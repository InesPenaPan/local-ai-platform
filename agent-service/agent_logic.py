from sqlalchemy.orm import Session
from models import AgentCreate

def create_new_agent(db: Session, agent: AgentCreate):
    from main import AgentDB
    db_agent = AgentDB(**agent.model_dump())
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

def get_all_agents(db: Session):
    from main import AgentDB
    return db.query(AgentDB).all()