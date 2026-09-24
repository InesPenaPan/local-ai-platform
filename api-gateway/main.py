from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

from config import settings
from router import router as api_router

# Initialize FastAPI application with minimal configuration and lifespan
app = FastAPI(
    title="Local AI API Gateway",
    description="Asynchronous entry point and reverse proxy for local inference and RAG services",
    version="1.0.0"
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