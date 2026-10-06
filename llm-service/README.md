# 🧠 LLM Service: Local Models Interface

> This microservice is part of an agent-based chatbot architecture. Built with **FastAPI**, it acts as the abstraction layer to communicate with open-source Large Language Models (LLMs) running locally via **Ollama**.

The service provides a local LLM interface layer that can:

* Accept conversation message histories and model configurations
* Inject optional system prompts dynamically
* Delegate chat completion tasks to local Ollama engines
* Return structured JSON responses with generated assistant replies

## 📋 Prerequisites

Before running this individual microservice locally, ensure you have the following installed on your host machine:

| Requirement | Details & Commands |
| :--- | :--- |
| **Python** | Version 3.12 (⚠️*Important: Do not use Python 3.14 or experimental versions to avoid Rust/C++ compilation errors with Pydantic-core)*.|
| **Ollama** | [Download Ollama](https://ollama.com/) and ensure it is running in the background (`http://localhost:11434`). |
| **LLM Models** | You need to download your preferred models locally via Ollama (e.g., `ollama pull llama3.1`). |

## 🚀 Running the Service

### Step 1: Start the LLM Engine

In a separate terminal, ensure Ollama has your desired model loaded in memory:

```PowerShell
ollama run llama3.1
```

*(You can type `/bye` to exit the prompt; Ollama will keep running in the background)*

### Step 2: Start the FastAPI Server

In your project terminal (with the `venv` activated), start the Uvicorn server on port 8001:
```PowerShell
python -m venv venv
.\venv\Scripts\activate

uvicorn main:app --port 8001 --reload
```

## 🌐 API Documentation & Usage

Once the server is running, the API is strictly available locally. You can access the auto-generated endpoint documentation directly on your machine.

Navigate to http://localhost:8001/docs in your browser to interact with the API.

### Endpoint: `POST /generate`

Receives conversational message history, model selection, and an optional system prompt, delegates the request to Ollama, and returns the generated text.

**Request Playload (`ChatRequest`)**

Example 1: Standar Chat (Without `system_prompt`)

```JSON
{
  "messages": [
    {
      "role": "user",
      "content": "Can you explain how a reverse proxy works?"
    }
  ],
  "model": "llama3.1"
}
```

Example 2: Custom Agent (With `system_prompt`)

```JSON
{
  "messages": [
    {
      "role": "user",
      "content": "Can you explain how a reverse proxy works?"
    }
  ],
  "model": "llama3.1",
  "system_prompt": "You are an expert cloud architect. Explain technical concepts using simple analogies suitable for a non-technical audience."
}
```

**Response Playload (`ChatResponse`)**
```JSON
{
  "reply": "Imagine a reverse proxy as a receptionist at a large office building. When you arrive..."
}
```

## 📦 Main Dependencies

The service relies on the following main components:

| Component | Purpose |
| :--- | :--- |
| **FastAPI** | HTTP API framework |
| **Uvicorn** | ASGI application server |
| **Pydantic** | Request/response validation |

## 📁 Project Structure

```bash
llm-service/
│
├── main.py               # FastAPI application controller and HTTP routes
├── request_llm.py        # Core logic handling outbound requests to Ollama
├── model_dtos.py         # Pydantic schemas (Contracts/Data Transfer Objects)
├── requirements.txt      # Project dependencies (FastAPI, Uvicorn, Requests, etc.)
```



