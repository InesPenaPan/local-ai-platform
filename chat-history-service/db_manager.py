from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship

DATABASE_URL = "sqlite:///./chat_history.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ConversationDB(Base):
    """
    SQLAlchemy ORM model representing a chat conversation session.
    """
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="New Conversation")
    created_at = Column(DateTime, default=datetime.utcnow)

    # One-to-many relationship: deleting a conversation cascades deletion to all its messages
    messages = relationship(
        "MessageDB", 
        back_populates="conversation", 
        cascade="all, delete-orphan"
    )


class MessageDB(Base):
    """
    SQLAlchemy ORM model representing individual chat messages within a conversation.
    """
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    role = Column(String)  # Identifies message origin: "system", "user", or "assistant"
    content = Column(String)

    # Many-to-one relationship back to the parent conversation record
    conversation = relationship("ConversationDB", back_populates="messages")


def get_db():
    """
    FastAPI dependency yielding an isolated database session per request lifecycle,
    ensuring deterministic connection teardown via try/finally.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()