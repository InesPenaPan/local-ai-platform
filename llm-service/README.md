# 🧠 LLM Service: Local Models Interface

> Built with **FastAPI**, this microservice acts as an abstraction layer to communicate with open-source Large Language Models (LLMs) running locally via **Ollama**, featuring full support for multi-turn chat, system prompt injection, and native function/tool calling.

The service provides a standardized inference layer that can:

* Accept structured conversation message histories across multiple roles (`system`, `user`, `assistant`, `tool`).
* Inject custom agent system instructions dynamically.
* Pass function/tool definitions to Ollama to trigger native function calling.
* Return structured responses delivering generated assistant text, emitted tool calls, or both.

## 📋 Prerequisites

Before running this individual microservice locally, ensure you have the following installed on your host machine:

| Requirement | Details & Commands |
| :--- | :--- |
| **Python** | Version 3.12 (⚠️*Important: Do not use Python 3.14 or experimental versions to avoid Rust/C++ compilation errors with Pydantic-core)*.|
| **Ollama** | [Download Ollama](https://ollama.com/) and ensure it is running in the background (`http://localhost:11434`). |
| **LLM Models** | Pull your target models locally via Ollama before invoking the API (e.g., `ollama pull llama3.1`) and run it (e.g., `ollama run llama3.1`). |


## 🌐 API Documentation & Usage

When the service starts, an interactive OpenAPI/Swagger specification interface is served directly from the application.

Navigate to http://localhost:8001/docs in your browser to inspect schemas and execute test requests against the endpoints.

### Endpoint: `POST /generate`

Receives conversational message history, target model selection, optional system prompts, and optional tool schemas, delegating the request directly to Ollama.

#### Example 1: Standard Chat

**Request Playload (`ChatRequest`)**

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
**Response Playload (`ChatResponse`)**
```JSON
{
  "reply": "A reverse proxy acts as an intermediary between client devices and backend web servers...",
  "tool_calls": null
}
```
#### Example 2: Custom agent (With `system_prompt`)

**Request Playload (`ChatRequest`)**

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
  "reply": "Imagine a reverse proxy as a receptionist at a large corporate building. When visitors arrive...",
  "tool_calls": null
}
```

#### Example 3: Custom agent (With `tools`)

**Request Playload (`ChatRequest`)**

```JSON
{
  "messages": [
    {
      "role": "user",
      "content": "¿Cuáles son las 5 últimas transacciones registradas en la base de datos?"
    }
  ],
  "model": "llama3.1",
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "read_query",
        "description": "Executes a SELECT query against the connected MySQL database to retrieve records.",
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "The SQL query to execute (e.g. SELECT * FROM transactions ORDER BY created_at DESC LIMIT 5)"
            }
          },
          "required": ["query"]
        }
      }
    }
  ]
}

```
**Response Playload (`ChatResponse`)**
```JSON
{
  "reply": "",
  "tool_calls": [
    {
      "function": {
        "name": "read_query",
        "arguments": {
          "query": "SELECT * FROM transactions ORDER BY created_at DESC LIMIT 5;"
        }
      }
    }
  ]
}
```

## 📦 Main Dependencies

The service relies on the following main components:

| Component | Purpose |
| :--- | :--- |
| **FastAPI** | High-performance asynchronous API framework and endpoint definitions. |
| **Uvicorn** | ASGI web server handling HTTP requests and runtime concurrency. |
| **Pydantic** | Payload parsing, type validation, and data serialization (DTOs). |
| **HTTPX** | HTTP clients for communication with the local Ollama inference daemon. |

## 📁 Project Structure

```bash
llm-service/
│
├── Dockerfile          # Multi-stage image build definition for containerized deployment
├── main.py             # FastAPI entry point, exception handlers, and route definitions
├── models.py           # Pydantic schemas (DTOs) for inbound/outbound payloads and role enums
├── README.md           # Microservice documentation, API examples, and usage instructions
├── request_llm.py      # Core orchestration logic and HTTP forwarding to Ollama
└── requirements.txt    # Frozen production dependencies
```



