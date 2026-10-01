# 🤖 Agent Service

> A lightweight, database-backed microservice built with FastAPI to manage, store, and retrieve custom AI agent configurations and their system instructions.

## 📋 Prerequisites

Before running this individual microservice locally, ensure you have the following installed:

| Requirement | Details & Commands |
| :--- | :--- |
| **Python** | Version 3.12 (⚠️*Important: Do not use Python 3.14 or experimental versions).* |
| **SQLite** | No installation required; the service uses Python's built-in SQLite library and auto-generates the `agents.db` file. |

## 🚀 Running the App

In your project terminal (with the `venv` activated), start the Uvicorn server on port 8001:

```PowerShell
python -m venv venv
.\venv\Scripts\activate

uvicorn main:app --port 8003 --reload
```

## 🌐 API Documentation & Usage

Once the server is running, the API is strictly available locally. You can access the auto-generated Swagger endpoint documentation directly on your machine.

Navigate to http://localhost:8003/docs in your browser to interact with the API.

### Endpoint 1: `POST /create-agent`

This endpoint receives the configuration details of a custom agent, saves it to the SQLite database, and returns the created record.

**Request Playload (`AgentCreate`)**

```JSON
{
  "name": "Senior Developer",
  "description": "Expert in React and FastAPI",
  "systemPrompt": "You are a senior software engineer. Provide clean, well-documented code.",
  "model": "llama3.1",
  "collection": "none",
  "temperature": 0.7
}
```

### Endpoint 2: `GET /list`

This endpoint fetches an array containing all the saved AI agents currently stored in the database.

### Endpoint 3: `GET /agent/{name}`

This endpoint retrieves a specific agent's detailed configuration by searching for its exact name.

**Response Playload (`AgentResponse`)**

```JSON
{
  "name": "Senior Developer",
  "description": "Expert in React and FastAPI",
  "systemPrompt": "You are a senior software engineer. Provide clean, well-documented code.",
  "model": "llama3.1",
  "collection": "none",
  "temperature": 0.7,
  "id": 1
}
```
## 🗄️ Inspecting the Database

To quickly view all saved agents and their configurations (such as their exact `collection` names) in a structured JSON format without installing external SQLite clients, run the following command in your terminal. Ensure you are inside the `agent-service` directory:

```PowerShell
python -c "import sqlite3, json; c=sqlite3.connect('agents.db'); c.row_factory=sqlite3.Row; print(json.dumps([dict(r) for r in c.execute('SELECT * FROM agents')], indent=2, ensure_ascii=False))"
``

## 📁 Project Structure

```text
agent-service/
│
├── main.py             # FastAPI entry point, CORS configuration, and HTTP endpoints
├── agent_logic.py      # Core CRUD operations and database transaction logic
├── models.py           # Pydantic schemas (DTOs) and SQLAlchemy ORM models
├── agents.db           # Auto-generated SQLite database (created on startup)
└── requirements.txt    # Production dependencies
```