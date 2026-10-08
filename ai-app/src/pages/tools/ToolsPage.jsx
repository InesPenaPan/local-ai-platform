import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import ToolCard from "./subcomponents/ToolCard";
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
            <ToolCard 
              key={mcp.id} 
              mcp={mcp} 
              onToggle={toggleMcp} 
            />
          ))}
        </div>
      </main>
    </div>
  );
}