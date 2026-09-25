import { useState } from "react";
import {
  Save,
  Settings2,
  Database,
  Sliders,
  Fingerprint,
  Loader2,
  MessageSquare,
} from "lucide-react";

import Sidebar from "./subcomponents/SideBar";
import PageHeader from "../../components/ui/PageHeader";
import FormWrapper from "../../components/layout/FormWrapper";

export default function NewAgentPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    model: "llama3.1",
    collection: "none",
    temperature: 0.7,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Ensure temperature is stored as a floating-point number
    const parsedValue =
      name === "temperature" ? parseFloat(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccessMessage(false);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/agents/create-agent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.detail ||
            "Error creating the agent on the server."
        );
      }

      const result = await response.json();

      console.log("Agent saved successfully:", result);

      setSuccessMessage(true);

      // Clear form after successful creation
      setFormData({
        name: "",
        description: "",
        systemPrompt: "",
        model: "llama3.1",
        collection: "none",
        temperature: 0.7,
      });
    } catch (err) {
      console.error("Request error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#060a11] text-slate-100 font-sans overflow-hidden">
      <div className="flex flex-1 h-full overflow-hidden">
        <Sidebar currentItem="agents" />

        <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto custom-scrollbar relative bg-[#04070c] shadow-[inset_1px_0_10px_rgba(0,0,0,0.5)] p-8 md:p-12">
          <div className="max-w-3xl w-full mx-auto pb-12">

            {/* Page Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
              <PageHeader
                title="New Agent"
                subtitle="Define the identity, instructions, and knowledge base for your custom AI assistant."
              />
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm">
                Agent created and saved to the database successfully!
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm">
                Error: {error}
              </div>
            )}

            <FormWrapper>
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Section 1: Basic Identity */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-slate-300 border-b border-white/5 pb-2 mb-4">
                    <Fingerprint
                      size={16}
                      className="text-[#DE145C]"
                    />

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
                        placeholder="e.g., Code Reviewer, Chef Bot"
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

                {/* Section 2: Behavior */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-slate-300 border-b border-white/5 pb-2 mb-4">
                    <Settings2
                      size={16}
                      className="text-[#3b82f6]"
                    />

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
                      placeholder="You are an expert copywriter. Your goal is to..."
                      rows={6}
                      className="w-full bg-[#04070c] border border-white/10 hover:border-white/25 focus:border-[#3b82f6] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all shadow-inner resize-y font-light leading-relaxed"
                    />

                    <p className="text-xs text-slate-500 mt-2 font-light">
                      This defines the personality, boundaries, and specific rules the agent must follow.
                    </p>
                  </div>
                </div>

                {/* Section 3: Configuration & RAG */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-slate-300 border-b border-white/5 pb-2 mb-4">
                    <Database
                      size={16}
                      className="text-emerald-400"
                    />

                    <h2 className="text-sm font-semibold uppercase tracking-wider">
                      Knowledge & Engine
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                        Base LLM Model
                      </label>

                      <select
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        className="w-full bg-[#04070c] border border-white/10 hover:border-white/25 focus:border-[#3b82f6] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all shadow-inner appearance-none cursor-pointer"
                      >
                        <option value="llama3.1">
                          Llama 3.1 (Recommended)
                        </option>

                        <option value="mistral">
                          Mistral
                        </option>

                        <option value="gemma2">
                          Gemma 2
                        </option>
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
                        <option value="none">
                          No external knowledge
                        </option>

                        <option value="recetas-familiares">
                          Recetas Familiares
                        </option>

                        <option value="hr-policies">
                          Corporate HR Policies
                        </option>
                      </select>
                    </div>
                  </div>

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

                {/* Footer Actions */}
                <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !formData.name ||
                      !formData.systemPrompt
                    }
                    className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-medium text-slate-200 bg-[#1e293b] border border-white/10 hover:border-[#3b82f6]/50 hover:text-white shadow-lg transition-all disabled:opacity-50 cursor-pointer group"
                  >
                    {loading ? (
                      <Loader2
                        size={18}
                        className="animate-spin text-[#3b82f6]"
                      />
                    ) : (
                      <Save
                        size={18}
                        className="text-[#3b82f6] group-hover:scale-110 transition-transform"
                      />
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
    </div>
  );
}

