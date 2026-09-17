import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2 } from "lucide-react";
import Header from "./components/layout/Header";

export default function App() {
  const [currentTab, setCurrentTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const clearChat = () => {
    if (!loading) setMessages([]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          model: "llama3.1",
        }),
      });

      if (!res.ok) {
        throw new Error(`Gateway returned status: ${res.status}`);
      }

      const data = await responseJson(res);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: No se pudo conectar con el API Gateway (puerto 8000).",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const responseJson = async (res) => await res.json();

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <Header currentTab={currentTab} onSelectTab={setCurrentTab} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {currentTab === "chat" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {messages.length > 0 && (
              <div className="px-6 py-2 border-b border-slate-900 bg-slate-950/40 flex justify-end">
                <button
                  onClick={clearChat}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  <span>Limpiar chat</span>
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-w-3xl w-full mx-auto">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                  <Bot size={36} className="text-slate-600 stroke-[1.5]" />
                  <p className="text-sm font-medium">Asistente local listo</p>
                  <p className="text-xs text-slate-500">Envía un mensaje para interactuar con el modelo.</p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <Bot size={15} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-900 text-slate-200 border border-slate-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <User size={15} />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0">
                    <Bot size={15} />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-slate-400 text-sm px-4 py-2.5 rounded-2xl animate-pulse">
                    Generando respuesta...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <footer className="p-4 border-t border-slate-800 bg-slate-900/40">
              <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  disabled={loading}
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition flex items-center gap-1.5"
                >
                  <Send size={15} />
                  <span>Enviar</span>
                </button>
              </form>
            </footer>
          </div>
        )}

        {currentTab === "rag" && (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Módulo de Knowledge Base / RAG (en construcción)
          </div>
        )}

        {currentTab === "settings" && (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Configuración del Gateway y selección de modelos (en construcción)
          </div>
        )}
      </main>
    </div>
  );
}