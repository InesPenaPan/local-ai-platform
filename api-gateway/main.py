from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
import httpx

from config import settings
from schemas import ChatRequest, ChatResponse

# Shared HTTP connection pool
http_client: httpx.AsyncClient = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages the lifecycle of persistent resources across the application.
    Initializes a shared AsyncClient pool on startup and ensures clean disposal on shutdown.
    """
    global http_client
    http_client = httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT_SECONDS)
    yield
    await http_client.aclose()

app = FastAPI(
    title="Local AI API Gateway",
    description="Asynchronous entry point and reverse proxy for local inference services",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/health")
async def health():
    """
    Basic health-check probe for the Gateway service.
    """
    return {"status": "healthy", "service": "api-gateway"}


@app.post("/api/v1/chat", response_model=ChatResponse)
async def proxy_chat(payload: ChatRequest):
    """
    Validates the inbound payload from the client and forwards the request
    asynchronously to the downstream LLM inference microservice.
    """
    try:
        # Forward request payload to the internal LLM service on port 8001
        response = await http_client.post(
            settings.LLM_SERVICE_URL,
            json=payload.model_dump()
        )
        response.raise_for_status()
        data = response.json()

        return ChatResponse(
            reply=data.get("reply", ""),
            target_service="llm-service"
        )

    except httpx.ConnectError:
        # Raised when the downstream LLM service is offline or unreachable
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Downstream LLM inference service is unreachable (port 8001 unavailable)."
        )
    except httpx.HTTPStatusError as exc:
        # Raised when the downstream service returns an HTTP 4xx or 5xx status code
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Downstream service error: {exc.response.text}"
        )