import { useState } from "react";

const API_BASE_URL = "http://localhost:8000/api/v1";

/**
 * useDeleteAgent custom hook manages confirmation, loading state, error handling,
 * and API deletion requests for removing existing AI assistants.
 * 
 * @function useDeleteAgent
 * @param {function(Object): void} [onDeleteSuccess] Callback function triggered upon successfully deleting an agent
 * @returns {Object} The agent deletion controller and state variables
 * @returns {function(Object): Promise<boolean>} returns.deleteAgent - Async function that prompts for confirmation and executes the deletion request against the API gateway
 * @returns {boolean} returns.isDeleting - Flag indicating whether a delete API request is currently in progress
 * @returns {string|null} returns.deleteError - Error message if the agent deletion fails
 */
export default function useDeleteAgent(onDeleteSuccess) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  /**
   * Prompts the user for confirmation and deletes the agent via the API gateway.
   *
   * @async
   * @param {Object} agent The agent object to delete
   * @param {number|string} agent.id The unique identifier of the agent
   * @param {string} [agent.name] The display name of the agent
   * @returns {Promise<boolean>} Resolves to true if deletion succeeded, false otherwise
   */
  const deleteAgent = async (agent) => {
    if (!agent?.id) {
      console.error("HOOK - Agent ID is missing:", agent);
      return false;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the agent "${agent.name || "Unnamed agent"}"?`
    );
    if (!confirmed) {
      return false;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/agents/${agent.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete agent (${response.status})`);
      }

      onDeleteSuccess?.(agent);
      return true;
    } catch (err) {
      console.error("Error in delete agent request:", err);
      setDeleteError(err.message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteAgent, isDeleting, deleteError };
}