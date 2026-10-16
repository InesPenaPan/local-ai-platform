import { useState } from "react";

const API_BASE_URL = "http://localhost:8000/api/v1";
const UPLOAD_DOCUMENT_ENDPOINT = `${API_BASE_URL}/rag/upload-document`;
const SUCCESS_REDIRECT_DELAY_MS = 1500;

/**
 * useUploadDocument custom hook manages file selection, validation,
 * collection targeting, upload progress states, and API document indexing.
 * 
 * @function useUploadDocument
 * @param {Object} [options={}] - Hook configuration options
 * @param {function(Object): void} [options.onSuccess] - Callback function triggered upon successful indexing
 * @param {function(): void} [options.onComplete] - Callback function triggered after success timeout to navigate back
 * @returns {Object} The document upload controller and state variables
 * @returns {File|null} returns.selectedFile - The currently selected document file
 * @returns {boolean} returns.loading - Flag indicating whether an upload/indexing request is in progress
 * @returns {string} returns.error - Current validation or API error message
 * @returns {string} returns.successMessage - Success message indicating stored chunk count
 * @returns {function(React.ChangeEvent<HTMLInputElement>): void} returns.handleFileChange - Handler for updating selected file
 * @returns {function(string): Promise<boolean>} returns.uploadDocument - Async function to validate and execute the upload request
 * @returns {function(): void} returns.resetState - Resets file, error, and success state to initial values
 */
export default function useUploadDocument({ onSuccess, onComplete } = {}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /**
   * Updates the selected file from file input change events.
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError("");
    }
  };

  /**
   * Resets local file and notification state.
   */
  const resetState = () => {
    setSelectedFile(null);
    setError("");
    setSuccessMessage("");
  };

  /**
   * Validates target collection and file, then uploads to the backend.
   *
   * @async
   * @param {string} targetCollection The target collection identifier
   * @returns {Promise<boolean>} True if indexing succeeded, false otherwise
   */
  const uploadDocument = async (targetCollection) => {
    const trimmedCollection = targetCollection?.trim();

    if (!trimmedCollection) {
      setError("Please select or provide a collection name.");
      return false;
    }

    if (!selectedFile) {
      setError("Please select a document (.pdf or .txt) to ingest.");
      return false;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("collection_name", trimmedCollection);

      const res = await fetch(UPLOAD_DOCUMENT_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`API Gateway returned status: ${res.status}`);
      }

      const data = await res.json();
      setSuccessMessage(
        `Success! ${data.chunks_stored} chunks indexed into "${trimmedCollection}".`
      );

      setTimeout(() => {
        onSuccess?.({
          name: trimmedCollection,
          chunks: data.chunks_stored,
        });
        onComplete?.();
      }, SUCCESS_REDIRECT_DELAY_MS);

      return true;
    } catch (err) {
      console.error("Error uploading document:", err);
      setError("Failed to connect to API Gateway (Port 8000). Make sure Docker containers are running.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedFile,
    loading,
    error,
    successMessage,
    handleFileChange,
    uploadDocument,
    resetState,
  };
}