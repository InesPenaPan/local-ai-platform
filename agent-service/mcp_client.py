import os
import json
import httpx

MCP_URL = os.getenv("MYSQL_MCP_URL", "http://mysql-mcp:8080/mcp")
SECRET_KEY = os.getenv("REMOTE_SECRET_KEY", "4a8f9c2d1e0b5a7f3e6c8b9a0d2e4f1a5b8c3d7e9f0a2b4c6d8e1f3a5b7c9d0e")

class MySQLMCPAgentClient:
    """
    Client for MCP Stateless Streamable HTTP Server over JSON-RPC 2.0.
    Handles standard JSON and Server-Sent Events (SSE) data stream framing.
    """
    def __init__(self):
        self.endpoint = MCP_URL if MCP_URL.endswith("/mcp") else f"{MCP_URL.rstrip('/')}/mcp"
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "Authorization": f"Bearer {SECRET_KEY}"
        }

    async def _send_rpc(self, method: str, params: dict = None) -> dict:
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": params or {}
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(self.endpoint, json=payload, headers=self.headers)
            res.raise_for_status()

            raw_text = res.text.strip()
            data = None

            # 1. Intentar decodificar como JSON estándar
            try:
                data = json.loads(raw_text)
            except Exception:
                # 2. Si viene como stream SSE, extraer las líneas que empiezan por 'data:'
                for line in raw_text.splitlines():
                    trimmed_line = line.strip()
                    if trimmed_line.startswith("data:"):
                        json_str = trimmed_line[len("data:"):].strip()
                        try:
                            data = json.loads(json_str)
                            break
                        except Exception:
                            continue

            if not data or not isinstance(data, dict):
                raise Exception(f"No se pudo parsear la respuesta MCP: {raw_text}")

            if "error" in data:
                raise Exception(f"MCP RPC Error: {data['error']}")

            return data.get("result", {})

    async def get_tools_for_ollama(self):
        """
        Retrieves database tools and maps them to Ollama-compatible function schemas.
        """
        result = await self._send_rpc("tools/list")
        raw_tools = result.get("tools", [])

        ollama_tools = []
        for tool in raw_tools:
            ollama_tools.append({
                "type": "function",
                "function": {
                    "name": tool.get("name"),
                    "description": tool.get("description", ""),
                    "parameters": tool.get("inputSchema", {})
                }
            })
        return ollama_tools

    async def execute_tool(self, tool_name: str, arguments: dict) -> str:
        """
        Executes a database query or schema inspection tool via MCP.
        """
        params = {
            "name": tool_name,
            "arguments": arguments
        }
        result = await self._send_rpc("tools/call", params)
        content_items = result.get("content", [])

        output_texts = []
        for item in content_items:
            if isinstance(item, dict) and "text" in item:
                output_texts.append(item["text"])
            elif isinstance(item, str):
                output_texts.append(item)

        return "\n".join(output_texts) if output_texts else str(result)