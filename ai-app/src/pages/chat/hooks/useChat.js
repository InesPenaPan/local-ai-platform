
import { useState } from "react";

const API_URL = "http://localhost:8000/api/v1";

/**
 * useChat custom hook manages chat state, conversation history persistence,
 * message loading, and communication with the backend LLM generation API.
 * 
 * @function useChat
 * @param {Object} [options] - Hook configuration options
 * @param {boolean} [options.enableHistory=false] - Flag indicating whether to persist messages and create conversations in the backend history
 * @returns {Object} The chat controller object and state variables
 * @returns {Array<Object>} returns.messages - The list of current chat messages
 * @returns {function(Array): void} returns.setMessages - State setter for messages
 * @returns {function(Array): void} returns.setConversationMessages - Replaces the messages array with validation
 * @returns {function(): void} returns.clearMessages - Clears current messages, input, and active conversation ID
 * @returns {string} returns.input - Current user input field string value
 * @returns {function(string): void} returns.setInput - State setter for input
 * @returns {boolean} returns.loading - Flag indicating whether an LLM generation or fetch request is in progress
 * @returns {function(Object): Promise<Object|null>} returns.sendMessage - Sends a user message, updates history, and calls the LLM generation endpoint
 * @returns {function(string): Promise<void>} returns.loadConversation - Loads past messages for a specified conversation ID
 */
export function useChat({ enableHistory = false } = {}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  /**
  * Load an existing conversation
  */
  const loadConversation = async (id) => {
    if (!id) return;
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/history/conversations/${id}/messages`
      );

      if (!response.ok) {
        throw new Error(`No se pudieron cargar los mensajes (${response.status})`);
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

  /**
  * Send a message to the backend
  */
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
      if (enableHistory) {

        /**
        * Create conversation and save user message
        */
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

        /**
        * Save the user message to history
        */
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
            console.error("No se pudo guardar el mensaje del usuario:", userHistoryRes.status);
          }
        }
      }

      /**
      * Generate assistant response
      */
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
        throw new Error(`Gateway returned status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);

      /**
      * Save assistant response to history
      */
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
          console.error("No se pudo guardar la respuesta del asistente:", assistantHistoryRes.status);
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

  /**
  * Replace the current messages
  */
  const setConversationMessages = (newMessages) => {
    setMessages(Array.isArray(newMessages) ? newMessages : []);
  };

  /**
  * Clear the current conversation
  */
  const clearMessages = () => {
    setMessages([]);
    setConversationId(null);
    setInput("");
  };

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

