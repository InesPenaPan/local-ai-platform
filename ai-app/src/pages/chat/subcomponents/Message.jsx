import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Message component renders an individual chat bubble message with a distinct layout,
 * subtle avatars, and inline markdown rendering for assistant responses.
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {Object} props.message - The message object containing its content and role
 * @param {string} props.message.role - The sender role, expected to be either "user" or "assistant"
 * @param {string} props.message.content - The text body of the message to be displayed
 * @param {boolean} [props.isLoading=false] - Whether the assistant is currently generating a response
 * @returns {JSX.Element} The rendered message bubble with appropriate alignment and styling
 */
export default function Message({ message, isLoading = false }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"} group`}>

      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-blue-400/80 shrink-0 mt-1">
          <Bot size={20} strokeWidth={2.2} />
        </div>
      )}

      {/* Message Content */}
      <div
        className={`max-w-[80%] px-5 py-3.5 text-[15px] leading-relaxed transition-all duration-300 ${
          isUser
            ? "bg-[#14080c] border border-[#DE145C]/30 text-slate-200 rounded-2xl rounded-tr-sm"
            : "bg-[#080d17] border border-[#3b82f6]/30 text-slate-200 rounded-2xl rounded-tl-sm"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap tracking-wide font-light">
            {message.content}
          </p>
        ) : (
          <div className="tracking-wide font-light">
            {isLoading ? (
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400/70 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400/70 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400/70 animate-bounce"></span>
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <span className="inline leading-relaxed">{children} </span>,
                  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                  em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
                  ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  code: ({ children }) => (
                    <code className="inline bg-slate-800/60 border border-slate-700/40 text-slate-200 px-1 py-0.5 rounded text-[13px] font-mono mx-0.5 align-baseline">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-lg overflow-x-auto my-2 text-xs font-mono text-slate-300">
                      {children}
                    </pre>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3 border border-slate-800 rounded-lg">
                      <table className="min-w-full divide-y divide-slate-800 text-left text-xs">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => <th className="px-3.5 py-2 font-semibold text-white bg-slate-900/70">{children}</th>,
                  td: ({ children }) => <td className="px-3.5 py-2 border-t border-slate-800/60 text-slate-300">{children}</td>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-rose-400/80 shrink-0 mt-1">
          <User size={20} strokeWidth={2.2} />
        </div>
      )}
    </div>
  );
}