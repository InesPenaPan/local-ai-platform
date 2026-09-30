from fastapi import FastAPI, HTTPException
from models import ChatRequest, ChatResponse
from request_llm import generate_from_ollama

app = FastAPI(title="LLM Service API")

@app.post("/generate", response_model=ChatResponse)
def generate_response(request: ChatRequest):
    """
    Endpoint that receives a user prompt, model selection, and an optional system prompt,
    delegates the generation task to the local LLM handler, and returns the result.
    """
    try:
        generated_text = generate_from_ollama(
            model_name=request.model, 
            prompt=request.message,
            system_prompt=request.system_prompt
        )
        
        return ChatResponse(reply=generated_text)
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error communicating with the LLM engine: {str(e)}"
        )