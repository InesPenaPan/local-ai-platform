import { Database, Wrench, Info } from "lucide-react";

/**
 * ToolCard component displays individual MCP server details.
 * Expands vertically on hover to show detailed architecture and connected resources.
 * 
 * @component
 * @param {Object} props Component properties
 * @param {Object} props.mcp The MCP server object configuration
 * @returns {JSX.Element} The rendered expandable tool card container
 */
export default function ToolCard({ mcp }) {
  return (
    <div className="group relative rounded-2xl transition-all duration-300">
      
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[#3b82f6] to-[#DE145C] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative flex flex-col p-6 bg-[#080d17]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300">
        
        {/* Top Header: Standard compact view */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 flex items-center justify-center shrink-0 mt-0.5">
            {mcp.isImage && (
              <img
                src={mcp.iconSrc}
                alt={mcp.name}
                className="w-full h-full object-contain filter brightness-200"
              />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-100">
              {mcp.name}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {mcp.description}
            </p>
          </div>
        </div>

        {/* Hover Vertical Expansion: Detailed overview & connected resource */}
        <div className="max-h-0 opacity-0 group-hover:max-h-[600px] group-hover:opacity-100 transition-all duration-300 ease-in-out overflow-hidden">
          <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
            
            {/* General MCP Explanation */}
            <div className="bg-[#04070c]/70 p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold mb-2">
                <Info size={16} className="text-[#3b82f6]" />
                <span>What is this Model Context Protocol (MCP)?</span>
              </div>
              <p className="text-slate-300 text-[13px] leading-relaxed font-light">
                {mcp.details || "A standardized protocol allowing LLM agents to securely inspect, query, and interact with external systems using structured function calling."}
              </p>
            </div>

            {/* Connected Resource & Capabilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* Connected resource */}
              <div className="bg-[#04070c]/70 p-4 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
                  <Database size={16} className="text-emerald-400" />
                  <span>Connected Resource & Scope</span>
                </div>
                <p className="text-slate-300 text-[13px] leading-relaxed font-light">
                  {mcp.connectedResource || "Not configured"}
                </p>
              </div>

              {/* Exposed tools */}
              <div className="bg-[#04070c]/70 p-4 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
                  <Wrench size={16} className="text-[#DE145C]" />
                  <span>Exposed Capabilities & Tools</span>
                </div>
                <p className="text-slate-300 text-[13px] leading-relaxed font-light">
                  {mcp.capabilities || "read_query, write_query, list_tables, describe_table"}
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}