from pydantic import BaseModel

class AgentCreate(BaseModel):
    """
    Inbound DTO schema for validating agent creation payloads.
    """
    name: str
    description: str = ""
    systemPrompt: str
    model: str = "llama3.1"
    mcp: str = "none"                 
    collection: str = "none"
    temperature: float = 0.7


class AgentResponse(AgentCreate):
    """
    Outbound response DTO schema returning persisted agent details along with the unique ID.
    """
    id: int

    class Config:
        from_attributes = True