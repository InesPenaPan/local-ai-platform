import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  ChevronDown,
  MessageSquare,
} from "lucide-react";

import Sidebar from "./subcomponents/SideBar";
import ChatEmptyState from "./subcomponents/ChatEmptyState";
import Message from "./subcomponents/Message";
import NewAgentPage from "./NewAgentPage";
import AgentChatPage from "./AgentChatPage";

export default function ChatPage() {
  const [currentTab, setCurrentTab] = useState("chat");

  // Currently selected agent
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Normal chat messages
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("llama3.1");

  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages/loading changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Send normal chat message to LLM Gateway
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

  // ============================
  // CREATE AGENT
  // ============================
  if (currentTab === "create-agent") {
    return (
      <NewAgentPage
        onBack={() => setCurrentTab("chat")}
      />
    );
  }

  // ============================
  // AGENT CHAT
  // ============================
  if (currentTab === "agent-chat") {
    return (
      <AgentChatPage
        agent={selectedAgent}
      />
    );
  }

  // ============================
  // NORMAL CHAT
  // ============================
  return (
    <div className="flex flex-col h-full w-full bg-[#060a11] text-slate-100 font-sans overflow-hidden">

      <div className="flex flex-1 h-full overflow-hidden">

        {/* Sidebar */}
        <Sidebar
          currentItem="agents"

          onNewAgentClick={() => {
            setCurrentTab("create-agent");
          }}

          onSelectAgent={(agent) => {
            setSelectedAgent(agent);
            setCurrentTab("agent-chat");
          }}
        />

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
          <footer className="shrink-0 px-6 py-6 bg-gradient-to-t from-[#04070c] via-[#04070c]/95 to-transparent relative z-30">

            <form
              onSubmit={sendMessage}
              className="max-w-4xl mx-auto flex gap-3 relative"
            >

              {/* Model Selector */}
              <div className="relative shrink-0 w-40">

                <select
                  value={selectedModel}
                  onChange={(e) =>
                    setSelectedModel(e.target.value)
                  }
                  disabled={loading}
                  className="w-full h-full bg-[#0a0f18]/90 backdrop-blur-md border border-white/10 hover:border-white/20 focus:border-[#3b82f6]/50 rounded-xl pl-4 pr-10 py-3.5 text-[14px] font-medium text-slate-200 focus:outline-none transition-all shadow-lg appearance-none cursor-pointer disabled:opacity-50"
                >

                  <option
                    value="llama3.1"
                    className="bg-[#0b111c]"
                  >
                    Llama 3.1
                  </option>

                  <option
                    value="mistral"
                    className="bg-[#0b111c]"
                  >
                    Mistral
                  </option>

                </select>

                <ChevronDown
                  size={16}
                  strokeWidth={2}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>

              {/* Text Input */}
              <div className="relative flex-1">

                <input
                  type="text"
                  value={input}
                  onChange={(e) =>
                    setInput(e.target.value)
                  }
                  placeholder="Message Local AI..."
                  disabled={loading}
                  className="w-full bg-[#0a0f18]/90 backdrop-blur-md border border-white/10 hover:border-white/20 focus:border-[#DE145C]/50 rounded-xl pl-5 pr-14 py-3.5 text-[15px] text-white placeholder-slate-500 focus:outline-none transition-all shadow-lg disabled:opacity-50 font-light"
                />

                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-transparent text-slate-500 hover:text-white hover:bg-gradient-to-br hover:from-[#3b82f6] hover:to-[#DE145C] hover:shadow-[0_4px_15px_rgba(222,20,92,0.3)] disabled:bg-transparent disabled:text-slate-700 transition-all duration-300"
                >

                  <Send
                    size={18}
                    strokeWidth={2}
                    className={
                      input.trim() && !loading
                        ? "text-[#DE145C]"
                        : ""
                    }
                  />

                </button>
              </div>
            </form>
          </footer>
        </main>
      </div>
    </div>
  );
}

