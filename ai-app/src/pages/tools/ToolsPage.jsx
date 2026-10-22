import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import ToolCard from "./subcomponents/ToolCard";
import githubLogo from "../../assets/github-logo.webp"; 
import mysqlLogo from "../../assets/mysql-logo.png";

/**
 * ToolsPage component serves as the configuration dashboard for managing
 * and toggling external Model Context Protocol (MCP) servers and tools.
 * 
 * @component
 * @returns {JSX.Element} The rendered Tools settings dashboard container
 */
export default function ToolsPage() {
  const [mcps, setMcps] = useState([
    {
      id: "mysql-mcp",
      name: "MySQL Database MCP",
      description: "Connects your AI agent directly to live business databases to fetch accurate customer information, inspect relational tables, and update records securely.",
      details: "This integration acts as an intelligent bridge between the AI model and your production database. Instead of guessing or hallucinating facts, the assistant translates everyday questions into precise SQL queries. It automatically inspects table schemas to understand column names and relationships, runs live searches to extract exact records, and can modify or insert new business data without requiring users to write a single line of SQL.",
      connectedResource: "Linked to the internal MySQL database instance serving the local 'crm' environment (active customer accounts, lead interaction histories, commercial deal stages, purchase orders, and support tickets).",
      capabilities: "Discover database structure and available tables (list_tables), inspect column data types and constraints (describe_table), run real-time search queries and aggregations (read_query / SELECT), and execute transactional changes or data entry (write_query / INSERT, UPDATE, DELETE).",
      status: "online",
      enabled: false,
      isImage: true,
      iconSrc: mysqlLogo
    },
    {
      id: "github-mcp",
      name: "GitHub Repository MCP",
      description: "Empowers the AI to explore software projects, analyze source code across branches, review past commit histories, and manage team task backlogs.",
      details: "Bridges your AI assistant with your software repositories to serve as an autonomous coding partner. It navigates repository folder structures, reads specific implementation files, tracks down bug causes across the codebase, and checks open pull requests or issue tickets to help developers troubleshoot problems, review code logic, and keep track of project development milestones.",
      connectedResource: "Linked to targeted application workspaces, version control tracking systems, Git branches, pull request workflows, and repository issue boards.",
      capabilities: "Examine file contents and implementation logic (read_file), browse past code changes and author logs (list_commits), search for keywords and function definitions across code trees (search_code), inspect bug reports and feature requests (get_issue), and list active branch configurations (list_branches).",
      status: "online",
      enabled: false,
      isImage: true,
      iconSrc: githubLogo
    },
    {
      id: "filesystem-mcp",
      name: "Local File System MCP",
      description: "Allows the AI agent to securely navigate directories, read file contents, and write data to the local file system.",
      details: "Provides a direct bridge to the host machine's file system within a specified safe directory. The agent can traverse folders to understand project structures, read logs or configuration files directly, and save generated scripts or reports to disk without requiring manual copy-pasting.",
      connectedResource: "Linked to a restricted local directory path on the host machine or container.",
      capabilities: "Navigate directories (list_directory), inspect file metadata (file_info), read file contents (read_file), and write data (write_file).",
      status: "online",
      enabled: false,
      isImage: false,
      icon: HardDrive
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
