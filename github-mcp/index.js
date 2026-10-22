import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { GitHubServer } from "@modelcontextprotocol/server-github/dist/server.js";

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";
const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

if (!GITHUB_TOKEN) {
  console.error("FATAL: GITHUB_PERSONAL_ACCESS_TOKEN is required.");
  process.exit(1);
}

// Initialize GitHub MCP server
const server = new GitHubServer({
  githubPersonalAccessToken: GITHUB_TOKEN
});

let transport = null;

app.get("/mcp", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);

  // Clean up transport reference on client disconnect
  res.on("close", () => {
    transport = null;
  });
});

app.post("/messages", async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("No active SSE session");
  }
});

app.listen(PORT, HOST, () => {
  console.log(`GitHub MCP Server running on http://${HOST}:${PORT}/mcp`);
});
