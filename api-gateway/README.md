# 🌐 API Gateway Service

> A high-performance, asynchronous reverse proxy and unified API gateway built with **FastAPI** to orchestrate traffic, validate client payloads, and securely route requests to downstream AI platform microservices.

The service acts as the central traffic management backbone of the platform, enabling:

* A single unified endpoint layer for frontend clients and external consumers under the `/api/v1` namespace.
* Conversational routing to the LLM inference service with extended timeout handling.
* Knowledge base operations, document ingestion, and vector retrieval routing for the RAG service.
* Agent lifecycle configuration management and multi-turn MCP tool execution coordination.
* Session and message persistence proxying for conversational history tracking.
* Direct health monitoring and connectivity verification for upstream services, including MCP servers.

## 📋 Prerequisites

Before running this microservice, ensure you have the following installed and configured:

| Requirement | Details & Description |
| :--- | :--- |
| **Python** | Version 3.11 or 3.12 (⚠️ *Important: Avoid Python 3.14 or unverified experimental builds to prevent native compilation issues*). |
| **Downstream Services** | The Gateway routes traffic to local services. Ensure upstream services (`llm-service`, `rag-service`, `agent-service`, `chat-history-service`, and optional MCP providers) are running or mapped appropriately. |

## 🌐 Routes & Proxy Mapping

Thee Gateway routes incoming client traffic to targeted downstream microservices under the `/api/v1` prefix:

| Method | Gateway Endpoint | Target Service | Description |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/health` | *Internal* | Basic health-check probe for the Gateway service. |
| **`POST`** | `/llm/generate` | `llm-service:8001` | Forwards chat requests and system prompts to the LLM engine. |
| **`POST`** | `/rag/embeddings` | `rag-service:8002` | Generates vector embeddings for raw text input. |
| **`POST`** | `/rag/upload-document` | `rag-service:8002` | Uploads multipart document files to be vectorized into a collection. |
| **`GET`** | `/rag/collections` | `rag-service:8002` | Fetches available vector collections and document counts. |
| **`POST`** | `/agents/create-agent` | `agent-service:8003` | Registers and persists a new custom AI agent definition. |
| **`GET`** | `/agents/list` | `agent-service:8003` | Retrieves all registered AI agent configurations. |
| **`GET`** | `/agents/agents/{name}` | `agent-service:8003` | Fetches a specific agent's configuration by name. |
| **`POST`** | `/agents/agent/{name}/chat` | `agent-service:8003` | Proxies chat sessions to an agent, coordinating multi-turn MCP tool loops. |
| **`DELETE`** | `/agents/{agent_id}` | `agent-service:8003` | Deletes an existing agent configuration by ID. |
| **`GET`** | `/history/conversations` | `chat-history-service:8004` | Retrieves all saved conversation sessions. |
| **`POST`** | `/history/conversations` | `chat-history-service:8004` | Initializes a new persistent conversation session. |
| **`GET`** | `/history/conversations/{id}/messages` | `chat-history-service:8004` | Fetches all stored messages belonging to a conversation. |
| **`POST`** | `/history/conversations/{id}/messages` | `chat-history-service:8004` | Appends a new user or assistant message to a conversation. |
| **`DELETE`** | `/history/conversations/{id}` | `chat-history-service:8004` | Deletes a conversation session and all its stored messages. |
| **`GET`** | `/mysql/health` | `mysql-mcp:8080` | Verifies health and connectivity status of the MySQL MCP provider. |
| **`GET`** | `/github/health` | `github-mcp:8080` | Verifies health and connectivity status of the GitHub MCP provider. |


## 📦 Main Dependencies

The service relies on the following main components:

| Component | Purpose |
| :--- | :--- |
| **FastAPI** | High-performance asynchronous API framework and route definitions. |
| **Uvicorn** | ASGI server managing concurrent requests and network sockets. |
| **HTTPX** | Non-blocking asynchronous HTTP client for forwarding proxy requests. |
| **Pydantic** | Data validation, contract typing, and environment configuration management. |

## 📁 Project Structure

```text
api-gateway/
│
├── config.py           # Centralized environment settings, timeout rules, and service discovery
├── Dockerfile          # Multi-stage container deployment specification
├── main.py             # Application factory, lifespan client pooling, and CORS configuration
├── README.md           # Gateway architecture, route mappings, and deployment documentation
├── requirements.txt    # Pinned production dependencies
├── router.py           # Unified proxy route handlers and downstream error translation
└── schemas.py          # Pydantic data models (DTOs) for inbound and outbound payload validation
```

