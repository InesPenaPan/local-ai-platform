# 🐬 MySQL MCP Server

> A bridge server implementing the **Model Context Protocol (MCP)** standard to allow Large Language Models and AI agents to securely inspect, query, and interact with MySQL databases.

This component containerizes the open-source repository [mcp-server-mysql](https://github.com/benborla/mcp-server-mysql) (authored by Ben Borla), exposing database tools over an HTTP Server-Sent Events (SSE) network transport.

The server provides standardized tool primitives for the MCP ecosystem:

- **Schema Inspection:** Discover tables, schemas, column configurations, and relational structures from the connected database.
- **Query Execution:** Run read operations (`SELECT`) and operational queries to provide grounded, real-time database context to LLMs.
- **Agent Integration:** Compatible with any MCP client or reverse proxy supporting network-based SSE transports.

## ⚙️ Environment Variables

Configure target database access and network binding using the following variables:

| Variable | Description |
| :--- | :--- |
| `HOST` | Network interface address the server binds to |
| `PORT` | Listening port for the HTTP/SSE service |
| `MYSQL_HOST` | Hostname or IP address of the target MySQL database |
| `MYSQL_PORT` | Port number of the MySQL database instance |
| `MYSQL_USER` | Database user account with query execution privileges |
| `MYSQL_PASSWORD` | Password for the specified database user |
| `MYSQL_DATABASE` | Target MySQL database name to connect to |