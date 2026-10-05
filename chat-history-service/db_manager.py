from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from datetime import datetime

# SQLite local database configuration for chat history
DATABASE_URL = "sqlite:///./chat_history.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ConversationDB(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="New Conversation")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    messages = relationship("MessageDB", back_populates="conversation", cascade="all, delete-orphan")


class MessageDB(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    role = Column(String)  # "system", "user", or "assistant"
    content = Column(String)
    
    conversation = relationship("ConversationDB", back_populates="messages")


def get_db():
    """
    Dependency to inject DB session into endpoints.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()