FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY backend/requirements.txt backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy application files
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY local_start.sh ./

# Make start script executable
RUN chmod +x local_start.sh

# Create data directory
RUN mkdir -p /app/backend/data

# Expose port
EXPOSE 8081

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=8081
ENV DATA_DIR=/app/backend/data

# Use start script (it will skip venv creation in Docker)
CMD ["./local_start.sh"]
