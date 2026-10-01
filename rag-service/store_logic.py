import os
import uuid
from langchain_community.embeddings import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.http import models
from pypdf import PdfReader
from docx import Document

# Initialize the Ollama embedding model
_embeddings_client = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url="http://host.docker.internal:11434"
)

# Initialize the Qdrant client
_qdrant_client = QdrantClient(
    url="http://qdrant:6333"
)

def check_system_health() -> dict:
    """
    Check the health of the core RAG infrastructure.
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

def generate_text_embedding(text: str) -> list[float]:
    """
    Generate a vector embedding for a piece of text using the local Ollama 
    embedding model.

    Args:
        text: ssThe text that should be converted into an embedding.

    Returns:
        A list of floating-point numbers representing the text embedding.
    """
    try:
        return _embeddings_client.embed_query(text)
    except Exception as e:
        raise RuntimeError(f"Embedding generation failed: {str(e)}")

      
def extract_text_from_file(file_path: str, filename: str) -> str:
    """
    Extract plain text from a PDF or Microsoft Word document.

    Args:
        file_path: Path to the file on the local filesystem.
        filename: Original filename, used to determine the file extension.

    Returns:
        The extracted text as a single string.
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

def split_text_into_chunks(
    text: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200
) -> list[str]:
    """
    Split a large document into smaller overlapping text chunks.

    Args:
        text: Full document text.
        chunk_size: Maximum approximate number of characters in each chunk.
        chunk_overlap: Number of characters shared between consecutive chunks.

    Returns:
        A list of text chunks ready to be embedded and stored in Qdrant.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )

    chunks = text_splitter.split_text(text)
    return chunks

def store_chunks_in_qdrant(
    chunks: list[str],
    filename: str,
    collection_name: str
) -> int:
    """
    Generate embeddings for text chunks and store them in Qdrant.

    Each chunk becomes an independent Qdrant point containing:
        - Its embedding vector.
        - The original text.
        - The source filename.
        - Its position within the original document.
    
    Args:
        chunks: List of text chunks extracted from a document.
        filename: Original document filename.
        collection_name: Qdrant collection where the vectors should be stored.

    Returns:
        The number of vectors successfully prepared for insertion.
  
    """
    ensure_collection_exists(collection_name)

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

    # Perform bulk upsert into Qdrant vector database.
    _qdrant_client.upsert(
        collection_name=collection_name,
        points=points
    )

    return len(points)

def ensure_collection_exists(collection_name: str):
    """
    Ensure that a Qdrant collection exists before inserting vectors.

    If the requested collection does not exist, it is automatically created
    using the vector configuration required by the embedding model.

    Args:
        collection_name: Name of the Qdrant collection that should be available.
    """
    try:
        collections = _qdrant_client.get_collections().collections
        exists = any(col.name == collection_name for col in collections)

        if not exists:
            _qdrant_client.create_collection(
                collection_name=collection_name,
                vectors_config=models.VectorParams(
                    size=768,  
                    distance=models.Distance.COSINE
                )
            )
    except Exception as e:
        raise RuntimeError(f"Failed to ensure Qdrant collection exists: {str(e)}")

def get_all_collections_info() -> list:
    """
    Retrieve detailed information about every Qdrant collection.

    The returned information includes:
        - Collection name.
        - Collection status.
        - Number of stored vectors/points.
        - Number of indexed vectors.
        - Vector dimension.
        - Number of unique source documents

    Returns:
        A list of dictionaries containing collection metadata.
    """
    try:
        response = _qdrant_client.get_collections()
        collections_data = []

        for col in response.collections:
            
            col_info = _qdrant_client.get_collection(col.name)

            vector_size = 0
            config = getattr(col_info, "config", None)
            params = getattr(config, "params", None) if config else None
            vectors = getattr(params, "vectors", None) if params else None

            if vectors:
                if hasattr(vectors, "size"):
                    vector_size = getattr(vectors, "size", 0)
                elif isinstance(vectors, dict) and vectors:
                    first_vector = list(vectors.values())[0]
                    vector_size = getattr(first_vector, "size", 0)

            unique_filenames = set()

            try:
                offset = None

                while True:
                    records, next_offset = _qdrant_client.scroll(
                        collection_name=col.name,
                        limit=1000,
                        offset=offset,
                        with_payload=["filename"],
                        with_vectors=False
                    )

                    for record in records:
                        if record.payload and "filename" in record.payload:
                            unique_filenames.add(record.payload["filename"])

                    offset = next_offset

                    if offset is None:
                        break

                document_count = len(unique_filenames)

            except Exception:
                document_count = 0  

            collections_data.append({
                "name": col.name,
                "status": str(getattr(col_info, "status", "unknown")).replace("CollectionStatus.", ""),
                "vectors_count": getattr(col_info, "vectors_count", getattr(col_info, "points_count", 0)) or 0,
                "indexed_vectors_count": getattr(col_info, "indexed_vectors_count", 0) or 0,
                "vector_size": vector_size,
                "document_count": document_count
            })

        return collections_data

    except Exception as e:
        raise RuntimeError(f"Failed to fetch detailed collections from Qdrant: {str(e)}")