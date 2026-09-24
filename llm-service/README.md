# 🧠 LLM Service: Local Models Interface

> This microservice is part of an agent-based chatbot architecture. Built with **FastAPI**, it acts as the abstraction layer to communicate with open-source Large Language Models (LLMs) running locally via **Ollama**.

## 📋 Prerequisites

Before running this microservice, ensure you have the following installed and configured:

| Requirement | Details & Commands |
| :--- | :--- |
| **Python** | Version 3.12 (⚠️*Important: Do not use Python 3.14 or experimental versions to avoid Rust/C++ compilation errors with Pydantic-core)*.|
| **Ollama** | [Download Ollama](https://ollama.com/) and ensure it is running in the background (`http://localhost:11434`). |
| **LLM Models** | You need to download the models locally |

## 📁 Directory Structure

```bash
llm-service/
│
├── main.py               # FastAPI application controller and HTTP routes
├── request_llm.py        # Core logic handling outbound requests to Ollama
├── model_dtos.py         # Pydantic schemas (Contracts/Data Transfer Objects)
├── requirements.txt      # Project dependencies (FastAPI, Uvicorn, Requests, etc.)
└── venv/                 # Isolated Python virtual environment (ignored in git)
```

## 🚀 Running the Microservice

You need to run both the LLM engine and the microservice concurrently.

### Step 1: Start the Ollama Engine
In a separate terminal, ensure Ollama has your desired model loaded in memory:
```PowerShell
ollama run llama3.1
```
*(You can exit the prompt using `/bye`, and Ollama will continue running in the background).*

### Step 2: Start the FastAPI Server
In your project terminal (with the `venv` activated), start the Uvicorn server on port 8001:
```PowerShell
python -m venv venv
.\venv\Scripts\activate

uvicorn main:app --port 8001 --reload
```

## 📖 API Documentation & Usage

Once the server is running, the API is strictly available locally. You can access the auto-generated endpoint documentation directly on your machine.

Navigate to http://localhost:8001/docs in your browser to interact with the API.

### Endpoint: `POST /generate`
This endpoint receives a prompt and a model identifier, delegates the task to the local Ollama instance, and returns the generated response.

**Request Playload (`ChatRequest`)**
```JSON
{
  "message": "Tell me a joke",
  "model": "llama3.1"
}
```

**Response Playload (`ChatResponse`)**
```JSON
{
  "reply": "Why do programmers prefer dark mode? Because light attracts bugs!"
}
```



