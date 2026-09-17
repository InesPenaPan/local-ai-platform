from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    message: str 
    model: str 
class ChatResponse(BaseModel):
    reply: str
    target_service: str = "llm-service"