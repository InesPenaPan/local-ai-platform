from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class Role(str, Enum):
    """
    Enumeration representing the valid roles in a conversational context.
    """
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"

class ConversationCreate(BaseModel):
    """
    Payload to create a new conversation session
    """
    title: Optional[str] = "New Conversation"

class ConversationResponse(BaseModel):
    """
    Response schema representing a saved conversation
    """
    id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    """
    Payload to save a chat message under a specific conversation
    """
    role: Role
    content: str

class MessageResponse(BaseModel):
    """
    Response schema representing a saved message
    """
    id: int
    conversation_id: int
    role: Role
    content: str

    class Config:
        from_attributes = True