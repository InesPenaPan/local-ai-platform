from langchain_community.embeddings import OllamaEmbeddings
from qdrant_client import QdrantClient

# Initialize the Ollama client for local vector embeddings.
_embeddings_client = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url="http://ollama:11434"
)

# Initialize the Qdrant client for vector database interactions.
_qdrant_client = QdrantClient(
    url="http://qdrant:6333"
)

def generate_text_embedding(text: str) -> list[float]:
    """
    Generate a high-dimensional vector embedding for a given input text string 
    using the local Ollama embedding model.
    """
    try:
        return _embeddings_client.embed_query(text)
    except Exception as e:
        raise RuntimeError(f"Embedding generation failed: {str(e)}")

def check_system_health() -> dict:
    """
    Perform a health diagnostic check on the core RAG components,
    specifically verifying connectivity with the Qdrant vector database.
    """
    try:
        _qdrant_client.get_collections()
        db_status = True
    except Exception:
        db_status = False

    return {
        "status": "healthy" if db_status else "degraded",
        "port": 8002,
        "embedding_model": "nomic-embed-text",
        "vector_db_connected": db_status
    }