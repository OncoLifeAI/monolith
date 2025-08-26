import os
import json
import hashlib
import logging
from typing import List, Dict, Any
from pinecone import Pinecone
from openai import OpenAI
from threading import Thread
import asyncio
import concurrent.futures
import time

try:
    from redis import Redis
except Exception:
    Redis = None  # Redis is optional

logger = logging.getLogger(__name__)

EMBED_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
INDEX_NAME = os.getenv("PINECONE_INDEX", "oncolife-rag")
REDIS_URL = os.getenv("REDIS_URL")

_pc = None
_oa = None
_idx = None
_cache = None


def _pc_client():
    global _pc
    if _pc is None:
        _pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
    return _pc


def _index():
    global _idx
    if _idx is None:
        _idx = _pc_client().Index(INDEX_NAME)
    return _idx


def _oa_client():
    global _oa
    if _oa is None:
        logger.debug(f"[RAG] Initializing OpenAI client (embed_model={EMBED_MODEL})")
        _oa = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    return _oa


def _cache_client():
    global _cache
    if _cache is None and REDIS_URL and Redis is not None:
        try:
            logger.info(f"[RAG][CACHE] Attempting Redis connection to: {REDIS_URL}")
            _cache = Redis.from_url(REDIS_URL)
            # Test the connection
            _cache.ping()
            logger.info(f"[RAG][CACHE] Redis connected successfully")
        except Exception as e:
            logger.error(f"[RAG][CACHE] Redis connection failed: {e}")
            _cache = None
    elif _cache is None:
        if not REDIS_URL:
            logger.warning(f"[RAG][CACHE] REDIS_URL environment variable not set - Redis caching disabled")
        elif Redis is None:
            logger.warning(f"[RAG][CACHE] Redis library not available - Redis caching disabled")
        else:
            logger.warning(f"[RAG][CACHE] Redis caching disabled for unknown reason")
    return _cache


def _embed(text: str) -> List[float]:
    logger.debug(f"[RAG] Embedding query (len={len(text)}) model={EMBED_MODEL}")
    r = _oa_client().embeddings.create(model=EMBED_MODEL, input=text)
    return r.data[0].embedding


def _normalize_symptoms(symptoms: List[str]) -> List[str]:
    norm = {s.strip().lower() for s in (symptoms or []) if s and s.strip()}
    out = sorted(norm)
    logger.debug(f"[RAG] Normalized symptoms: {out}")
    return out


def _key(prefix: str, symptoms: List[str]) -> str:
    base = ",".join(_normalize_symptoms(symptoms))
    h = hashlib.md5(base.encode()).hexdigest()
    key = f"rag:{prefix}:{h}:v2"
    logger.debug(f"[RAG][CACHE] key={key}")
    return key


# ----- Per-symptom retrieval + caching helpers -----

def _single_key(prefix: str, symptom: str) -> str:
    sym = (symptom or "").strip().lower()
    h = hashlib.md5(sym.encode()).hexdigest()
    key = f"rag:per:{prefix}:{h}:v2"
    logger.debug(f"[RAG][CACHE][PER] key={key} symptom='{sym}'")
    return key


