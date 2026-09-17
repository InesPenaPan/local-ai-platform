import { MessageSquare, Database, Settings, Sparkles } from "lucide-react";

export default function Header({ currentTab, onSelectTab }) {
  const navItems = [
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "rag", label: "Knowledge / RAG", icon: Database },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  return (
    <header className="px-6 py-2.5 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex justify-between items-center select-none">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-500/20">
          <Sparkles size={16} />
        </div>
        <span className="text-sm font-semibold tracking-wide text-white">
          Local AI Platform
        </span>
      </div>

      {/* Navigation tabs */}
      <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Icon size={14} className={isActive ? "text-blue-400" : ""} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Status */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          Gateway :8000
        </span>
      </div>
    </header>
  );
}