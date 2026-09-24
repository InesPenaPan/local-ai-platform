import { MessageSquarePlus, Bot, History, Compass, Edit2 } from "lucide-react";

export default function Sidebar({ currentItem = "agents", onNewAgentClick }) {
  const menuItems = [
    { id: "history", label: "Chat History", icon: History },
    { id: "agents", label: "New Agents", icon: Bot, showPlus: true },
    { id: "explore", label: "Explore", icon: Compass },
  ];

  return (
    <aside className="w-72 h-full bg-[#0b111c]/95 border-r border-white/5 flex flex-col p-5 select-none z-40">
      
      {/* New Conversation */}
      <button className="mt-10 flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-xl text-base font-bold text-white bg-[#1e293b] border border-white/10 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:bg-[#283852] hover:border-white/20 transition-all duration-300 ease-out active:scale-[0.98] group">
        <MessageSquarePlus 
          size={20} 
          strokeWidth={2.5} 
          className="text-slate-300 group-hover:text-white transition-colors duration-300" 
        />
        <span className="tracking-wide">New Conversation</span>
      </button>

      {/* Agents Section */}
      <div className="mt-8 flex flex-col">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
          Agents
        </h3>
        
        {/* New Agent Button */}
        <button 
          onClick={onNewAgentClick}
          className="flex items-center justify-center gap-2.5 w-full py-3.5 px-4 mb-4 rounded-xl text-base font-bold text-white bg-[#1e293b] border border-white/10 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:bg-[#283852] hover:border-white/20 transition-all duration-300 ease-out active:scale-[0.98] group"
        >
          <Bot 
            size={20} 
            strokeWidth={2.5} 
            className="text-slate-300 group-hover:text-white transition-colors duration-300" 
          />
          <span className="tracking-wide">New Agent</span>
        </button>

        {/* Existing Agents List */}
        <div className="flex flex-col space-y-0.5">
          {/* Agent 1 */}
          <div className="flex items-center justify-between w-full py-2 px-3 rounded-lg bg-transparent hover:bg-white/5 transition-all duration-200 group cursor-pointer">
            <div className="flex items-center text-slate-400 group-hover:text-slate-200 transition-colors">
              <span className="text-sm font-light">Chef Privado</span>
            </div>
            <button 
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-md text-slate-500 hover:text-white transition-all"
              title="Edit Agent"
            >
              <Edit2 size={14} />
            </button>
          </div>

          {/* Agent 2 */}
          <div className="flex items-center justify-between w-full py-2 px-3 rounded-lg bg-transparent hover:bg-white/5 transition-all duration-200 group cursor-pointer">
            <div className="flex items-center text-slate-400 group-hover:text-slate-200 transition-colors">
              <span className="text-sm font-light">Simulador de Exámenes</span>
            </div>
            <button 
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-md text-slate-500 hover:text-white transition-all"
              title="Edit Agent"
            >
              <Edit2 size={14} />
            </button>
          </div>
        </div>
      </div>

    </aside>
  );
}