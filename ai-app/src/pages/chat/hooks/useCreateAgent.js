import { useState } from "react";

// ============================================================================
// useCreateAgent
// ----------------------------------------------------------------------------
// Custom hook that manages the create-agent form state, agent creation,
// loading state, success/error messages, and form reset.
// ============================================================================

const API_URL = "http://localhost:8000/api/v1";

const initialFormData = {
  name: "",
  description: "",
  systemPrompt: "",
  model: "llama3.1",
  collection: "none",
  temperature: 0.7,
};

export function useCreateAgent({ onAgentCreated } = {}) {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const parsedValue =
      name === "temperature" ? parseFloat(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

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

        throw new Error(
          errorData.detail ||
            "Error creating the agent on the server."
        );
      }

      const result = await response.json();

      console.log("Agent saved successfully:", result);

      setSuccessMessage(true);

      // Reset form after successful creation
      setFormData(initialFormData);

      // Notify parent component
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