def retrieve_for_single_symptom(symptom: str, *, k_ctcae=8, k_questions=8, k_triage_kb=8) -> Dict[str, List[Dict[str, Any]]]:
    sym = (symptom or "").strip().lower()
    if not sym:
        logger.debug("[RAG][PER] Empty symptom → empty results")
        return {"ctcae": [], "questions": [], "triage_kb": []}

    vec = _embed(sym)
    idx = _index()

    results = {"ctcae": [], "questions": [], "triage_kb": []}

    if k_ctcae > 0:
        logger.debug(f"[RAG][PER][CTCAE] symptom='{sym}' top_k={k_ctcae}")
        ctcae_res = idx.query(
            vector=vec, top_k=k_ctcae, include_metadata=True,
            filter={"type": {"$eq": "ctcae"}}  # Only filter by type, not symptoms
        )
        matches = ctcae_res.matches or []
        logger.debug(f"[RAG][PER][CTCAE] symptom='{sym}' matches={len(matches)}")
        results["ctcae"] = [
            {
                "text": m.metadata.get("text", ""),
                "symptoms": m.metadata.get("symptoms", []),
                "version": m.metadata.get("version", ""),
                "score": getattr(m, "score", None),
            }
            for m in matches
        ]

    if k_questions > 0:
        logger.debug(f"[RAG][PER][QUESTIONS] symptom='{sym}' top_k={k_questions}")
        q_res = idx.query(
            vector=vec, top_k=k_questions, include_metadata=True,
            filter={"type": {"$eq": "question"}}  # Only filter by type, not symptoms
        )
        matches = q_res.matches or []
        logger.debug(f"[RAG][PER][QUESTIONS] symptom='{sym}' matches={len(matches)}")
        results["questions"] = [
            {
                "text": m.metadata.get("text", ""),
                "symptoms": m.metadata.get("symptoms", []),
                "phase": m.metadata.get("phase", ""),
                "qid": m.metadata.get("id", ""),
                "score": getattr(m, "score", None),
            }
            for m in matches
        ]

    if k_triage_kb > 0:
        logger.debug(f"[RAG][PER][TRIAGE_KB] symptom='{sym}' top_k={k_triage_kb}")
        triage_kb_res = idx.query(
            vector=vec, top_k=k_triage_kb, include_metadata=True,
            filter={"type": {"$eq": "triage_kb"}}  # Only filter by type, not symptoms
        )
        matches = triage_kb_res.matches or []
        logger.debug(f"[RAG][PER][TRIAGE_KB] symptom='{sym}' matches={len(matches)}")
        results["triage_kb"] = [
            {
                "text": m.metadata.get("text", ""),
                "symptoms": m.metadata.get("symptoms", []),
                "version": m.metadata.get("version", ""),
                "score": getattr(m, "score", None),
            }
            for m in matches
        ]

    return results


def cached_retrieve_single_symptom(symptom: str, *, ttl: int = 3600, k_ctcae=8, k_questions=8, k_triage_kb=8) -> Dict[str, List[Dict[str, Any]]]:
    cache = _cache_client()
    sym = (symptom or "").strip().lower()
    if not cache:
        logger.debug(f"[RAG][CACHE][PER] Redis disabled → direct per-sym retrieve '{sym}'")
        return retrieve_for_single_symptom(sym, k_ctcae=k_ctcae, k_questions=k_questions, k_triage_kb=k_triage_kb)

    key = _single_key("both", sym)
    try:
        raw = cache.get(key)
    except Exception as e:
        logger.error(f"[RAG][CACHE][PER] get failed key={key} error={e}")
        raw = None

    if raw:
        logger.debug(f"[RAG][CACHE][PER] HIT key={key}")
        try:
            return json.loads(raw)
        except Exception as e:
            logger.error(f"[RAG][CACHE][PER] decode failed key={key} error={e}")

    logger.debug(f"[RAG][CACHE][PER] MISS key={key} → querying Pinecone for '{sym}'")
    res = retrieve_for_single_symptom(sym, k_ctcae=k_ctcae, k_questions=k_questions, k_triage_kb=k_triage_kb)
    try:
        cache.setex(key, ttl, json.dumps(res))
        logger.debug(f"[RAG][CACHE][PER] SET key={key} ttl={ttl}s")
    except Exception as e:
        logger.error(f"[RAG][CACHE][PER] set failed key={key} error={e}")
    return res


# ----- Set-union assembly and background refresh -----

def _dedupe_and_limit(items: List[Dict[str, Any]], *, top_k: int, kind: str) -> List[Dict[str, Any]]:
    seen = set()
    ordered: List[Dict[str, Any]] = []

    def score_of(x: Dict[str, Any]):
        s = x.get("score")
        try:
            return float(s) if s is not None else 0.0
        except Exception:
            return 0.0

    # Prefer higher score first
    for item in sorted(items, key=score_of, reverse=True):
        if kind == "questions":
            key = (item.get("qid") or item.get("text"))
        else:  # ctcae
            key = (item.get("text"), item.get("version"))
        if key in seen:
            continue
        seen.add(key)
        ordered.append(item)
        if len(ordered) >= top_k:
            break
    return ordered


