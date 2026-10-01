// ============================================================================
// NewButton
// ----------------------------------------------------------------------------
// A reusable button component primarily used within the sidebar to trigger
// the creation of new entities, such as starting a "New Chat" or creating a 
// "New Agent".
// ============================================================================

export default function NewButton({ icon: Icon, label, onClick, className = "" }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-xl text-base font-bold text-white bg-[#1e293b] border border-white/10 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:bg-[#283852] hover:border-white/20 transition-all duration-300 ease-out active:scale-[0.98] group ${className}`}
    >
      {Icon && (
        <Icon 
          size={20} 
          strokeWidth={2.5} 
          className="text-slate-300 group-hover:text-white transition-colors duration-300" 
        />
      )}
      <span className="tracking-wide">{label}</span>
    </button>
  );
}