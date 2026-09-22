import { useState } from "react";
import { Database, Plus, FileText, Layers, HardDrive , FolderPlus } from "lucide-react";

import UploadCollectionPage from "./UploadCollectionPage";

export default function KnowledgePage() {

  const [currentView, setCurrentView] = useState("grid");
  
  // Mock collections
  const [collections, setCollections] = useState([
    {
      id: 1,
      name: "Corporate HR Policies",
      description: "Internal employee guidelines, remote work rules, and benefit documents.",
      documentsCount: 14,
      chunks: 350,
      updatedAt: "2 days ago",
    },
    {
      id: 2,
      name: "Technical Architecture Specs",
      description: "Cloud infrastructure blueprints, microservice guidelines, and API docs.",
      documentsCount: 8,
      chunks: 210,
      updatedAt: "5 days ago",
    },
    {
      id: 3,
      name: "Financial Reports Q2",
      description: "Quarterly earnings, budget spreadsheets, and expense projections.",
      documentsCount: 5,
      chunks: 120,
      updatedAt: "1 week ago",
    },
  ]);

  // Handler for creating a new collection
  const handleNewModal = () => {
    // Placeholder for opening collection creation modal
    console.log("Trigger new collection creation");
    setCurrentView("upload");
  };

  // Handler to add the newly created collection to the state grid
  const handleCollectionCreated = (newCol) => {
    setCollections((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: newCol.name,
        description: newCol.description,
        documentsCount: 1,
        chunks: newCol.chunks,
        updatedAt: "Just now",
      },
    ]);
  };

  // Conditional Rendering: If view is "upload", render UploadCollectionPage
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
        
        {/* Header Section: Title, Subtitle, and Action Button */}
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

          {/* New Collection Button matching Chat input styling */}
          <button
            onClick={handleNewModal}
            className="flex items-center gap-2 px-5 py-3 bg-[#0a0f18]/90 backdrop-blur-md border border-white/10 hover:border-[#DE145C]/50 rounded-xl text-sm font-medium text-slate-200 hover:text-white transition-all shadow-lg duration-300 group cursor-pointer shrink-0"
          >
            <FolderPlus size={18} strokeWidth={2} className="text-[#DE145C] group-hover:scale-110 transition-transform" />
            <span>New Collection</span>
          </button>
        </div>

        {/* Battle Cards Grid Section */}
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {collections.map((col) => (
            <div
              key={col.id}
              className="bg-[#0a0f18]/80 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-[0_4px_25px_rgba(59,130,246,0.1)] relative overflow-hidden"
            >
              {/* Subtle top accent gradient line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3b82f6]/50 to-[#DE145C]/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#111927] border border-white/5 flex items-center justify-center text-[#3b82f6] shadow-inner">
                    <Layers size={20} strokeWidth={2} />
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    Updated {col.updatedAt}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-100 tracking-wide mb-2 group-hover:text-[#3b82f6] transition-colors">
                  {col.name}
                </h3>
                <p className="text-sm text-slate-400 font-light leading-relaxed mb-6">
                  {col.description}
                </p>
              </div>

              {/* Card Footer: Metrics & Action */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <FileText size={14} className="text-slate-500" />
                    {col.documentsCount} docs
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HardDrive size={14} className="text-slate-500" />
                    {col.chunks} chunks
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

      </main>
    </div>
  )
}