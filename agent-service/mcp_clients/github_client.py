import os
import json
import httpx

GITHUB_MCP_URL = os.getenv("GITHUB_MCP_URL", "http://github-mcp:8080/mcp")
SECRET_KEY = os.getenv("REMOTE_SECRET_KEY", "4a8f9c2d1e0b5a7f3e6c8b9a0d2e4f1a5b8c3d7e9f0a2b4c6d8e1f3a5b7c9d0e")

class GitHubMCPAgentClient:
    """
    Handles communication between the AI agent and the GitHub MCP server.

    It allows the agent to:
    - Discover which GitHub tools are available.
    - Convert those tools into a format Ollama understands.
    - Execute GitHub tools and retrieve their results.

    Communication uses JSON-RPC 2.0 over HTTP.
    """

    def __init__(self):
        self.endpoint = (GITHUB_MCP_URL if GITHUB_MCP_URL.endswith("/mcp") else f"{GITHUB_MCP_URL.rstrip('/')}/mcp")
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "Authorization": f"Bearer {SECRET_KEY}",
        }


    async def _send_rpc(self, method: str, params: dict = None) -> dict:
        """
        Send a JSON-RPC request to MCP and return the server's result.
        Supports standard JSON and SSE responses.
        """

        # Build the JSON-RPC request.
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": params or {},
        }

        # Open an asynchronous HTTP connection to the MCP server.
        async with httpx.AsyncClient(timeout=60.0) as client:

            # Send the request and wait for the server's response.
            res = await client.post(self.endpoint, json=payload, headers=self.headers)

            res.raise_for_status()

            # Read the response text and prepare to decode it.
            raw_text = res.text.strip()
            data = None

            # First, try to read the response as standard JSON.
            try:
                data = json.loads(raw_text)

            # If JSON parsing fails, check for JSON inside SSE data lines.
            except Exception:
                for line in raw_text.splitlines():
                    trimmed_line = line.strip()
                    if trimmed_line.startswith("data:"):
                        # Remove the SSE prefix and extract the JSON content.
                        json_str = trimmed_line[len("data:"):].strip()
                        try:
                            data = json.loads(json_str)
                            break
                        except Exception:
                            continue

            # Make sure the server returned a valid JSON object.
            if not data or not isinstance(data, dict):
                raise Exception(f"Failed to parse GitHub MCP response: {raw_text}")

            # Check whether the server returned a JSON-RPC error.
            if "error" in data:
                raise Exception(f"GitHub MCP RPC Error: {data['error']}")

            # Return the actual result without the JSON-RPC wrapper.
            return data.get("result", {})


    async def get_tools_for_ollama(self):
        """
        Retrieve GitHub MCP tools and convert them into Ollama's format.
        """

        # Ask MCP for all available tools.
        result = await self._send_rpc("tools/list")

        # Extract the tools from the server response.
        raw_tools = result.get("tools", [])
        ollama_tools = []

        # Convert each MCP tool into the function format Ollama understands.
        for tool in raw_tools:
            ollama_tools.append({
                "type": "function",
                "function": {
                    "name": tool.get("name"),
                    "description": tool.get("description", ""),
                    "parameters": tool.get("inputSchema", {}),
                },
            })

        # Return all available tools so Ollama can use them.
        return ollama_tools


    async def execute_tool(self, tool_name: str, arguments: dict) -> str:
        """
        Execute a selected GitHub MCP tool and return its result as text.
        """
        params = {
            "name": tool_name,
            "arguments": arguments,
        }

        # Ask MCP to execute the selected tool.
        result = await self._send_rpc("tools/call", params)

        # Extract the content returned by the executed tool.
        content_items = result.get("content", [])
        output_texts = []

        # Collect readable text from each returned content item.
        for item in content_items:
            if isinstance(item, dict) and "text" in item:
                output_texts.append(item["text"])
            elif isinstance(item, str):
                output_texts.append(item)

        # Combine all text results into one string.
        return "\n".join(output_texts) if output_texts else str(result)
