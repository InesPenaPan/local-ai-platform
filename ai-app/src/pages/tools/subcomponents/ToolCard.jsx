import { CheckCircle2, XCircle, Power } from "lucide-react";

/**
 * ToolCard component displays individual MCP server details,
 * its logo, description, online status, and enable/disable toggle button.
 * 
 * @component
 * @param {Object} props Component properties
 * @param {Object} props.mcp The MCP server object containing name, description, status, enabled state, and icon
 * @param {function(string): void} props.onToggle Callback function triggered when toggling the MCP server state
 * @returns {JSX.Element} The rendered tool card container
 */
export default function ToolCard({ mcp, onToggle }) {
  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-[#080d17]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-[#3b82f6]/30 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-blue-600/15 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5 overflow-hidden p-2">
          {mcp.isImage && (
            <img src={mcp.iconSrc} alt={mcp.name} className="w-full h-full object-contain filter brightness-200" />
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-slate-100">
              {mcp.name}
            </h3>
            {mcp.status === "online" ? (
              <span className="flex items-center text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 size={12} className="mr-1.5" /> Online
              </span>
            ) : (
              <span className="flex items-center text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                <XCircle size={12} className="mr-1.5" /> Offline
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {mcp.description}
          </p>
        </div>
      </div>

      <button
        onClick={() => onToggle(mcp.id)}
        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all shadow-lg shrink-0 cursor-pointer ${
          mcp.enabled
            ? "bg-[#3b82f6] hover:bg-blue-600 text-white shadow-[0_4px_20px_rgba(59,130,246,0.3)] border border-blue-400/30"
            : "bg-[#0a0f18]/90 border border-white/10 text-slate-300 hover:text-white hover:border-white/20"
        }`}
      >
        <Power size={16} />
        <span>{mcp.enabled ? "Enabled" : "Disabled"}</span>
      </button>
    </div>
  );
}