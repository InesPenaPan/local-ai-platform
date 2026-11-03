from sqlalchemy.orm import Session
from models import GuardrailsDB, GuardrailsConfig

def get_or_create_config(db: Session):
    """
    Retrieves the global configuration or initializes a default if none exists.
    """
    config = db.query(GuardrailsDB).first()
    if not config:
        config = GuardrailsDB()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

def update_config(db: Session, payload: GuardrailsConfig):
    """
    Updates the existing global configuration properties.
    """
    config = db.query(GuardrailsDB).first()
    if not config:
        config = GuardrailsDB()
        db.add(config)
    
    config.strict_mode = payload.strict_mode
    config.banned_topics = payload.banned_topics
    config.global_system_instruction = payload.global_system_instruction
    
    db.commit()
    db.refresh(config)
    return config

def validate_prompt(db: Session, prompt: str):
    """
    Evaluates a user prompt against the banned topics list.
    Returns a dictionary detailing safety status and the global instruction overlay.
    """
    config = db.query(GuardrailsDB).first()
    if not config or not config.banned_topics:
        return {"safe": True, "global_instruction": config.global_system_instruction if config else ""}

    banned_words = [w.strip().lower() for w in config.banned_topics.split(",") if w.strip()]
    prompt_lower = prompt.lower()

    for word in banned_words:
        if word in prompt_lower:
            return {
                "safe": False, 
                "reason": f"System Guardrail Triggered: Topic related to '{word}' is restricted."
            }

    return {"safe": True, "global_instruction": config.global_system_instruction}