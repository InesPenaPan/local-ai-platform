import { useState, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

import FormWrapper from "../../components/layout/FormWrapper";
import useUploadDocument from "./hooks/useUploadDocument";

const API_BASE_URL = "http://localhost:8000/api/v1";
const RAG_COLLECTIONS_ENDPOINT = `${API_BASE_URL}/rag/collections`;
const NEW_COLLECTION_VALUE = "NEW_COLLECTION";

/**
 * UploadCollectionPage component renders a form interface for uploading and indexing
 * document files (.pdf or .txt) into a new Qdrant vector collection via the API gateway.
 * 
 * @component
 * @param {Object} props Component properties
 * @param {function(): void} [props.onBack] Optional callback function triggered to return to the previous view
 * @param {function(Object): void} [props.onCollectionCreated] Optional callback function triggered after successful collection indexing
 * @returns {JSX.Element} The rendered upload collection page layout container
 */
export default function UploadCollectionPage({ onBack, onCollectionCreated }) {
  const [collectionsList, setCollectionsList] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");

  const {
    selectedFile,
    loading,
    error,
    successMessage,
    handleFileChange,
    uploadDocument,
  } = useUploadDocument({
    onSuccess: onCollectionCreated,
    onComplete: onBack,
  });

  /**
   * Fetch existing RAG collections from the backend on component mount.
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
   * Handle form submission by delegating upload execution to the hook.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const targetCollection =
      selectedCollection === NEW_COLLECTION_VALUE
        ? newCollectionName.trim()
        : selectedCollection;

    await uploadDocument(targetCollection);
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
                Upload & Index Document
              </h1>
            </div>
          </div>

          <FormWrapper>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Collection Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Target Collection
                </label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#04070c] border border-white/10 hover:border-white/25 focus:border-[#3b82f6] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all shadow-inner appearance-none cursor-pointer"
                >
                  <option value="">-- Select a collection --</option>
                  <option value={NEW_COLLECTION_VALUE}>+ Create New Collection</option>
                  
                  {collectionsList.map((col) => {
                    const colName = typeof col === "string" ? col : col.name;
                    return (
                      <option key={colName} value={colName}>
                        {colName} (Existing)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Conditional input for New Collection Name */}
              {selectedCollection === NEW_COLLECTION_VALUE && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                    New Collection Name
                  </label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="e.g., Financial-Reports-2026"
                    disabled={loading}
                    className="w-full bg-[#04070c] border border-white/10 hover:border-white/25 focus:border-[#3b82f6] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              )}

              {/* File upload (Dropzone) */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Source Document (.pdf or .txt)
                </label>
                <label
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                    selectedFile 
                      ? "border-[#3b82f6]/50 bg-[#3b82f6]/5" 
                      : "border-white/10 hover:border-[#DE145C]/50 bg-[#04070c]"
                  }`}
                >
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