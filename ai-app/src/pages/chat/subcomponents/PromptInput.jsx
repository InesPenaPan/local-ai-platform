
import { Send } from "lucide-react";

// ============================================================================
// PromptInput
// ----------------------------------------------------------------------------
// Renders the main text input area at the bottom of the chat interface.
// It controls the user's message input, handles form submission, and 
// ============================================================================

export default function PromptInput({input, setInput, loading, onSubmit, placeholder = "Message Local AI...", }) {
  return (
    <footer className="shrink-0 px-6 py-6 bg-gradient-to-t from-[#04070c] via-[#04070c]/95 to-transparent relative z-30">
      
      <form onSubmit={onSubmit} className="max-w-4xl mx-auto flex gap-3 relative" >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            className="w-full bg-[#0a0f18]/90 backdrop-blur-md border border-white/10 hover:border-white/20 focus:border-[#DE145C]/50 rounded-xl pl-5 pr-14 py-3.5 text-[15px] text-white placeholder-slate-500 focus:outline-none transition-all shadow-lg disabled:opacity-50 font-light"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-transparent text-slate-500 hover:text-white hover:bg-gradient-to-br hover:from-[#3b82f6] hover:to-[#DE145C] hover:shadow-[0_4px_15px_rgba(222,20,92,0.3)] disabled:bg-transparent disabled:text-slate-700 transition-all duration-300"
          >
            <Send
              size={18}
              strokeWidth={2}
              className={
                input.trim() && !loading
                  ? "text-[#DE145C]"
                  : ""
              }
            />
          </button>
        </div>
      </form>
    </footer>
  );
}