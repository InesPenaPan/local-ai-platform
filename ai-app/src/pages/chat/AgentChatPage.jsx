import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";

import Sidebar from "./subcomponents/SideBar";
import Message from "./subcomponents/Message";

export default function AgentChatPage({ agent: selectedAgent }) {
  const [agent, setAgent] = useState(selectedAgent || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentLoading, setAgentLoading] = useState(true);
  const [agentError, setAgentError] = useState(null);

  const messagesEndRef = useRef(null);

  // Load agent information from the API Gateway
  useEffect(() => {
    if (!selectedAgent?.name) {
      setAgentLoading(false);
      setAgentError("No agent has been selected.");
      return;
    }

    const fetchAgent = async () => {
      try {
        setAgentLoading(true);
        setAgentError(null);

        const response = await fetch(
          `http://localhost:8000/api/v1/agent/agents/${encodeURIComponent(
            selectedAgent.name
          )}`
        );

        if (!response.ok) {
          throw new Error(
            `Could not retrieve agent (${response.status})`
          );
        }

        const data = await response.json();

        setAgent(data);
      } catch (error) {
        console.error("Error loading agent:", error);
        setAgentError("Could not load agent information.");
      } finally {
        setAgentLoading(false);
      }
    };

    fetchAgent();
  }, [selectedAgent]);

  // Scroll to the bottom whenever messages or loading state changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Send a message to the LLM Gateway using the selected agent configuration
  const sendMessage = async (e) => {
    e.preventDefault();

    const trimmed = input.trim();

    if (!trimmed || loading || !agent) return;

    const userMessage = {
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Send the user's message to the same LLM endpoint used by ChatPage.
      // The agent's model and system prompt are included in the request.
      const response = await fetch(
        "http://localhost:8000/api/v1/llm/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmed,
            model: agent.model,
            system_prompt: agent.systemPrompt,
          }),
        }
      );

      // Handle unsuccessful responses from the API Gateway
      if (!response.ok) {
        throw new Error(
          `Gateway returned status: ${response.status}`
        );
      }

      // Parse the LLM service response
      const data = await response.json();

      // Add the assistant response to the chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Show a user-friendly error message in the chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Could not get a response from the agent.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while retrieving the agent
  if (agentLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#060a11] text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="ml-2">
            Loading agent...
          </span>
        </div>
      </div>
    );
  }

  // Show an error state if the agent could not be loaded
  if (agentError || !agent) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#060a11] text-slate-400">
        <div className="text-center">
          <p className="text-red-400 mb-2">
            {agentError || "Agent not found."}
          </p>

          <p className="text-sm text-slate-500">
            Make sure the agent exists and that the API Gateway is available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#060a11] text-slate-100 font-sans overflow-hidden">
      <div className="flex flex-1 h-full overflow-hidden">

        {/* Sidebar */}
        <Sidebar currentItem="agents" />

        {/* Main agent chat area */}
        <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-[#04070c] shadow-[inset_1px_0_10px_rgba(0,0,0,0.5)]">

          {/* Agent information header */}
          <header className="shrink-0 px-6 pt-6 relative z-20">
            <div className="max-w-4xl mx-auto">

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080d17]/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.25)]">

                {/* Decorative background glow */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#3b82f6]/15 blur-[50px] rounded-full pointer-events-none" />

                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#DE145C]/15 blur-[50px] rounded-full pointer-events-none" />

                {/* Agent information */}
                <div className="relative z-10 flex items-center p-5">
                  <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-3">
                      <h1 className="text-lg font-semibold text-slate-100 tracking-wide truncate">
                        {agent.name}
                      </h1>

                      <span className="px-2.5 py-1 rounded-md bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[11px] font-medium text-blue-300 uppercase tracking-wider">
                        Agent
                      </span>
                    </div>

                    <p className="text-sm text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                      {agent.description}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider">
                        Model
                      </span>

                      <span className="text-[11px] text-slate-300 font-medium">
                        {agent.model}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">

            {/* Empty state */}
            {messages.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in pointer-events-none mt-16">

                <div className="relative flex items-center justify-center">
                  <div className="absolute w-32 h-32 bg-[#3b82f6]/40 blur-[35px] -translate-x-6 rounded-full" />

                  <div className="absolute w-32 h-32 bg-[#DE145C]/40 blur-[35px] translate-x-6 rounded-full" />

                  <Bot
                    size={65}
                    strokeWidth={1.2}
                    className="text-slate-200 relative z-10 drop-shadow-lg"
                  />
                </div>

                <div className="text-center relative z-10 mt-14">
                  <p className="text-lg font-medium text-slate-200 tracking-wide">
                    Start a conversation with {agent.name}
                  </p>

                  <p className="text-sm text-slate-500 mt-2 max-w-md">
                    Send a message below to interact with this agent.
                  </p>
                </div>

              </div>
            )}

            {/* Chat history */}
            <div className="max-w-4xl w-full mx-auto p-6 md:p-8 pt-8 space-y-8 relative z-10 pb-24">

              {/* Message list */}
              {messages.map((msg, idx) => (
                <Message
                  key={idx}
                  message={msg}
                />
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex gap-4 justify-start animate-fade-in">

                  <div className="w-9 h-9 flex items-center justify-center shrink-0 mt-1">
                    <Bot
                      size={22}
                      strokeWidth={1.8}
                      className="text-blue-300"
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

          {/* Bottom input area */}
          <footer className="shrink-0 px-6 py-6 bg-gradient-to-t from-[#04070c] via-[#04070c]/95 to-transparent relative z-30">

            <form
              onSubmit={sendMessage}
              className="max-w-4xl mx-auto flex gap-3 relative"
            >

              {/* Text input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Message ${agent.name}...`}
                  disabled={loading}
                  className="w-full bg-[#0a0f18]/90 backdrop-blur-md border border-white/10 hover:border-white/20 focus:border-[#DE145C]/50 rounded-xl pl-5 pr-14 py-3.5 text-[15px] text-white placeholder-slate-500 focus:outline-none transition-all shadow-lg disabled:opacity-50 font-light"
                />

                {/* Send button */}
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