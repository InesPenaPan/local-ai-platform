import { useState, useEffect } from "react";
import { Save, Settings2, Database, Sliders, Fingerprint, Loader2, Wrench } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import FormWrapper from "../../components/layout/FormWrapper";
import { useCreateAgent } from "./hooks/useCreateAgent";

/**
 * NewAgentPage component renders a form interface for creating and configuring
 * custom AI assistants, allowing users to define identity, system prompts, MCP tool integrations,
 * RAG knowledge bases, and temperature settings.
 * 
 * @component
 * @param {Object} props Component properties
 * @param {function(): void} props.onCancel Callback function triggered when the cancel button is clicked
 * @param {function(Object): void} props.onAgentCreated Callback function triggered successfully after a new agent is created
 * @returns {JSX.Element} The rendered new agent creation page layout
 */
export default function NewAgentPage({ onCancel, onAgentCreated }) {
  const {
    formData,
    loading,
    error,
    successMessage,
    handleChange,
    handleSubmit,
  } = useCreateAgent({ onAgentCreated });

  const [collectionsList, setCollectionsList] = useState([]);

  /**
   * Fetch available RAG collections.
   */
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/rag/collections");
        if (response.ok) {
          const data = await response.json();
          setCollectionsList(Array.isArray(data) ? data : data.collections || []);
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#060a11] text-slate-100 font-sans overflow-hidden">
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto custom-scrollbar relative bg-[#04070c] shadow-[inset_1px_0_10px_rgba(0,0,0,0.5)] p-8 md:p-12">

        <div className="max-w-3xl w-full mx-auto pb-12">

          {/* Page title and description */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
            <PageHeader
              title="New Agent"
              subtitle="Define the identity, instructions, and tool integrations for your custom AI assistant."
            />
          </div>

          {/* Display the creation result or any submission error */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm">
              Agent created and saved to the database successfully!
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm">
              Error: {error}
            </div>
          )}

          <FormWrapper>
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Basic agent identity */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-slate-300 border-b border-white/5 pb-2 mb-4">
                  <Fingerprint size={16} className="text-[#DE145C]"/>
                  <h2 className="text-sm font-semibold uppercase tracking-wider">
                    Identity
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                      Agent Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Code Reviewer, Database Assistant"
                      className="w-full bg-[#04070c] border border-white/10 hover:border-white/25 focus:border-[#3b82f6] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                      Short Description
                    </label>

                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="What does this agent do?"
                      className="w-full bg-[#04070c] border border-white/10 hover:border-white/25 focus:border-[#3b82f6] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all shadow-inner"
                    />
                  </div>

                </div>
              </div>

              {/* Agent instructions and behavior */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-slate-300 border-b border-white/5 pb-2 mb-4">
                  <Settings2 size={16} className="text-[#3b82f6]"/>
                  <h2 className="text-sm font-semibold uppercase tracking-wider">
                    Behavior
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                    System Prompt / Instructions
                  </label>

                  <textarea
                    name="systemPrompt"
                    required
                    value={formData.systemPrompt}
                    onChange={handleChange}
                    placeholder="You are an expert assistant. Your goal is to..."
                    rows={6}
                    className="w-full bg-[#04070c] border border-white/10 hover:border-white/25 focus:border-[#3b82f6] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all shadow-inner resize-y font-light leading-relaxed"
                  />
                  
                </div>
              </div>

              {/* MCP tools and knowledge base configuration */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-slate-300 border-b border-white/5 pb-2 mb-4">
                  <Database size={16} className="text-emerald-400"/>
                  <h2 className="text-sm font-semibold uppercase tracking-wider">
                    Knowledge & Tools
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                      <Wrench size={14} /> Attach Tool (MCP)
                    </label>

                    <select
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      className="w-full bg-[#04070c] border border-white/10 hover:border-white/25 focus:border-[#3b82f6] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all shadow-inner appearance-none cursor-pointer"
                    >
                      <option value="none"> No tools attached </option>
                      <option value="mysql-mcp"> MySQL Database </option>
                      <option value="github-mcp"> GitHub Repository </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                      Attach Knowledge Base (RAG)
                    </label>

                    <select
                      name="collection"
                      value={formData.collection}
                      onChange={handleChange}
                      className="w-full bg-[#04070c] border border-white/10 hover:border-white/25 focus:border-[#3b82f6] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all shadow-inner appearance-none cursor-pointer"
                    >
                      <option value="none"> No external knowledge </option>
                      
                      {collectionsList.map((col) => {
                        const colName = typeof col === "string" ? col : col.name;
                        return (
                          <option key={colName} value={colName}>
                            {colName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Control how deterministic or creative the model responses are */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      <Sliders size={14} />
                      Temperature: {formData.temperature}
                    </label>

                    <span className="text-xs text-slate-500 font-light">
                      {formData.temperature < 0.4
                        ? "Focused & Precise"
                        : formData.temperature > 0.7
                        ? "Creative & Random"
                        : "Balanced"}
                    </span>
                  </div>

                  <input
                    type="range"
                    name="temperature"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.temperature}
                    onChange={handleChange}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end gap-4">

                {/* Cancel without submitting the form */}
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>

                {/* Submit the form and create the agent */}
                <button
                  type="submit"
                  disabled={ loading || !formData.name || !formData.systemPrompt }
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-medium text-slate-200 bg-[#1e293b] border border-white/10 hover:border-[#3b82f6]/50 hover:text-white shadow-lg transition-all disabled:opacity-50 cursor-pointer group"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin text-[#3b82f6]" />
                  ) : (
                    <Save size={18} className="text-[#3b82f6] group-hover:scale-110 transition-transform" />
                  )}

                  <span>
                    {loading ? "Saving..." : "Create Agent"}
                  </span>
                </button>

              </div>
            </form>
          </FormWrapper>
        </div>
      </main>
    </div>
  );
}