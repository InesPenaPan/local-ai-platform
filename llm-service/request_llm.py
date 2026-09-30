import requests
from typing import Optional 

def generate_from_ollama(model_name: str, prompt: str, system_prompt: Optional[str] = None) -> str:
    """
    Interfaces with a local Ollama instance to generate text based on a user prompt, 
    supporting optional system instructions to define custom agent behavior.
    """
    
    # ollama_url = "http://localhost:11434/api/generate"
    ollama_url = "http://host.docker.internal:11434/api/generate"
    
    # Construct the base payload with the required model and user prompt
    payload = {
        "model": model_name,
        "prompt": prompt,
        "stream": False
    }
    
    # Inject the system prompt into the payload if agent instructions are provided
    if system_prompt:
        payload["system"] = system_prompt
    
    # Execute the POST request to the Ollama API
    response = requests.post(ollama_url, json=payload)
    
    # Validate the response, raising an HTTPError for bad status codes
    response.raise_for_status() 
    
    # Extract and return the generated response string from the JSON payload
    data = response.json()
    return data.get("response", "")