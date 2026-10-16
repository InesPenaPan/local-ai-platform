from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from pydantic import BaseModel
from typing import Optional, List

from models import AgentCreate, AgentResponse
import agent_logic
from agent_chat import execute_agent_chat

DATABASE_URL = "sqlite:///./agents.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class AgentDB(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    systemPrompt = Column(String)
    model = Column(String)
    mcp = Column(String, default="none")
    collection = Column(String)
    temperature = Column(Float)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Agent Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AgentChatRequest(BaseModel):
    """
    Inbound payload containing the user query and optional previous conversation history.
    """
    prompt: str
    history: Optional[List[dict]] = []

@app.post("/create-agent", response_model=AgentResponse)
def create_agent(agent: AgentCreate, db: Session = Depends(get_db)):
    return agent_logic.create_new_agent(db, agent)

@app.get("/list", response_model=list[AgentResponse])
def list_agents(db: Session = Depends(get_db)):
    return agent_logic.get_all_agents(db)

@app.get("/agent/{name}", response_model=AgentResponse)
def get_agent(name: str, db: Session = Depends(get_db)):
    agent = agent_logic.get_agent_by_name(db, name)
    if agent is None:
        raise HTTPException(status_code=404, detail=f"Agente con el nombre '{name}' no encontrado")
    return agent

@app.post("/agent/{name}/chat")
async def chat_with_agent(name: str, payload: AgentChatRequest, db: Session = Depends(get_db)):
    """
    Executes a chat session with an agent, granting it access to downstream MCP database tools.
    """
    agent = agent_logic.get_agent_by_name(db, name)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agente con el nombre '{name}' no encontrado")
        
    reply = await execute_agent_chat(agent, payload.prompt, payload.history)
    return {"reply": reply}