FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing pyc files and enable unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies if required (e.g., build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application source code
COPY . .

# Expose port 8002 for the FastAPI application
EXPOSE 8002

# Command to start the FastAPI server on port 8002 with auto-reload
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002", "--reload"]