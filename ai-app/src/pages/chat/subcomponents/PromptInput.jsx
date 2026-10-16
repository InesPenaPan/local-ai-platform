import { Send } from "lucide-react";

/**
 * PromptInput component renders the main chat input bar at the bottom of the interface,
 * handling user text input, submission states, disabled loading states, and submit button toggling.
 * 
 * @component
 * @param {Object} props Component properties
 * @param {string} props.input The current value of the text input
 * @param {function(string): void} props.setInput State setter function to update the input value
 * @param {boolean} props.loading Flag indicating whether a response is currently loading (disables input and submit)
 * @param {function(React.FormEvent): void} props.onSubmit Form submission event handler callback
 * @param {string} [props.placeholder="Message Local AI..."] Optional custom placeholder text for the input field
 * @returns {JSX.Element} The rendered prompt input footer container
 */
export default function PromptInput({ input, setInput, loading, onSubmit, placeholder = "Message Local AI..." }) {
  const canSubmit = input.trim() && !loading;

  return (
    <footer className="shrink-0 px-6 py-6 bg-gradient-to-t from-[#04070c] via-[#04070c]/95 to-transparent relative z-30">
      <form onSubmit={onSubmit} className="max-w-4xl mx-auto flex gap-3 relative">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            className="w-full bg-[#0a0f18]/90 backdrop-blur-md border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-xl pl-5 pr-14 py-3.5 text-[15px] text-white placeholder-slate-500 focus:outline-none transition-all shadow-lg focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] disabled:opacity-50 font-light"
          />

          <button
            type="submit"
            disabled={!canSubmit}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-transparent text-slate-500 hover:text-white hover:bg-blue-600/15 disabled:bg-transparent disabled:text-slate-700 transition-colors duration-200"
          >
            <Send
              size={18}
              strokeWidth={2}
              className={
                canSubmit
                  ? "text-blue-500 hover:text-blue-400 transition-colors"
                  : "text-slate-600"
              }
            />
          </button>
        </div>
      </form>
    </footer>
  );
}