import { useState, useEffect } from "react";

const API_URL = "http://localhost:8000/api/v1";

export function useFetchCollections() {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollections = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/rag/collections`);

      if (!response.ok) {
        throw new Error(
          `API Gateway returned status: ${response.status}`
        );
      }

      const data = await response.json();

      setCollections(data.collections || []);
    } catch (err) {
      console.error("Failed to fetch collections:", err);

      setError(
        "Failed to load collections. Ensure Docker containers are running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  return {
    collections,
    isLoading,
    error,
    fetchCollections,
  };
}