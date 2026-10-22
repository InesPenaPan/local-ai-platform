# 🐙 GitHub MCP Server

> A Model Context Protocol (MCP) bridge server enabling Large Language Models and AI agents to securely interact with the GitHub API, inspect repositories, manage pull requests, and automate developer workflows.

This component containerizes and adapts the official Model Context Protocol integration for GitHub, exposing repository and code management tools over network transports. 

The server provides standardized tool primitives for the MCP ecosystem:
- **Repository Inspection:** Search code, read file contents, analyze directory trees, and inspect commit histories.
- **Issue & PR Management:** Create, review, comment, and query issues and pull requests programmatically.
- **Workflow Automation:** Trigger actions, inspect check runs, and assist developers with context-aware repository reasoning.

## ⚙️ Environment Variables

Configure GitHub authentication and network binding using the following environment variables:

| Variable | Description |
| :--- | :--- |
| **`HOST`** | Network interface address the server binds to (e.g., `0.0.0.0`). |
| **`PORT`** | Listening port for the HTTP/SSE service (default: `8080`). |
| **`GITHUB_PERSONAL_ACCESS_TOKEN`** | Personal Access Token (PAT) with appropriate scopes (repo, issues, etc.) for GitHub API authentication. |
| **`GITHUB_API_URL`** | Optional custom base URL for GitHub Enterprise instances (defaults to `https://api.github.com`). |
