import os
import uuid
from langchain_community.embeddings import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.http import models
from pypdf import PdfReader
from docx import Document

# Default collection name for Qdrant vector database
COLLECTION_NAME = "personal_documents"

# Initialize the Ollama client for local vector embeddings.
# Initialize the Ollama client for local vector embeddings.
_embeddings_client = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url="http://host.docker.internal:11434"
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

def extract_text_from_file(file_path: str, filename: str) -> str:
    """
    Extract raw text from PDF or Word (docx) files based on their extension.
    """
    text = ""
    file_extension = filename.lower().split(".")[-1]

    if file_extension == "pdf":
        reader = PdfReader(file_path)
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"

    elif file_extension in ["doc", "docx"]:
        doc = Document(file_path)
        for paragraph in doc.paragraphs:
            if paragraph.text:
                text += paragraph.text + "\n"
    else:
        raise ValueError(f"Unsupported file format: .{file_extension}")

    return text.strip()

def split_text_into_chunks(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    """
    Split large raw text into smaller overlapping chunks for precise vector embedding and retrieval.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )
    chunks = text_splitter.split_text(text)
    return chunks

def ensure_collection_exists():
    """
    Ensure that the target Qdrant collection exists. 
    If not, create it with 768 dimensions matching the nomic-embed-text model.
    """
    try:
        collections = _qdrant_client.get_collections().collections
        exists = any(col.name == COLLECTION_NAME for col in collections)
        
        if not exists:
            _qdrant_client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=models.VectorParams(
                    size=768,  # Exact vector dimension for nomic-embed-text
                    distance=models.Distance.COSINE
                )
            )
    except Exception as e:
        raise RuntimeError(f"Failed to ensure Qdrant collection exists: {str(e)}")

def store_chunks_in_qdrant(chunks: list[str], filename: str) -> int:
    """
    Generate embeddings for all text chunks and perform an upsert operation 
    to store them permanently in Qdrant along with their metadata.
    """
    ensure_collection_exists()
    
    points = []
    for i, chunk in enumerate(chunks):
        vector = generate_text_embedding(chunk)
        point_id = str(uuid.uuid4())
        
        points.append(
            models.PointStruct(
                id=point_id,
                vector=vector,
                payload={
                    "text": chunk,
                    "filename": filename,
                    "chunk_index": i
                }
            )
        )
    
    # Perform bulk upsert into Qdrant vector database
    _qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )
    
    return len(points)