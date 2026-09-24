from fastapi import APIRouter, HTTPException, status, UploadFile, File
import httpx

from schemas import ChatRequest, ChatResponse, TextEmbeddingRequest, EmbeddingResponse

router = APIRouter(prefix="/api/v1", tags=["AI Services Gateway"])

@router.post("/llm/generate", response_model=ChatResponse)
async def proxy_chat(payload: ChatRequest):
    """
    Forwards chat requests to the downstream LLM inference microservice.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://llm-service:8001/generate",
                json=payload.model_dump()
            )
            response.raise_for_status()
            data = response.json()

            return ChatResponse(
                reply=data.get("reply", ""),
                target_service="llm-service"
            )

    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Downstream LLM inference service is unreachable (port 8001 unavailable)."
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Downstream service error: {exc.response.text}"
        )


@router.post("/rag/embeddings", response_model=EmbeddingResponse)
async def proxy_embeddings(payload: TextEmbeddingRequest):
    """
    Forwards text to the downstream rag-service (port 8002) to generate vector embeddings.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://rag-service:8002/embeddings",
                json=payload.model_dump()
            )
            response.raise_for_status()
            return response.json()

    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Downstream RAG service is unreachable (port 8002 unavailable)."
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Downstream RAG service error: {exc.response.text}"
        )


@router.post("/rag/upload-document")
async def proxy_upload_document(file: UploadFile = File(...)):
    """
    Forwards an uploaded PDF or Word document to the downstream rag-service (port 8002).
    """
    try:
        file_bytes = await file.read()
        files = {"file": (file.filename, file_bytes, file.content_type)}

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://rag-service:8002/upload-document",
                files=files
            )
            response.raise_for_status()
            return response.json()

    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Downstream RAG service is unreachable (port 8002 unavailable)."
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Downstream RAG service error: {exc.response.text}"
        )