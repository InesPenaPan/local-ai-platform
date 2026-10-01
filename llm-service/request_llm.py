import requests
from typing import Optional, List
from models import ChatMessage

def generate_from_ollama(model_name: str, messages: List[ChatMessage], system_prompt: Optional[str] = None) -> str:
    
    ollama_url = "http://host.docker.internal:11434/api/chat"
    
    formatted_messages = []
    
    # Inject system prompt at the beginning if provided
    if system_prompt:
        formatted_messages.append({
            "role": "system",
            "content": system_prompt
        })
        
    # Append all conversation messages
    for msg in messages:
        formatted_messages.append({
            "role": msg.role.value,
            "content": msg.content
        })
    
    payload = {
        "model": model_name,
        "messages": formatted_messages,
        "stream": False
    }
    
    response = requests.post(ollama_url, json=payload)
    response.raise_for_status() 
    
    data = response.json()
    
    # Extract response content from Ollama's chat response structure
    return data.get("message", {}).get("content", "")