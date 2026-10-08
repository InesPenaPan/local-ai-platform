import { useState } from "react";
import { CheckCircle2, XCircle, Power } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import githubLogo from "../../assets/github-logo.webp"; 
import mysqlLogo from "../../assets/mysql-logo.png";

/**
 * ToolsPage component serves as the configuration dashboard for managing
 * and toggling mocked external Model Context Protocol (MCP) servers and tools.
 * 
 * @component
 * @returns {JSX.Element} The rendered Tools settings dashboard container
 */
export default function ToolsPage() {
  // Mock data for MCP servers containing GitHub and MySQL MCPs with custom logo images
  const [mcps, setMcps] = useState([
    {
      id: "github-mcp",
      name: "GitHub Repository MCP",
      description: "Enables code inspection, file searching, and issue tracking across connected codebases.",
      status: "online",
      enabled: false,
      isImage: true,
      iconSrc: githubLogo
    },
    {
      id: "mysql-mcp",
      name: "MySQL Database MCP",
      description: "Allows querying schemas and executing safe read-only SQL statements on relational databases.",
      status: "online",
      enabled: false,
      isImage: true,
      iconSrc: mysqlLogo
    }
  ]);

  const toggleMcp = (id) => {
    setMcps(mcps.map(mcp => 
      mcp.id === id ? { ...mcp, enabled: !mcp.enabled } : mcp
    ));
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#060a11] text-slate-100 font-sans overflow-hidden">
      <main className="flex-1 flex flex-col h-full w-full min-w-0 overflow-y-auto custom-scrollbar relative bg-[#04070c] shadow-[inset_1px_0_10px_rgba(0,0,0,0.5)] p-8 md:p-12">

        <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5 mb-8">
          <PageHeader
            title="Tools & MCPs"
            subtitle="Configure, monitor, and toggle external Model Context Protocol servers globally."
          />
        </div>

        {/* MCP servers list */}
        <div className="max-w-6xl w-full mx-auto space-y-4 pb-12">
          {mcps.map((mcp) => (
            <div
              key={mcp.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-[#080d17]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-[#3b82f6]/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-600/15 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5 overflow-hidden p-2">
                  {mcp.isImage ? (
                    <img src={mcp.iconSrc} alt={mcp.name} className="w-full h-full object-contain filter brightness-200" />
                  ) : null}
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
                onClick={() => toggleMcp(mcp.id)}
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
          ))}
        </div>
      </main>
    </div>
  );
}