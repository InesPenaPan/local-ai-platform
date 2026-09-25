from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from models import AgentCreate, AgentResponse
import agent_logic

# --- DATABASE SETUP ---
DATABASE_URL = "sqlite:///./agents.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Database Model (ORM)
class AgentDB(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    systemPrompt = Column(String)
    model = Column(String)
    collection = Column(String)
    temperature = Column(Float)

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Agent Service")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- ENDPOINTS ---
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