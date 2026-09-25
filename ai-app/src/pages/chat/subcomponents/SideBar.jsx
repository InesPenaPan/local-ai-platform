import { useState, useEffect } from "react";
import { MessageSquarePlus, Bot, Edit2, Loader2 } from "lucide-react";

import NewButton from "./NewButton"; 

export default function Sidebar({ currentItem = "agents", onNewAgentClick, onSelectAgent }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch agents list from the server on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/agents/list");
        if (!response.ok) {
          throw new Error("Failed to load agents from the server.");
        }
        const data = await response.json();
        setAgents(data);
      } catch (err) {
        console.error("Error fetching agents:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return (
    <aside className="w-72 h-full bg-[#0b111c]/95 border-r border-white/5 flex flex-col p-5 select-none z-40">
      
      {/* New Conversation Button */}
      <NewButton 
        icon={MessageSquarePlus} 
        label="New Conversation" 
        className="mt-10" 
      />

      {/* Agents Section */}
      <div className="mt-8 flex flex-col flex-1 min-h-0">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
          Agents
        </h3>
        
        {/* New Agent Button */}
        <NewButton 
          icon={Bot} 
          label="New Agent" 
          onClick={onNewAgentClick}
          className="mb-4 shrink-0" 
        />

        {/* Agents List container */}
        <div className="flex flex-col space-y-1 overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar pr-1">
          {loading && (
            <div className="flex items-center gap-2.5 px-3 py-3 text-xs text-slate-500 bg-white/[0.02] rounded-xl border border-white/5">
              <Loader2 size={14} className="animate-spin text-[#3b82f6]" />
              <span className="font-light">Loading agents...</span>
            </div>
          )}

          {error && (
            <div className="px-3 py-3 text-xs text-rose-400 bg-rose-950/20 rounded-xl border border-rose-500/10 font-light">
              Failed to sync agents.
            </div>
          )}

          {!loading && !error && agents.length === 0 && (
            <div className="px-3 py-4 text-xs text-slate-500 font-light bg-white/[0.01] rounded-xl border border-dashed border-white/5 text-center">
              No custom agents created yet.
            </div>
          )}

          {/* Dynamic rendering of database agents*/}
          {!loading && agents.map((agent) => (
            <div 
              key={agent.id}
              onClick={() => onSelectAgent && onSelectAgent(agent)}
              className="group relative flex items-center justify-between w-full py-2.5 px-3 rounded-xl bg-transparent hover:bg-white/[0.04] border border-transparent hover:border-white/10 transition-all duration-200 cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2 h-2 rounded-full bg-[#3b82f6]/40 group-hover:bg-[#3b82f6] group-hover:shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all shrink-0" />
                <span className="text-sm font-light text-slate-300 group-hover:text-white transition-colors truncate">
                  {agent.name}
                </span>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering parent click event when editing
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