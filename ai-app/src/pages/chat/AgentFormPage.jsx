import { useState, useEffect } from "react";
import { Save, Settings2, Database, Sliders, Fingerprint, Loader2, Wrench } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import FormWrapper from "../../components/layout/FormWrapper";

const API_BASE_URL = "http://localhost:8000/api/v1";
const RAG_COLLECTIONS_ENDPOINT = `${API_BASE_URL}/rag/collections`;
const AGENT_ENDPOINT = (name) => `${API_BASE_URL}/agent/${encodeURIComponent(name)}`;

/**
 * AgentFormPage component handles both the creation of new AI agents and the editing 
 * of existing ones based on the presence of the agentToEdit prop.
 * 
 * @component
 * @param {Object} props Component properties
 * @param {Object} [props.agentToEdit] The agent object to populate the form with for editing
 * @param {function(): void} props.onCancel Callback function triggered when the cancel button is clicked
 * @param {function(Object): void} props.onSaved Callback function triggered successfully after saving or updating an agent
 * @returns {JSX.Element} The rendered agent form page layout
 */
export default function AgentFormPage({ agentToEdit, onCancel, onSaved }) {
  // Determine whether the form is in edit mode or creation mode
  const isEditing = Boolean(agentToEdit);

  // State initialization for the agent form fields
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    model: "llama3.1",
    mcp: "none",
    collection: "none",
    temperature: 0.7,
  });

  const [collectionsList, setCollectionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(false);

  /**
   * Prepopulate form data if an agent is passed for editing.
   */
  useEffect(() => {
    if (isEditing && agentToEdit) {
      setFormData({
        name: agentToEdit.name || "",
        description: agentToEdit.description || "",
        systemPrompt: agentToEdit.systemPrompt || "",
        model: agentToEdit.model || "llama3.1",
        mcp: agentToEdit.mcp || "none",
        collection: agentToEdit.collection || "none",
        temperature: agentToEdit.temperature ?? 0.7,
      });
    }
  }, [agentToEdit, isEditing]);

  /**
   * Fetch available RAG collections on component mount.
   */
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch(RAG_COLLECTIONS_ENDPOINT);
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

  /**
   * Handle input changes for text fields, selects, and sliders.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "temperature" ? parseFloat(value) : value,
    }));
  };

  /**
   * Handle form submission to either create or update an agent.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(false);

    try {
      // Choose endpoint and HTTP method depending on whether we are editing or creating
      const url = isEditing ? AGENT_ENDPOINT(agentToEdit.name) : `${API_BASE_URL}/agent/create`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || `Error while ${isEditing ? "updating" : "creating"} the agent`);
      }

      const savedAgent = await response.json();
      setSuccessMessage(true);
      
      // Delay navigation slightly to let the user see the success message
      setTimeout(() => {
        onSaved?.(savedAgent);
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#060a11] text-slate-100 font-sans overflow-hidden">
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto custom-scrollbar relative bg-[#04070c] shadow-[inset_1px_0_10px_rgba(0,0,0,0.5)] p-8 md:p-12">
        <div className="max-w-3xl w-full mx-auto pb-12">
          
          {/* Page title and description header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
            <PageHeader
              title={isEditing ? `Edit Agent: ${agentToEdit.name}` : "New Agent"}
              subtitle={isEditing ? "Modify the settings and behavior of your custom assistant." : "Define the identity, instructions, and tool integrations for your custom AI assistant."}
            />
          </div>

          {/* Success notification banner */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm">
              {isEditing ? "Agent updated successfully!" : "Agent created and saved successfully!"}
            </div>
          )}

          {/* Error notification banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm">
              Error: {error}
            </div>
          )}

          <FormWrapper>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Identity Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-slate-300 border-b border-white/5 pb-2 mb-4">
                  <Fingerprint size={16} className="text-[#DE145C]"/>
                  <h2 className="text-sm font-semibold uppercase tracking-wider">Identity</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Agent Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      disabled={isEditing} // Prevent modifying the name if editing (acts as primary identifier)
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Code Reviewer"
                      className="w-full bg-[#04070c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Short Description</label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="What does this agent do?"
                      className="w-full bg-[#04070c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Behavior Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-slate-300 border-b border-white/5 pb-2 mb-4">
                  <Settings2 size={16} className="text-[#3b82f6]"/>
                  <h2 className="text-sm font-semibold uppercase tracking-wider">Behavior</h2>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">System Prompt / Instructions</label>
                  <textarea
                    name="systemPrompt"
                    required
                    value={formData.systemPrompt}
                    onChange={handleChange}
                    rows={6}
                    className="w-full bg-[#04070c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none resize-y"
                  />
                </div>
              </div>

              {/* Knowledge & Tools Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-slate-300 border-b border-white/5 pb-2 mb-4">
                  <Database size={16} className="text-emerald-400"/>
                  <h2 className="text-sm font-semibold uppercase tracking-wider">Knowledge & Tools</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* LLM Model Selection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">LLM Model</label>
                    <select
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      className="w-full bg-[#04070c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none cursor-pointer"
                    >
                      <option value="llama3.1">llama3.1</option>
                      <option value="qwen2.5:7b">qwen2.5:7b</option>
                    </select>
                  </div>

                  {/* MCP Tool Attachment Selection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                      <Wrench size={14} /> Attach Tool (MCP)
                    </label>
                    <select
                      name="mcp"
                      value={formData.mcp}
                      onChange={handleChange}
                      className="w-full bg-[#04070c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none cursor-pointer"
                    >
                      <option value="none">No tools attached</option>
                      <option value="mysql-mcp">MySQL Database</option>
                      <option value="github-mcp">GitHub Repository</option>
                    </select>
                  </div>

                  {/* RAG Knowledge Base Selection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Attach Knowledge Base (RAG)</label>
                    <select
                      name="collection"
                      value={formData.collection}
                      onChange={handleChange}
                      className="w-full bg-[#04070c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none cursor-pointer"
                    >
                      <option value="none">No external knowledge</option>
                      {collectionsList.map((col) => {
                        const colName = typeof col === "string" ? col : col.name;
                        return (
                          <option key={colName} value={colName}>{colName}</option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Temperature Slider */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      <Sliders size={14} /> Temperature: {formData.temperature}
                    </label>
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

              {/* Form Action Buttons */}
              <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.name || !formData.systemPrompt}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-medium text-slate-200 bg-[#1e293b] border border-white/10 hover:border-[#3b82f6]/50 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 size={18} className="animate-spin text-[#3b82f6]" /> : <Save size={18} className="text-[#3b82f6]" />}
                  <span>{loading ? "Saving..." : isEditing ? "Update Agent" : "Create Agent"}</span>
                </button>
              </div>

            </form>
          </FormWrapper>

        </div>
      </main>
    </div>
  );
}