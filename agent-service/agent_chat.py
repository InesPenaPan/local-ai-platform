import os
import json
import httpx
from mcp_clients.mysql_client import MySQLMCPAgentClient
from mcp_clients.github_client import GitHubMCPAgentClient

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434")
DEFAULT_MODEL = "llama3.1"
DEFAULT_TEMPERATURE = 0.1
MAX_TOOL_ITERATIONS = 4
REQUEST_TIMEOUT_SECONDS = 1800.0
CONNECT_TIMEOUT_SECONDS = 10.0

async def execute_agent_chat(agent, user_prompt: str, history: list = None) -> str:
    """
    Resolves natural language queries by executing real operations via MCP tools.
    """
    if history is None:
        history = []

    mcp_client = None
    system_instruction = agent.systemPrompt or ""

    # Dynamically assign the correct MCP client and inject strict system guardrails
    if agent.mcp == "mysql-mcp":
        mcp_client = MySQLMCPAgentClient()
        system_instruction += "\n\nCRITICAL INSTRUCTION: You MUST use the available database tools to fetch data before answering. Do NOT simulate or invent database schemas, tables, or records."
    elif agent.mcp == "github-mcp":
        mcp_client = GitHubMCPAgentClient()
        system_instruction += "\n\nCRITICAL INSTRUCTION: You MUST use the available GitHub tools (like 'search_repositories', 'get_file_contents', or 'list_commits') to fetch real data before answering. Do NOT simulate, invent, or hallucinate repository names, code, or organizations."

    # Fetch available tools if an MCP client is active
    tools = []
    if mcp_client:
        tools = await mcp_client.get_tools_for_ollama()

    # Assemble the message history
    messages = [{"role": "system", "content": system_instruction}]
    for msg in history:
        messages.append(msg)
    messages.append({"role": "user", "content": user_prompt})

    model_name = agent.model or DEFAULT_MODEL
    agent_temperature = agent.temperature if agent.temperature is not None else DEFAULT_TEMPERATURE
    timeout_config = httpx.Timeout(REQUEST_TIMEOUT_SECONDS, connect=CONNECT_TIMEOUT_SECONDS)

    async with httpx.AsyncClient(timeout=timeout_config) as client:
        # Re-Act reasoning loop: allows the model to call tools sequentially until convergence
        for _ in range(MAX_TOOL_ITERATIONS):
            try:
                payload = {
                    "model": model_name,
                    "messages": messages,
                    "stream": False,
                    "options": {"temperature": agent_temperature}
                }
                
                # Ollama requires the tools array to be omitted if empty
                if tools:
                    payload["tools"] = tools

                res = await client.post(f"{OLLAMA_URL}/api/chat", json=payload)
                res.raise_for_status()
                res_data = res.json()
            except httpx.ReadTimeout:
                return "Agent processing timed out."

            message = res_data.get("message", {})
            tool_calls = message.get("tool_calls", [])

            # Exit the loop and return text if the model does not request any tools
            if not tool_calls:
                return message.get("content", "")

            # Append the model's tool request to the context history
            messages.append(message)

            # Execute the requested tools
            for tool_call in tool_calls:
                function_data = tool_call.get("function", {})
                fn_name = function_data.get("name")
                fn_args = function_data.get("arguments", {})

                # Ensure arguments are parsed into a dictionary if returned as a string
                if isinstance(fn_args, str):
                    try:
                        fn_args = json.loads(fn_args)
                    except Exception:
                        fn_args = {}

                # --- DATA TYPE SANITIZATION ---
                # Force conversion to integers for numeric values that the LLM mistakenly sends as strings.
                # This prevents 422 Validation Errors from strict MCP schemas.
                if isinstance(fn_args, dict):
                    for key, value in list(fn_args.items()):
                        if isinstance(value, str) and value.isdigit():
                            fn_args[key] = int(value)
                            
                    # Corregimos la dirección: el MCP de GitHub SIEMPRE espera "query".
                    # Si el LLM alucina y envía "q", lo transformamos al correcto "query".
                    if "query" not in fn_args and "q" in fn_args:
                        fn_args["query"] = fn_args.pop("q")
                # ------------------------------    

                print(f"[AGENT] Executing tool: {fn_name} with arguments: {fn_args}")
                
                # Route execution to the active MCP client
                if mcp_client:
                    tool_output = await mcp_client.execute_tool(fn_name, fn_args)
                else:
                    tool_output = "Error: This agent does not have an active MCP connection."
                    
                print(f"[AGENT] Tool output: {tool_output}")

                # Append the tool's execution result back to the context so the LLM can read it
                messages.append({
                    "role": "tool",
                    "content": str(tool_output)
                })

        # Final fallback synthesis: force a natural language response if max iterations are exhausted
        final_res = await client.post(
            f"{OLLAMA_URL}/api/chat",
            json={"model": model_name, "messages": messages, "stream": False}
        )
        final_res.raise_for_status()
        return final_res.json().get("message", {}).get("content", "")