from fastapi import FastAPI, HTTPException
from models import ChatRequest, ChatResponse
from request_llm import generate_from_ollama

app = FastAPI(title="LLM Service API")

@app.post("/generate", response_model=ChatResponse)
def generate_response(request: ChatRequest):
    """
    Entry point for handling conversational inference requests and proxying them to Ollama.
    """
    try:
        result = generate_from_ollama(
            model_name=request.model, 
            messages=request.messages,
            system_prompt=request.system_prompt,
            tools=request.tools
        )
        return ChatResponse(
            reply=result.get("reply"),
            tool_calls=result.get("tool_calls")
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error communicating with the LLM engine: {str(e)}"
        )