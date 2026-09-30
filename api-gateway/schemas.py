from pydantic import BaseModel, Field
from typing import Optional

class ChatRequest(BaseModel):
    message: str 
    model: str 
    system_prompt: Optional[str] = None
    
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