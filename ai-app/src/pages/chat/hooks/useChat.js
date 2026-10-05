import { useState } from "react";

const API_URL = "http://localhost:8000/api/v1";

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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

    try {
      const response = await fetch(`${API_URL}/llm/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          model,
          system_prompt: systemPrompt,
        }),
      });

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

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);

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

  const setConversationMessages = (messages) => {
    setMessages(messages || []);
  };

  const clearMessages = () => {
    setMessages([]);
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
  };
}
