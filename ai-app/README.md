# 💻 AI Platform: Web Client

> A modern, responsive conversational UI built with **React**, **Vite**, and **Tailwind CSS** to interact seamlessly with the local AI platform via the API Gateway.

The frontend application provides a clean user interface that can:

* Connect to the centralized API Gateway architecture
* Manage dynamic conversation sessions and real-time chat interactions
* Display structured responses from local AI agents and RAG microservices
* Render fully responsive layouts styled with Tailwind CSS

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


## 📦 Main Dependencies

The application relies on the following core tools and libraries:

| Component | Purpose |
| :--- | :--- |
| **React** | Component-based UI library |
| **Vite** | Lightning-fast frontend build tool and development server |
| **Tailwind CSS** | Utility-first CSS framework for modern styling |

## 📁 Project Structure

```bash
ai-app/
│
├── src/                   # React source code (components, pages, and hooks)
│   ├── App.jsx            # Core application routing and layout
│   ├── main.jsx           # React DOM root bootstrapping.
│   └── index.css          # Tailwind CSS root imports.
│
├── package.json           # Frontend dependencies, scripts, and build tasks.
├── vite.config.js         # Vite configuration including @tailwindcss/vite plugin.
├── eslint.config.js       # ESLint rules and React hooks configurations.
├── index.html             # HTML entry template.
└── README.md              # Frontend architecture and usage documentation.
```
