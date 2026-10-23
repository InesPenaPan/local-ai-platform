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

### 🔑 How to configure the `GITHUB_PERSONAL_ACCESS_TOKEN`

The MCP server requires a **Personal Access Token (PAT)**. It will *not* work with a GitHub App Client Secret. 

**Note:** This project specifically uses **Fine-grained personal access tokens** for enhanced security and granular permission control.

To generate the correct token for your local AI agent:
1. Navigate directly to the [GitHub Fine-grained Tokens page](https://github.com/settings/personal-access-tokens/new) (or manually go to **Settings** > **Developer settings** > **Personal access tokens** > **Fine-grained tokens**).
2. Click **Generate new token**.
3. Set a **Token name** (e.g., `mcp-local-agent`) and a **Description** (e.g., "Token for local AI agent MCP access").
4. **Repository access:** Select **All repositories** (or explicitly select the targeted repositories you want the AI to analyze).
5. **Permissions:** Under **Repository permissions**, grant **Read-only** access to the following:
   - **Contents**
   - **Metadata**
6. Click **Generate token** at the bottom of the page.
7. Copy the generated token (it will start with `github_pat_...`) and assign it to the `GITHUB_PERSONAL_ACCESS_TOKEN` variable in your `.env` file.
