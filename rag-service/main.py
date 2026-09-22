from fastapi import FastAPI, HTTPException

from models import TextEmbeddingRequest, EmbeddingResponse
from rag_logic import generate_text_embedding, check_system_health

# Initialize FastAPI app with descriptive metadata
app = FastAPI(
    title="Local Enterprise RAG Service",
    description="Microservice handling vector embeddings via Ollama and health checks for Qdrant.",
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