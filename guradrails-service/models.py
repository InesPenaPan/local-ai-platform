from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base
from pydantic import BaseModel

DATABASE_URL = "sqlite:///./guardrails.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class GuardrailsDB(Base):
    """
    SQLAlchemy ORM model for storing global guardrails configuration.
    """
    __tablename__ = "guardrails_config"
    
    id = Column(Integer, primary_key=True, index=True)
    strict_mode = Column(Boolean, default=True)
    banned_topics = Column(String, default="")
    global_system_instruction = Column(String, default="")

def get_db():
    """
    Dependency generator for database sessions.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class GuardrailsConfig(BaseModel):
    """
    Inbound DTO for updating guardrails settings.
    """
    strict_mode: bool
    banned_topics: str
    global_system_instruction: str

class ValidationRequest(BaseModel):
    """
    Inbound DTO for prompt validation checks.
    """
    prompt: str