import { useState } from "react";

import Header from "./components/layout/Header";

import Sidebar from "./pages/chat/subcomponents/SideBar";
import ChatPage from "./pages/chat/ChatPage";
import NewAgentPage from "./pages/chat/NewAgentPage";
import AgentChatPage from "./pages/chat/AgentChatPage";
import KnowledgePage from "./pages/knowledge/KnowledgePage";
import ToolsPage from "./pages/tools/ToolsPage";

/**
 * App component acts as the root application container, managing global navigation tabs,
 * active custom agent states, conditional sidebar visibility, and view routing across the platform.
 * 
 * @component
 * @returns {JSX.Element} The rendered root application layout container
 */
export default function App() {
  const [currentTab, setCurrentTab] = useState("chat");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const showSidebar = [
    "chat",
    "create-agent",
    "agent-chat",
  ].includes(currentTab);

  /**
  * Handle navigation between pages
  */
  const handleNavigate = (tab) => {
    setCurrentTab(tab);

    /**
    * Reset selected agent when returning to normal chat
    */
    if (tab === "chat") {
      setSelectedAgent(null);
    }
  };

  /**
  * Start a new conversation
  */
  const handleNewConversation = () => {
    setSelectedAgent(null);
    setActiveConversationId(null);
    setCurrentTab("chat");
  };

  /**
  * Open the create-agent page
  */
  const handleNewAgent = () => {
    setSelectedAgent(null);
    setCurrentTab("create-agent");
  };

  /**
  * Open the selected agent's chat
  */
  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    setCurrentTab("agent-chat");
  };

  /**
  * Handle a newly created agent
  */
  const handleAgentCreated = (agent) => {
    if (agent) {
      setSelectedAgent(agent);
      setCurrentTab("agent-chat");
    } else {
      setCurrentTab("chat");
    }
  };
  
  /**
  * Handle deleting a conversation
  */
  const handleDeleteConversation = (conversation) => {
    if (activeConversationId === conversation.id) {
      setActiveConversationId(null); // Limpia la pantalla si borras el chat actual
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0f18] text-white">

      <Header currentTab={currentTab} onSelectTab={handleNavigate}/>

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Sidebar only for chat/agent pages */}
        {showSidebar && (
          <Sidebar
            onNewConversation={handleNewConversation}
            onNewAgentClick={handleNewAgent}
            onSelectAgent={handleSelectAgent}
            onSelectConversation={(id) => {
              setActiveConversationId(id);
              setCurrentTab("chat");
            }}
            onDeleteConversation={handleDeleteConversation}
          />
        )}

        {/* Current page content */}
        <main className="flex-1 min-w-0 overflow-hidden relative">

          {/* Normal chat */}
          {currentTab === "chat" && (
            <ChatPage activeConversationId={activeConversationId} />
          )}

          {/* Create agent */}
          {currentTab === "create-agent" && (
            <NewAgentPage
              onCancel={() => handleNavigate("chat")}
              onAgentCreated={handleAgentCreated}
            />
          )}

          {/* Selected agent chat */}
          {currentTab === "agent-chat" && selectedAgent && (
            <AgentChatPage
              agent={selectedAgent}
              onBack={() => handleNavigate("chat")}
            />
          )}

          {/* Knowledge base */}
          {currentTab === "rag" && (
            <KnowledgePage />
          )}

          {/* Settings */}
          {currentTab === "tools" && (
            <ToolsPage />
          )}

        </main>
      </div>
    </div>
  );
}

