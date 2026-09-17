import { MessageSquarePlus, Bot, History, Compass, Plus } from "lucide-react";

export default function Sidebar({ currentItem = "agents" }) {
  const menuItems = [
    { id: "history", label: "Chat History", icon: History },
    { id: "agents", label: "New Agents", icon: Bot, showPlus: true },
    { id: "explore", label: "Explore", icon: Compass },
  ];

  return (
    <aside className="w-72 h-full bg-[#0b111c]/95 border-r border-white/5 flex flex-col p-5 select-none z-40">
      
      {/*  New Conversation */}
      <button className="flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-xl text-base font-bold text-white bg-[#1e293b] border border-white/10 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:bg-[#283852] hover:border-white/20 transition-all duration-300 ease-out active:scale-[0.98] group">
        <MessageSquarePlus 
          size={20} 
          strokeWidth={2.5} 
          className="text-slate-300 group-hover:text-white transition-colors duration-300" 
        />
        <span className="tracking-wide">New Conversation</span>
      </button>

    </aside>
  );
}