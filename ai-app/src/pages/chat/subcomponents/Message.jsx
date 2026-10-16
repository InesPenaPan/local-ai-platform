import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Message renders conversational bubbles with role-based visual hierarchy,
 * conditional alignments, and a custom Markdown formatting pipeline.
 * 
 * @component
 * @param {Object} props Component properties
 * @param {Object} props.message The message object containing its content and role
 * @param {string} props.message.role The sender role ("user" | "assistant")
 * @param {string} props.message.content The text body of the message
 * @param {boolean} [props.isLoading=false] Whether the assistant is generating a response
 * @returns {JSX.Element} The rendered chat message element
 */
export default function Message({ message, isLoading = false }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"} group items-start`}>
      
      {/* SVG linear gradient definition for the Bot icon stroke */}
      {!isUser && (
        <svg width="0" height="0" className="absolute">
          <linearGradient id="robotGradientStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#DE145C" />
          </linearGradient>
        </svg>
      )}

      {/* Assistant Avatar: Mismo recuadro simple que el usuario */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-[#0b111c] border border-white/10 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <Bot size={17} stroke="url(#robotGradientStroke)" strokeWidth={2.2} />
        </div>
      )}

      {/* User Bubble */}
      {isUser ? (
        <div className="max-w-[80%] px-5 py-3.5 bg-[#0e1726] border border-white/5 text-slate-200 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed shadow-sm">
          <p className="whitespace-pre-wrap tracking-wide font-light">
            {message.content}
          </p>
        </div>
      ) : (
        /* Assistant Bubble: Destacado equilibrado */
        <div className="relative max-w-[80%] bg-[#0c1424] border border-[#3b82f6]/25 rounded-2xl rounded-tl-sm px-5 py-4 text-[15px] leading-relaxed text-slate-100 shadow-[0_4px_25px_rgba(59,130,246,0.07)] overflow-hidden">
          
          {/* Acento lateral sutil en degradado azul-rosa */}
          <div className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-gradient-to-b from-[#3b82f6] via-[#60a5fa] to-[#DE145C]/80" />

          {/* Luz ambiental superior muy suave */}
          <div className="absolute -top-12 left-1/4 w-40 h-20 bg-[#3b82f6]/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 tracking-wide font-light">
            {isLoading ? (
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#DE145C] animate-bounce"></span>
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
                    <code className="inline bg-white/[0.06] border border-white/10 text-blue-200 px-1 py-0.5 rounded text-[13px] font-mono mx-0.5 align-baseline">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-[#050911] border border-white/10 p-3 rounded-lg overflow-x-auto my-2.5 text-xs font-mono text-slate-300">
                      {children}
                    </pre>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3 border border-white/10 rounded-lg">
                      <table className="min-w-full divide-y divide-white/10 text-left text-xs">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => <th className="px-3.5 py-2 font-semibold text-white bg-white/[0.04]">{children}</th>,
                  td: ({ children }) => <td className="px-3.5 py-2 border-t border-white/5 text-slate-300">{children}</td>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      )}

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-[#0b111c] border border-white/10 flex items-center justify-center text-slate-400 shrink-0 mt-0.5 shadow-sm">
          <User size={17} />
        </div>
      )}
    </div>
  );
}