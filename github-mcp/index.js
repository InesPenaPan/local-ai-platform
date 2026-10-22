import express from "express";
import { spawn } from "child_process";
import crypto from "crypto";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";
const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

if (!GITHUB_TOKEN) {
  console.error("FATAL: GITHUB_PERSONAL_ACCESS_TOKEN is required.");
  process.exit(1);
}

// 1. Iniciamos el servidor oficial de GitHub en segundo plano usando su ejecutable
const child = spawn("node", ["node_modules/@modelcontextprotocol/server-github/dist/index.js"], {
  env: process.env
});

// Mapa para vincular cada petición HTTP con la respuesta del CLI
const pendingRequests = new Map();
let buffer = "";

// 2. Escuchamos las respuestas del proceso interno (CLI)
child.stdout.on("data", (data) => {
  buffer += data.toString();
  let lines = buffer.split("\n");
  buffer = lines.pop(); // Guarda fragmentos incompletos para el siguiente ciclo
  
  for (const line of lines) {
    if (line.trim()) {
      try {
        const msg = JSON.parse(line);
        // Si el mensaje es una respuesta a una petición nuestra, la devolvemos a Python
        if (msg.id !== undefined && pendingRequests.has(msg.id)) {
          const { res, originalId } = pendingRequests.get(msg.id);
          msg.id = originalId; // Restaurar el ID original
          res.json(msg);
          pendingRequests.delete(msg.id);
        }
      } catch (e) {
        // Ignora advertencias o registros que no son JSON
      }
    }
  }
});

child.stderr.on("data", (data) => {
  console.error(`[GitHub MCP Interno]: ${data}`);
});

// 3. Endpoint HTTP que recibe las llamadas desde github_client.py
app.post("/mcp", (req, res) => {
  const rpcMessage = req.body;
  
  // Protegemos el ID por si Python envía siempre "id": 1 en todas sus peticiones concurrentes
  const internalId = crypto.randomUUID();
  const originalId = rpcMessage.id;
  
  rpcMessage.id = internalId;
  pendingRequests.set(internalId, { res, originalId });
  
  // Enviamos la petición JSON-RPC al proceso de la consola
  child.stdin.write(JSON.stringify(rpcMessage) + "\n");
});

app.listen(PORT, HOST, () => {
  console.log(`GitHub MCP Proxy Server running on http://${HOST}:${PORT}/mcp`);
});