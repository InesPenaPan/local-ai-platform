# 📚 RAG Service: Local Vector Retrieval & Document Processing

> This microservice is part of an agent-based local conversational architecture. Built with **FastAPI**, it acts as the abstraction layer to process documents, generate local embeddings using **Ollama** (`nomic-embed-text`), and interact with the **Qdrant** vector database.

The service provides a local RAG (Retrieval-Augmented Generation) infrastructure layer that can:

* Upload and process documents
* Extract text from PDF and Word documents
* Split documents into overlapping chunks
* Generate local embeddings using 
* Store embeddings and metadata in Qdrant
* Perform semantic similarity searches


## 📋 Prerequisites

Before running this microservice, ensure you have the following installed and configured:

| Requirement | Details & Commands |
| :--- | :--- |
| **Python** | Version 3.11 or 3.12 (⚠️ *Important: Avoid experimental versions to prevent compilation errors with Pydantic*). |
| **Ollama** | [Download Ollama](https://ollama.com/) and ensure it runs in the background (`http://localhost:11434`). |
| **Embedding Model** | You must download the required local embedding model: <br>`ollama run nomic-embed-text` |



## 🚀 Running the Microservice

In your project terminal (with the `venv` activated), start the Uvicorn server on port 8001:
```PowerShell
python -m venv venv
.\venv\Scripts\activate

uvicorn main:app --port 8002 --reload
```

## 📖 API Documentation & Usage

Once the server is running, the API is strictly available locally. You can access the auto-generated endpoint documentation directly on your machine.

Navigate to http://localhost:8002/docs in your browser to interact with the API.


### Endpoint 1: `POST /health`

Verifies the health status of the service, the active port, the configured embedding model, and connectivity with the Qdrant vector database.

### Endpoint 2: `POST /embeddings`

Generates an embedding vector from plain text using the local Ollama `nomic-embed-text` model.

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

Uploads a document and adds it to the RAG knowledge base.

The API currently accepts:

* `.pdf`
* `.doc`
* `.docx`

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

Returns information about the Qdrant collections currently available to the application.

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

Performs semantic similarity search against a Qdrant collection.

The user's query is converted into an embedding using Ollama. Qdrant then compares that vector with the stored document vectors and returns the most semantically similar chunks.

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
| **FastAPI** | HTTP API framework |
| **Uvicorn** | ASGI application server |
| **Ollama** | Local embedding generation |
| **Qdrant** | Vector database and similarity search |
| **LangChain** | Embedding and text-splitting utilities |
| **Pydantic** | Request/response validation |

## 📁 Directory Structure

```bash
rag-service/
│
├── main.py              # FastAPI application controller and HTTP routes
├── models.py            # Pydantic schemas (Contracts and DTOs)
├── rag_logic.py         # Core logic (Ollama embeddings, Qdrant, and PDF/Word parsing)
├── Dockerfile           # Docker containerization configuration
├── requirements.txt     # Project dependencies (FastAPI, LangChain, Qdrant, pypdf, python-docx)
└── store_logic.py       # Embeddings, document parsing, chunking, Qdrant storage, collection management, and health checks
```