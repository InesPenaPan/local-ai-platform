from sqlalchemy.orm import Session
from models import AgentCreate

def create_new_agent(db: Session, agent: AgentCreate):
    """
    Persists a new agent configuration in the database.
    """
    from main import AgentDB
    db_agent = AgentDB(**agent.model_dump())
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

def get_all_agents(db: Session):
    """
    Retrieves all registered agent configurations.
    """
    from main import AgentDB
    return db.query(AgentDB).all()

def get_agent_by_name(db: Session, name: str):
    """
    Retrieves a specific agent by its unique name.
    """
    from main import AgentDB
    return db.query(AgentDB).filter(AgentDB.name == name).first()