import { useState, useEffect } from "react";
import { MessageSquarePlus, Bot, Trash2, Loader2 } from "lucide-react";

import NewButton from "./NewButton";
import useDeleteAgent from "./../hooks/useDeleteAgent";
import useDeleteChat from "./../hooks/useDeleteChat";

const API_BASE_URL = "http://localhost:8000/api/v1";
const AGENTS_LIST_ENDPOINT = `${API_BASE_URL}/agents/list`;
const CONVERSATIONS_ENDPOINT = `${API_BASE_URL}/history/conversations`;

/**
 * SidebarItem component serves as a flexible, interactive list entry for either 
 * a conversation or an AI agent within the application navigation sidebar.
 *
 * @component
 * @param {Object} props Component properties
 * @param {Object} props.item The data object representing the conversation or agent
 * @param {string} [props.item.name] The name of the agent (used if type is "agent")
 * @param {string} [props.item.title] The title of the conversation (used if type is "conversation")
 * @param {'agent' | 'conversation'} props.type The category/type of the sidebar item
 * @param {() => void} props.onClick Callback function triggered when the item container is clicked
 * @param {(item: Object) => void} [props.onAction] Callback function triggered when the action button (delete) is clicked
 * @returns {JSX.Element} The rendered sidebar item element
 */
function SidebarItem({ item, type, onClick, onAction }) {
  const isAgent = type === "agent";

  return (
    <div onClick={onClick} className="group relative flex items-center justify-between w-full py-2.5 px-3 rounded-xl bg-transparent hover:bg-white/[0.04] border border-transparent hover:border-white/10 transition-all duration-200 cursor-pointer">
      <div className="flex items-center gap-3 min-w-0">

        {/* Colored status indicator distinguishes agents from conversations. */}
        <div
          className={
            isAgent
              ? "w-2 h-2 rounded-full bg-[#3b82f6]/40 group-hover:bg-[#3b82f6] group-hover:shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all shrink-0"
              : "w-2 h-2 rounded-full bg-pink-500/40 group-hover:bg-pink-500 group-hover:shadow-[0_0_8px_rgba(236,72,153,0.6)] transition-all shrink-0"
          }
        />

        {/* Display the agent name or conversation title. */}
        <span
          className={
            isAgent
              ? "flex-1 min-w-0 text-sm font-light text-slate-300 group-hover:text-white transition-colors truncate"
              : "flex-1 min-w-0 text-sm font-light text-slate-400 group-hover:text-white transition-colors truncate"
          }
        >
          {isAgent
            ? item.name || "Unnamed agent"
            : item.title || "Untitled conversation"}
        </span>
      </div>

      {/* Secondary action is only visible while hovering over the item. */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAction?.(item);
        }}
        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all shrink-0 ml-2"
        title={isAgent ? "Delete Agent" : "Delete Conversation"}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

/**
 * Sidebar component acts as the primary navigation drawer for the application,
 * managing the layout and state for past conversations and custom AI agents.
 * It handles data fetching on mount, selection events, and delete actions.
 *
 * @component
 * @param {Object} props Component properties
 * @param {() => void} props.onNewConversation Callback triggered to start a new conversation
 * @param {() => void} props.onNewAgentClick Callback triggered to open the creation flow for a new agent
 * @param {(agent: Object) => void} [props.onSelectAgent] Callback triggered when an agent is selected
 * @param {(conversationId: string | number) => void} [props.onSelectConversation] Callback triggered when a past conversation is selected
 * @param {(conversation: Object) => void} [props.onDeleteChat] Callback triggered when deleting a past conversation
 * @param {(agent: Object) => void} [props.onDeleteAgent] Callback triggered when deleting an agent
 * @returns {JSX.Element} The rendered sidebar navigation drawer
 */
export default function Sidebar({
  onNewConversation,
  onNewAgentClick,
  onSelectAgent,
  onSelectConversation,
  onDeleteChat,
  onDeleteAgent,
}) {
  const [agents, setAgents] = useState([]);
  const [pastConversations, setPastConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { deleteAgent } = useDeleteAgent((deletedAgent) => {
    setAgents((prev) => prev.filter((a) => a.id !== deletedAgent.id));
    onDeleteAgent?.(deletedAgent);
  });

  const { deleteChat } = useDeleteChat((deletedChat) => {
    setPastConversations((prev) =>
      prev.filter((conv) => conv.id !== deletedChat.id)
    );
    onDeleteChat?.(deletedChat);
  });

  /**
   * Load agents and conversations when the sidebar is mounted.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [agentsRes, convRes] = await Promise.all([
          fetch(AGENTS_LIST_ENDPOINT),
          fetch(CONVERSATIONS_ENDPOINT),
        ]);

        if (agentsRes.ok) {
          const agentsData = await agentsRes.json();
          setAgents(Array.isArray(agentsData) ? agentsData : []);
        } else {
          console.error(`Failed to load agents (${agentsRes.status})`);
        }

        if (convRes.ok) {
          const convData = await convRes.json();
          setPastConversations(
            Array.isArray(convData) ? convData : []
          );
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
   * Select conversation.
   */
  const handleSelectConversation = (conversation) => {
    if (!conversation?.id) {
      console.error("SIDEBAR - La conversación no tiene ID:", conversation);
      return;
    }

    if (typeof onSelectConversation !== "function") {
      console.error("SIDEBAR - onSelectConversation no está definido");
      return;
    }

    onSelectConversation(conversation.id);
  };

  /**
   * Select agent.
   */
  const handleSelectAgent = (agent) => {
    console.log("SIDEBAR - Agent seleccionado:", agent);
    onSelectAgent?.(agent);
  };

  return (
    <aside className="w-72 h-full bg-[#0b111c]/95 border-r border-white/5 flex flex-col p-5 select-none z-40">

      {/* New conversation */}
      <NewButton
        icon={MessageSquarePlus}
        label="New Conversation"
        onClick={onNewConversation}
        className="mt-10"
      />

      {/* Conversations */}
      <div className="mt-4 flex flex-col space-y-1">

        {pastConversations.map((conversation) => (
          <SidebarItem
            key={conversation.id}
            item={conversation}
            type="conversation"
            onClick={() => handleSelectConversation(conversation)}
            onAction={deleteChat}
          />
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

        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
          Agents
        </h3>

        {/* New agent */}
        <NewButton
          icon={Bot}
          label="New Agent"
          onClick={onNewAgentClick}
          className="mb-4 shrink-0"
        />

        {/* Agents list */}
        <div className="flex flex-col space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar pr-1">

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2.5 px-3 py-3 text-xs text-slate-500 bg-white/[0.02] rounded-xl border border-white/5">
              <Loader2 size={14} className="animate-spin text-[#3b82f6]"/>
              <span className="font-light">
                Loading agents...
              </span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="px-3 py-3 text-xs text-rose-400 bg-rose-950/20 rounded-xl border border-rose-500/10 font-light">
              Failed to sync agents.
            </div>
          )}

          {/* Empty */}
          {!loading && !error && agents.length === 0 && (
            <div className="px-3 py-4 text-xs text-slate-500 font-light bg-white/[0.01] rounded-xl border border-dashed border-white/5 text-center">
              No custom agents created yet.
            </div>
          )}

          {/* Agents */}
          {!loading && !error && agents.map((agent) => (
            <SidebarItem
              key={agent.id ?? agent.name}
              item={agent}
              type="agent"
              onClick={() => handleSelectAgent(agent)}
              onAction={deleteAgent}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}