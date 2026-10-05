from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class Role(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"

class ChatMessage(BaseModel):
    """
    A single message with its role and content
    """
    role: Role
    content: str

class ChatRequest(BaseModel):
    """
    Incoming payload containing message history, model selection, and optional system prompt
    """
    messages: List[ChatMessage]
    model: str 
    system_prompt: Optional[str] = None
    
class ChatResponse(BaseModel):
    reply: str
    target_service: str = "llm-service"

class TextEmbeddingRequest(BaseModel):
    """
    Payload schema containing the text required for vector generation.
    """
    text: str = Field(..., description="Raw text input string")

class EmbeddingResponse(BaseModel):
    """
    Response schema containing the generated vector metadata.ç
    """
    text: str
    dimension: int
    preview: list[float]

class SearchRequest(BaseModel):
    """
    Payload schema for querying the vector database for relevant context.
    """
    query: str = Field(..., description="The user's message or search query")
    collection_name: str = Field(..., description="The target collection to search for context")
    top_k: int = Field(3, description="Number of text chunks to retrieve")

class SearchResponse(BaseModel):
    """
    Response schema containing the retrieved context and its sources.
    """
    context: str
    source_documents: list[str]

class ConversationCreate(BaseModel):
    """
    Payload to create a new conversation session.
    """
    title: Optional[str] = "New Conversation"

class ConversationResponse(BaseModel):
    """
    Response schema representing a saved conversation.
    """
    id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    """
    Payload to save a chat message under a specific conversation.
    """
    role: Role
    content: str

class MessageResponse(BaseModel):
    """
    Response schema representing a saved message.
    """
    id: int
    conversation_id: int
    role: Role
    content: str

    class Config:
        from_attributes = True