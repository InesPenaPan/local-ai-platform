import { useState } from "react";
import Header from "./components/layout/Header";
import ChatPage from "./pages/chat/ChatPage";
import KnowledgePage from "./pages/knowledge/KnowledgePage"; 

export default function App() {
  //State to control the active tab (defaults to "chat")
  const [currentTab, setCurrentTab] = useState("chat");

  return (
    <div className="flex flex-col h-screen bg-[#0a0f18] text-white">
      
      {/* Header */}
      <Header currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area (Conditional rendering based on the active tab) */}
      <main className="flex-1 overflow-hidden relative">
        {currentTab === "chat" && <ChatPage />}
        
        {currentTab === "rag" && <KnowledgePage />}

        {currentTab === "settings" && (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>Settings View</p>
          </div>
        )}
      </main>

    </div>
  );
}