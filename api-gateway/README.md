# 🌐 API Gateway Service

> High-performance, asynchronous reverse proxy and entry point built with FastAPI to orchestrate traffic, validate client payloads, and route requests to downstream AI microservices.

## 📌 Overview

The **API Gateway** acts as the public-facing facade and edge controller for the Local AI Platform. It decouples client-facing interfaces from private backend microservices, ensuring internal service topology, ports, and networking details remain completely abstracted.

### Key Capabilities
* **Contract Validation:** Enforces strict inbound and outbound schema validation using Pydantic DTOs.
* **Persistent Connection Pooling:** Leverages an asynchronous `httpx.AsyncClient` lifespan pool to avoid per-request TCP handshake overhead.
* **Service Decoupling & Fault Isolation:** Traps downstream network failures (`llm-service` downtime) and maps them to standardized, clean HTTP error responses (e.g., `503 Service Unavailable`).
* **Semantic Routing:** Implements versioned resource-based routes (`/api/v1/chat`) conforming to REST and OpenAPI standards.

## 📁 Directory Structure

```bash
api-gateway/
│
├── README.md           # Gateway architectural and operational documentation
├── main.py             # FastAPI entry point, lifecycle management, and route proxies
├── schemas.py          # Inbound and outbound Pydantic Data Transfer Objects (DTOs)
├── config.py           # Centralized environment configuration and service targets
└── requirements.txt    # Production dependencies
```

## 🚀 Running the Microservice
In your project terminal (with the `venv` activated), start the Uvicorn server on port 8000:
```PowerShell
python -m venv venv
.\venv\Scripts\activate

uvicorn main:app --port 8000 --reload
```

