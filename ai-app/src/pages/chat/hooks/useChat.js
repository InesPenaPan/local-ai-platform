
import { useState } from "react";

const API_URL = "http://localhost:8000/api/v1";

export function useChat({ enableHistory = false } = {}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  // ============================================================
  // Cargar una conversación existente
  // ============================================================
  const loadConversation = async (id) => {
    if (!id) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/history/conversations/${id}/messages`
      );

      if (!response.ok) {
        throw new Error(
          `No se pudieron cargar los mensajes (${response.status})`
        );
      }

      const data = await response.json();

      setMessages(Array.isArray(data) ? data : []);
      setConversationId(id);
    } catch (error) {
      console.error("Error cargando la conversación:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Enviar mensaje
  // ============================================================
  const sendMessage = async ({
    content,
    model = "llama3.1",
    systemPrompt = "",
  }) => {
    const trimmed = content?.trim();

    if (!trimmed || loading) {
      return null;
    }

    const userMessage = {
      role: "user",
      content: trimmed,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    let currentConvId = conversationId;

    try {
      // ========================================================
      // Historial
      // ========================================================
      if (enableHistory) {

        // Crear conversación si todavía no existe
        if (!currentConvId) {
          const convRes = await fetch(
            `${API_URL}/history/conversations`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title:
                  trimmed.length > 30
                    ? `${trimmed.substring(0, 30)}...`
                    : trimmed,
              }),
            }
          );

          if (!convRes.ok) {
            throw new Error(
              `No se pudo crear la conversación (${convRes.status})`
            );
          }

          const convData = await convRes.json();

          currentConvId = convData.id;

          setConversationId(currentConvId);
        }

        // Guardar mensaje del usuario
        if (currentConvId) {
          const userHistoryRes = await fetch(
            `${API_URL}/history/conversations/${currentConvId}/messages`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                role: "user",
                content: trimmed,
              }),
            }
          );

          if (!userHistoryRes.ok) {
            console.error(
              "No se pudo guardar el mensaje del usuario:",
              userHistoryRes.status
            );
          }
        }
      }

      // ========================================================
      // Generar respuesta del modelo
      // ========================================================
      const response = await fetch(
        `${API_URL}/llm/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: updatedMessages,
            model,
            system_prompt: systemPrompt,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Gateway returned status: ${response.status}`
        );
      }

      const data = await response.json();

      const assistantMessage = {
        role: "assistant",
        content: data.reply,
      };

      // Mostrar respuesta del asistente
      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);

      // ========================================================
      // Guardar respuesta del asistente en el historial
      // ========================================================
      if (enableHistory && currentConvId) {
        const assistantHistoryRes = await fetch(
          `${API_URL}/history/conversations/${currentConvId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              role: "assistant",
              content: data.reply,
            }),
          }
        );

        if (!assistantHistoryRes.ok) {
          console.error(
            "No se pudo guardar la respuesta del asistente:",
            assistantHistoryRes.status
          );
        }
      }

      return {
        userMessage,
        assistantMessage,
      };

    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage = {
        role: "assistant",
        content:
          "Could not get a response from the model.",
      };

      setMessages((prev) => [
        ...prev,
        errorMessage,
      ]);

      return {
        userMessage,
        assistantMessage: errorMessage,
        error,
      };

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Reemplazar mensajes
  // ============================================================
  const setConversationMessages = (newMessages) => {
    setMessages(
      Array.isArray(newMessages) ? newMessages : []
    );
  };

  // ============================================================
  // Limpiar conversación
  // ============================================================
  const clearMessages = () => {
    setMessages([]);
    setConversationId(null);
    setInput("");
  };

  // ============================================================
  // API pública del hook
  // ============================================================
  return {
    messages,
    setMessages,
    setConversationMessages,
    clearMessages,

    input,
    setInput,

    loading,

    sendMessage,
    loadConversation,
  };
}

