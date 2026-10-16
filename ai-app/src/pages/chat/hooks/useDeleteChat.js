import { useState } from "react";

const API_BASE_URL = "http://localhost:8000/api/v1";

/**
 * useDeleteConversation custom hook manages confirmation prompts, loading states,
 * error handling, and API deletion requests for removing stored chat conversations.
 * 
 * @function useDeleteConversation
 * @param {function(Object): void} [onDeleteSuccess] Callback function triggered upon successfully deleting a conversation
 * @returns {Object} The conversation deletion controller and state variables
 * @returns {function(Object): Promise<boolean>} returns.deleteConversation - Async function that prompts for confirmation and executes the deletion request against the API gateway
 * @returns {boolean} returns.isDeleting - Flag indicating whether a delete API request is currently in progress
 * @returns {string|null} returns.deleteError - Error message if the conversation deletion fails
 */
export default function useDeleteConversation(onDeleteSuccess) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  /**
   * Prompts user for confirmation and deletes the conversation via the API gateway.
   *
   * @async
   * @param {Object} conversation The conversation object to delete
   * @param {number|string} conversation.id The unique identifier of the conversation
   * @returns {Promise<boolean>} Resolves to true if deletion succeeded, false otherwise
   */
  const deleteConversation = async (conversation) => {
    if (!conversation?.id) {
      console.error("HOOK - Conversation ID is missing:", conversation);
      return false;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?"
    );
    if (!confirmed) {
      return false;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/history/conversations/${conversation.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete conversation (${response.status})`);
      }

      onDeleteSuccess?.(conversation);
      return true;
    } catch (err) {
      console.error("Error in delete conversation request:", err);
      setDeleteError(err.message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteConversation, isDeleting, deleteError };
}