from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class Role(str, Enum):
    """
    Enumeration representing the valid roles in a conversational context.
    """
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
    Incoming request data with message history and model settings
    """
    messages: List[ChatMessage]
    model: str
    system_prompt: Optional[str] = None

class ChatResponse(BaseModel):
    """
    Outgoing response containing the generated text
    """
    reply: str