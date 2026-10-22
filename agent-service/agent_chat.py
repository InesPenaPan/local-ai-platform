import os
import json
import httpx
from mcp_clients.mysql_client import MySQLMCPAgentClient
from mcp_clients.github_client import GitHubMCPAgentClient

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434")
DEFAULT_MODEL = "llama3.1"
DEFAULT_TEMPERATURE = 0.1
MAX_TOOL_ITERATIONS = 4
REQUEST_TIMEOUT_SECONDS = 300.0
CONNECT_TIMEOUT_SECONDS = 10.0

mcp_client = MySQLMCPAgentClient()

async def execute_agent_chat(agent, user_prompt: str, history: list = None) -> str:
    """
    Resolves natural language queries by executing real database operations via MCP.
    Delivers a grounded response synthesized from verified transactional data.
    """
    if history is None:
        history = []

    tools = await mcp_client.get_tools_for_ollama()

    system_instruction = (
        f"{agent.systemPrompt}\n\n"
        "DATABASE RULES:\n"
        "- Query MySQL via MCP tools; never simulate data or column names.\n"
        "- Be direct: use 'read_query' immediately to fetch data without redundant schema checks."
    )

    # Assemble conversation payload with strict system guardrails
    messages = [{"role": "system", "content": system_instruction}]
    for msg in history:
        messages.append(msg)
    messages.append({"role": "user", "content": user_prompt})

    model_name = agent.model or DEFAULT_MODEL
    agent_temperature = agent.temperature if agent.temperature is not None else DEFAULT_TEMPERATURE

    timeout_config = httpx.Timeout(REQUEST_TIMEOUT_SECONDS, connect=CONNECT_TIMEOUT_SECONDS)

    async with httpx.AsyncClient(timeout=timeout_config) as client:
        # Re-Act reasoning loop: permits sequential tool calls until convergence
        for _ in range(MAX_TOOL_ITERATIONS):
            try:
                res = await client.post(
                    f"{OLLAMA_URL}/api/chat",
                    json={
                        "model": model_name,
                        "messages": messages,
                        "tools": tools,
                        "stream": False,
                        "options": {
                            "temperature": agent_temperature
                        }
                    }
                )
                res.raise_for_status()
                res_data = res.json()
            except httpx.ReadTimeout:
                return "Database query timed out. Please try a more specific request."

            message = res_data.get("message", {})
            tool_calls = message.get("tool_calls", [])

            # Exit the loop once the model has sufficient data to answer
            if not tool_calls:
                return message.get("content", "")

            # Preserve the model's function-calling intent in conversation history
            messages.append(message)

            # Execute requested database operations via the MCP bridge
            for tool_call in tool_calls:
                function_data = tool_call.get("function", {})
                fn_name = function_data.get("name")
                fn_args = function_data.get("arguments", {})

                if isinstance(fn_args, str):
                    try:
                        fn_args = json.loads(fn_args)
                    except Exception:
                        fn_args = {}

                print(f"[AGENT] Executing tool: {fn_name} with arguments: {fn_args}")
                tool_output = await mcp_client.execute_tool(fn_name, fn_args)
                print(f"[AGENT] Tool output: {tool_output}")

                # Provide grounded execution outputs back to the model context
                messages.append({
                    "role": "tool",
                    "content": str(tool_output)
                })

        # Fallback synthesis: force natural language summary if max iterations are exhausted
        final_res = await client.post(
            f"{OLLAMA_URL}/api/chat",
            json={
                "model": model_name,
                "messages": messages,
                "stream": False
            }
        )
        final_res.raise_for_status()
        return final_res.json().get("message", {}).get("content", "")
