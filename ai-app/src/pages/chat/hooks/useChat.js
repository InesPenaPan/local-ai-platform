import { useState } from "react";

const API_BASE_URL = "http://localhost:8000/api/v1";
const DEFAULT_MODEL = "llama3.1";
const TITLE_MAX_LENGTH = 30;
const JSON_HEADERS = {
  "Content-Type": "application/json",
};

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
        `${API_BASE_URL}/history/conversations/${id}/messages`
      );

      if (!response.ok) {
        throw new Error(`Failed to load messages (${response.status})`);
      }

      const data = await response.json();

      setMessages(Array.isArray(data) ? data : []);
      setConversationId(id);
    } catch (error) {
      console.error("Error loading conversation:", error);
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
    model = DEFAULT_MODEL,
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
            `${API_BASE_URL}/history/conversations`,
            {
              method: "POST",
              headers: JSON_HEADERS,
              body: JSON.stringify({
                title:
                  trimmed.length > TITLE_MAX_LENGTH
                    ? `${trimmed.substring(0, TITLE_MAX_LENGTH)}...`
                    : trimmed,
              }),
            }
          );

          if (!convRes.ok) {
            throw new Error(
              `Failed to create conversation (${convRes.status})`
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
            `${API_BASE_URL}/history/conversations/${currentConvId}/messages`,
            {
              method: "POST",
              headers: JSON_HEADERS,
              body: JSON.stringify({
                role: "user",
                content: trimmed,
              }),
            }
          );

          if (!userHistoryRes.ok) {
            console.error("Failed to save user message:", userHistoryRes.status);
          }
        }
      }

      /**
       * Generate assistant response
       */
      const response = await fetch(
        `${API_BASE_URL}/llm/generate`,
        {
          method: "POST",
          headers: JSON_HEADERS,
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
          `${API_BASE_URL}/history/conversations/${currentConvId}/messages`,
          {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify({
              role: "assistant",
              content: data.reply,
            }),
          }
        );

        if (!assistantHistoryRes.ok) {
          console.error("Failed to save assistant response:", assistantHistoryRes.status);
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
        content: "Could not get a response from the model.",
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