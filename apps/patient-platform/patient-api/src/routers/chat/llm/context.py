import os
import json
import docx
import time
from pypdf import PdfReader
from typing import List, Dict, Any

# Feature flag for prompt caching (default: OFF)
ENABLE_PROMPT_CACHE = False

class ContextLoader:
    """
    Loads context from files and uses Pinecone-based RAG for symptom-specific information.
    Documents can optionally be cached at the class level for performance.
    """
    
    # Class-level cache for documents - only used if ENABLE_PROMPT_CACHE is True
    _base_documents_cache = None
    _base_documents_length = 0

    def __init__(self, directory: str):
        self.directory = directory
        self.context_dir = os.path.join(directory, "context")
        print(f"[CTX] Initializing ContextLoader with directory: {self.directory}")
        print(f"[CTX] Context files directory: {self.context_dir}")
        print(f"[CTX] Prompt caching: {'ENABLED' if ENABLE_PROMPT_CACHE else 'DISABLED'}")
        print(f"[CTX] Using Pinecone-based RAG system")
        
        # Only use cache if feature flag is enabled
        if ENABLE_PROMPT_CACHE:
            if ContextLoader._base_documents_cache is None:
                print("[CTX] First initialization - loading documents into cache...")
                start_time = time.time()
                ContextLoader._base_documents_cache = self._load_base_documents_into_cache()
                ContextLoader._base_documents_length = len(ContextLoader._base_documents_cache)
                load_time = time.time() - start_time
                print(f"[CTX] Documents cached successfully (length: {ContextLoader._base_documents_length}, load_time: {load_time:.2f}s)")
            else:
                print(f"[CTX] Using cached documents (length: {ContextLoader._base_documents_length})")
        else:
            print("[CTX] Caching disabled - will load documents fresh each time")

    def _load_base_documents_into_cache(self) -> str:
        """Loads all base documents from context folder. Used for caching when enabled."""
        return self._load_base_documents_fresh()

    def _load_base_documents_fresh(self) -> str:
        """Loads all base documents from context folder fresh each time."""
        print("[CTX] Loading base documents from context folder...")
        
        documents = []
        
        # Load text files from context folder
        text_files = [
            "oncolife_alerts_configuration.txt",
            "oncolifebot_instructions.txt", 
            "written_chatbot_docs.txt"
        ]
        
        for filename in text_files:
            file_path = os.path.join(self.context_dir, filename)
            if os.path.exists(file_path):
                try:
                    content = self._load_txt(file_path)
                    documents.append(f"=== {filename} ===\n{content}")
                    print(f"[CTX] Loaded {filename} (chars={len(content)})")
                except Exception as e:
                    print(f"[CTX] Error loading {filename}: {e}")
            else:
                print(f"[CTX] Warning: {filename} not found in context folder")
        
        # Load PDF file from context folder
        pdf_file = "ukons_triage_toolkit_v3_final.pdf"
        pdf_path = os.path.join(self.context_dir, pdf_file)
        if os.path.exists(pdf_path):
            try:
                content = self._load_pdf(pdf_path)
                documents.append(f"=== {pdf_file} ===\n{content}")
                print(f"[CTX] Loaded {pdf_file} (chars={len(content)})")
            except Exception as e:
                print(f"[CTX] Error loading {pdf_file}: {e}")
        else:
            print(f"[CTX] Warning: {pdf_file} not found in context folder")
        
        # Combine all documents
        combined = "\n\n".join(documents)
        print(f"[CTX] Total base documents length: {len(combined)}")
        return combined

    def _get_base_documents(self) -> str:
        """Returns base documents - either from cache (if enabled) or fresh load."""
        if ENABLE_PROMPT_CACHE and ContextLoader._base_documents_cache is not None:
            print("[CTX] Using cached base documents")
            return ContextLoader._base_documents_cache
        else:
            print("[CTX] Loading base documents fresh")
            return self._load_base_documents_fresh()

    def _append_rag_results(self, base_prompt: str, symptoms: List[str]) -> str:
        """Appends RAG results to the base prompt using Pinecone and Redis caching."""
        if not symptoms:
            print("[CTX] No symptoms provided, skipping RAG")
            return base_prompt
        
        try:
            # Import here to avoid circular imports
            from .retrieval import parallel_retrieve_all_document_types
            
            print(f"[CTX] Performing parallel Pinecone RAG for symptoms: {symptoms}")
            
            # Get all RAG results in parallel with separate cache keys
            start_time = time.time()
            all_results = parallel_retrieve_all_document_types(
                symptoms, 
                ttl=1800, 
                k_ctcae=10, 
                k_questions=12, 
                k_triage_kb=8
            )
            rag_time = time.time() - start_time
            
            # Extract results from each document type
            ctcae_chunks = all_results.get("ctcae", [])
            questions_chunks = all_results.get("questions", [])
            triage_kb_chunks = all_results.get("triage_kb", [])
            
            print(f"[CTX] ⚡ Parallel RAG completed in {rag_time:.3f}s")
            print(f"[CTX] 📋 CTCAE: Retrieved {len(ctcae_chunks)} chunks")
            print(f"[CTX] ❓ Questions: Retrieved {len(questions_chunks)} chunks")
            print(f"[CTX] 🚨 Triage KB: Retrieved {len(triage_kb_chunks)} chunks")
            
            # Show samples of what was retrieved
            if ctcae_chunks:
                print(f"[CTX] 📋 CTCAE Sample: {ctcae_chunks[0].get('text', '')[:100]}...")
            if questions_chunks:
                print(f"[CTX] ❓ Questions Sample: {questions_chunks[0].get('text', '')[:100]}...")
            if triage_kb_chunks:
                print(f"[CTX] 🚨 Triage KB Sample: {triage_kb_chunks[0].get('text', '')[:100]}...")
            
            # Build RAG section
            rag_sections = []
            total_rag_chunks = 0
        
            if ctcae_chunks:
                ctcae_text = "\n---\n".join([chunk.get("text", "") for chunk in ctcae_chunks[:6]])
                rag_sections.append(f"=== Relevant CTCAE Criteria for {', '.join(symptoms)} ===\n{ctcae_text}")
                total_rag_chunks += len(ctcae_chunks[:6])
            
            if questions_chunks:
                questions_text = "\n---\n".join([chunk.get("text", "") for chunk in questions_chunks[:8]])
                rag_sections.append(f"=== Assessment Questions for {', '.join(symptoms)} ===\n{questions_text}")
                total_rag_chunks += len(questions_chunks[:8])
            
            if triage_kb_chunks:
                triage_kb_text = "\n---\n".join([chunk.get("text", "") for chunk in triage_kb_chunks[:6]])
                rag_sections.append(f"=== Triage Rules for {', '.join(symptoms)} ===\n{triage_kb_text}")
                total_rag_chunks += len(triage_kb_chunks[:6])
            
            if rag_sections:
                rag_content = "\n\n".join(rag_sections)
                full_prompt = f"{base_prompt}\n\n=== RAG Results ===\n{rag_content}"
                print(f"[CTX] ✅ RAG Complete: {total_rag_chunks} total chunks from {len(rag_sections)} document types")
                print(f"[CTX] 📏 Final prompt length: {len(full_prompt)} characters")
                return full_prompt
            else:
                print("[CTX] ⚠️  No Pinecone RAG results found")
                return base_prompt
                
        except Exception as e:
            print(f"[CTX] ❌ Error during Pinecone RAG: {e}")
            return base_prompt

    def load_context(self, symptoms: List[str] = None) -> str:
        """
        Loads all context including base documents and Pinecone RAG results.
        Base documents are loaded fresh each time unless caching is enabled.
        """
        start_time = time.time()
        print(f"[CTX] Building complete system prompt for symptoms: {symptoms}")
        
        # Step 1: Get base documents (cached or fresh depending on feature flag)
        base_prompt = self._get_base_documents()
        
        # Step 2: Append Pinecone RAG results (with Redis caching - this stays cached)
        complete_prompt = self._append_rag_results(base_prompt, symptoms)
        
        total_time = time.time() - start_time
        cache_status = "CACHED" if (ENABLE_PROMPT_CACHE and ContextLoader._base_documents_cache is not None) else "FRESH"
        
        # Calculate RAG content summary
        base_length = len(base_prompt)
        rag_length = len(complete_prompt) - base_length
        rag_percentage = (rag_length / len(complete_prompt)) * 100 if complete_prompt else 0
        
        print(f"[CTX] Context built in {total_time:.3f}s (mode: {cache_status})")
        print(f"[CTX] 📊 Content breakdown:")
        print(f"[CTX]   📚 Base documents: {base_length:,} characters")
        print(f"[CTX]   🔍 RAG content: {rag_length:,} characters ({rag_percentage:.1f}%)")
        print(f"[CTX]   📏 Total prompt: {len(complete_prompt):,} characters")
        
        return complete_prompt

    @classmethod
    def clear_cache(cls):
        """Clears the cached documents. Useful if documents are updated or for debugging."""
        cls._base_documents_cache = None
        cls._base_documents_length = 0
        print("[CTX] Document cache cleared")

    @classmethod
    def get_cache_info(cls) -> Dict[str, Any]:
        """Returns information about the current cache status."""
        return {
            "caching_enabled": ENABLE_PROMPT_CACHE,
            "cached": cls._base_documents_cache is not None,
            "length": cls._base_documents_length,
            "memory_usage_mb": round(len(cls._base_documents_cache.encode('utf-8')) / (1024 * 1024), 2) if cls._base_documents_cache else 0
        }

    # Keep the existing loader methods (_load_docx, _load_pdf, _load_txt, _load_json)
    def _load_docx(self, file_path: str) -> str:
        """Loads text from a .docx file."""
        doc = docx.Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])

    def _load_pdf(self, file_path: str) -> str:
        """Loads text from a .pdf file."""
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text

    def _load_txt(self, file_path: str) -> str:
        """Loads text from a .txt file."""
        with open(file_path, 'r') as f:
            return f.read()

    def _load_json(self, file_path: str) -> Dict[str, Any]:
        """Loads data from a .json file."""
        with open(file_path, 'r') as f:
            return json.load(f)