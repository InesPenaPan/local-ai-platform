from datetime import datetime
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
import httpx

from schemas import (
    ChatRequest, 
    ChatResponse, 
    TextEmbeddingRequest, 
    EmbeddingResponse,
    SearchRequest,
    SearchResponse,
    ConversationCreate,   
    ConversationResponse, 
    MessageCreate,       
    MessageResponse      
)

router = APIRouter(prefix="/api/v1", tags=["AI Services Gateway"])

@router.post("/llm/generate", response_model=ChatResponse)
async def proxy_chat(payload: ChatRequest):
    """
    Forwards chat requests (including message history and roles) 
    to the downstream LLM inference microservice.
    """
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            # model_dump() convertirá correctamente la lista de mensajes y los Enums a JSON
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
    except httpx.ReadTimeout:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The LLM service took too long to respond (Read Timeout)."
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
        async with httpx.AsyncClient(timeout=30.0) as client:
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
    except httpx.ReadTimeout:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The RAG service took too long to generate embeddings (Read Timeout)."
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Downstream RAG service error: {exc.response.text}"
        )


@router.post("/rag/upload-document")
async def proxy_upload_document(
    file: UploadFile = File(...),
    collection_name: str = Form(...)
):
    """
    Forwards an uploaded document and its target collection name to the downstream RAG service.
    """
    try:
        file_bytes = await file.read()
        files = {"file": (file.filename, file_bytes, file.content_type)}
        
        # Only send collection_name, matching the React frontend
        data = {"collection_name": collection_name}

        timeout_settings = httpx.Timeout(120.0, connect=15.0)

        async with httpx.AsyncClient(timeout=timeout_settings) as client:
            response = await client.post(
                "http://rag-service:8002/upload-document",
                files=files,
                data=data
            )
            response.raise_for_status()
            return response.json()

    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Downstream RAG service is unreachable (port 8002 unavailable)."
        )
    except httpx.ReadTimeout:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The RAG service took too long to process and embed the document (Read Timeout)."
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Downstream RAG service error: {exc.response.text}"
        )


@router.get("/rag/collections")
async def proxy_get_collections():
    """
    Fetches the list of all collections and their sizes from the downstream RAG service.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get("http://rag-service:8002/collections")
            response.raise_for_status()
            return response.json()

    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Downstream RAG service is unreachable."
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Downstream RAG service error: {exc.response.text}"
        )


@router.post("/rag/search", response_model=SearchResponse)
async def proxy_search_context(payload: SearchRequest):
    """
    Forwards search queries to the downstream RAG service to retrieve relevant context.
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "http://rag-service:8002/search",
                json=payload.model_dump()
            )
            response.raise_for_status()
            return response.json()

    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Downstream RAG service is unreachable (port 8002 unavailable)."
        )
    except httpx.ReadTimeout:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The RAG service took too long to search the vector database."
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Downstream RAG service error: {exc.response.text}"
        )


@router.post("/agents/create-agent")
async def proxy_create_agent(payload: dict):
    """
    Forwards a request to create a new agent to the downstream agent-service (port 8003).
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "http://agent-service:8003/create-agent",
                json=payload
            )
            response.raise_for_status()
            return response.json()

    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Downstream agent-service is unreachable (port 8003 unavailable)."
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Downstream agent-service error: {exc.response.text}"
        )


@router.get("/agents/list")
async def proxy_get_agents():
    """
    Fetches the list of all created agents from the downstream agent-service (port 8003).
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get("http://agent-service:8003/list")
            response.raise_for_status()
            return response.json()

    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Downstream agent-service is unreachable (port 8003 unavailable)."
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Downstream agent-service error: {exc.response.text}"
        )


@router.get("/agent/agents/{name}")
async def proxy_get_agent(name: str):
    """
    Fetches a specific agent by name from the downstream agent-service.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                f"http://agent-service:8003/agent/{name}"
            )
            response.raise_for_status()
            return response.json()

    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Downstream agent-service is unreachable (port 8003 unavailable)."
        )
    except httpx.ReadTimeout:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The agent-service took too long to respond."
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Downstream agent-service error: {exc.response.text}"
        )

@router.get("/history/conversations")
async def proxy_list_conversations():
    """
    Fetches the list of all saved conversations from the chat-history-service.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get("http://chat-history-service:8004/conversations")
            response.raise_for_status()
            return response.json()

    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Downstream chat-history-service is unreachable (port 8004 unavailable)."
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Downstream chat-history-service error: {exc.response.text}"
        )


@router.post("/history/conversations")
async def proxy_create_conversation(payload: ConversationCreate):
    """
    Forwards a request to create a new conversation to the chat-history-service.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "http://chat-history-service:8004/conversations",
                json=payload.model_dump()
            )
            response.raise_for_status()
            return response.json()

    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Downstream chat-history-service is unreachable (port 8004 unavailable)."
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Downstream chat-history-service error: {exc.response.text}"
        )


@router.get("/history/conversations/{conversation_id}/messages")
async def proxy_get_conversation_messages(conversation_id: int):
    """
    Fetches all messages belonging to a specific conversation from chat-history-service.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                f"http://chat-history-service:8004/conversations/{conversation_id}/messages"
            )
            response.raise_for_status()
            return response.json()

    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Downstream chat-history-service is unreachable (port 8004 unavailable)."
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Downstream chat-history-service error: {exc.response.text}"
        )


@router.post("/history/conversations/{conversation_id}/messages")
async def proxy_add_message_to_conversation(conversation_id: int, payload: MessageCreate):
    """
    Forwards a message (user prompt or assistant reply) to be saved in a conversation.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"http://chat-history-service:8004/conversations/{conversation_id}/messages",
                json=payload.model_dump()
            )
            response.raise_for_status()
            return response.json()

    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Downstream chat-history-service is unreachable (port 8004 unavailable)."
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Downstream chat-history-service error: {exc.response.text}"
        )