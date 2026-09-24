from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    message: str 
    model: str 
class ChatResponse(BaseModel):
    reply: str
    target_service: str = "llm-service"

class TextEmbeddingRequest(BaseModel):
    """Payload schema containing the text required for vector generation."""
    text: str = Field(..., description="Raw text input string")

class EmbeddingResponse(BaseModel):
    """Response schema containing the generated vector metadata."""
    text: str
    dimension: int
    preview: list[float]