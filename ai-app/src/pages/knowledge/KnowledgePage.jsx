import { useState } from "react";
import { Plus, FolderPlus, Loader2 } from "lucide-react";

import UploadCollectionPage from "./UploadCollectionPage";
import PageHeader from "../../components/ui/PageHeader";
import CollectionBattleCard from "./subcomponents/CollectionBattleCard";
import { useFetchCollections } from "./hooks/useFetchCollections";

/**
 * KnowledgePage component serves as the knowledge management dashboard,
 * allowing users to view vector collections, handle loading/syncing states with Qdrant,
 * and switch views to upload new document datasets.
 * 
 * @component
 * @returns {JSX.Element} The rendered knowledge base dashboard container
 */
export default function KnowledgePage() {
  const [currentView, setCurrentView] = useState("grid");

  const {
    collections,
    isLoading,
    error,
    fetchCollections,
  } = useFetchCollections();

  const handleNewModal = () => {
    setCurrentView("upload");
  };

  const handleCollectionCreated = () => {
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
      <main className="flex-1 flex flex-col h-full w-full min-w-0 overflow-y-auto custom-scrollbar relative bg-[#04070c] shadow-[inset_1px_0_10px_rgba(0,0,0,0.5)] p-8 md:p-12">

        {/* Page header and upload action */}
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

        {error && (
          <div className="max-w-6xl w-full mx-auto mb-8 p-4 bg-[#DE145C]/10 border border-[#DE145C]/20 rounded-xl text-[#DE145C] text-sm">
            {error}
          </div>
        )}

        {/* Show a loading state while collections are being fetched */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <Loader2 size={32} className="animate-spin text-[#3b82f6]" />
              <p className="text-sm font-light tracking-wide">
                Syncing with Qdrant Vector Database...
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">

            {/* Render each available vector collection */}
            {collections.map((col) => (
              <CollectionBattleCard
                key={col.name}
                col={col}
              />
            ))}

          </div>
        )}
      </main>
    </div>
  );
}
