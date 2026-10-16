# 💻 AI Platform: Web Client

> A modern, responsive conversational UI built with **React**, **Vite**, and **Tailwind CSS** to interact seamlessly with the local AI platform microservices via the centralized API Gateway.

The frontend application provides a modular interface designed to:

- Connect to the centralized API Gateway architecture.
- Manage dynamic conversation sessions, custom agent execution, and standard model prompts.
- Administer knowledge bases and document collections for Retrieval-Augmented Generation (RAG).
- Inspect and monitor connected external tools and MCP servers.
- Render responsive layouts with custom design tokens styled using Tailwind CSS.

## 📋 Prerequisites

Before running this frontend application locally, ensure you have the following installed and configured:

| Requirement | Details & Commands |
| :--- | :--- |
| **Node.js & npm** | Node v18+ (or v20+ recommended) and npm installed on your system. |
| **API Gateway** | The frontend connects to the `api-gateway` on port `8000`. Ensure the backend ecosystem is running to avoid connection errors. |

## 🚀 Running the App

In your project terminal, install the dependencies (if you haven't already) and start the Vite development server:

```PowerShell
npm install
npm run dev
```

*The local development server will start at http://localhost:5173*

## 🧭 Key Features & Views

### Chat (`/chat`)

Centralizes conversational workflows, custom agent execution, and prompt interactions[cite: 10]:

- **General Chat (`ChatPage.jsx`):** Serves as the standard LLM workspace for generic prompts, featuring full multi-session history and conversation tracking.
- **Dedicated Agent Workspaces (`AgentChatPage.jsx`):** Provides an isolated chat interface for each registered agent, binding its custom system prompt and executing multi-turn MCP tool actions.
- **Agent Creation Studio (`NewAgentPage.jsx`):** Interactive builder form to configure agent identities, system instructions, model parameters, RAG collections, and MCP tool attachments.

### Knowledge Base (`/knowledge`)

Centralized management layer for vector datasets and Retrieval-Augmented Generation:

- **Collections Dashboard (`KnowledgePage.jsx`):** Document collection overview and vector indexing lifecycle management.
- **Ingestion Modal (`UploadCollectionModal.jsx`):** Structured file upload pipeline and chunking workflows for RAG vector embeddings.

### Tools (`/tools`)

Operational dashboard for system capabilities and connected integrations:

- **MCP Tools Overview (`ToolsPage.jsx`):** Discovery and visualization interface for active MCP tools, server schemas, and microservice capabilities.

## 📦 Main Dependencies

The application relies on the following core tools and libraries:

| Component | Purpose |
| :--- | :--- |
| **React** | Declarative component-based UI framework. |
| **Vite** | Frontend build tool and development server with hot module replacement (HMR). |
| **Tailwind CSS** | Utility-first styling framework integrated via the modern Vite plugin pipeline. |

## 📁 Project Structure

```bash
ai-app/
│
├── src/
│   ├── components/
│   │   ├── layout/            # Reusable navigation bars, sidebars, and container wrappers
│   │   └── ui/                # Core UI primitives (buttons, inputs, modals, alerts, badges)
│   │
│   ├── pages/
│   │   ├── chat/              # Conversational workflows and agent interfaces
│   │   │   ├── hooks/         # Custom hooks managing message states and streaming
│   │   │   ├── subcomponents/ # Message items, input forms, and session lists
│   │   │   ├── AgentChatModal.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   └── NewAgentModal.jsx
│   │   │
│   │   ├── knowledge/         # Knowledge base and RAG document administration
│   │   │   ├── hooks/         # Hooks for collection fetching and document upload status
│   │   │   ├── subcomponents/ # Collection cards, document tables, and upload zones
│   │   │   ├── KnowledgePage.jsx
│   │   │   └── UploadCollectionModal.jsx
│   │   │
│   │   └── tools/             # Tool inspection and MCP status views
│   │       ├── subcomponents/ # Tool cards, schema viewers, and status indicators
│   │       └── ToolsPage.jsx
│   │
│   ├── App.css                # Global style overrides
│   ├── App.jsx                # Application routing configuration and layout boundaries
│   ├── index.css              # Tailwind CSS imports and utility layer definitions
│   └── main.jsx               # React DOM root entry point
│
├── .gitignore                 # Version control exclusions
├── Dockerfile                 # Multi-stage container deployment specification
├── eslint.config.js           # ESLint configuration and React rules
├── index.html                 # HTML template entry file
├── package-lock.json          # Deterministic dependency tree lockfile
├── package.json               # Node manifests, build scripts, and production dependencies
└── README.md                  # Frontend architecture, installation, and usage documentation
```
