from fastapi import FastAPI, HTTPException, UploadFile, File, Form
import shutil
import os

from models import TextEmbeddingRequest, EmbeddingResponse, SearchRequest, SearchResponse
from retrieve_logic import search_similar_chunks
from store_logic import (
    generate_text_embedding,
    check_system_health,
    extract_text_from_file,
    split_text_into_chunks,
    store_chunks_in_qdrant,
    get_all_collections_info
)

# Initialize FastAPI app 
app = FastAPI(
    title="Local Enterprise RAG Service",
    description="Microservice handling vector embeddings via Ollama, health checks for Qdrant, and document parsing with chunking and storage.",
    version="1.0.0"
)

# =============================================================================
# ENDPOINTS
# =============================================================================

@app.get("/health", tags=["Monitoring"])
def health_check_route():
    """
    Check the health of the RAG service and its vector database connection.
    """
    return check_system_health()


@app.post("/embeddings", response_model=EmbeddingResponse, tags=["AI Operations"])
def generate_embedding_route(payload: TextEmbeddingRequest):
    """
    Generate an embedding vector for a piece of text.
    """
    try:
        vector = generate_text_embedding(payload.text)

        return EmbeddingResponse(
            text=payload.text,
            dimension=len(vector),
            preview=vector[:5]  
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload-document", tags=["Document Processing"])
async def upload_document_route(file: UploadFile = File(...), collection_name: str = Form(...)):
    """
    Upload and ingest a document into a Qdrant collection.
    """
    filename = file.filename

    if not filename.lower().endswith((".pdf", ".docx", ".doc", ".txt")):
        raise HTTPException(status_code=400, detail="Unsupported file format.")

    temp_file_path = f"temp_{filename}"

    try:
        # Save the uploaded file temporarily on disk.
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract raw text content from the file.
        document_text = extract_text_from_file(temp_file_path, filename)

        if not document_text:
            raise HTTPException(status_code=400, detail="The document is empty or text could not be extracted.")

        # Apply text chunking to split the document into manageable parts.
        chunks = split_text_into_chunks(
            document_text,
            chunk_size=1000,
            chunk_overlap=200
        )

        # Generate embeddings for all chunks and store them in Qdrant
        stored_count = store_chunks_in_qdrant(
            chunks,
            filename,
            collection_name
        )

        return {
            "filename": filename,
            "collection_used": collection_name,
            "extracted_characters": len(document_text),
            "total_chunks": len(chunks),
            "chunks_stored": stored_count,
            "message": "Document successfully processed, chunked, and stored in Qdrant."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)


@app.get("/collections", tags=["Document Processing"])
def get_collections_route():
    """
    Return detailed information about all Qdrant collections.
    """
    try:
        collections = get_all_collections_info()
        return {"collections": collections}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search", response_model=SearchResponse, tags=["Retrieval"])
def search_context_route(payload: SearchRequest):
    """
    Search a Qdrant collection for semantically similar document chunks.
    """
    try:
        result = search_similar_chunks(
            query=payload.query,
            collection_name=payload.collection_name,
            top_k=payload.top_k
        )

        return SearchResponse(
            context=result["context"],
            source_documents=result["source_documents"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))