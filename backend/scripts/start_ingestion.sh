#!/bin/bash

# Simple script to start research data ingestion
# Usage: ./start_ingestion.sh [mode]
# Modes: once, continuous (default)

set -e

cd "$(dirname "$0")/.."

MODE=${1:-continuous}

echo "=========================================="
echo "Battery Research Data Ingestion"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo ""
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and configure:"
    echo "  - Database connection (if not using defaults)"
    echo "  - Embedding provider (local, openai, gemini, cohere)"
    echo "  - API keys (if using cloud providers)"
    echo ""
    read -p "Press Enter to continue after editing .env, or Ctrl+C to exit..."
fi

# Check if dependencies are installed
echo "Checking dependencies..."
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
fi

echo "✓ Dependencies ready"
echo ""

# Check database connection
echo "Checking database connection..."
source .env
if ! PGPASSWORD=${POSTGRES_PASSWORD} psql -h ${POSTGRES_HOST:-localhost} -p ${POSTGRES_PORT:-5432} -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT 1" > /dev/null 2>&1; then
    echo "⚠️  Database connection failed!"
    echo ""
    echo "Running database setup..."
    if [ -f scripts/setup_database.sh ]; then
        bash scripts/setup_database.sh
    else
        echo "❌ setup_database.sh not found"
        exit 1
    fi
else
    echo "✓ Database connection successful"
fi

echo ""
echo "=========================================="

if [ "$MODE" == "once" ]; then
    echo "Running one-time ingestion..."
    echo "=========================================="
    echo ""
    python3 scripts/process_documents.py
    echo ""
    echo "✓ Ingestion completed!"
elif [ "$MODE" == "continuous" ]; then
    echo "Starting continuous ingestion monitor..."
    echo "=========================================="
    echo ""
    echo "Press Ctrl+C to stop"
    echo ""
    python3 scripts/continuous_ingest.py
else
    echo "❌ Invalid mode: $MODE"
    echo "Usage: $0 [once|continuous]"
    exit 1
fi
