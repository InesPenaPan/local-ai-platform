import { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

import FormWrapper from "../../components/layout/FormWrapper"; 

/**
 * UploadCollectionPage component renders a form interface for uploading and indexing
 * document files (.pdf or .txt) into a new Qdrant vector collection via the API gateway.
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {function(): void} [props.onBack] - Optional callback function triggered to return to the previous view
 * @param {function(Object): void} [props.onCollectionCreated] - Optional callback function triggered after successful collection indexing
 * @returns {JSX.Element} The rendered upload collection page layout container
 */
export default function UploadCollectionPage({ onBack, onCollectionCreated }) {
  const [collectionName, setCollectionName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /**
  * Handle file selection
  */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError("");
    }
  };

  /**
  * Validate form and upload document
  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!collectionName.trim()) {
      setError("Please provide a collection name.");
      return;
    }
    if (!selectedFile) {
      setError("Please select a document (.pdf or .txt) to ingest.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("collection_name", collectionName);

      const res = await fetch("http://localhost:8000/api/v1/rag/upload-document", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`API Gateway returned status: ${res.status}`);
      }

      const data = await res.json();
      
      setSuccessMessage(`Success! ${data.chunks_stored} chunks indexed.`);
      
      setTimeout(() => {
        if (onCollectionCreated) {
          onCollectionCreated({
            name: collectionName,
            chunks: data.chunks_stored,
          });
        }
        if (onBack) onBack();
      }, 1500);

    } catch (err) {
      setError("Failed to connect to API Gateway (Port 8000). Make sure Docker containers are running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#060a11] text-slate-100 font-sans overflow-hidden">
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto custom-scrollbar relative bg-[#04070c] shadow-[inset_1px_0_10px_rgba(0,0,0,0.5)] p-8 md:p-12">
        <div className="max-w-2xl w-full mx-auto">
          
          {/* Page header */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                disabled={loading}
                className="p-2.5 rounded-xl bg-[#0a0f18]/80 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all shadow-md"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">
                Upload New Collection
              </h1>
            </div>
          </div>

          <FormWrapper>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Collection name*/}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="e.g., Financial Reports 2026"
                  disabled={loading}
                  className="w-full bg-[#04070c] border border-white/10 hover:border-white/25 focus:border-[#3b82f6] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all shadow-inner"
                />
              </div>

              {/* File upload (Dropzone) */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Source Document (.pdf or .txt)
                </label>
                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                  selectedFile 
                    ? "border-[#3b82f6]/50 bg-[#3b82f6]/5" 
                    : "border-white/10 hover:border-[#DE145C]/50 bg-[#04070c]"
                }`}>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="flex items-center gap-3 text-slate-200">
                      <FileText size={26} className="text-[#3b82f6]" />
                      <span className="text-sm font-medium truncate max-w-[320px]">{selectedFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={34} className="text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-300">Click to browse file</p>
                    </>
                  )}
                </label>
              </div>

              {error && (
                <p className="text-xs text-[#DE145C] bg-[#DE145C]/10 border border-[#DE145C]/20 p-3 rounded-lg">
                  {error}
                </p>
              )}

              {successMessage && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                  <CheckCircle2 size={16} />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    disabled={loading}
                    className="px-5 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all bg-transparent"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-slate-200 bg-[#0a0f18]/90 backdrop-blur-md border border-white/10 hover:border-[#3b82f6]/50 hover:text-white shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading && <Loader2 size={16} className="animate-spin text-[#3b82f6]" />}
                  <span>{loading ? "Indexing..." : "Upload & Index"}</span>
                </button>
              </div>

            </form>
          </FormWrapper>

        </div>
      </main>
    </div>
  );
}