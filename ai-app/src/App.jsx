import { useState } from "react";

import Header from "./components/layout/Header";

import Sidebar from "./pages/chat/subcomponents/SideBar";
import ChatPage from "./pages/chat/ChatPage";
import NewAgentPage from "./pages/chat/NewAgentPage";
import AgentChatPage from "./pages/chat/AgentChatPage";

import KnowledgePage from "./pages/knowledge/KnowledgePage";

export default function App() {
  const [currentTab, setCurrentTab] = useState("chat");
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Sidebar only appears on chat/agent pages
  const showSidebar = [
    "chat",
    "create-agent",
    "agent-chat",
  ].includes(currentTab);

  // Handle navigation between the main application views
  const handleNavigate = (tab) => {
    setCurrentTab(tab);

    // Clear the selected agent when returning to normal chat
    if (tab === "chat") {
      setSelectedAgent(null);
    }
  };

  // Start a new conversation
  const handleNewConversation = () => {
    setSelectedAgent(null);
    setCurrentTab("chat");
  };

  // Navigate to the new agent page
  const handleNewAgent = () => {
    setSelectedAgent(null);
    setCurrentTab("create-agent");
  };

  // Select an existing agent and open its chat
  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    setCurrentTab("agent-chat");
  };

  // Handle the result after creating a new agent
  const handleAgentCreated = (agent) => {
    if (agent) {
      setSelectedAgent(agent);
      setCurrentTab("agent-chat");
    } else {
      setCurrentTab("chat");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0f18] text-white">

      {/* Global header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleNavigate}
      />

      {/* Content area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Sidebar - only for chat and agent pages */}
        {showSidebar && (
          <Sidebar
            onNewConversation={handleNewConversation}
            onNewAgentClick={handleNewAgent}
            onSelectAgent={handleSelectAgent}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-hidden relative">

          {/* Normal chat */}
          {currentTab === "chat" && (
            <ChatPage />
          )}

          {/* Create agent */}
          {currentTab === "create-agent" && (
            <NewAgentPage
              onCancel={() => handleNavigate("chat")}
              onAgentCreated={handleAgentCreated}
            />
          )}

          {/* Agent chat */}
          {currentTab === "agent-chat" && selectedAgent && (
            <AgentChatPage
              agent={selectedAgent}
              onBack={() => handleNavigate("chat")}
            />
          )}

          {/* Knowledge base - NO SIDEBAR */}
          {currentTab === "rag" && (
            <KnowledgePage />
          )}

          {/* Settings - NO SIDEBAR */}
          {currentTab === "settings" && (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p>Settings View</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

