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

def delete_agent_by_id(db: Session, agent_id: int):
    """
    Deletes an existing agent from the database by its unique identifier.
    Returns True if successfully deleted, False if the agent was not found.
    """
    from main import AgentDB
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
    from main import AgentDB
    db_agent = db.query(AgentDB).filter(AgentDB.name == name).first()
    if not db_agent:
        return None
    
    for key, value in agent_update.model_dump().items():
        setattr(db_agent, key, value)
        
    db.commit()
    db.refresh(db_agent)
    return db_agent