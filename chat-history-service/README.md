# 📚 Chat History Service: Persistent Conversational Storage

> Built with **FastAPI** and **SQLAlchemy**, it acts as the persistence abstraction layer to manage conversation sessions and store message histories locally using SQLite.

The service provides a local RAG (Retrieval-Augmented Generation) infrastructure layer that can:

* Create and manage chat conversation sessions
* Store and retrieve user prompts, assistant replies, and system messages
* Automatically organize message histories by conversation ID
* Handle relational data with automatic cascading deletions


## 📋 Prerequisites

Before running this microservice, ensure you have the following installed and configured:

| Requirement | Details & Commands |
| :--- | :--- |
| **Python** | Version 3.12 (⚠️*Important: Do not use Python 3.14 or experimental versions to avoid Rust/C++ compilation errors with Pydantic-core)*.|

## 🌐 API Documentation & Usage

Once the server is running, the API is strictly available locally. You can access the auto-generated endpoint documentation directly on your machine.

Navigate to http://localhost:8001/docs in your browser to interact with the API.

### Endpoint 1: `POST /conversations`

Retrieve a list of all saved conversations ordered by newest first.

**Response Playload (`List[ConversationResponse]`)**

```JSON
[
  {
    "id": 1,
    "title": "Agent Architecture Discussion",
    "created_at": "2026-06-06T12:00:00"
  }
]
```

### Endpoint 2: `POST /conversations`

Create a new conversation session and return its details.

**Request Playload (`ConversationCreate`)**

```JSON
{
  "title": "Agent Architecture Discussion"
}
```

**Response Playload (`ConversationResponse`)**

```JSON
{
  "id": 1,
  "title": "Agent Architecture Discussion",
  "created_at": "2026-06-06T12:00:00"
}
```

### Endpoint 3: `GET /conversations/{conversation_id}/messages`

Retrieve all messages belonging to a specific conversation ID.

**Response Playload (`List[MessageResponse]`)**

```JSON
[
  {
    "id": 1,
    "conversation_id": 1,
    "role": "user",
    "content": "What is the company's AI architecture?"
  },
  {
    "id": 2,
    "conversation_id": 1,
    "role": "assistant",
    "content": "The company uses a distributed AI architecture..."
  }
]
```

### Endpoint 4: `POST /conversations/{conversation_id}/messages`

Save a new message (user prompt or assistant reply) under a specific conversation ID.

**Request Playload (`MessageCreate`)**

```JSON
{
  "role": "user",
  "content": "Can you elaborate on the vector database?"
}
```

**Response Playload (`MessageResponse`)**

```JSON
{
  "id": 3,
  "conversation_id": 1,
  "role": "user",
  "content": "Can you elaborate on the vector database?"
}
```

## 🗄️ Inspecting the Database

To quickly view all saved conversations and messages in a structured JSON format without installing external SQLite clients, run the following command in your terminal while inside the `chat-history-service` directory:

To inspect all conversations:

```PowerShell
python -c "import sqlite3, json; c=sqlite3.connect('chat_history.db'); c.row_factory=sqlite3.Row; print(json.dumps([dict(r) for r in c.execute('SELECT * FROM conversations')], indent=2, ensure_ascii=False))"
```

To inspect all stored messages:

```PowerShell
python -c "import sqlite3, json; c=sqlite3.connect('chat_history.db'); c.row_factory=sqlite3.Row; print(json.dumps([dict(r) for r in c.execute('SELECT * FROM messages')], indent=2, ensure_ascii=False))"
```

## 📦 Main Dependencies

The service relies on the following main components:

| Component | Purpose |
| :--- | :--- |
| **FastAPI** | HTTP API framework |
| **Uvicorn** | ASGI application server |
| **SQLAlchemy** | SQL toolkit and Object Relational Mapper (ORM) |
| **SQLite** | Local relational database for persistent storage |
| **Pydantic** | Request/response validation and serialization |

## 📁 Directory Structure

```bash
chat-history-service/
│
├── main.py              # FastAPI application controller and HTTP routes
├── models.py            # Pydantic schemas (Contracts, Enums, and DTOs)
├── db_manager.py        # SQLAlchemy configuration, database models, and session dependency
├── chat_history.db      # Local SQLite database file (auto-generated)
└── requirements.txt     # Project dependencies (FastAPI, Uvicorn, SQLAlchemy, Pydantic)
```