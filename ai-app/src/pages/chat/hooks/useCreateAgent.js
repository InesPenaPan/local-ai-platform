import { useState } from "react";

const API_URL = "http://localhost:8000/api/v1";

const initialFormData = {
  name: "",
  description: "",
  systemPrompt: "",
  model: "llama3.1",
  collection: "none",
  temperature: 0.7,
};

/**
 * useCreateAgent custom hook manages the form state, validation, error handling,
 * and API submission for creating new custom AI assistants.
 * 
 * @function useCreateAgent
 * @param {Object} [options] - Hook configuration options
 * @param {function(Object): void} [options.onAgentCreated] - Callback function triggered upon successfully creating and saving a new agent
 * @returns {Object} The agent creation form controller and state variables
 * @returns {Object} returns.formData - The current state of the form fields
 * @returns {boolean} returns.loading - Flag indicating whether an API request is currently in progress
 * @returns {string|null} returns.error - Error message if the agent creation fails
 * @returns {boolean} returns.successMessage - Flag indicating whether the agent was created successfully
 * @returns {function(React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>): void} returns.handleChange - Event handler to update form input values
 * @returns {function(React.FormEvent<HTMLFormElement>): Promise<void>} returns.handleSubmit - Form submission event handler
 * @returns {function(): Promise<Object|null>} returns.createAgent - Async function to submit agent data to the API gateway
 * @returns {function(): void} returns.resetForm - Resets form state, error status, and success state to initial values
 */
export function useCreateAgent({ onAgentCreated } = {}) {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const parsedValue = name === "temperature" ? parseFloat(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  /**
  * Send agent data to the API
  */
  const createAgent = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(false);

    try {
      const response = await fetch(
        `${API_URL}/agents/create-agent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error creating the agent on the server.");
      }

      const result = await response.json();

      console.log("Agent saved successfully:", result);

      setSuccessMessage(true);

      setFormData(initialFormData);

      if (onAgentCreated) {
        onAgentCreated(result);
      }

      return result;
    } catch (error) {
      console.error("Error creating agent:", error);
      setError(error.message);

      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.systemPrompt || loading) {
      return;
    }

    await createAgent();
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setError(null);
    setSuccessMessage(false);
  };

  return {
    formData,
    loading,
    error,
    successMessage,
    handleChange,
    handleSubmit,
    createAgent,
    resetForm,
  };
}
