import { Database, Layers, Activity, FileText, HardDrive } from "lucide-react";

/**
 * CollectionBattlecard component renders an individual vector collection summary card,
 * featuring status badges, vector dimensions, indexed counts, and document/chunk metrics.
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {Object} props.col - The vector collection data object
 * @param {string} props.col.name - The unique identifier or name of the collection
 * @param {string} props.col.status - The current health status of the collection (e.g., "green" or "GREEN")
 * @param {number} props.col.vector_size - The vector embedding dimension size
 * @param {number} props.col.indexed_vectors_count - The number of currently indexed vectors
 * @param {number} props.col.vectors_count - The total number of vector chunks stored
 * @param {number} props.col.document_count - The total number of unique source documents
 * @returns {JSX.Element} The rendered collection battlecard container
 */
export default function CollectionBattlecard({ col }) {

  /**
  * Helper to format collection names (e.g., "financial_reports" -> "Financial Reports")
  */
  const formatName = (name) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-[#0a0f18]/80 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-[0_4px_25px_rgba(59,130,246,0.1)] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3b82f6]/50 to-[#DE145C]/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div>

        {/* Collection header and status */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#111927] border border-white/5 flex items-center justify-center text-[#3b82f6] shadow-inner">
            <Database size={20} strokeWidth={2} />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-100 tracking-wide mb-2 group-hover:text-[#3b82f6] transition-colors truncate">
          {formatName(col.name)}
        </h3>

        {/* Collection technical details */}
        <div className="text-sm text-slate-400 font-light leading-relaxed mb-6 space-y-1">
          <p className="flex items-center gap-2">
            <Layers size={14} className="text-slate-500" />
            Dimensions: <span className="text-slate-300">{col.vector_size}</span>
          </p>
          <p className="flex items-center gap-2">
            <Activity size={14} className="text-slate-500" />
            Indexed:{" "}
            <span className="text-slate-300">
              {col.indexed_vectors_count} / {col.vectors_count}
            </span>
          </p>
        </div>
      </div>

      {/* Document and vector chunk metrics */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5" title="Total Unique Documents">
            <FileText size={14} className="text-slate-500" />
            <span className="font-medium text-slate-300">{col.document_count}</span> docs
          </span>
          <span className="flex items-center gap-1.5" title="Total Vector Chunks">
            <HardDrive size={14} className="text-slate-500" />
            <span className="font-medium text-slate-300">{col.vectors_count}</span> chunks
          </span>
        </div>
      </div>
    </div>
  );
}