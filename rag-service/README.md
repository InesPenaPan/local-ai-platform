# 📚 RAG Service: Local Vector Retrieval & Document Processing

> This microservice is part of an agent-based local conversational architecture. Built with **FastAPI**, it acts as the abstraction layer to process documents, generate local embeddings using **Ollama** (`nomic-embed-text`), and interact with the **Qdrant** vector database.

## 📋 Prerequisites

Before running this microservice, ensure you have the following installed and configured:

| Requirement | Details & Commands |
| :--- | :--- |
| **Python** | Version 3.11 or 3.12 (⚠️ *Important: Avoid experimental versions to prevent compilation errors with Pydantic*). |
| **Ollama** | [Download Ollama](https://ollama.com/) and ensure it runs in the background (`http://localhost:11434`). |
| **Embedding Model** | You must download the required local embedding model: <br>`ollama run nomic-embed-text` |

## 📁 Directory Structure

```bash
rag-service/
│
├── main.py              # FastAPI application controller and HTTP routes
├── models.py            # Pydantic schemas (Contracts and DTOs)
├── rag_logic.py         # Core logic (Ollama embeddings, Qdrant, and PDF/Word parsing)[cite: 4]
├── Dockerfile           # Docker containerization configuration
├── requirements.txt     # Project dependencies (FastAPI, LangChain, Qdrant, pypdf, python-docx)[cite: 5]
└── venv/                # Isolated Python virtual environment (ignored in git)[cite: 1]
```

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


### Endpoint 1 : `POST /health`

Verifies the health status of the service, the active port, the configured embedding model, and connectivity with the Qdrant vector database.

### Endpoint 2 : `POST /embeddings`

Receives plain text in JSON format, generates its feature vector using the local Ollama model, and returns metadata along with a preview of the vector. 

**Request Playload (`TextEmbeddingRequest`)**
```JSON
{
  "text": "Enterprise artificial intelligence architecture"
}
```

**Response Playload (`ChatResponse`)**
```JSON
{
  "text": "Enterprise artificial intelligence architecture",
  "dimension": 768,
  "preview": [0.1234, -0.5678, 0.9101, -0.1121, 0.3141]
}
```

### Endpoint 3 : `POST /upload-document`

Allows you to attach a corporate document in **PDF** or **Word** (`.docx`) format. The system automatically extracts the text, processes chunks, and generates 
the corresponding vectors to feed the RAG knowledge base.

**PowerShell Test Example:**
```PowerShell
$filePath = "C:\path\to\your\document.pdf"
$form = @{ file = Get-Item -Path$filePath }
Invoke-RestMethod -Uri "http://localhost:8002/upload-document" -Method Post -Form $form
```