import os
import sys
import json
import faiss
from sentence_transformers import SentenceTransformer

# Add the project root to the Python path to allow importing from routers
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from routers.chat.llm.context import ContextLoader

def build_and_save_vector_store():
    """
    A one-time script to build the FAISS vector store from CTCAE.json and save it to disk.
    """
    print("Starting vector store build process...")
    
    model_inputs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'model_inputs'))
    ctcae_path = os.path.join(model_inputs_dir, "CTCAE.json")
    vector_store_path = os.path.join(model_inputs_dir, "ctcae_index.faiss")
    documents_path = os.path.join(model_inputs_dir, "ctcae_documents.json")

    if not os.path.exists(ctcae_path):
        print(f"Error: {ctcae_path} not found. Cannot build vector store.")
        return

    print("Loading SentenceTransformer model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')

    print("Loading and flattening CTCAE.json...")
    with open(ctcae_path, 'r') as f:
        ctcae_data = json.load(f)
    
    documents = []
    for category, disorders in ctcae_data.items():
        for disorder, grades in disorders.items():
            chunk = f"Symptom/Disorder: {disorder} (Category: {category})\n"
            for grade, description in grades.items():
                if description:
                    chunk += f"  - Grade {grade}: {description}\n"
            documents.append(chunk)

    print(f"Creating embeddings for {len(documents)} documents...")
    embeddings = model.encode(documents, convert_to_tensor=True, show_progress_bar=True)
    embeddings_np = embeddings.cpu().numpy()

    print("Building FAISS index...")
    d = embeddings_np.shape[1]
    index = faiss.IndexFlatL2(d)
    index.add(embeddings_np)

    print(f"Saving FAISS index to {vector_store_path}...")
    faiss.write_index(index, vector_store_path)

    print(f"Saving documents to {documents_path}...")
    with open(documents_path, 'w') as f:
        json.dump(documents, f)

    print("\nVector store build process completed successfully!")
    print(f"Files created:\n- {vector_store_path}\n- {documents_path}")

if __name__ == "__main__":
    build_and_save_vector_store() 