import os
import json
import httpx
from mcp_client import MySQLMCPAgentClient

LLM_SERVICE_URL = os.getenv("LLM_SERVICE_URL", "http://llm-service:8001")
mcp_client = MySQLMCPAgentClient()

async def execute_agent_chat(agent, user_prompt: str, history: list = None) -> str:
    """
    Orchestrates the autonomous agent conversation loop:
    User Prompt -> LLM Reasoning -> MySQL MCP Tool Execution -> Final LLM Synthesis.
    """
    if history is None:
        history = []

    # Retrieve live database operation tools from mysql-mcp
    tools = await mcp_client.get_tools_for_ollama()

    system_instruction = (
        f"{agent.systemPrompt}\n"
        "You have direct access to a local MySQL database via MCP tools. "
        "When requested to create, read, update, or delete tables and records, "
        "invoke the appropriate database tools to perform the SQL operations."
    )

    messages = [{"role": "system", "content": system_instruction}]
    for msg in history:
        messages.append(msg)
    messages.append({"role": "user", "content": user_prompt})

    # Step 1: Initial invocation asking the LLM to process prompt with available tools
    async with httpx.AsyncClient(timeout=180.0) as client:
        res = await client.post(
            f"{LLM_SERVICE_URL}/generate",
            json={
                "messages": messages,
                "model": agent.model or "llama3.1",
                "tools": tools
            }
        )
        res.raise_for_status()
        res_data = res.json()

    tool_calls = res_data.get("tool_calls")

    # Step 2: Handle tool calls if the model determined an operation is required
    if tool_calls:
        for tool_call in tool_calls:
            function_data = tool_call.get("function", {})
            fn_name = function_data.get("name")
            fn_args = function_data.get("arguments", {})

            if isinstance(fn_args, str):
                fn_args = json.loads(fn_args)

            # Execute SQL operation through the MCP bridge
            tool_output = await mcp_client.execute_tool(fn_name, fn_args)

            # Append assistant action and tool result to conversation context
            messages.append({
                "role": "assistant",
                "content": "",
                "tool_calls": [tool_call]
            })
            messages.append({
                "role": "tool",
                "content": str(tool_output)
            })

        # Step 3: Final pass for the model to produce a natural language summary of the result
        async with httpx.AsyncClient(timeout=180.0) as client:
            final_res = await client.post(
                f"{LLM_SERVICE_URL}/generate",
                json={
                    "messages": messages,
                    "model": agent.model or "llama3.1"
                }
            )
            final_res.raise_for_status()
            return final_res.json().get("reply", "")

    return res_data.get("reply", "")