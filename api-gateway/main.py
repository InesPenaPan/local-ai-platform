from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

from config import settings
from router import router as api_router

# Shared HTTP connection pool for asynchronous requests
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

# Initialize FastAPI application with lifespan
app = FastAPI(
    title="Local AI API Gateway",
    description="Asynchronous entry point and reverse proxy for local inference and RAG services",
    version="1.0.0",
    lifespan=lifespan
)

# Cross-Origin Resource Sharing (CORS) Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the unified AI services router
app.include_router(api_router)

@app.get("/health")
async def health():
    """
    Basic health-check probe for the Gateway service.
    """
    return {"status": "healthy", "service": "api-gateway"}