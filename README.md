# Local AI Platform 

> An end-to-end, private local AI platform and experimentation testbed designed to run on-premise Large Language Models (LLMs), test Retrieval-Augmented Generation (RAG) pipelines, and build secure conversational agents offline using FastAPI and Ollama.

# 📁 Project Structure

``` text
local-ai-platform/
│
├── README.md               # Global platform documentation and ecosystem setup
└── llm-service/            # Downstream service interfacing with local LLMs
```

## 🚀 Running the App

To run the pltaform, ensure you have Docker, Docker Compose, and [Ollama](https://ollama.com/) installed on your system.

1. Start your local Ollama instance and ensure the required model is loaded or available:

```PowerShell
ollama run llama3.1
```

2. Open your terminal, navigate to the root directory of the project where the `docker-compose.yml` file is located, and build/start the containers in detached mode:

```PowerShell
docker compose up --build -d
```

3. Verify that all services are up and running successfully:

```PowerShell
docker compose ps
```

## User Interface

Once your containers are up and running, you can access the platform's services and UIs through the following ports:

* Frontend Application (Web UI): http://localhost:5173
* Qdrant Vector Database (Dashboard UI): http://localhost:6333/dashboard


