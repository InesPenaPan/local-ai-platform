import { useState, useRef, useEffect } from "react";
import {
  Bot,
  MessageSquare,
} from "lucide-react";

import ChatEmptyState from "./subcomponents/ChatEmptyState";
import Message from "./subcomponents/Message";
import PromptInput from "./subcomponents/PromptInput";

export default function ChatPage() {
  // Normal chat messages
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("llama3.1");

  const messagesEndRef = useRef(null);

  // Scroll to the bottom whenever messages or loading state changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Send a normal chat message to the LLM Gateway
  const sendMessage = async (e) => {
    e.preventDefault();

    const trimmed = input.trim();

    if (!trimmed || loading) {
      return;
    }

    const userMessage = {
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/llm/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmed,
            model: selectedModel,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Gateway returned status: ${response.status}`
        );
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Error: No se pudo conectar con el API Gateway (puerto 8000).",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#060a11] text-slate-100 font-sans overflow-hidden">

      {/* Main Chat */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-[#04070c] shadow-[inset_1px_0_10px_rgba(0,0,0,0.5)]">

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">

          {/* Empty State */}
          {messages.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center animate-fade-in pointer-events-none mt-10">

              <ChatEmptyState
                icon={MessageSquare}
                title="How can I help you?"
                subtitle="Start a conversation with your local AI assistant."
              />

            </div>
          )}

          {/* Chat History */}
          <div className="max-w-4xl w-full mx-auto p-6 md:p-8 pt-12 space-y-8 relative z-10 pb-24">

            {/* Messages */}
            {messages.map((message, idx) => (
              <Message
                key={idx}
                message={message}
              />
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-4 justify-start animate-fade-in">

                <div className="w-10 h-10 rounded-xl bg-[#2563eb] border border-blue-400/30 flex items-center justify-center text-white shrink-0 mt-1 shadow-[0_4px_15px_rgba(59,130,246,0.25)]">
                  <Bot
                    size={20}
                    strokeWidth={2}
                  />
                </div>

                <div className="bg-[#080d17] border border-[#3b82f6]/30 shadow-[0_4px_20px_rgba(59,130,246,0.1)] px-6 py-5 rounded-2xl rounded-tl-sm flex items-center gap-2">

                  <div className="w-2 h-2 bg-[#60a5fa] rounded-full animate-bounce [animation-delay:-0.3s]" />

                  <div className="w-2 h-2 bg-[#60a5fa] rounded-full animate-bounce [animation-delay:-0.15s]" />

                  <div className="w-2 h-2 bg-[#60a5fa] rounded-full animate-bounce" />

                </div>
              </div>
            )}

            <div
              ref={messagesEndRef}
              className="h-6"
            />

          </div>
        </div>

        {/* Input Area */}
        <PromptInput
          input={input}
          setInput={setInput}
          loading={loading}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          onSubmit={sendMessage}
        />

      </main>
    </div>
  );
}
