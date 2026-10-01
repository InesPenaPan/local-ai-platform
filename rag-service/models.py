from pydantic import BaseModel, Field

class TextEmbeddingRequest(BaseModel):
    """Payload schema containing the text required for vector generation."""
    text: str = Field(..., description="Raw text input string")

class EmbeddingResponse(BaseModel):
    """Response schema containing the generated vector metadata."""
    text: str
    dimension: int
    preview: list[float]

class SearchRequest(BaseModel):
    """Payload schema for querying the vector database for relevant context."""
    query: str = Field(..., description="The user's message or search query")
    collection_name: str = Field(..., description="The target collection to search for context")
    top_k: int = Field(3, description="Number of text chunks to retrieve")

class SearchResponse(BaseModel):
    """Response schema containing the retrieved context and its sources."""
    context: str
    source_documents: list[str]