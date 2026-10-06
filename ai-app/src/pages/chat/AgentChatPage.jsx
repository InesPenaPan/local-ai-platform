import { useState, useRef, useEffect } from "react";
import { Bot } from "lucide-react";

import Message from "./subcomponents/Message";
import PromptInput from "./subcomponents/PromptInput";
import ChatEmptyState from "./subcomponents/ChatEmptyState";
import { useChat } from "./hooks/useChat";

/**
 * AgentChatPage component renders an agent-specific chat interface, handling agent data fetching,
 * RAG context enrichment for messages, automatic scrolling, and message submissions.
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {Object} [props.agent] - The selected agent object containing details like name, model, system prompt, and RAG collection
 * @returns {JSX.Element} The rendered agent chat layout container
 */
export default function AgentChatPage({ agent: selectedAgent }) {
  const [agent, setAgent] = useState(selectedAgent || null);
  const [input, setInput] = useState("");
  const [agentLoading, setAgentLoading] = useState(true);
  const [agentError, setAgentError] = useState(null);

  const messagesEndRef = useRef(null);

  const {
    messages,
    loading,
    sendMessage: sendChatMessage,
  } = useChat();

  /**
   * Load the full agent configuration when the selected agent changes.
   */
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
          `http://localhost:8000/api/v1/agent/agents/${encodeURIComponent(selectedAgent.name)}`
        );

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
  }, [selectedAgent]);

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

    let finalSystemPrompt = agent.systemPrompt || "";

    /**
     * Retrieve additional context when the agent uses a RAG collection.
     */
    if (agent.collection && agent.collection !== "none") {
      try {
        const searchRes = await fetch(
          "http://localhost:8000/api/v1/rag/search",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: trimmed,
              collection_name: agent.collection,
              top_k: 3,
            }),
          }
        );

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
        console.error("Error retrieving RAG context:", error );
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
  * Show a loading state while retrieving the agent configuration.
  */
  if (agentLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#060a11] text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="ml-2"> Loading agent... </span>
        </div>
      </div>
    );
  }

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
          <p className="text-sm text-slate-500">
            Make sure the agent exists and that the API Gateway is available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#060a11] text-slate-100 font-sans overflow-hidden">
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-[#04070c] shadow-[inset_1px_0_10px_rgba(0,0,0,0.5)]">

        {/* Agent information header */}
        <header className="shrink-0 px-6 pt-6 relative z-20">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080d17]/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.25)]">

              <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#3b82f6]/15 blur-[50px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#DE145C]/15 blur-[50px] rounded-full pointer-events-none" />

              {/* Agent name, description, and model information */}
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

          {/* Message list and loading indicator. */}
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

        {/* Input area for writing and submitting messages. */}
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

