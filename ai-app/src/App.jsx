import { useState } from "react";

import Header from "./components/layout/Header";

import Sidebar from "./pages/chat/subcomponents/SideBar";
import ChatPage from "./pages/chat/ChatPage";
import AgentFormPage from "./pages/chat/AgentFormPage";
import AgentChatPage from "./pages/chat/AgentChatPage";
import GuardrailsPage from "./pages/chat/GuardrailsPage";
import KnowledgePage from "./pages/knowledge/KnowledgePage";
import ToolsPage from "./pages/tools/ToolsPage";

/**
 * App component acts as the root application container, managing global navigation tabs,
 * active custom agent states, form editing states, conditional sidebar visibility, and view routing across the platform.
 * 
 * @component
 * @returns {JSX.Element} The rendered root application layout container
 */
export default function App() {
  const [currentTab, setCurrentTab] = useState("chat");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentToEdit, setAgentToEdit] = useState(null); // Holds the agent data when editing an existing agent
  const [activeConversationId, setActiveConversationId] = useState(null);

  // Include agent form states in the sidebar visibility rules
  const showSidebar = [
    "chat",
    "create-agent",
    "edit-agent",
    "agent-chat",
    "guardrails",
  ].includes(currentTab);

  /**
   * Handle navigation between pages and reset states conditionally.
   */
  const handleNavigate = (tab) => {
    setCurrentTab(tab);

    /**
     * Reset selected agent and editing state when returning to normal chat.
     */
    if (tab === "chat") {
      setSelectedAgent(null);
      setAgentToEdit(null);
    }
  };

  /**
   * Start a new conversation and clear active agent/chat parameters.
   */
  const handleNewConversation = () => {
    setSelectedAgent(null);
    setAgentToEdit(null);
    setActiveConversationId(null);
    setCurrentTab("chat");
  };

  /**
   * Open the agent form in creation mode (empty fields).
   */
  const handleNewAgent = () => {
    setSelectedAgent(null);
    setAgentToEdit(null); // Ensure form is empty for a new creation
    setCurrentTab("create-agent");
  };

  /**
   * Open the agent form in edit mode, pre-filling it with the selected agent's data.
   */
  const handleEditAgent = (agent) => {
    setSelectedAgent(null);
    setAgentToEdit(agent); // Pass agent data to populate the form
    setCurrentTab("edit-agent");
  };

  /**
   * Open the selected agent's chat interface.
   */
  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    setAgentToEdit(null);
    setCurrentTab("agent-chat");
  };

  /**
   * Handle successful creation or update of an agent, redirecting to its chat.
   */
  const handleAgentSaved = (agent) => {
    if (agent) {
      setSelectedAgent(agent);
      setAgentToEdit(null);
      setCurrentTab("agent-chat");
    } else {
      setCurrentTab("chat");
    }
  };
  
  /**
   * Handle deleting a conversation and reset view if the active chat was removed.
   */
  const handleDeleteConversation = (conversation) => {
    if (activeConversationId === conversation.id) {
      setActiveConversationId(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0f18] text-white">

      {/* Global application header */}
      <Header currentTab={currentTab} onSelectTab={handleNavigate}/>

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Sidebar navigation container with callbacks connected */}
        {showSidebar && (
          <Sidebar
            onNewConversation={handleNewConversation}
            onNewAgentClick={handleNewAgent}
            onSelectAgent={handleSelectAgent}
            onEditAgent={handleEditAgent} // Converted edit callback
            onSelectConversation={(id) => {
              setActiveConversationId(id);
              setCurrentTab("chat");
            }}
            onDeleteConversation={handleDeleteConversation}
            onGuardrailsClick={() => setCurrentTab("guardrails")}
          />
        )}

        {/* Dynamic page content container */}
        <main className="flex-1 min-w-0 overflow-hidden relative">

          {/* Normal chat view */}
          {currentTab === "chat" && (
            <ChatPage activeConversationId={activeConversationId} />
          )}

          {/* Create or Edit agent form view */}
          {(currentTab === "create-agent" || currentTab === "edit-agent") && (
            <AgentFormPage
              // Force component remounting when switching between create and edit modes to clear stale states
              key={currentTab + (agentToEdit?.name || "new")}
              agentToEdit={agentToEdit} // Null when creating, populated object when editing
              onCancel={() => handleNavigate("chat")}
              onSaved={handleAgentSaved}
            />
          )}

          {/* Selected agent chat view */}
          {currentTab === "agent-chat" && selectedAgent && (
            <AgentChatPage
              agent={selectedAgent}
              onBack={() => handleNavigate("chat")}
            />
          )}
          
          {/* Guardrails view */}
          {currentTab === "guardrails" && (
            <GuardrailsPage />
          )}

          {/* Knowledge base RAG view */}
          {currentTab === "rag" && (
            <KnowledgePage />
          )}

          {/* Tools settings view */}
          {currentTab === "tools" && (
            <ToolsPage />
          )}

        </main>
      </div>
    </div>
  );
}