from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db_manager import engine, Base, get_db, ConversationDB, MessageDB
from models import (
    ConversationCreate, ConversationResponse, 
    MessageCreate, MessageResponse
)

# Automatically create database tables on application startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Chat History Service API")

@app.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(db: Session = Depends(get_db)):
    """
    Retrieve a list of all saved conversations ordered by newest first.
    """
    return db.query(ConversationDB).order_by(ConversationDB.created_at.desc()).all()


@app.post("/conversations", response_model=ConversationResponse)
def create_conversation(payload: ConversationCreate, db: Session = Depends(get_db)):
    """
    Create a new conversation session and return its details.
    """
    new_conv = ConversationDB(title=payload.title)
    db.add(new_conv)
    db.commit()
    db.refresh(new_conv)
    return new_conv


@app.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(conversation_id: int, db: Session = Depends(get_db)):
    """
    Retrieve all messages belonging to a specific conversation ID.
    """
    conv = db.query(ConversationDB).filter(ConversationDB.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv.messages


@app.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
def add_message_to_conversation(conversation_id: int, payload: MessageCreate, db: Session = Depends(get_db)):
    """
    Save a new message (user prompt or assistant reply) under a specific conversation ID.
    """
    conv = db.query(ConversationDB).filter(ConversationDB.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    new_msg = MessageDB(
        conversation_id=conversation_id,
        role=payload.role.value,
        content=payload.content
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg