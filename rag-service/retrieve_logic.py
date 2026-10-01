import json
import urllib.request
from langchain_community.embeddings import OllamaEmbeddings

# Initialize the Ollama embedding model
_embeddings_client = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url="http://host.docker.internal:11434"
)

def search_similar_chunks(
    query: str,
    collection_name: str,
    top_k: int = 3
) -> dict:
    """
    Search Qdrant for the text chunks most semantically similar to a query.

    The function performs the following steps:
    1. Converts the user's query into an embedding vector using Ollama.
    2. Sends that vector directly to Qdrant's REST API.
    3. Retrieves the most similar documents and their payloads.
    4. Extracts the text and source filename from each result.
    5. Combines the retrieved chunks into a single context string.

    Args:
        query: The user's natural-language search query.
        collection_name: Name of the Qdrant collection to search.
        top_k: Maximum number of similar chunks to retrieve.
    
    Returns:
        A dictionary containing:
            - "context": The retrieved text chunks joined together.
            - "source_documents": A list of source filenames.
    """
    try:

        # Convert the user's query into an embedding vector
        query_vector = _embeddings_client.embed_query(query)

        # Build the Qdrant REST API request
        url = f"http://qdrant:6333/collections/{collection_name}/points/search"

        payload = json.dumps({
            "vector": query_vector,
            "limit": top_k,
            "with_payload": True
        }).encode('utf-8')
        
        req = urllib.request.Request(
            url, 
            data=payload, 
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            search_result = json.loads(response.read().decode())

        # Extract the retrieved text and source information
        context_chunks = []
        sources = set()

        for hit in search_result.get("result", []):
            payload_data = hit.get("payload", {})
            if payload_data:
                context_chunks.append(payload_data.get("text", ""))
                sources.add(payload_data.get("filename", "unknown"))

        # Combine the retrieved chunks into one context string
        joined_context = "\n\n---\n\n".join(context_chunks)

        return {
            "context": joined_context,
            "source_documents": list(sources)
        }
        
    except Exception as e:
        print(f"RAG Search Error: {str(e)}")

        # Return an empty context instead of crashing the app if something fails
        return {
            "context": "",
            "source_documents": []
        }