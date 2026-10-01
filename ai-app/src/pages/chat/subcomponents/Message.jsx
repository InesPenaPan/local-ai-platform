import { Bot, User } from "lucide-react";

// ============================================================================
// Message
// ----------------------------------------------------------------------------
// Renders an individual message within the chat interface. The layout, 
// styling, and avatar rendered depend dynamically on whether the message 
// belongs to the user or if it is the chat (assistant) responding.
// ============================================================================

export default function Message({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-4 ${ isUser ? "justify-end" : "justify-start"} group`}>

      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-10 h-10 rounded-xl bg-[#2563eb] border border-blue-400/30 flex items-center justify-center text-white shrink-0 shadow-[0_4px_15px_rgba(59,130,246,0.25)] mt-1">
          <Bot size={20} strokeWidth={2} />
        </div>
      )}

      {/* Message Content */}
      <div
        className={`max-w-[80%] px-6 py-4 text-[15px] leading-relaxed transition-all duration-300 ${
          isUser
            ? "bg-[#14080c] border border-[#DE145C]/30 text-slate-200 shadow-[0_4px_20px_rgba(222,20,92,0.1)] rounded-2xl rounded-tr-sm"
            : "bg-[#080d17] border border-[#3b82f6]/30 text-slate-200 shadow-[0_4px_20px_rgba(59,130,246,0.1)] rounded-2xl rounded-tl-sm"
        }`}
      >
        <p className="whitespace-pre-wrap tracking-wide font-light">
          {message.content}
        </p>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-10 h-10 rounded-xl bg-[#DE145C] border border-pink-400/30 flex items-center justify-center text-white shrink-0 mt-1 shadow-[0_4px_15px_rgba(222,20,92,0.25)]">
          <User size={20} strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}

