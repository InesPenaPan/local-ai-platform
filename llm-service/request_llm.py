import requests
from typing import Optional, List, Dict, Any
from models import ChatMessage

def generate_from_ollama(
    model_name: str, 
    messages: List[ChatMessage], 
    system_prompt: Optional[str] = None,
    tools: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Delegates conversational completion requests to the local Ollama daemon,
    injecting optional tool calling schemas when provided.
    """
    ollama_url = "http://host.docker.internal:11434/api/chat"
    formatted_messages = []
    
    # Prepend system instruction prompt if explicitly supplied
    if system_prompt:
        formatted_messages.append({"role": "system", "content": system_prompt})
        
    # Format message history ensuring role and tool calls consistency
    for msg in messages:
        entry = {
            "role": msg.role.value,
            "content": msg.content or ""
        }
        if msg.tool_calls:
            entry["tool_calls"] = msg.tool_calls
        formatted_messages.append(entry)
    
    payload = {
        "model": model_name,
        "messages": formatted_messages,
        "stream": False
    }

    # Attach tool specifications to trigger native function calling in Ollama
    if tools:
        payload["tools"] = tools
    
    response = requests.post(ollama_url, json=payload, timeout=300.0)
    response.raise_for_status() 
    
    message_data = response.json().get("message", {})
    return {
        "reply": message_data.get("content", ""),
        "tool_calls": message_data.get("tool_calls", None)
    }