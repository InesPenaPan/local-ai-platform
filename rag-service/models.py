from pydantic import BaseModel, Field

class TextEmbeddingRequest(BaseModel):
    """Payload schema containing the text required for vector generation."""
    text: str = Field(..., description="Raw text input string")

class EmbeddingResponse(BaseModel):
    """Response schema containing the generated vector metadata."""
    text: str
    dimension: int
    preview: list[float]