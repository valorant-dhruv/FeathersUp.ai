#!/bin/bash

# Ingestion Service Startup Script

echo "Starting Ingestion Service..."

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -e .

# Set default environment variables if not set
export ENVIRONMENT=${ENVIRONMENT:-development}
export LOG_LEVEL=${LOG_LEVEL:-INFO}
export HOST=${HOST:-0.0.0.0}
export PORT=${PORT:-8000}

echo "Environment: $ENVIRONMENT"
echo "Log Level: $LOG_LEVEL"
echo "Host: $HOST"
echo "Port: $PORT"

# Start the service
echo "Starting service..."
python main.py
