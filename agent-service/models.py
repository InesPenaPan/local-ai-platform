from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, declarative_base
from pydantic import BaseModel

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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AgentCreate(BaseModel):
    name: str
    description: str = ""
    systemPrompt: str
    model: str = "llama3.1"
    mcp: str = "none"                 
    collection: str = "none"
    temperature: float = 0.7

class AgentResponse(AgentCreate):
    id: int
    class Config:
        from_attributes = True