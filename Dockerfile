FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY backend/requirements.txt backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY start.sh ./

# Install system dependencies if needed
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Create data directory
RUN mkdir -p backend/data

# Expose port
EXPOSE 8081

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=8081

# Start the application
CMD ["python", "backend/main.py"]
