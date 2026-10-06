import { useState, useEffect } from "react";
import { MessageSquarePlus, Bot, Edit2, Loader2 } from "lucide-react";

import NewButton from "./NewButton";

/**
 * Sidebar component acts as the primary navigation drawer, fetching and displaying
 * past conversations and AI agents from the backend, with controls to create new items
 * or select existing ones.
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {function(): void} props.onNewConversation - Callback triggered when the "New Conversation" button is clicked
 * @param {function(): void} props.onNewAgentClick - Callback triggered when the "New Agent" button is clicked
 * @param {function(Object): void} props.onSelectAgent - Callback triggered when an individual agent is selected
 * @param {function(string): void} props.onSelectConversation - Callback triggered when a past conversation is selected
 * @returns {JSX.Element} The rendered sidebar container with conversation and agent lists
 */
export default function Sidebar({
  onNewConversation,
  onNewAgentClick,
  onSelectAgent,
  onSelectConversation,
}) {
  const [agents, setAgents] = useState([]);
  const [pastConversations, setPastConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load agents and conversations when the sidebar is mounted.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [agentsRes, convRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1/agents/list"),
          fetch("http://localhost:8000/api/v1/history/conversations"),
        ]);

        if (agentsRes.ok) {
          const agentsData = await agentsRes.json();
          setAgents(Array.isArray(agentsData) ? agentsData : []);
        } else {
          console.error(`Failed to load agents (${agentsRes.status})`);
        }

        if (convRes.ok) {
          const convData = await convRes.json();
          setPastConversations(Array.isArray(convData) ? convData : []);
        } else {
          console.error(`Failed to load conversations (${convRes.status})`);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setAgents([]);
        setPastConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  /**
   * Select conversation
   */
  const handleSelectConversation = (conversation) => {
    console.log("SIDEBAR - Conversación seleccionada:", conversation);
    console.log("SIDEBAR - ID:", conversation?.id);

    if (!conversation?.id) {
      console.error("SIDEBAR - La conversación no tiene ID:", conversation);
      return;
    }

    if (typeof onSelectConversation !== "function") {
      console.error("SIDEBAR - onSelectConversation no está definido");
      return;
    }

    console.log("SIDEBAR - Enviando ID al App:", conversation.id);

    onSelectConversation(conversation.id);
  };

  return (
    <aside className="w-72 h-full bg-[#0b111c]/95 border-r border-white/5 flex flex-col p-5 select-none z-40">

      {/* Button for starting a new conversation */}
      <NewButton
        icon={MessageSquarePlus}
        label="New Conversation"
        onClick={onNewConversation}
        className="mt-10"
      />

      {/* List of previously created conversations */}
      <div className="mt-4 flex flex-col space-y-1">

        {pastConversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() =>
              handleSelectConversation(conversation)
            }
            className="group flex items-center gap-3 w-full min-w-0 py-2.5 px-3 rounded-xl bg-transparent hover:bg-white/[0.04] border border-transparent hover:border-white/10 transition-all duration-200 text-left cursor-pointer"
          >
            <div className="w-2 h-2 rounded-full bg-pink-500/40 group-hover:bg-pink-500 group-hover:shadow-[0_0_8px_rgba(236,72,153,0.6)] transition-all shrink-0" />

            <span className="flex-1 min-w-0 text-sm font-light text-slate-400 group-hover:text-white transition-colors truncate">
              {conversation.title || "Untitled conversation"}
            </span>
          </button>
        ))}

        {!loading &&
          !error &&
          pastConversations.length === 0 && (
            <div className="px-3 py-4 text-xs text-slate-500 font-light text-center">
              No conversations yet.
            </div>
          )}
      </div>

      {/* Agents section */}
      <div className="mt-8 flex flex-col flex-1 min-h-0">

        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2"> Agents </h3>

        {/* Button for creating a new agent. */}
        <NewButton
          icon={Bot}
          label="New Agent"
          onClick={onNewAgentClick}
          className="mb-4 shrink-0"
        />

        {/* Scrollable list of available agents. */}
        <div className="flex flex-col space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar pr-1">

          {/* Loading state while agents are being fetched */}
          {loading && (
            <div className="flex items-center gap-2.5 px-3 py-3 text-xs text-slate-500 bg-white/[0.02] rounded-xl border border-white/5">
              <Loader2 size={14} className="animate-spin text-[#3b82f6]"/>
              <span className="font-light"> Loading agents... </span>
            </div>
          )}

          {/* Error state when the data request fails */}
          {!loading && error && (
            <div className="px-3 py-3 text-xs text-rose-400 bg-rose-950/20 rounded-xl border border-rose-500/10 font-light">
              Failed to sync agents.
            </div>
          )}

          {/* Empty state when no agents exist */}
          {!loading && !error && agents.length === 0 && (
            <div className="px-3 py-4 text-xs text-slate-500 font-light bg-white/[0.01] rounded-xl border border-dashed border-white/5 text-center">
              No custom agents created yet.
            </div>
          )}

          {/* Render each available agent */}
          {!loading && !error &&
            agents.map((agent) => (
              <div
                key={agent.id ?? agent.name}
                onClick={() => {
                  console.log(
                    "SIDEBAR - Agent seleccionado:",
                    agent
                  );

                  onSelectAgent?.(agent);
                }}
                className="group relative flex items-center justify-between w-full py-2.5 px-3 rounded-xl bg-transparent hover:bg-white/[0.04] border border-transparent hover:border-white/10 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">

                  <div className="w-2 h-2 rounded-full bg-[#3b82f6]/40 group-hover:bg-[#3b82f6] group-hover:shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all shrink-0" />

                  <span className="text-sm font-light text-slate-300 group-hover:text-white transition-colors truncate">
                    {agent.name}
                  </span>
                </div>

                {/* Edit button appears when hovering over an agent. */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all shrink-0 ml-2"
                  title="Edit Agent"
                >
                  <Edit2 size={13} />
                </button>
              </div>
            ))}
        </div>
      </div>
    </aside>
  );
}