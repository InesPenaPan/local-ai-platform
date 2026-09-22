from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    LLM_SERVICE_URL: str = "http://llm-service:8001/generate"
    GATEWAY_PORT: int = 8000
    REQUEST_TIMEOUT_SECONDS: float = 120.0

settings = Settings()