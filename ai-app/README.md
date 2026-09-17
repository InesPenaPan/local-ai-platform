# 💻 AI Platform: Web Client

> A modern, responsive conversational UI built with React, Vite, and Tailwind CSS to interact with the local AI platform via the API Gateway.


## 📌 Overview

**AI App** serves as the user-facing web client for the Local AI Platform monorepo. It connects directly to the edge `api-gateway` (running on port `8000`), abstracting downstream inference workers and providing a clean conversational interface to test and benchmark local models running through Ollama.

### Key Features
* **Lightning-Fast Tooling:** Built with Vite and React for instant Hot Module Replacement (HMR).
* **Modern Styling:** Powered by Tailwind CSS (via the official `@tailwindcss/vite` plugin).
* **Decoupled Connectivity:** Consumes the versioned public contract (`POST /api/v1/chat`) exposed by the API Gateway.
* **Auto-Scrolling Viewport:** Maintains scroll position at the latest message during active generations.
* **State Management:** Reactive conversation state with visual loading states and error fallbacks.

## 📁 Directory Structure

```bash
ai-app/
│
├── README.md              # Frontend architecture and usage documentation
├── package.json           # Frontend dependencies, scripts, and build tasks
├── vite.config.js         # Vite configuration including @tailwindcss/vite plugin
├── eslint.config.js       # ESLint rules and React hooks configurations
├── index.html             # HTML entry template
│
└── src/
    ├── App.jsx            # Core chat interface, message state, and API caller
    ├── main.jsx           # React DOM root bootstrapping
    └── index.css          # Tailwind CSS root imports
```

## ⚙️ Prerequisites & Environment Setup

| Requirement | Details & Commands |
| :--- | :--- |
| **Node.js** | Node v18+ (or v20+ recommended).|
| **npm** | Installed with Node. |


## 🚀 Running the Microservice

Start the local Vite development server at http://localhost:5173:

```PowerShell
npm run dev
```