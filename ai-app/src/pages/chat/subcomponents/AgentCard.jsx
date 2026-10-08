import { Database, Wrench, Cpu } from "lucide-react";

/**
 * AgentCard component displays the selected agent's metadata, 
 * including description, base model, collection, and MCP tools configuration.
 * 
 * @component
 * @param {Object} props Component properties
 * @param {Object} props.agent The agent object containing name, description, model, collection, etc.
 * @returns {JSX.Element} The rendered agent card header container
 */
export default function AgentCard({ agent }) {

  const modelName = agent.model || "llama3.1";
  const collectionName = agent.collection && agent.collection !== "none" ? agent.collection : null;
  const mcpTool = agent.mcp || (agent.model === "mysql-mcp" || agent.model === "github-mcp" ? agent.model : null);

  return (
    <header className="shrink-0 px-6 pt-6 relative z-20">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080d17]/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.25)]">

          <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#3b82f6]/15 blur-[50px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#DE145C]/15 blur-[50px] rounded-full pointer-events-none" />

          {/* Agent details */}
          <div className="relative z-10 flex flex-col p-5 gap-3">
            <div className="min-w-0 flex-1">
              
              <h1 className="text-lg font-semibold text-slate-100 tracking-wide truncate">
                {agent.name}
              </h1>

              <p className="text-sm text-slate-400 mt-1 leading-relaxed line-clamp-2">
                {agent.description}
              </p>

            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              
              {/* Model */}
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/15 border border-blue-400/30 text-xs font-medium text-blue-300">
                <Cpu size={13} className="text-blue-400" />
                <span>{modelName}</span>
              </span>

              {/* Collection */}
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${
                collectionName 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" 
                  : "bg-slate-800/60 border-white/5 text-slate-500"
              }`}>
                <Database size={13} className={collectionName ? "text-emerald-400" : "text-slate-600"} />
                <span>{collectionName ? `RAG: ${collectionName}` : "No collection attached"}</span>
              </span>

              {/* Tool */}
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${
                mcpTool 
                  ? "bg-[#DE145C]/10 border-[#DE145C]/20 text-rose-300" 
                  : "bg-slate-800/60 border-white/5 text-slate-500"
              }`}>
                <Wrench size={13} className={mcpTool ? "text-[#DE145C]" : "text-slate-600"} />
                <span>{mcpTool ? `MCP: ${mcpTool}` : "No tools attached"}</span>
              </span>

            </div>

          </div>
        </div>
      </div>
    </header>
  );
}