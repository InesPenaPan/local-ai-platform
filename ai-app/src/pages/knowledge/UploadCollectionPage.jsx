import { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

export default function UploadCollectionPage({ onBack, onCollectionCreated }) {
  // State variables for form inputs, loading state, and feedback messages
  const [collectionName, setCollectionName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle file selection from the file input element
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError("");
    }
  };

  // Handle form submission, form validation, and communication with the Ingestion Service (:8001)
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
      // 1. Prepare FormData containing the file for the Ingestion Service API
      const formData = new FormData();
      formData.append("file", selectedFile);

      // 2. Send HTTP POST request to the Ingestion Service running on port 8001
      const res = await fetch("http://localhost:8000/api/v1/rag/upload-document", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Ingestion service returned status: ${res.status}`);
      }

      const data = await res.json();
      
      // Display success feedback showing stored chunks count
      setSuccessMessage(`Success! ${data.chunks_stored} chunks indexed.`);
      
      // Notify parent component after a brief delay and navigate back to the grid view
      setTimeout(() => {
        if (onCollectionCreated) {
          onCollectionCreated({
            name: collectionName,
            description: description || "Custom uploaded collection",
            chunks: data.chunks_stored,
          });
        }
        if (onBack) onBack();
      }, 1500);

    } catch (err) {
      setError("Failed to connect to Ingestion Service (Port 8001). Make sure it's running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#060a11] text-slate-100 font-sans overflow-hidden">
      
      {/* Main Container */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto custom-scrollbar relative bg-[#04070c] shadow-[inset_1px_0_10px_rgba(0,0,0,0.5)] p-8 md:p-12">
        
        <div className="max-w-2xl w-full mx-auto">
          
          {/* Back Navigation and Page Header */}
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
              <p className="text-slate-400 text-sm mt-1 font-light">
                Configure your dataset details and ingest a document into your local vector database.
              </p>
            </div>
          </div>

          {/* Upload Form Card Container */}
          <div className="bg-[#0a0f18]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Top decorative gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3b82f6] to-[#DE145C]"></div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Collection Name Input Field */}
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

              {/* Description Textarea Field */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the contents of this dataset..."
                  rows={3}
                  disabled={loading}
                  className="w-full bg-[#04070c] border border-white/10 hover:border-white/25 focus:border-[#3b82f6] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all shadow-inner resize-none font-light"
                />
              </div>

              {/* File Upload Box / Dropzone */}
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
                      <p className="text-xs text-slate-500 mt-1">Supports PDF and TXT formats</p>
                    </>
                  )}
                </label>
              </div>

              {/* Error Notification Alert */}
              {error && (
                <p className="text-xs text-[#DE145C] bg-[#DE145C]/10 border border-[#DE145C]/20 p-3 rounded-lg">
                  {error}
                </p>
              )}

              {/* Success Notification Alert */}
              {successMessage && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                  <CheckCircle2 size={16} />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Footer Actions (Cancel and Submit Buttons) */}
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
                {/* Clean non-colored button matching the Quiet Luxury theme */}
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
          </div>

        </div>
      </main>
    </div>
  );
}