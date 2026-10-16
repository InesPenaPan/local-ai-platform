# 📚 Chat History Service: Persistent Conversational Storage

> Built with **FastAPI** and **SQLAlchemy**, this service acts as the persistence abstraction layer to manage conversation sessions and store message histories locally using SQLite.

The service provides a dedicated conversational persistence layer that can:

* Create and manage chat conversation sessions
* Store and retrieve user prompts, assistant replies, and system messages
* Automatically organize message histories ordered chronologically by conversation
* Handle relational data with automatic cascading deletions upon conversation removal

## 📋 Prerequisites

Before running this microservice, ensure you have the following installed and configured:

| Requirement | Details & Description |
| :--- | :--- |
| **Python** | Version 3.11 or 3.12 (⚠️ *Important: Avoid experimental versions or Python 3.14 to prevent compilation issues with Pydantic-core*). |
| **SQLite** | Standard embedded relational engine supplied with Python; automatically provisions `chat_history.db` on launch. |

## 🌐 API Documentation & Usage

When the service starts, an interactive OpenAPI/Swagger specification interface is served directly from the application.

Navigate to http://localhost:8004/docs in your browser to inspect schemas and execute test requests against the endpoints.

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

Creates a new conversation session and returns its persisted details.

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
    "content": "What is an MCP Server?"
  },
  {
    "id": 2,
    "conversation_id": 1,
    "role": "assistant",
    "content": "A Model Context Protocol server exposes standardized tools and resources to LLMs..."
  }
]
```

### Endpoint 4: `POST /conversations/{conversation_id}/messages`

Saves a new message (user prompt, assistant reply, or system message) under a specific conversation ID.

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

### Endpoint 5: `DELETE /conversations/{conversation_id}`

Deletes a conversation session along with all associated messages via cascading deletion.

**Response Playload**

```JSON
{
  "ok": true,
  "message": "Conversation deleted successfully"
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
| **FastAPI** | High-performance asynchronous API framework and route declarations. |
| **Uvicorn** | ASGI server managing concurrent requests and network sockets. |
| **SQLAlchemy** | Declarative ORM and transactional persistence abstraction layer. |
| **SQLite** | Embedded local relational database storage. |
| **Pydantic** | Schema validation, type enforcement, and serialization for incoming/outgoing DTOs. |

## 📁 Directory Structure

```bash
chat-history-service/
│
├── chat_history.db      # Local SQLite database file (auto-generated on startup)
├── db_manager.py        # SQLAlchemy configuration, ORM models, and database session generator
├── Dockerfile           # Multi-stage container deployment specification
├── main.py              # FastAPI application controller and HTTP routes
├── models.py            # Pydantic schemas (Contracts, Enums, and DTOs)
├── README.md            # Service documentation, API specifications, and architectural overview
└── requirements.txt     # Pinned production dependencies
```