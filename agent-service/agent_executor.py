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
    Process a user's message using Ollama and MCP tools.
    The agent can retrieve real information from GitHub or MySQL before generating its final response.
    """

     # Start with an empty conversation history if none was provided.
    if history is None:
        history = []

    # Store the MCP client selected for this agent.
    mcp_client = None

    # Load the agent's system instructions.
    system_instruction = agent.systemPrompt or ""

    # Select the MCP client according to the agent configuration.
    if agent.mcp == "mysql-mcp":
        mcp_client = MySQLMCPAgentClient()
        system_instruction += "\n\nCRITICAL INSTRUCTION: You MUST use the available database tools to fetch data before answering. Do NOT simulate or invent database schemas, tables, or records."
    
    elif agent.mcp == "github-mcp":
        mcp_client = GitHubMCPAgentClient()
        system_instruction += "\n\nCRITICAL INSTRUCTION: You MUST use the available GitHub tools (like 'search_repositories', 'get_file_contents', or 'list_commits') to fetch real data before answering. Do NOT simulate, invent, or hallucinate repository names, code, or organizations."

    # Retrieve the available tools from the selected MCP server.
    tools = []
    if mcp_client:
        tools = await mcp_client.get_tools_for_ollama()

    # Build the conversation messages sent to Ollama.
    messages = [{"role": "system", "content": system_instruction}]

     # Add previous messages so the model can remember the conversation context.
    for msg in history:
        messages.append(msg)

    # Add the current user message at the end of the conversation.
    messages.append({"role": "user", "content": user_prompt})

    # Use the agent's custom model and temperature, or their default values.
    model_name = agent.model or DEFAULT_MODEL
    agent_temperature = agent.temperature if agent.temperature is not None else DEFAULT_TEMPERATURE

    # Configure the maximum time allowed for requests and connections.
    timeout_config = httpx.Timeout(REQUEST_TIMEOUT_SECONDS, connect=CONNECT_TIMEOUT_SECONDS)

    # Create an asynchronous HTTP client for communicating with Ollama.
    async with httpx.AsyncClient(timeout=timeout_config) as client:

        for _ in range(MAX_TOOL_ITERATIONS):
            try:
                # Prepare the request containing the model and conversation.
                payload = {
                    "model": model_name,
                    "messages": messages,
                    "stream": False,
                    "options": {"temperature": agent_temperature}
                }

                # Only include tools if an MCP client has provided them.
                if tools:
                    payload["tools"] = tools

                # Send the conversation to Ollama for processing.
                res = await client.post(f"{OLLAMA_URL}/api/chat", json=payload)

                # Raise an error if Ollama returns an unsuccessful HTTP status.
                res.raise_for_status()

                # Convert Ollama's JSON response into a Python dictionary.
                res_data = res.json()

            except httpx.ReadTimeout:
                return "Agent processing timed out."

            # Extract the model's response message.
            message = res_data.get("message", {})

            # Check whether the model wants to execute any tools.
            tool_calls = message.get("tool_calls", [])

            # If no tools are requested, return the model's final answer.
            if not tool_calls:
                return message.get("content", "")

            # Append the model's tool request to the context history
            messages.append(message)

            # Execute the requested tools
            for tool_call in tool_calls:

                # Extract the function name and its arguments.
                function_data = tool_call.get("function", {})
                fn_name = function_data.get("name")
                fn_args = function_data.get("arguments", {})

                # Convert arguments from JSON strings into Python dictionaries.
                if isinstance(fn_args, str):
                    try:
                        fn_args = json.loads(fn_args)
                    except Exception:
                        fn_args = {}

                # Convert numeric strings into integers when possible.
                if isinstance(fn_args, dict):
                    for key, value in list(fn_args.items()):
                        if isinstance(value, str) and value.isdigit():
                            fn_args[key] = int(value)
                            
                    if "query" not in fn_args and "q" in fn_args:
                        fn_args["query"] = fn_args.pop("q")
      
                print(f"[AGENT] Executing tool: {fn_name} with arguments: {fn_args}")
                
                # Execute the requested tool through the active MCP client.
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

        # If the maximum number of tool iterations is reached, ask Ollama to generate a final answer using the collected results.
        final_res = await client.post(
            f"{OLLAMA_URL}/api/chat",
            json={"model": model_name, "messages": messages, "stream": False}
        )

        # Check the final request and return the model's response.
        final_res.raise_for_status()
        return final_res.json().get("message", {}).get("content", "")