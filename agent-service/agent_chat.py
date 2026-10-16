import os
import json
import httpx
from mcp_client import MySQLMCPAgentClient

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434")
mcp_client = MySQLMCPAgentClient()

async def execute_agent_chat(agent, user_prompt: str, history: list = None) -> str:
    """
    Orchestrates the autonomous agent conversation loop with multi-turn tool support:
    User Prompt -> [Ollama Tool Call <-> MCP Tool Execution]* -> Final Synthesis.
    """
    if history is None:
        history = []

    # 1. Obtener herramientas reales de mysql-mcp
    tools = await mcp_client.get_tools_for_ollama()

    system_instruction = (
        f"{agent.systemPrompt}\n\n"
        "REGLA OBLIGATORIA:\n"
        "- Tienes acceso real a la base de datos MySQL local mediante herramientas MCP.\n"
        "- Para responder cualquier pregunta sobre datos o columnas, DEBES ejecutar las herramientas ('list_tables', 'describe_table', 'read_query').\n"
        "- NUNCA supongas ni inventes columnas, registros ni valores."
    )

    messages = [{"role": "system", "content": system_instruction}]
    for msg in history:
        messages.append(msg)
    messages.append({"role": "user", "content": user_prompt})

    model_name = agent.model or "llama3.1"
    max_turns = 5  # Permite hasta 5 iteraciones seguidas de herramientas

    async with httpx.AsyncClient(timeout=180.0) as client:
        for _ in range(max_turns):
            # Llamamos a Ollama ofreciendo siempre las herramientas
            res = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": model_name,
                    "messages": messages,
                    "tools": tools,
                    "stream": False,
                    "options": {
                        "temperature": agent.temperature or 0.1
                    }
                }
            )
            res.raise_for_status()
            res_data = res.json()

            message = res_data.get("message", {})
            tool_calls = message.get("tool_calls", [])

            # Si el modelo no pide más herramientas, ya tiene la respuesta final
            if not tool_calls:
                return message.get("content", "")

            # Guardamos la intención del modelo
            messages.append(message)

            # Ejecutar todas las herramientas que haya pedido en este turno
            for tool_call in tool_calls:
                function_data = tool_call.get("function", {})
                fn_name = function_data.get("name")
                fn_args = function_data.get("arguments", {})

                if isinstance(fn_args, str):
                    try:
                        fn_args = json.loads(fn_args)
                    except Exception:
                        fn_args = {}

                print(f"[AGENT] Ejecutando: {fn_name} con args {fn_args}")
                tool_output = await mcp_client.execute_tool(fn_name, fn_args)
                print(f"[AGENT] Salida BD: {tool_output}")

                messages.append({
                    "role": "tool",
                    "content": str(tool_output)
                })

        # Si agotara los 5 turnos, forzamos respuesta final de texto
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