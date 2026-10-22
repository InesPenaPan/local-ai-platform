# 🤖 Agent Service

> A lightweight microservice built with FastAPI to manage, store, and retrieve custom AI agent configurations, with optional tool integration powered by the Model Context Protocol (MCP).

The service provides a robust local infrastructure that can:

* Create and store custom AI agent configurations securely
* Retrieve a complete list of all registered agents
* Fetch detailed configurations for specific agents by name
* Execute conversational reasoning loops with optional external MCP tools (such as MySQL integration)
* Support modular CRUD operations via dedicated logic handlers

## 📋 Prerequisites

Before running this microservice, ensure you have the following installed:

| Requirement | Details & Commands |
| :--- | :--- |
| **Python** | Version 3.11 or 3.12 (⚠️*Important: Do not use Python 3.14 or experimental versions).* |
| **SQLite** | Built-in with Python; auto-generates the local database file on startup. |
| **Ollama** | Local LLM runtime (e.g., serving `llama3.1`). |
| **MCP Server** | *(Optional)* External tool providers such as `mysql-mcp` o `github-mcp` for agent tool execution. |

## 🌐 API Documentation & Usage

When the service starts, an interactive OpenAPI/Swagger specification interface is served directly from the application.

Navigate to http://localhost:8003/docs in your browser to inspect schemas and execute test requests against the endpoints.

### Endpoint 1: `POST /create-agent`

Registers and saves a new agent configuration in the system database.

**Request Playload (`AgentCreate`)**

```JSON
{
  "name": "General Assistant",
  "description": "General-purpose agent capable of executing optional external tools.",
  "systemPrompt": "You are a professional assistant designed to execute available tools accurately.",
  "model": "llama3.1",
  "mcp": "none",
  "collection": "none",
  "temperature": 0.7
}
```

### Endpoint 2: `GET /list`

Returns a list containing all saved agent configurations stored in the persistence layer.

**Response Playload (`List[AgentResponse]`)**

```JSON
[
  {
    "id": 1,
    "name": "General Assistant",
    "description": "General-purpose agent capable of executing optional external tools.",
    "systemPrompt": "You are a professional assistant designed to execute available tools accurately.",
    "model": "llama3.1",
    "mcp": "none",
    "collection": "none",
    "temperature": 0.7
  }
]
```


### Endpoint 3: `GET /agent/{name}`

Fetches the configuration specifications of an individual agent by its unique registered name.

**Response Playload (`AgentResponse`)**

```JSON
{
  "id": 1,
  "name": "General Assistant",
  "description": "General-purpose agent capable of executing optional external tools.",
  "systemPrompt": "You are a professional assistant designed to execute available tools accurately.",
  "model": "llama3.1",
  "mcp": "none",
  "collection": "none",
  "temperature": 0.7
}
```

### Endpoint 4: `POST /agent/{name}/chat`

Executes an interactive reasoning loop with the target agent. If the agent is assigned an optional MCP integration (e.g., a database or search connector), the engine dynamically discovers the provider's capabilities, invokes tools via structured function calling, and delivers an objective synthesis.

**Request Playload (`AgentChatRequest`)**
```JSON
{
"prompt": "Hello! What tasks and tools can you assist me with?",
  "history": []
}
```

**Request Playload**
```JSON
{
  "reply": "Hello! I can analyze information, answer questions, and utilize connected tools to perform real-time actions."
}
```

### Endpoint 5: `GET /agent/{agent_id}`

Deletes an existing agent configuration from the database by its unique identifier.

**Response Payload**

```json
{
  "message": "Agent deleted successfully"
}
```


## 🗄️ Inspecting the Database

To quickly view all saved agents and their configurations (such as their exact `collection` names) in a structured JSON format without installing external SQLite clients, run the following command in your terminal. Ensure you are inside the `agent-service` directory:

```PowerShell
python -c "import sqlite3, json; c=sqlite3.connect('agents.db'); c.row_factory=sqlite3.Row; print(json.dumps([dict(r) for r in c.execute('SELECT * FROM agents')], indent=2, ensure_ascii=False))"
```

## 🔌 Model Context Protocol (MCP) Integration

The service includes a dedicated `mcp-clients` package that handles communication with external Model Context Protocol servers using JSON-RPC 2.0 over HTTP/SSE transports.

* **MySQL MCP Client (`mysql_client.py`)**: Connects to the downstream `mysql-mcp` service to allow agents to inspect database schemas and execute safe query operations.
* **GitHub MCP Client (`github_client.py`)**: Connects to the downstream `github-mcp` service to enable repository exploration, code searches, issue management, and workflow checks.

## 📦 Main Dependencies

The service relies on the following main components:

| Component | Purpose |
| :--- | :--- |
| **FastAPI** | High-performance asynchronous HTTP routing and API contract framework. |
| **Uvicorn** | Production-ready ASGI server handling concurrency and socket lifecycles. |
| **SQLAlchemy** | Declarative ORM and transactional persistence abstraction layer. |
| **Pydantic** | Schema validation, type enforcement, and serialization for incoming/outgoing DTOs. |
| **HTTPX** | Fully async HTTP client managing communication with Ollama and MCP endpoints. |
| **MCP SDK** | Protocol specifications defining standard tool exposure, invocation, and response framing. |

## 📁 Project Structure

```text
agent-service/
│
├── agent_chat.py       # Conversational reasoning loop, tool call dispatcher, and context builder
├── agent_logic.py      # Persistence operations, query builders, and database business logic
├── agents.db           # Local SQLite persistent data store
├── Dockerfile          # Multi-stage image build definition for containerized deployments
├── main.py             # FastAPI entry point: route declarations, lifecycle hooks, and CORS middleware
├── mcp-clients/        # Modular MCP client implementations
│   ├── __init__.py     # Package initialization module
│   ├── github_client.py# Asynchronous client for GitHub repository inspection and workflows
│   └── mysql_client.py # Asynchronous client for MySQL database schema and query tools
├── models.py           # Pydantic schemas (DTOs) and SQLAlchemy declarative database models
├── README.md           # Service documentation, API specifications, and architectural overview
└── requirements.txt    # Frozen production dependencies
```
