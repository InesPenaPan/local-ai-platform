import { useState, useEffect } from "react";
import { Plus, FolderPlus, Loader2 } from "lucide-react";

import UploadCollectionPage from "./UploadCollectionPage";
import PageHeader from "../../components/ui/PageHeader";
import CollectionBattleCard from "./subcomponents/CollectionBattleCard"; 

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
    // Re-fetch from the database to get the real metrics
    fetchCollections();
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
          <PageHeader 
            title="Knowledge Base"
            subtitle="Manage your local vector collections, documents, and RAG ingestion pipelines securely."
          />

          <button
            onClick={handleNewModal}
            className="flex items-center gap-2 px-5 py-3 bg-[#0a0f18]/90 backdrop-blur-md border border-white/10 hover:border-[#DE145C]/50 rounded-xl text-sm font-medium text-slate-200 hover:text-white transition-all shadow-lg duration-300 group cursor-pointer shrink-0"
          >
            <FolderPlus size={18} strokeWidth={2} className="text-[#DE145C] group-hover:scale-110 transition-transform" />
            <span>Upload Documents</span>
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
              <CollectionBattleCard key={col.name} col={col} />
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