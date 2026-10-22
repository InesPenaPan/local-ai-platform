import { useState } from "react";
import { Save, ShieldAlert, Lock, ShieldCheck, Loader2 } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import FormWrapper from "../../components/layout/FormWrapper";

/**
 * GuardrailsPage component renders a configuration interface for defining
 * global safety rules, content filters, and strict operational boundaries
 * for all AI agents running on the platform.
 * 
 * @component
 * @returns {JSX.Element} The rendered guardrails configuration page layout
 */
export default function GuardrailsPage() {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    strictMode: true,
    contentFilterLevel: "high",
    globalSystemInstruction: "",
    bannedTopics: "",
    maxTokens: 2048,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(false);

    // Simulated API call for saving guardrails
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#060a11] text-slate-100 font-sans overflow-hidden">
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto custom-scrollbar relative bg-[#04070c] shadow-[inset_1px_0_10px_rgba(0,0,0,0.5)] p-8 md:p-12">

        <div className="max-w-3xl w-full mx-auto pb-12">

          {/* Page title and description */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
            <PageHeader
              title="Global Guardrails"
              subtitle="Configure safety filters, operational boundaries, and system-wide rules for all agents."
            />
          </div>

          {/* Display the creation result or any submission error */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm">
              Global guardrails configuration saved successfully!
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm">
              Error: {error}
            </div>
          )}

          <FormWrapper>
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Safety & Enforcement */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-slate-300 border-b border-white/5 pb-2 mb-4">
                  <ShieldCheck size={16} className="text-[#DE145C]"/>
                  <h2 className="text-sm font-semibold uppercase tracking-wider">
                    Safety & Enforcement
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Strict Mode Toggle */}
                  <div className="flex flex-col justify-center">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="strictMode"
                          checked={formData.strictMode}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${formData.strictMode ? 'bg-[#3b82f6]' : 'bg-slate-700'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.strictMode ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">Enforce Strict Mode</div>
                        <div className="text-xs font-light text-slate-500 mt-0.5">Prevent tools from modifying external systems without confirmation.</div>
                      </div>
                    </label>
                  </div>

                  {/* Content Filter Level */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                      Content Filter Level
                    </label>
                    <select
                      name="contentFilterLevel"
                      value={formData.contentFilterLevel}
                      onChange={handleChange}
                      className="w-full bg-[#04070c] border border-white/10 hover:border-white/25 focus:border-[#3b82f6] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all shadow-inner cursor-pointer"
                    >
                      <option value="low">Low (Permissive)</option>
                      <option value="medium">Medium (Standard)</option>
                      <option value="high">High (Strict)</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Operational Boundaries */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-slate-300 border-b border-white/5 pb-2 mb-4">
                  <Lock size={16} className="text-[#3b82f6]"/>
                  <h2 className="text-sm font-semibold uppercase tracking-wider">
                    Operational Boundaries
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                    Global System Instruction Overlay
                  </label>

                  <textarea
                    name="globalSystemInstruction"
                    value={formData.globalSystemInstruction}
                    onChange={handleChange}
                    placeholder="Instructions entered here will be silently prepended to ALL agents (e.g., 'Never output raw JSON data. Always answer in Spanish.')"
                    rows={4}
                    className="w-full bg-[#04070c] border border-white/10 hover:border-white/25 focus:border-[#3b82f6] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all shadow-inner resize-y font-light leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert size={14} /> Banned Topics / Keywords
                  </label>

                  <input
                    type="text"
                    name="bannedTopics"
                    value={formData.bannedTopics}
                    onChange={handleChange}
                    placeholder="e.g., politics, competitors, passwords (comma separated)"
                    className="w-full bg-[#04070c] border border-white/10 hover:border-white/25 focus:border-[#3b82f6] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end gap-4">

                {/* Save Guardrails */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-medium text-slate-200 bg-[#1e293b] border border-white/10 hover:border-[#3b82f6]/50 hover:text-white shadow-lg transition-all disabled:opacity-50 cursor-pointer group"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin text-[#3b82f6]" />
                  ) : (
                    <Save size={18} className="text-[#3b82f6] group-hover:scale-110 transition-transform" />
                  )}

                  <span>
                    {loading ? "Applying..." : "Save Configuration"}
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