from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from enum import Enum

class Role(str, Enum):
    """
    Enumeration representing the valid roles in a conversational context.
    """
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"

class ChatMessage(BaseModel):
    """
    A single conversational message supporting standard content and tool invocations.
    """
    role: Role
    content: Optional[str] = ""
    tool_calls: Optional[List[Dict[str, Any]]] = None

class ChatRequest(BaseModel):
    """
    Incoming payload containing message history, target model, system prompt, and optional function definitions.
    """
    messages: List[ChatMessage]
    model: str
    system_prompt: Optional[str] = None
    tools: Optional[List[Dict[str, Any]]] = None 

class ChatResponse(BaseModel):
    """
    Outgoing response delivering either generated textual content or tool calls to be executed.
    """
    reply: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None