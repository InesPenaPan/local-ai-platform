# 🧠 Local AI Platform 

> An end-to-end, private, and modular local AI platform designed to run on-premise Large Language Models (LLMs), orchestrate Retrieval-Augmented Generation (RAG) pipelines, execute autonomous agents with Model Context Protocol (MCP) tool support, and manage multi-turn chat sessions without relying on third-party cloud APIs

## 🏛️ System Architecture & Services

The ecosystem operates as a distributed system with standardized network boundaries and dedicated service responsibilities:

| Service | Port | Technology | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **`ai-app`** | `5173` | React, Vite, Tailwind CSS | Conversational UI, agent creation studio, and RAG/tool management dashboards. |
| **`api-gateway`** | `8000` | FastAPI, HTTPX | Centralized entry point, reverse proxy, request validation, and route orchestration. |
| **`llm-service`** | `8001` | FastAPI, Requests | Model inference proxy with Ollama, handling chat completion and native function calling. |
| **`rag-service`** | `8002` | FastAPI, LangChain, Qdrant | Document parsing, text chunking, local vector embedding generation, and semantic search. |
| **`agent-service`** | `8003` | FastAPI, SQLite, MCP Client | AI agent definition persistence and conversational reasoning loops with dynamic tool invocation. |
| **`chat-history-service`** | `8004` | FastAPI, SQLAlchemy, SQLite | Persistent conversational session storage and message history tracking. |
| **`qdrant`** | `6333` | Qdrant Vector Engine | Embedded vector storage and nearest-neighbor vector similarity retrieval. |
| **`mysql-mcp`** | `8080` | Node.js, MCP Protocol | *(Optional)* Model Context Protocol bridge server enabling database inspection and query execution. |

The following diagram illustrates the high-level system architecture, service communication pathways, and persistent storage layers:

```text
                                [ User / Browser ]
                                       │
                                       ▼
                   ┌─────────────────────────────────────────────┐
                   │                ai-app                       │
                   └─────────────────────────────────────────────┘
                                       │
                                       │ HTTP REST Requests
                                       ▼
 ┌───────────────────────────────────────────────────────────────────────────────────────────┐
 │                               api-gateway                                                 │               
 └───────────────────────────────────────────────────────────────────────────────────────────┘
         │                  │                  │                  │                   │
         │                  │                  │                  │                   │
         ▼                  ▼                  ▼                  ▼                   ▼
 ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  ┌──────────────────────┐  ┌───────────┐
 │ llm-service │  │ rag-service │  │ agent-service │  │ chat-history-service │  │ mysql-mcp │  
 └─────────────┘  └─────────────┘  └───────────────┘  └──────────────────────┘  └───────────┘ 
         │                  │                  │                  │
         │                  │                  │                  ▼
         │                  │                  │             [ chat_history.db ]
         ▼                  ▼                  ▼             (SQLite Database)
    [ OLLAMA ]    ┌─────────────┐         [ agents.db ]
 (Local Models)   │    Qdrant   │        (SQLite Database)
                  └─────────────┘ 
```

## 📋 Prerequisites

Before deploying the platform, verify that your environment satisfies the following requirements:

| Requirement | Details & Description |
| :--- | :--- |
| **Docker & Docker Compose** | Engine v24+ and Docker Compose v2+ installed for multi-container orchestration. |
| **Ollama** | [Download Ollama](https://ollama.com/) and ensure the background daemon is running and reachable on `http://localhost:11434`. |
| **LLM Inference Models** | Pull your desired model before initiating inference calls (e.g., `ollama pull llama3.1`). |
| **Embedding Models** | Pull and run the local embedding model used by the RAG service: `ollama run nomic-embed-text`.|

## 🚀 Running the App

### Step 1: Start the LLM Engine

Open a terminal and start your local Ollama instance. Ensure the default model is downloaded and loaded into memory:

```PowerShell
ollama run llama3.1
```

*(You can type `/bye` to exit the prompt; Ollama will keep running in the background)*


### Step 2: Configure Environment Variables

Create or review your root `.env` file to ensure the API Gateway and downstream services have their required keys and endpoints configured (e.g., `REMOTE_SECRET_KEY`).

### Step 3: Deploy the Ecosystem

From the root repository directory (where the `docker-compose.yml` is located) build and launch all containers in detached mode:

```PowerShell
docker compose up --build -d
```

### Step 4: Verify Service Health

Inspect the operational status of all platform containers:

```PowerShell
docker compose ps
```

## 🌐 User Interfaces & Endpoints

Once initialized, access the graphical dashboards and technical interfaces directly from your browser:

* **Frontend Application (Web UI)**: http://localhost:5173
* **API Gateway Swagger Documentation**: http://localhost:8000/docs
* **Qdrant Vector Database Web Dashboard**: http://localhost:6333/dashboard


## 📁 Project Structure

Each subdirectory is an isolated service containing its own dedicated `README.md`, configuration, and dependency definitions:

```text
local-ai-platform/
│
├── agent-service/          # Custom AI agent profiles, logic handlers, and MCP execution loops
├── ai-app/                 # Responsive React/Vite user interface (Chat, Knowledge, Tools)
├── api-gateway/            # Central asynchronous reverse proxy and route orchestrator
├── chat-history-service/   # Session persistence, relational message storage, and SQLite backend
├── llm-service/            # Local model inference abstraction layer interfacing with Ollama
├── mysql-mcp/              # MCP database server exposing SQL inspection tools over HTTP/SSE
├── rag-service/            # Document parsing, chunking, embedding generation, and Qdrant retrieval
│
├── docker-compose.yml      # Orchestration file linking container networks, volumes, and ports
└── README.md               # Root architecture overview and deployment guide
```

