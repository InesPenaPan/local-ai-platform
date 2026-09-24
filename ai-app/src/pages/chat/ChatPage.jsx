import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ChevronDown, Sparkles } from "lucide-react";

import Sidebar from "./subcomponents/SideBar";

export default function ChatPage() {
  const [currentTab, setCurrentTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("llama3.1");
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat when new messages appear
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle message submission to the local backend
  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/llm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          model: selectedModel,
        }),
      });

      if (!res.ok) throw new Error(`Gateway returned status: ${res.status}`);

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: No se pudo conectar con el API Gateway (puerto 8000)." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#060a11] text-slate-100 font-sans overflow-hidden">

      {/* Main Wrapper */}
      <div className="flex flex-1 h-full overflow-hidden">
        
        {/* Sidebar */}
        <Sidebar currentItem="agents" />

        {/* Main Area Chat */}
        <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-[#04070c] shadow-[inset_1px_0_10px_rgba(0,0,0,0.5)]">
          
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            
            {/* Empty State */}
            {messages.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in pointer-events-none mt-10">
                
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-32 h-32 bg-[#3b82f6]/45 blur-[35px] -translate-x-6 rounded-full"></div>
                  <div className="absolute w-32 h-32 bg-[#DE145C]/45 blur-[35px] translate-x-6 rounded-full"></div>
                  <Bot size={65} strokeWidth={1.2} className="text-slate-200 relative z-10 drop-shadow-lg" />
                </div>

                <div className="text-center relative z-10 mt-20">
                  <p className="text-lg font-medium text-slate-200 tracking-wide">
                    How can I help you?
                  </p>
                </div>
                
              </div>
            )}

            {/* Chat History Container */}
            <div className="max-w-4xl w-full mx-auto p-6 md:p-8 pt-12 space-y-8 relative z-10 pb-24">
              
              {/* Message Bubbles Map */}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"} group`}>
                  
                  {/* Assistant Avatar */}
                  {msg.role === "assistant" && (
                    <div className="w-10 h-10 rounded-xl bg-[#2563eb] border border-blue-400/30 flex items-center justify-center text-white shrink-0 shadow-[0_4px_15px_rgba(59,130,246,0.25)] mt-1">
                      <Bot size={20} strokeWidth={2} />
                    </div>
                  )}

                  {/* Message Content Container*/}
                  <div
                    className={`max-w-[80%] px-6 py-4 text-[15px] leading-relaxed transition-all duration-300 ${
                      msg.role === "user"
                        // User Message: Magenta Tint
                        ? "bg-[#14080c] border border-[#DE145C]/30 text-slate-200 shadow-[0_4px_20px_rgba(222,20,92,0.1)] rounded-2xl rounded-tr-sm"
                        // AI Message: Blue Tint
                        : "bg-[#080d17] border border-[#3b82f6]/30 text-slate-200 shadow-[0_4px_20px_rgba(59,130,246,0.1)] rounded-2xl rounded-tl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap tracking-wide font-light">{msg.content}</p>
                  </div>

                  {/* User Avatar */}
                  {msg.role === "user" && (
                    <div className="w-10 h-10 rounded-xl bg-[#DE145C] border border-pink-400/30 flex items-center justify-center text-white shrink-0 mt-1 shadow-[0_4px_15px_rgba(222,20,92,0.25)]">
                      <User size={20} strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex gap-4 justify-start animate-fade-in">
                  <div className="w-10 h-10 rounded-xl bg-[#2563eb] border border-blue-400/30 flex items-center justify-center text-white shrink-0 mt-1 shadow-[0_4px_15px_rgba(59,130,246,0.25)]">
                    <Bot size={20} strokeWidth={2} />
                  </div>
                  <div className="bg-[#080d17] border border-[#3b82f6]/30 shadow-[0_4px_20px_rgba(59,130,246,0.1)] px-6 py-5 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#60a5fa] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-[#60a5fa] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-[#60a5fa] rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-6" />
            </div>
          </div>

          {/* Bottom Input Area */}
          <footer className="shrink-0 px-6 py-6 bg-gradient-to-t from-[#04070c] via-[#04070c]/95 to-transparent relative z-30">
            <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3 relative">
              
              {/* Model Selector Dropdown */}
              <div className="relative shrink-0 w-40">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={loading}
                  className="w-full h-full bg-[#0a0f18]/90 backdrop-blur-md border border-white/10 hover:border-white/20 focus:border-[#3b82f6]/50 rounded-xl pl-4 pr-10 py-3.5 text-[14px] font-medium text-slate-200 focus:outline-none transition-all shadow-lg appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="llama3.1" className="bg-[#0b111c]">Llama 3.1</option>
                  <option value="mistral" className="bg-[#0b111c]">Mistral</option>
                </select>
                <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>

              {/* Text Input Field */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message Local AI..."
                  disabled={loading}
                  className="w-full bg-[#0a0f18]/90 backdrop-blur-md border border-white/10 hover:border-white/20 focus:border-[#DE145C]/50 rounded-xl pl-5 pr-14 py-3.5 text-[15px] text-white placeholder-slate-500 focus:outline-none transition-all shadow-lg disabled:opacity-50 font-light"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-transparent text-slate-500 hover:text-white hover:bg-gradient-to-br hover:from-[#3b82f6] hover:to-[#DE145C] hover:shadow-[0_4px_15px_rgba(222,20,92,0.3)] disabled:bg-transparent disabled:text-slate-700 transition-all duration-300"
                >
                  <Send size={18} strokeWidth={2} className={input.trim() && !loading ? "text-[#DE145C]" : ""} />
                </button>
              </div>
            </form>

          </footer>
        </main>
      </div>
    </div>
  );
}