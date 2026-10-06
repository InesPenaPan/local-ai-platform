# 🧠 Local AI Platform 

> An end-to-end, private local AI platform and experimentation testbed designed to run on-premise Large Language Models (LLMs), test Retrieval-Augmented Generation (RAG) pipelines, and build secure conversational agents offline using FastAPI and Ollama.

## 📋 Prerequisites

Before running the platform, ensure you have the following installed and configured on your host machine:

| Requirement | Details |
| :--- | :--- |
| **Docker & Compose** | Required to build, orchestrate, and run the microservices ecosystem. |
| **Ollama** | [Download Ollama](https://ollama.com/) and ensure it is running in the background (`http://localhost:11434`). |
| **LLM Models** | You need to download your preferred models locally via Ollama (e.g., `ollama pull llama3.1`). |

## 🚀 Running the App

### Step 1: Start the LLM Engine

Open a terminal and start your local Ollama instance. Ensure the default model is downloaded and loaded into memory:

```PowerShell
ollama run llama3.1
```

*(You can type `/bye` to exit the prompt; Ollama will keep running in the background)*

### Step 2: Deploy the Microservices

Open a new terminal, navigate to the root directory of the project (where the `docker-compose.yml` is located), and build/start the containers in detached mode:

```PowerShell
docker compose up --build -d
```

### Step 3: Verify the Deployment

Ensure that all backend services, the frontend, and the databases are up and running successfully:

```PowerShell
docker compose ps
```

## 🌐 User Interfaces & Endpoints

Once your containers are fully initialized, you can interact with the platform through your browser:

* Frontend Application (Web UI): http://localhost:5173
* Qdrant Vector Database (Dashboard UI): http://localhost:6333/dashboard
* API Gateway (Swagger UI): http://localhost:8000/docs


## 📁 Project Structure

This repository uses a microservices architecture. Each service contains its own detailed `README.md` for specific configuration and development guidelines.

```text
local-ai-platform/
│
├── agent-service/          # Microservice for creating and managing custom AI agents
├── ai-app/                 # Frontend Web Application (React/Vite)
├── api-gateway/            # Centralized FastAPI reverse proxy and routing
├── llm-service/            # Downstream service interfacing with local LLMs (Ollama)
├── rag-service/            # Microservice for document embedding and vector search
│
├── docker-compose.yml      # Global deployment configuration
└── README.md               # Global platform documentation (You are here)
```

