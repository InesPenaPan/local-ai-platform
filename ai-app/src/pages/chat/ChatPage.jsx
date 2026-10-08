import { useState, useRef, useEffect } from "react";
import { Bot, MessageSquare, Activity, Cpu, HardDrive } from "lucide-react";

import { useChat } from "./hooks/useChat";

import ChatEmptyState from "./subcomponents/ChatEmptyState";
import Message from "./subcomponents/Message";
import PromptInput from "./subcomponents/PromptInput";

/**
 * ChatPage component renders the primary chat interface, handling active conversations,
 * message streaming/loading states, automatic scroll behavior, and message submissions.
 * 
 * @component
 * @param {Object} props Component properties
 * @param {string|null} [props.activeConversationId] The ID of the currently selected conversation to load from history
 * @returns {JSX.Element} The rendered chat layout container
 */
export default function ChatPage({ activeConversationId }) {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("llama3.1");

  const {
    messages,
    loading,
    sendMessage,
    loadConversation,
    clearMessages,
  } = useChat({ enableHistory: true });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  /**
   * Load the selected conversation or clear the chat for a new one.
   */
  useEffect(() => {
    if (activeConversationId) {
      loadConversation(activeConversationId);
    } else {
      clearMessages();
    }
  }, [activeConversationId]);

  /**
   * Keep the latest message visible when messages or loading state changes.
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  /**
   * Send message
   */
  const handleSend = async (e) => {
    e.preventDefault();

    const trimmed = input.trim();

    if (!trimmed || loading) {
      return;
    }

    await sendMessage({
      content: trimmed,
      model: selectedModel,
    });

    setInput("");
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#060a11] text-slate-100 font-sans overflow-hidden">

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-[#04070c] shadow-[inset_1px_0_10px_rgba(0,0,0,0.5)]">

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">

          {/* Display the welcome state when there are no messages. */}
          {messages.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center animate-fade-in pointer-events-none mt-10">
              <ChatEmptyState
                icon={MessageSquare}
                title="How can I help you?"
                subtitle="Start a conversation with your local AI assistant."
              />
            </div>
          )}

          {/* Message list and loading indicator. */}
          <div className="max-w-4xl w-full mx-auto p-6 md:p-8 pt-12 space-y-8 relative z-10 pb-24">

            {messages.map((message, idx) => (
              <Message
                key={idx}
                message={message}
              />
            ))}

            {loading && (
              <div className="flex gap-4 justify-start animate-fade-in">

                <div className="w-10 h-10 rounded-xl bg-[#2563eb] border border-blue-400/30 flex items-center justify-center text-white shrink-0 mt-1 shadow-[0_4px_15px_rgba(59,130,246,0.25)]">
                  <Bot size={20} strokeWidth={2} />
                </div>

                <div className="bg-[#080d17] border border-[#3b82f6]/30 shadow-[0_4px_20px_rgba(59,130,246,0.1)] px-6 py-5 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#60a5fa] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-[#60a5fa] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-[#60a5fa] rounded-full animate-bounce" />
                </div>
              </div>
            )}

            {/* Target used to scroll to the bottom of the conversation. */}
            <div ref={messagesEndRef} className="h-6"/>

          </div>
        </div>

        {/* Input area for writing and submitting messages. */}
        <PromptInput
          input={input}
          setInput={setInput}
          loading={loading}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          onSubmit={handleSend}
        />

      </main>
    </div>
  );
}