def _union_from_per_symptoms(symptoms: List[str], *, ttl: int, k_ctcae: int, k_questions: int, k_triage_kb: int) -> Dict[str, List[Dict[str, Any]]]:
    q_syms = _normalize_symptoms(symptoms)
    logger.debug(f"[RAG][UNION] Building union from per-sym caches for {q_syms}")

    ctcae_accum: List[Dict[str, Any]] = []
    q_accum: List[Dict[str, Any]] = []
    triage_kb_accum: List[Dict[str, Any]] = []

    for sym in q_syms:
        per = cached_retrieve_single_symptom(sym, ttl=ttl, k_ctcae=k_ctcae, k_questions=k_questions, k_triage_kb=k_triage_kb)
        ctcae_accum.extend(per.get("ctcae", []))
        q_accum.extend(per.get("questions", []))
        triage_kb_accum.extend(per.get("triage_kb", []))

    ctcae_final = _dedupe_and_limit(ctcae_accum, top_k=k_ctcae, kind="ctcae")
    q_final = _dedupe_and_limit(q_accum, top_k=k_questions, kind="questions")
    triage_kb_final = _dedupe_and_limit(triage_kb_accum, top_k=k_triage_kb, kind="triage_kb")

    logger.debug(
        f"[RAG][UNION] Combined results → ctcae_in={len(ctcae_accum)} ctcae_out={len(ctcae_final)} "
        f"questions_in={len(q_accum)} questions_out={len(q_final)} "
        f"triage_kb_in={len(triage_kb_accum)} triage_kb_out={len(triage_kb_final)}"
    )

    return {"ctcae": ctcae_final, "questions": q_final, "triage_kb": triage_kb_final}


def _spawn_background_full_refresh(symptoms: List[str], *, combined_key: str, ttl: int, k_ctcae: int, k_questions: int, k_triage_kb: int):
    def _task():
        try:
            logger.debug(f"[RAG][CACHE][REFRESH] Start full-set refresh key={combined_key}")
            res = retrieve_for_symptoms(symptoms, k_ctcae=k_ctcae, k_questions=k_questions, k_triage_kb=k_triage_kb)
            cache = _cache_client()
            if cache:
                cache.setex(combined_key, ttl, json.dumps(res))
                logger.debug(f"[RAG][CACHE][REFRESH] Updated key={combined_key} ttl={ttl}s")
            else:
                logger.debug("[RAG][CACHE][REFRESH] Redis not available during refresh")
        except Exception as e:
            logger.error(f"[RAG][CACHE][REFRESH] failed key={combined_key} error={e}")
    Thread(target=_task, daemon=True).start()


# ----- Original full-set retrieval -----

