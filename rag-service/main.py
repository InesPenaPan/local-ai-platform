from fastapi import FastAPI, HTTPException, UploadFile, File
import shutil
import os

from models import TextEmbeddingRequest, EmbeddingResponse
from rag_logic import generate_text_embedding, check_system_health, extract_text_from_file

# Initialize FastAPI app with descriptive metadata
app = FastAPI(
    title="Local Enterprise RAG Service",
    description="Microservice handling vector embeddings via Ollama, health checks for Qdrant, and document parsing.",
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
        # Generate the vector using our core operations logic
        vector = generate_text_embedding(payload.text)
        
        # Return response matching the EmbeddingResponse model
        return EmbeddingResponse(
            text=payload.text,
            dimension=len(vector),
            preview=vector[:5]  # Show the first 5 dimensions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to upload and parse PDF or Word documents
@app.post("/upload-document", tags=["Document Processing"])
async def upload_document_route(file: UploadFile = File(...)):
    filename = file.filename
    if not filename.lower().endswith((".pdf", ".docx", ".doc")):
        raise HTTPException(status_code=400, detail="Only PDF and Word documents are allowed.")

    temp_file_path = f"temp_{filename}"

    try:
        # Save temporary file locally
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract text content from file
        document_text = extract_text_from_file(temp_file_path, filename)
        
        if not document_text:
            raise HTTPException(status_code=400, detail="The document is empty or text could not be extracted.")

        # Generate preview embedding from extracted text chunk
        vector = generate_text_embedding(document_text[:2000])

        return {
            "filename": filename,
            "extracted_characters": len(document_text),
            "vector_dimension": len(vector),
            "vector_preview": vector[:5],
            "message": "Document successfully processed and embedded."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)