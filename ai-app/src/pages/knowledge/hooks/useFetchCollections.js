import { useState, useEffect } from "react";

const API_URL = "http://localhost:8000/api/v1";

/**
 * useFetchCollections custom hook manages fetching, loading states, and error handling
 * for vector collections from the backend RAG API endpoint.
 * 
 * @function useFetchCollections
 * @returns {Object} The collection fetching controller and state variables
 * @returns {Array<Object>} returns.collections - The list of retrieved vector collections
 * @returns {boolean} returns.isLoading - Flag indicating whether the collections fetch request is in progress
 * @returns {string|null} returns.error - Error message if fetching collections fails
 * @returns {function(): Promise<void>} returns.fetchCollections - Async function to trigger fetching collections from the API gateway
 */
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
        throw new Error(`API Gateway returned status: ${response.status}`);
      }

      const data = await response.json();

      setCollections(data.collections || []);
    } catch (err) {
      console.error("Failed to fetch collections:", err);
      setError("Failed to load collections. Ensure Docker containers are running.");
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