def retrieve_for_symptoms(symptoms: List[str], *, k_ctcae=8, k_questions=8, k_triage_kb=8) -> Dict[str, List[Dict[str, Any]]]:
    if not symptoms:
        logger.debug("[RAG] Empty symptoms → returning empty results")
        return {"ctcae": [], "questions": [], "triage_kb": []}
    q_syms = _normalize_symptoms(symptoms)
    query = ", ".join(q_syms)
    vec = _embed(query)

    idx = _index()

    results = {"ctcae": [], "questions": [], "triage_kb": []}

    if k_ctcae > 0:
        logger.debug(f"[RAG][CTCAE] Query top_k={k_ctcae} filter_syms={q_syms}")
        ctcae_res = idx.query(
            vector=vec, top_k=k_ctcae, include_metadata=True,
            filter={"type": {"$eq": "ctcae"}}  # Only filter by type, not symptoms
        )
        matches = ctcae_res.matches or []
        logger.debug(f"[RAG][CTCAE] matches={len(matches)}")
        results["ctcae"] = [
            {
                "text": m.metadata.get("text", ""),
                "symptoms": m.metadata.get("symptoms", []),
                "version": m.metadata.get("version", ""),
                "score": getattr(m, "score", None),
            }
            for m in matches
        ]
        if results["ctcae"]:
            logger.info(f"[RAG][CTCAE] Retrieved {len(results['ctcae'])} CTCAE chunks for symptoms: {q_syms}")
            # Log top scores to show semantic similarity quality
            top_scores = [r["score"] for r in results["ctcae"][:3] if r["score"] is not None]
            if top_scores:
                logger.info(f"[RAG][CTCAE] Top similarity scores: {[f'{s:.3f}' for s in top_scores]}")

    if k_questions > 0:
        logger.debug(f"[RAG][QUESTIONS] Query top_k={k_questions} filter_syms={q_syms}")
        q_res = idx.query(
            vector=vec, top_k=k_questions, include_metadata=True,
            filter={"type": {"$eq": "question"}}  # Only filter by type, not symptoms
        )
        matches = q_res.matches or []
        logger.debug(f"[RAG][QUESTIONS] matches={len(matches)}")
        results["questions"] = [
            {
                "text": m.metadata.get("text", ""),
                "symptoms": m.metadata.get("symptoms", []),
                "phase": m.metadata.get("phase", ""),
                "qid": m.metadata.get("id", ""),
                "score": getattr(m, "score", None),
            }
            for m in matches
        ]
        if results["questions"]:
            logger.info(f"[RAG][QUESTIONS] Retrieved {len(results['questions'])} question chunks for symptoms: {q_syms}")
            # Log top scores to show semantic similarity quality
            top_scores = [r["score"] for r in results["questions"][:3] if r["score"] is not None]
            if top_scores:
                logger.info(f"[RAG][QUESTIONS] Top similarity scores: {[f'{s:.3f}' for s in top_scores]}")

    if k_triage_kb > 0:
        logger.debug(f"[RAG][TRIAGE_KB] Query top_k={k_triage_kb} filter_syms={q_syms}")
        triage_kb_res = idx.query(
            vector=vec, top_k=k_triage_kb, include_metadata=True,
            filter={"type": {"$eq": "triage_kb"}}  # Only filter by type, not symptoms
        )
        matches = triage_kb_res.matches or []
        logger.debug(f"[RAG][TRIAGE_KB] matches={len(matches)}")
        results["triage_kb"] = [
            {
                "text": m.metadata.get("text", ""),
                "symptoms": m.metadata.get("symptoms", []),
                "version": m.metadata.get("version", ""),
                "score": getattr(m, "score", None),
            }
            for m in matches
        ]
        if results["triage_kb"]:
            logger.info(f"[RAG][TRIAGE_KB] Retrieved {len(results['triage_kb'])} triage KB chunks for symptoms: {q_syms}")
            # Log top scores to show semantic similarity quality
            top_scores = [r["score"] for r in results["triage_kb"][:3] if r["score"] is not None]
            if top_scores:
                logger.info(f"[RAG][TRIAGE_KB] Top similarity scores: {[f'{s:.3f}' for s in top_scores]}")

    # Summary of what was retrieved
    total_chunks = sum(len(results[key]) for key in results)
    logger.info(f"[RAG] Total retrieval: {total_chunks} chunks from Pinecone for symptoms: {q_syms}")
    
    return results


