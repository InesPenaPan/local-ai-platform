import { useState, useEffect } from "react";
import { Database, Plus, FileText, Layers, HardDrive, FolderPlus, Loader2, Activity } from "lucide-react";

import UploadCollectionPage from "./UploadCollectionPage";

export default function KnowledgePage() {
  const [currentView, setCurrentView] = useState("grid");
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch collections from the API Gateway
  const fetchCollections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/v1/rag/collections");
      if (!res.ok) {
        throw new Error(`API Gateway returned status: ${res.status}`);
      }
      const data = await res.json();
      setCollections(data.collections || []);
    } catch (err) {
      console.error("Failed to fetch collections:", err);
      setError("Failed to load collections. Ensure Docker containers are running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load collections on initial mount
  useEffect(() => {
    fetchCollections();
  }, []);

  // Handler for creating a new collection
  const handleNewModal = () => {
    setCurrentView("upload");
  };

  // Handler triggered when a collection is created in the upload view
  const handleCollectionCreated = () => {
    // Re-fetch from the database to get the real metrics instead of mocking
    fetchCollections();
  };

  // Helper to format collection names (e.g., "financial_reports" -> "Financial Reports")
  const formatName = (name) => {
    return name
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (currentView === "upload") {
    return (
      <UploadCollectionPage
        onBack={() => setCurrentView("grid")}
        onCollectionCreated={handleCollectionCreated}
      />
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#060a11] text-slate-100 font-sans overflow-hidden">
      
      {/* Main Container */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto custom-scrollbar relative bg-[#04070c] shadow-[inset_1px_0_10px_rgba(0,0,0,0.5)] p-8 md:p-12">
        
        {/* Header Section */}
        <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-wide">
                Knowledge Base
              </h1>
            </div>
            <p className="text-slate-400 text-sm md:text-base mt-2 font-light tracking-wide">
              Manage your local vector collections, documents, and RAG ingestion pipelines securely.
            </p>
          </div>

          <button
            onClick={handleNewModal}
            className="flex items-center gap-2 px-5 py-3 bg-[#0a0f18]/90 backdrop-blur-md border border-white/10 hover:border-[#DE145C]/50 rounded-xl text-sm font-medium text-slate-200 hover:text-white transition-all shadow-lg duration-300 group cursor-pointer shrink-0"
          >
            <FolderPlus size={18} strokeWidth={2} className="text-[#DE145C] group-hover:scale-110 transition-transform" />
            <span>New Collection</span>
          </button>
        </div>

        {/* State Handling: Error */}
        {error && (
          <div className="max-w-6xl w-full mx-auto mb-8 p-4 bg-[#DE145C]/10 border border-[#DE145C]/20 rounded-xl text-[#DE145C] text-sm">
            {error}
          </div>
        )}

        {/* State Handling: Loading */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <Loader2 size={32} className="animate-spin text-[#3b82f6]" />
              <p className="text-sm font-light tracking-wide">Syncing with Qdrant Vector Database...</p>
            </div>
          </div>
        ) : (
          /* Battle Cards Grid Section */
          <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            
            {collections.map((col) => (
              <div
                key={col.name}
                className="bg-[#0a0f18]/80 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-[0_4px_25px_rgba(59,130,246,0.1)] relative overflow-hidden"
              >
                {/* Subtle top accent gradient line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3b82f6]/50 to-[#DE145C]/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Card Header */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#111927] border border-white/5 flex items-center justify-center text-[#3b82f6] shadow-inner">
                      <Database size={20} strokeWidth={2} />
                    </div>
                    {/* Dynamic Status Badge */}
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border ${
                      col.status === 'GREEN' 
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                        : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    }`}>
                      {col.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-100 tracking-wide mb-2 group-hover:text-[#3b82f6] transition-colors truncate">
                    {formatName(col.name)}
                  </h3>
                  
                  {/* Technical Meta Description */}
                  <div className="text-sm text-slate-400 font-light leading-relaxed mb-6 space-y-1">
                    <p className="flex items-center gap-2">
                      <Layers size={14} className="text-slate-500" />
                      Dimensions: <span className="text-slate-300">{col.vector_size}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Activity size={14} className="text-slate-500" />
                      Indexed: <span className="text-slate-300">{col.indexed_vectors_count} / {col.vectors_count}</span>
                    </p>
                  </div>
                </div>

                {/* Card Footer: Core Metrics */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5" title="Total Unique Documents">
                      <FileText size={14} className="text-[#DE145C]/70" />
                      <span className="font-medium text-slate-300">{col.document_count}</span> docs
                    </span>
                    <span className="flex items-center gap-1.5" title="Total Vector Chunks">
                      <HardDrive size={14} className="text-[#3b82f6]/70" />
                      <span className="font-medium text-slate-300">{col.vectors_count}</span> chunks
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty / Create Card Placeholder */}
            <div
              onClick={handleNewModal}
              className="border-2 border-dashed border-white/10 hover:border-[#3b82f6]/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 bg-[#0a0f18]/30 hover:bg-[#0a0f18]/60 cursor-pointer group min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-[#3b82f6] group-hover:scale-110 transition-all mb-3">
                <Plus size={22} strokeWidth={2} />
              </div>
              <p className="text-sm font-medium text-slate-300 tracking-wide">Create New Collection</p>
              <p className="text-xs text-slate-500 font-light mt-1">Upload and index a new dataset</p>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}