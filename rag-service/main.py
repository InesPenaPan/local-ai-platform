from fastapi import FastAPI, HTTPException, UploadFile, File, Form
import shutil
import os

from models import TextEmbeddingRequest, EmbeddingResponse
from rag_logic import (
    generate_text_embedding, 
    check_system_health, 
    extract_text_from_file, 
    split_text_into_chunks,
    store_chunks_in_qdrant,
    get_all_collections_info
)

# Initialize FastAPI app with descriptive metadata
app = FastAPI(
    title="Local Enterprise RAG Service",
    description="Microservice handling vector embeddings via Ollama, health checks for Qdrant, and document parsing with chunking and storage.",
    version="1.0.0"
)

# Endpoint to check system and database connectivity
@app.get("/health", tags=["Monitoring"])
def health_check_route():
    return check_system_health()

# Endpoint to generate vector embeddings from text
@app.post("/embeddings", response_model=EmbeddingResponse, tags=["AI Operations"])
def generate_embedding_route(payload: TextEmbeddingRequest):
    try:
        # Generate the vector using core operations logic
        vector = generate_text_embedding(payload.text)
        
        # Return response matching the EmbeddingResponse model
        return EmbeddingResponse(
            text=payload.text,
            dimension=len(vector),
            preview=vector[:5]  # Show the first 5 dimensions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to upload, parse, chunk, and store documents dynamically in Qdrant collections
@app.post("/upload-document", tags=["Document Processing"])
async def upload_document_route(
    file: UploadFile = File(...),
    collection_name: str = Form(...)
):
    filename = file.filename
    if not filename.lower().endswith((".pdf", ".docx", ".doc", ".txt")):
        raise HTTPException(status_code=400, detail="Unsupported file format.")

    temp_file_path = f"temp_{filename}"

    try:
        # Save uploaded file temporarily on disk
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1. Extract raw text content from the file
        document_text = extract_text_from_file(temp_file_path, filename)
        
        if not document_text:
            raise HTTPException(status_code=400, detail="The document is empty or text could not be extracted.")

        # 2. Apply text chunking to split text into manageable parts
        chunks = split_text_into_chunks(document_text, chunk_size=1000, chunk_overlap=200)

        # 3. Generate embeddings for all chunks and store them in Qdrant under the specific collection
        stored_count = store_chunks_in_qdrant(chunks, filename, collection_name)

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
        # Clean up temporary file from local disk
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.get("/collections", tags=["Document Processing"])
def get_collections_route():
    try:
        collections = get_all_collections_info()
        return {"collections": collections}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))