def cached_retrieve(symptoms: List[str], *, ttl: int = 3600, k_ctcae=8, k_questions=8, k_triage_kb=8) -> Dict[str, List[Dict[str, Any]]]:
    cache = _cache_client()
    # Summary line: what symptoms we're retrieving for
    norm_syms = _normalize_symptoms(symptoms)
    if cache:
        logger.info(f"[RAG] symptoms={norm_syms}")
    else:
        logger.info(f"[RAG] symptoms={norm_syms} (cache=disabled)")

    if not cache:
        logger.info(f"[RAG][CACHE] Redis disabled → direct Pinecone query for symptoms: {norm_syms}")
        return retrieve_for_symptoms(symptoms, k_ctcae=k_ctcae, k_questions=k_questions, k_triage_kb=k_triage_kb)

    combined_key = _key("both", symptoms)

    # 1) Try combined-set cache
    try:
        raw = cache.get(combined_key)
    except Exception as e:
        logger.error(f"[RAG][CACHE] get failed error={e}")
        raw = None

    if raw:
        logger.info(f"[RAG][CACHE] 🎯 HIT symptoms={norm_syms} (using cached results)")
        try:
            cached_data = json.loads(raw)
            # Log what was retrieved from cache
            ctcae_count = len(cached_data.get("ctcae", []))
            questions_count = len(cached_data.get("questions", []))
            triage_kb_count = len(cached_data.get("triage_kb", []))
            logger.info(f"[RAG][CACHE] 📋 Cache contents: {ctcae_count} CTCAE, {questions_count} Questions, {triage_kb_count} Triage KB")
            return cached_data
        except Exception as e:
            logger.error(f"[RAG][CACHE] decode failed error={e}")

    logger.info(f"[RAG][CACHE] ❌ MISS symptoms={norm_syms} → querying Pinecone for fresh data")
    try:
        union_res = _union_from_per_symptoms(symptoms, ttl=ttl, k_ctcae=k_ctcae, k_questions=k_questions, k_triage_kb=k_triage_kb)
        # Save union as a quick answer
        try:
            cache.setex(combined_key, ttl, json.dumps(union_res))
            logger.debug(f"[RAG][CACHE] 💾 SET (union) ttl={ttl}s")
        except Exception as e:
            logger.error(f"[RAG][CACHE] set (union) failed error={e}")
        # Background refresh with full-set retrieval
        _spawn_background_full_refresh(symptoms, combined_key=combined_key, ttl=ttl, k_ctcae=k_ctcae, k_questions=k_questions, k_triage_kb=k_triage_kb)
        return union_res
    except Exception as e:
        logger.error(f"[RAG][UNION] failed to assemble union error={e}")

    # 3) Fallback to direct full retrieval
    logger.info(f"[RAG][FALLBACK] Using direct Pinecone query for symptoms: {norm_syms}")
    res = retrieve_for_symptoms(symptoms, k_ctcae=k_ctcae, k_questions=k_questions, k_triage_kb=k_triage_kb)
    try:
        cache.setex(combined_key, ttl, json.dumps(res))
        logger.debug(f"[RAG][CACHE] 💾 SET ttl={ttl}s size={len(json.dumps(res))} bytes")
    except Exception as e:
        logger.error(f"[RAG][CACHE] set failed error={e}")
    return res 


