import {
  MessageSquare,
  Database,
  Settings,
} from "lucide-react";

import UserIcon from "./UserIcon";

export default function Header({ currentTab, onSelectTab }) {
  const navItems = [
    {
      id: "chat",
      label: "Chat",
      icon: MessageSquare,
    },
    {
      id: "rag",
      label: "Knowledge / RAG",
      icon: Database,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <header className="px-8 py-4 border-b border-white/5 bg-[#111927]/95 backdrop-blur-xl grid grid-cols-3 items-center select-none shadow-lg z-50 sticky top-0">

      {/* Brand */}
      <div className="flex items-center justify-self-start">
        <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3b82f6] to-[#DE145C] tracking-wide">
          Local AI Platform
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-2 bg-black/20 backdrop-blur-md p-2 rounded-2xl border border-white/5 justify-self-center shadow-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-base font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-[#1e293b]/80 text-white shadow-lg border border-white/10 ring-1 ring-[#DE145C]/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                className={
                  isActive
                    ? "text-[#DE145C]"
                    : "text-slate-400"
                }
              />

              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="justify-self-end">
        <UserIcon />
      </div>
    </header>
  );
}