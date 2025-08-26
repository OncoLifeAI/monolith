#!/usr/bin/env python3
"""
Script to clear RAG cache in Redis after adding new documents
"""

import os
import redis
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def clear_rag_cache():
    """Clear all RAG-related cache entries from Redis."""
    redis_url = os.getenv("REDIS_URL")
    
    if not redis_url:
        print("❌ REDIS_URL not found in environment variables")
        return False
    
    try:
        # Connect to Redis
        r = redis.from_url(redis_url)
        r.ping()  # Test connection
        print("✅ Connected to Redis")
        
        # Find all RAG-related keys
        rag_keys = r.keys("rag:*")
        
        if not rag_keys:
            print("ℹ️  No RAG cache keys found")
            return True
        
        print(f"🔍 Found {len(rag_keys)} RAG cache keys")
        
        # Clear all RAG keys
        deleted_count = 0
        for key in rag_keys:
            r.delete(key)
            deleted_count += 1
        
        print(f"🗑️  Cleared {deleted_count} RAG cache keys")
        
        # Verify cache is cleared
        remaining_keys = r.keys("rag:*")
        if not remaining_keys:
            print("✅ All RAG cache successfully cleared")
        else:
            print(f"⚠️  {len(remaining_keys)} RAG keys still remain")
        
        return True
        
    except redis.ConnectionError:
        print("❌ Could not connect to Redis")
        return False
    except Exception as e:
        print(f"❌ Error clearing cache: {e}")
        return False

def show_cache_stats():
    """Show statistics about the current RAG cache."""
    redis_url = os.getenv("REDIS_URL")
    
    if not redis_url:
        print("❌ REDIS_URL not found in environment variables")
        return False
    
    try:
        # Connect to Redis
        r = redis.from_url(redis_url)
        r.ping()
        print("✅ Connected to Redis")
        
        # Find all RAG-related keys
        rag_keys = r.keys("rag:*")
        
        if not rag_keys:
            print("ℹ️  No RAG cache keys found")
            return True
        
        print(f"📊 RAG Cache Statistics:")
        print(f"  Total keys: {len(rag_keys)}")
        
        # Group by document type
        ctcae_keys = [k for k in rag_keys if b"ctcae" in k]
        questions_keys = [k for k in rag_keys if b"questions" in k]
        triage_kb_keys = [k for k in rag_keys if b"triage_kb" in k]
        other_keys = [k for k in rag_keys if b"ctcae" not in k and b"questions" not in k and b"triage_kb" not in k]
        
        print(f"  CTCAE keys: {len(ctcae_keys)}")
        print(f"  Questions keys: {len(questions_keys)}")
        print(f"  Triage KB keys: {len(triage_kb_keys)}")
        print(f"  Other keys: {len(other_keys)}")
        
        # Show some example keys
        if ctcae_keys:
            print(f"  Example CTCAE key: {ctcae_keys[0].decode()}")
        if questions_keys:
            print(f"  Example Questions key: {questions_keys[0].decode()}")
        if triage_kb_keys:
            print(f"  Example Triage KB key: {triage_kb_keys[0].decode()}")
        
        return True
        
    except redis.ConnectionError:
        print("❌ Could not connect to Redis")
        return False
    except Exception as e:
        print(f"❌ Error showing cache stats: {e}")
        return False

def clear_specific_document_type(doc_type):
    """Clear cache for a specific document type."""
    redis_url = os.getenv("REDIS_URL")
    
    if not redis_url:
        print("❌ REDIS_URL not found in environment variables")
        return False
    
    try:
        # Connect to Redis
        r = redis.from_url(redis_url)
        r.ping()
        print(f"✅ Connected to Redis")
        
        # Find keys for specific document type
        pattern = f"rag:{doc_type}:*"
        keys_to_clear = r.keys(pattern)
        
        if not keys_to_clear:
            print(f"ℹ️  No cache keys found for {doc_type}")
            return True
        
        print(f"🔍 Found {len(keys_to_clear)} cache keys for {doc_type}")
        
        # Clear specific keys
        deleted_count = 0
        for key in keys_to_clear:
            r.delete(key)
            deleted_count += 1
        
        print(f"🗑️  Cleared {deleted_count} {doc_type} cache keys")
        return True
        
    except redis.ConnectionError:
        print("❌ Could not connect to Redis")
        return False
    except Exception as e:
        print(f"❌ Error clearing {doc_type} cache: {e}")
        return False

def clear_old_combined_cache():
    """Clear old combined cache keys that are no longer used."""
    redis_url = os.getenv("REDIS_URL")
    
    if not redis_url:
        print("❌ REDIS_URL not found in environment variables")
        return False
    
    try:
        # Connect to Redis
        r = redis.from_url(redis_url)
        r.ping()
        print("✅ Connected to Redis")
        
        # Find old combined cache keys (rag:both:*)
        old_keys = r.keys("rag:both:*")
        
        if not old_keys:
            print("ℹ️  No old combined cache keys found")
            return True
        
        print(f"🔍 Found {len(old_keys)} old combined cache keys")
        
        # Clear old keys
        deleted_count = 0
        for key in old_keys:
            r.delete(key)
            deleted_count += 1
        
        print(f"🗑️  Cleared {deleted_count} old combined cache keys")
        return True
        
    except redis.ConnectionError:
        print("❌ Could not connect to Redis")
        return False
    except Exception as e:
        print(f"❌ Error clearing old combined cache: {e}")
        return False

def migrate_cache():
    """Clear old cache system and prepare for new parallel system."""
    print("🔄 Migrating to new parallel RAG cache system...")
    
    # Clear old combined cache
    clear_old_combined_cache()
    
    # Clear all document type caches
    clear_specific_document_type("ctcae")
    clear_specific_document_type("questions")
    clear_specific_document_type("triage_kb")
    
    print("✅ Migration complete! New parallel RAG system is ready.")
    return True

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "stats":
            print("📊 Showing RAG cache statistics...")
            show_cache_stats()
        elif command == "ctcae":
            print(f"🧹 Clearing CTCAE cache...")
            clear_specific_document_type("ctcae")
        elif command == "questions":
            print(f"🧹 Clearing Questions cache...")
            clear_specific_document_type("questions")
        elif command == "triage_kb":
            print(f"🧹 Clearing Triage KB cache...")
            clear_specific_document_type("triage_kb")
        elif command == "migrate":
            print("🔄 Migrating to new parallel RAG cache system...")
            migrate_cache()
        else:
            print("❌ Unknown command. Use: stats, ctcae, questions, triage_kb, or no args for all")
    else:
        print("🧹 Clearing all RAG cache...")
        print()
        
        success = clear_rag_cache()
        
        if success:
            print("\n🎉 Cache cleared successfully!")
            print("Next time you chat, fresh RAG results will be retrieved from Pinecone.")
            print("\nAvailable commands:")
            print("  python clear_rag_cache.py          # Clear all cache")
            print("  python clear_rag_cache.py stats    # Show cache statistics")
            print("  python clear_rag_cache.py ctcae    # Clear only CTCAE cache")
            print("  python clear_rag_cache.py questions # Clear only Questions cache")
            print("  python clear_rag_cache.py triage_kb # Clear only Triage KB cache")
            print("  python clear_rag_cache.py migrate  # Migrate to new parallel RAG system")
        else:
            print("\n❌ Failed to clear cache. Check Redis connection.")