def parallel_retrieve_all_document_types(symptoms: List[str], *, ttl: int = 1800, k_ctcae=8, k_questions=8, k_triage_kb=8) -> Dict[str, List[Dict[str, Any]]]:
    """
    Parallel retrieval from all document types with separate cache keys for optimal performance.
    Each document type gets its own cache key and is fetched independently.
    """
    if not symptoms:
        logger.debug("[RAG][PARALLEL] Empty symptoms → returning empty results")
        return {"ctcae": [], "questions": [], "triage_kb": []}
    
    norm_syms = _normalize_symptoms(symptoms)
    logger.info(f"[RAG][PARALLEL] Starting parallel retrieval for symptoms: {norm_syms}")
    
    # Create separate cache keys for each document type
    ctcae_key = _key("ctcae", symptoms)
    questions_key = _key("questions", symptoms)
    triage_kb_key = _key("triage_kb", symptoms)
    
    cache = _cache_client()
    
    def retrieve_ctcae():
        """Retrieve CTCAE data with its own cache key."""
        if cache:
            try:
                raw = cache.get(ctcae_key)
                if raw:
                    logger.debug(f"[RAG][PARALLEL][CTCAE] Cache HIT for key: {ctcae_key}")
                    return json.loads(raw)
            except Exception as e:
                logger.error(f"[RAG][PARALLEL][CTCAE] Cache get failed: {e}")
        
        logger.debug(f"[RAG][PARALLEL][CTCAE] Cache MISS, querying Pinecone")
        result = retrieve_for_symptoms(symptoms, k_ctcae=k_ctcae, k_questions=0, k_triage_kb=0)
        
        if cache and result["ctcae"]:
            try:
                cache.setex(ctcae_key, ttl, json.dumps(result))
                logger.debug(f"[RAG][PARALLEL][CTCAE] Cached result with key: {ctcae_key}")
            except Exception as e:
                logger.error(f"[RAG][PARALLEL][CTCAE] Cache set failed: {e}")
        
        return result["ctcae"]
    
    def retrieve_questions():
        """Retrieve questions data with its own cache key."""
        if cache:
            try:
                raw = cache.get(questions_key)
                if raw:
                    logger.debug(f"[RAG][PARALLEL][QUESTIONS] Cache HIT for key: {questions_key}")
                    return json.loads(raw)
            except Exception as e:
                logger.error(f"[RAG][PARALLEL][QUESTIONS] Cache get failed: {e}")
        
        logger.debug(f"[RAG][PARALLEL][QUESTIONS] Cache MISS, querying Pinecone")
        result = retrieve_for_symptoms(symptoms, k_ctcae=0, k_questions=k_questions, k_triage_kb=0)
        
        if cache and result["questions"]:
            try:
                cache.setex(questions_key, ttl, json.dumps(result))
                logger.debug(f"[RAG][PARALLEL][QUESTIONS] Cached result with key: {questions_key}")
            except Exception as e:
                logger.error(f"[RAG][PARALLEL][QUESTIONS] Cache set failed: {e}")
        
        return result["questions"]
    
    def retrieve_triage_kb():
        """Retrieve triage KB data with its own cache key."""
        if cache:
            try:
                raw = cache.get(triage_kb_key)
                if raw:
                    logger.debug(f"[RAG][PARALLEL][TRIAGE_KB] Cache HIT for key: {triage_kb_key}")
                    return json.loads(raw)
            except Exception as e:
                logger.error(f"[RAG][PARALLEL][TRIAGE_KB] Cache get failed: {e}")
        
        logger.debug(f"[RAG][PARALLEL][TRIAGE_KB] Cache MISS, querying Pinecone")
        result = retrieve_for_symptoms(symptoms, k_ctcae=0, k_questions=0, k_triage_kb=k_triage_kb)
        
        if cache and result["triage_kb"]:
            try:
                cache.setex(triage_kb_key, ttl, json.dumps(result))
                logger.debug(f"[RAG][PARALLEL][TRIAGE_KB] Cached result with key: {triage_kb_key}")
            except Exception as e:
                logger.error(f"[RAG][PARALLEL][TRIAGE_KB] Cache set failed: {e}")
        
        return result["triage_kb"]
    
    # Execute all retrievals in parallel using ThreadPoolExecutor
    start_time = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        # Submit all tasks
        ctcae_future = executor.submit(retrieve_ctcae)
        questions_future = executor.submit(retrieve_questions)
        triage_kb_future = executor.submit(retrieve_triage_kb)
        
        # Wait for all to complete and collect results
        ctcae_results = ctcae_future.result()
        questions_results = questions_future.result()
        triage_kb_results = triage_kb_future.result()
    
    total_time = time.time() - start_time
    logger.info(f"[RAG][PARALLEL] Parallel retrieval completed in {total_time:.3f}s")
    
    # Combine results
    final_results = {
        "ctcae": ctcae_results,
        "questions": questions_results,
        "triage_kb": triage_kb_results
    }
    
    # Log summary
    total_chunks = sum(len(final_results[key]) for key in final_results)
    logger.info(f"[RAG][PARALLEL] Total chunks retrieved: {total_chunks} (CTCAE: {len(ctcae_results)}, Questions: {len(questions_results)}, Triage KB: {len(triage_kb_results)})")
    
    return final_results 