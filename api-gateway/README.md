# 🌐 API Gateway Service

> A high-performance, asynchronous reverse proxy and entry point built with **FastAPI** to orchestrate traffic, validate client payloads, and securely route requests to downstream AI microservices.

The service provides a centralized traffic management layer that can:

* Act as a single entry point for all frontend and client communications
* Forward conversational requests and system prompts to the LLM engine
* Route document ingestion and vector retrieval requests to the RAG service
* Coordinate agent registration and retrieval with the agent service

## 📋 Prerequisites

Before running this microservice, ensure you have the following installed and configured:

| Requirement | Details & Commands |
| :--- | :--- |
| **Python** | Version 3.11 or 3.12 (⚠️ *Important: Avoid experimental versions or Python 3.14 to prevent compilation errors with Pydantic-core*). |

## 🚀 Running the App

In your project terminal (with the `venv` activated), start the Uvicorn server on port 8000:
```PowerShell
python -m venv venv
.\venv\Scripts\activate

uvicorn main:app --port 8000 --reload
```

## 🌐 Routes

The Gateway acts as a reverse proxy mapping frontend requests to backend microservices under the `/api/v1` prefix:

| Method | Gateway Endpoint | Target Service | Description |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/health` | *Internal* | Basic health-check probe for the Gateway service. |
| **`POST`** | `/api/v1/llm/generate` | `llm-service:8001` | Forwards chat requests and system prompts to the LLM engine. |
| **`POST`** | `/api/v1/rag/embeddings` | `rag-service:8002` | Forwards text to generate vector embeddings. |
| **`POST`** | `/api/v1/rag/upload-document`| `rag-service:8002` | Forwards an uploaded document and its target collection name. |
| **`GET`** | `/api/v1/rag/collections` | `rag-service:8002` | Fetches the list of all collections and their sizes. |
| **`POST`** | `/api/v1/agents/create-agent` | `agent-service:8003` | Forwards a request to create and save a new agent. |
| **`GET`** | `/api/v1/agents/list` | `agent-service:8003` | Fetches the list of all created agents from the database. |
| **`GET`** | `/api/v1/agents/{name}` | `agent-service:8003` | Fetches a specific agent's configuration by its name. |

## 📦 Main Dependencies

The service relies on the following main components:

| Component | Purpose |
| :--- | :--- |
| **React** | Component-based UI library |

## 📁 Project Structure

```text
api-gateway/
│
├── main.py             # FastAPI entry point, lifecycle management, and route proxies.
├── router.py           # API routes and downstream proxy logic.
├── schemas.py          # Inbound and outbound Pydantic Data Transfer Objects (DTOs).
├── config.py           # Centralized environment configuration and service targets.
├── Dockerfile          # Docker container build instructions.
└── requirements.txt    # Production dependencies.
```

