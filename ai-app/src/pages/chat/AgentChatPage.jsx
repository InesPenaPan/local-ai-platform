import { useState, useRef, useEffect } from "react";
import { Bot } from "lucide-react";

import Message from "./subcomponents/Message";
import PromptInput from "./subcomponents/PromptInput";
import ChatEmptyState from "./subcomponents/ChatEmptyState";
import AgentCard from "./subcomponents/AgentCard";
import { useChat } from "./hooks/useChat";

const API_BASE_URL = "http://localhost:8000/api/v1";
const RAG_SEARCH_ENDPOINT = `${API_BASE_URL}/rag/search`;
const AGENT_DETAILS_ENDPOINT = (name) => `${API_BASE_URL}/agent/agents/${encodeURIComponent(name)}`;
const AGENT_CHAT_ENDPOINT = (name) => `${API_BASE_URL}/agent/${encodeURIComponent(name)}/chat`;

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

const DEFAULT_TOP_K = 3;

/**
 * AgentChatPage component renders an agent-specific chat interface, handling agent data fetching,
 * RAG context enrichment for messages, automatic scrolling, and message submissions.
 * 
 * @component
 * @param {Object} props Component properties
 * @param {Object} [props.agent] The selected agent object containing details like name, model, system prompt, and RAG collection
 * @returns {JSX.Element} The rendered agent chat layout container
 */
export default function AgentChatPage({ agent: selectedAgent }) {
  const [agent, setAgent] = useState(selectedAgent || null);
  const [input, setInput] = useState("");
  const [agentLoading, setAgentLoading] = useState(true);
  const [agentError, setAgentError] = useState(null);
  const [mcpLoading, setMcpLoading] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);

  const messagesEndRef = useRef(null);

  const {
    messages: hookMessages,
    loading: hookLoading,
    sendMessage: sendChatMessage,
    clearMessages,
    setMessages,
  } = useChat();

  /**
   * Determine whether to use standard hook messages or local state for MCP-driven chats.
   * Modificado para aceptar cualquier MCP válido ("none" significa que no usa MCP).
   */
  const isMcpAgent = agent?.mcp && agent.mcp !== "none";
  const messages = isMcpAgent ? localMessages : hookMessages;
  const loading = isMcpAgent ? mcpLoading : hookLoading;

  /**
   * Load the full agent configuration and reset chat history when the selected agent changes.
   */
  useEffect(() => {
    setLocalMessages([]);
    setInput("");
    if (typeof clearMessages === "function") {
      clearMessages();
    } else if (typeof setMessages === "function") {
      setMessages([]);
    }

    if (!selectedAgent?.name) {
      setAgentLoading(false);
      setAgentError("No agent has been selected.");
      return;
    }

    const fetchAgent = async () => {
      try {
        setAgentLoading(true);
        setAgentError(null);

        const response = await fetch(AGENT_DETAILS_ENDPOINT(selectedAgent.name));

        if (!response.ok) {
          throw new Error(`Could not retrieve agent (${response.status})`);
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
  }, [selectedAgent?.name]);

  /**
   * Keep the latest message visible when the chat changes.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /**
   * Send message
   */
  const handleSend = async (e) => {
    e.preventDefault();

    const trimmed = input.trim();

    if (!trimmed || loading || !agent) {
      return;
    }

    /**
     * Route message directly to the Agent MCP execution cycle if a tool is attached.
     */
    if (isMcpAgent) {
      const userMessage = { role: "user", content: trimmed };
      setLocalMessages((prev) => [...prev, userMessage]);
      setInput("");
      setMcpLoading(true);

      try {
        const response = await fetch(AGENT_CHAT_ENDPOINT(agent.name), {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({
            prompt: trimmed,
            history: localMessages.map((m) => ({
              role: m.role || (m.sender === "user" ? "user" : "assistant"),
              content: m.content || m.text,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`MCP agent error (${response.status})`);
        }

        const data = await response.json();
        const assistantMessage = { role: "assistant", content: data.reply || "" };
        setLocalMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Error communicating with MCP agent:", error);
        setLocalMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Error communicating with the agent service." },
        ]);
      } finally {
        setMcpLoading(false);
      }
      return;
    }

    let finalSystemPrompt = agent.systemPrompt || "";

    /**
     * Retrieve additional context when the agent uses a RAG collection.
     */
    if (agent.collection && agent.collection !== "none") {
      try {
        const searchRes = await fetch(RAG_SEARCH_ENDPOINT, {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({
            query: trimmed,
            collection_name: agent.collection,
            top_k: DEFAULT_TOP_K,
          }),
        });

        if (searchRes.ok) {
          const searchData = await searchRes.json();

          if (searchData.context) {
            finalSystemPrompt += `
            
### CONTEXT INFORMATION ###

Use the following information to answer the question. If the answer is not present in the context, state this clearly.

${searchData.context}`;
          }
        }
      } catch (error) {
        console.error("Error retrieving RAG context:", error);
      }
    }

    await sendChatMessage({
      content: trimmed,
      model: agent.model,
      systemPrompt: finalSystemPrompt,
    });

    setInput("");
  };

  /**
   * Show an error when the agent could not be loaded.
   */
  if (agentError || !agent) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#060a11] text-slate-400">
        <div className="text-center">
          <p className="text-red-400 mb-2">
            {agentError || "Agent not found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div key={agent.name} className="flex flex-col h-full w-full bg-[#060a11] text-slate-100 font-sans overflow-hidden">
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-[#04070c] shadow-[inset_1px_0_10px_rgba(0,0,0,0.5)]">

        {/* Agent information card component */}
        <AgentCard agent={agent} />

        {/* Scrollable chat messages area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">

          {/* Empty state shown before the first message */}
          {messages.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center animate-fade-in pointer-events-none mt-10">
              <ChatEmptyState
                icon={Bot}
                title="Start a conversation with the agent"
                subtitle="Send a message below to interact with this agent."
              />
            </div>
          )}

          {/* Message list and loading indicator */}
          <div className="max-w-4xl w-full mx-auto p-6 md:p-8 pt-8 space-y-8 relative z-10 pb-24">

            {messages.map((msg, idx) => (
              <Message
                key={idx}
                message={msg}
              />
            ))}

            {loading && (
              <div className="flex gap-4 justify-start animate-fade-in">

                <div className="w-9 h-9 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={22} strokeWidth={1.8} className="text-blue-300"/>
                </div>

                <div className="bg-[#080d17] border border-[#3b82f6]/30 shadow-[0_4px_20px_rgba(59,130,246,0.1)] px-6 py-5 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#60a5fa] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-[#60a5fa] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-[#60a5fa] rounded-full animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-6"/>

          </div>
        </div>

        {/* Input area for writing and submitting messages */}
        <PromptInput
          input={input}
          setInput={setInput}
          loading={loading}
          onSubmit={handleSend}
          placeholder={`Message ${agent.name}...`}
          hideModelSelector
        />

      </main>
    </div>
  );
}