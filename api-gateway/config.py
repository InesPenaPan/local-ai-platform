import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    LLM_SERVICE_URL: str = os.getenv("LLM_SERVICE_URL", "http://llm-service:8001")
    RAG_SERVICE_URL: str = os.getenv("RAG_SERVICE_URL", "http://rag-service:8002")
    AGENT_SERVICE_URL: str = os.getenv("AGENT_SERVICE_URL", "http://agent-service:8003")
    CHAT_HISTORY_SERVICE_URL: str = os.getenv("CHAT_HISTORY_SERVICE_URL", "http://chat-history-service:8004")
    MYSQL_MCP_URL: str = os.getenv("MYSQL_MCP_URL", "http://mysql-mcp:8080")
    
    REMOTE_SECRET_KEY: str

    REQUEST_TIMEOUT_SECONDS: float = 30.0
    LLM_TIMEOUT_SECONDS: float = 300.0  # 5 minutes for heavy local inference

    model_config = SettingsConfigDict(extra="ignore")

settings = Settings()