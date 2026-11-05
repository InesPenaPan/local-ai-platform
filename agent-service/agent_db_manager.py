from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from models import AgentCreate

# Database configuration
DATABASE_URL = "sqlite:///./agents.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class AgentDB(Base):
    """
    SQLAlchemy ORM model representing agent definitions and configurations.
    """
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    systemPrompt = Column(String)
    model = Column(String)
    mcp = Column(String, default="none")
    collection = Column(String)
    temperature = Column(Float)

# Create database tables if they do not already exist.
Base.metadata.create_all(bind=engine)

def get_db():
    """
    Dependency generator providing an isolated database session per request lifecycle.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- CRUD Functions ---

def create_new_agent(db: Session, agent: AgentCreate):
    """
    Persists a new agent configuration in the database.
    """
    db_agent = AgentDB(**agent.model_dump())
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent


def get_all_agents(db: Session):
    """
    Retrieves all registered agent configurations.
    """
    return db.query(AgentDB).all()


def get_agent_by_name(db: Session, name: str):
    """
    Retrieves a specific agent by its unique name.
    """
    return db.query(AgentDB).filter(AgentDB.name == name).first()


def delete_agent_by_id(db: Session, agent_id: int):
    """
    Deletes an existing agent from the database by its unique identifier.
    """
    db_agent = db.query(AgentDB).filter(AgentDB.id == agent_id).first()
    if not db_agent:
        return False

    db.delete(db_agent)
    db.commit()
    return True


def update_agent_by_name(db: Session, name: str, agent_update: AgentCreate):
    """
    Updates an existing agent configuration by its unique name.
    """
    db_agent = db.query(AgentDB).filter(AgentDB.name == name).first()
    if not db_agent:
        return None
    
    for key, value in agent_update.model_dump().items():
        setattr(db_agent, key, value)
        
    db.commit()
    db.refresh(db_agent)
    return db_agent