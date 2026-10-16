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
        "REGLAS DE EFICIENCIA:\n"
        "- Tienes acceso real a la base de datos MySQL CRM mediante herramientas MCP.\n"
        "- Sé directo y eficiente: si necesitas datos de una tabla, ejecuta directamente 'read_query' con la consulta SQL adecuada (ej. SELECT * FROM tabla LIMIT 10) en vez de hacer múltiples pasos innecesarios.\n"
        "- NUNCA supongas ni inventes registros ni columnas."
    )

    messages = [{"role": "system", "content": system_instruction}]
    for msg in history:
        messages.append(msg)
    messages.append({"role": "user", "content": user_prompt})

    model_name = agent.model or "llama3.1"
    max_turns = 4

    # Timeout de 300 segundos para dar tiempo suficiente a ejecuciones multi-turno en local
    timeout_config = httpx.Timeout(300.0, connect=10.0)

    async with httpx.AsyncClient(timeout=timeout_config) as client:
        for _ in range(max_turns):
            try:
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
            except httpx.ReadTimeout:
                return "La consulta a la base de datos tomó demasiado tiempo en procesarse. Intenta hacer una pregunta más concreta (por ejemplo: 'Muestra los primeros 5 clientes')."

            message = res_data.get("message", {})
            tool_calls = message.get("tool_calls", [])

            # Si el modelo no solicita más herramientas, ya redactó la respuesta final
            if not tool_calls:
                return message.get("content", "")

            # Guardar el mensaje del asistente con las llamadas
            messages.append(message)

            # Ejecutar las herramientas solicitadas en este turno
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

        # Síntesis final tras agotar turnos
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