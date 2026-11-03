from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from models import Base, engine, get_db, GuardrailsConfig, ValidationRequest
import guardrails_logic

# Ensure database tables exist on application startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Guardrails Service")

# Global CORS middleware configuration
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

@app.get("/config")
def get_config(db: Session = Depends(get_db)):
    """
    Endpoint to retrieve the current global guardrails.
    """
    return guardrails_logic.get_or_create_config(db)

@app.post("/config")
def update_config(payload: GuardrailsConfig, db: Session = Depends(get_db)):
    """
    Endpoint to update the global guardrails.
    """
    guardrails_logic.update_config(db, payload)
    return {"status": "success"}

@app.post("/validate")
def validate_prompt(request: ValidationRequest, db: Session = Depends(get_db)):
    """
    Endpoint used by the agent-service to verify if a prompt is permitted.
    """
    return guardrails_logic.validate_prompt(db, request.prompt)