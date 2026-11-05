from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from models import AgentCreate, AgentResponse
import agent_db_manager
from agent_db_manager import get_db
from agent_executor import execute_agent_chat

# FastAPI application initialization
app = FastAPI(title="Agent Service")

# Global CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AgentChatRequest(BaseModel):
    """
    Schema for inbound chat requests containing the user query and message context.
    """
    prompt: str
    history: Optional[List[dict]] = []


@app.post("/create-agent", response_model=AgentResponse)
def create_agent(agent: AgentCreate, db: Session = Depends(get_db)):
    """
    Registers a new agent configuration in the system.
    """
    return agent_db_manager.create_new_agent(db, agent)


@app.get("/list", response_model=list[AgentResponse])
def list_agents(db: Session = Depends(get_db)):
    """
    Retrieves all registered agents stored in the database.
    """
    return agent_db_manager.get_all_agents(db)


@app.get("/agent/{name}", response_model=AgentResponse)
def get_agent(name: str, db: Session = Depends(get_db)):
    """
    Fetches the configuration details of a specific agent by its unique name.
    """
    agent = agent_db_manager.get_agent_by_name(db, name)
    if agent is None:
        raise HTTPException(status_code=404, detail=f"Agente con el nombre '{name}' no encontrado")
    return agent


@app.post("/agent/{name}/chat")
async def chat_with_agent(name: str, payload: AgentChatRequest, db: Session = Depends(get_db)):
    """
    Executes a multi-turn chat cycle with the specified agent using MCP tool integrations.
    """
    agent = agent_db_manager.get_agent_by_name(db, name)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agente con el nombre '{name}' no encontrado")

    reply = await execute_agent_chat(agent, payload.prompt, payload.history)
    return {"reply": reply}


@app.delete("/agent/{agent_id}")
def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    """
    Deletes an agent configuration matching the specified ID.
    Raises a 404 HTTP exception if the agent does not exist.
    """
    success = agent_db_manager.delete_agent_by_id(db, agent_id)
    if not success:
        raise HTTPException(
            status_code=404, 
            detail=f"Agent with ID '{agent_id}' not found"
        )
    return {"message": "Agent deleted successfully"}

@app.put("/agent/{name}", response_model=AgentResponse)
def update_agent(name: str, agent_update: AgentCreate, db: Session = Depends(get_db)):
    """
    Updates an existing agent's configuration details by its unique name.
    """
    # Corregido: antes decía agent_logic.update_agent_by_name
    updated_agent = agent_db_manager.update_agent_by_name(db, name, agent_update)
    if updated_agent is None:
        raise HTTPException(
            status_code=404, 
            detail=f"Agente con el nombre '{name}' no encontrado para actualizar"
        )
    return updated_agent