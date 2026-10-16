# 📚 RAG Service: Local Vector Retrieval & Document Processing

> Built with **FastAPI**, this microservice acts as the abstraction layer to process documents, extract textual data, generate local embeddings via **Ollama** (`nomic-embed-text`), and persist and query vector representations using the **Qdrant** vector database.

The service provides a local RAG (Retrieval-Augmented Generation) infrastructure layer that can:

* Ingest and parse documents (`.pdf`, `.docx`, `.doc`, `.txt`).
* Split continuous text into overlapping chunks using recursive character splitting.
* Generate dense vector embeddings locally via Ollama.
* Provision collections and store vector payloads and metadata in Qdrant.
* Execute semantic similarity searches against indexed document collections.
* Provide monitoring and health checks for vector database connectivity.


## 📋 Prerequisites

| Requirement | Details & Description |
| :--- | :--- |
| **Python** | Version 3.11 or 3.12 (⚠️ *Important: Avoid Python 3.14 or unverified experimental builds to prevent compilation issues with Pydantic*). |
| **Ollama** | [Download Ollama](https://ollama.com/) and ensure the background daemon is running (`http://localhost:11434` or `http://host.docker.internal:11434`). |
| **Embedding Model** | Pull and run the local embedding model before starting the service: `ollama run nomic-embed-text` |
| **Qdrant** | Ensure an active Qdrant vector database instance is accessible on port `6333`. |


## 📖 API Documentation & Usage

When the service starts, an interactive OpenAPI/Swagger specification interface is served directly from the application.

Navigate to http://localhost:8002/docs in your browser to inspect schemas and execute test requests against the endpoints.

### Endpoint 1: `POST /health`

Verifies the service status, listening port, configured embedding model, and connection state with the Qdrant vector database.

**Response Playload**
```JSON
{
  "status": "healthy",
  "port": 8002,
  "embedding_model": "nomic-embed-text",
  "vector_db_connected": true
}
```

### Endpoint 2: `POST /embeddings`

Generates a dense vector embedding from plain text using the local `nomic-embed-text` model.

**Request Playload (`TextEmbeddingRequest`)**
```JSON
{
  "text": "Enterprise artificial intelligence architecture"
}
```

**Response Playload (`EmbeddingResponse`)**
```JSON
{
  "text": "Enterprise artificial intelligence architecture",
  "dimension": 768,
  "preview": [0.1234, -0.5678, 0.9101, -0.1121, 0.3141]
}
```

### Endpoint 3: `POST /upload-document`

Uploads a document, extracts text, chunks content, generates embeddings, and indexes them into the specified Qdrant collection.

Supported formats:`.pdf`, `.doc`, `.docx`, `txt`

**PowerShell Test Example:**
```PowerShell
$filePath = "C:\path\to\your\document.pdf"
$form = @{ file = Get-Item -Path$filePath }
Invoke-RestMethod -Uri "http://localhost:8002/upload-document" -Method Post -Form $form
```
**Response Playload**
```JSON
{
  "filename": "document.pdf",
  "collection_used": "corporate_documents",
  "extracted_characters": 15243,
  "total_chunks": 19,
  "chunks_stored": 19,
  "message": "Document successfully processed, chunked, and stored in Qdrant."
}
```

### Endpoint 4: `GET /collections`

Returns detailed statistics and status for all collections currently available in the Qdrant instance.

**Response Playload**
```JSON
{
  "collections": [
    {
      "name": "corporate_documents",
      "status": "GREEN",
      "vectors_count": 124,
      "indexed_vectors_count": 124,
      "vector_size": 768,
      "document_count": 8
    }
  ]
}
```

### Endpoint 5: `POST /search`

Executes a semantic similarity search against a specified Qdrant collection. The input query is embedded via Ollama, matched against indexed points in Qdrant, and returns the top matching text chunks.

**Request Playload (`SearchRequest`)**
```JSON
{ 
  "query": "What is the company's AI architecture?", 
  "collection_name": "corporate_documents", 
  "top_k": 3 
}
```

**Response Playload (`SearchResponse`)**
```JSON
{ 
  "context": "The company uses a distributed AI architecture...", 
  "source_documents": [ 
    "architecture.pdf", 
    "technical-overview.pdf" 
  ] 
}
```
## 📦 Main Dependencies

The service relies on the following main components:

| Component | Purpose |
| :--- | :--- |
| **FastAPI** | High-performance asynchronous API framework and route definitions. |
| **Uvicorn** | ASGI web server handling HTTP requests and runtime concurrency. |
| **Qdrant Client** | Vector database client managing collection lifecycle, upserts, and payload filtering. |
| **LangChain** | Embeddings client interfaces and recursive text-splitting utilities. |
| **Pydantic** | Document text extraction libraries for PDF and Word files. |
| **PyPDF / Python-Docx** | Payload parsing, type validation, and data serialization (DTOs). |

## 📁 Directory Structure

```bash
rag-service/
│
├── Dockerfile          # Multi-stage image build definition for containerized deployment
├── main.py             # FastAPI entry point, multipart upload endpoints, and retrieval routes
├── models.py           # Pydantic schemas (DTOs) for inbound and outbound request validation
├── README.md           # Microservice documentation, API examples, and usage instructions
├── requirements.txt    # Frozen production dependencies
├── retrieve_logic.py   # Embedding conversion and semantic similarity search against Qdrant
└── store_logic.py      # Document parsing, chunking, collection creation, upsert, and health checks
```