#!/bin/bash

# One-command script to start the RAG chatbot
# Usage: ./start_chatbot.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}RAG Chatbot Startup Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Check PostgreSQL
echo -e "${YELLOW}Step 1: Checking PostgreSQL...${NC}"
if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${RED}✗ PostgreSQL is not running${NC}"
    echo ""
    echo "Would you like to start PostgreSQL with Docker? (recommended)"
    echo "  1) Yes - Start PostgreSQL in Docker"
    echo "  2) No - I'll start it manually"
    read -p "Choice (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        echo -e "${YELLOW}Starting PostgreSQL with Docker...${NC}"
        docker run -d --name battery-postgres \
          -e POSTGRES_USER=battery_user \
          -e POSTGRES_PASSWORD=battery_pass \
          -e POSTGRES_DB=battery_intelligence \
          -p 5432:5432 \
          pgvector/pgvector:pg16
        
        echo "Waiting for PostgreSQL to start..."
        sleep 10
        
        docker exec battery-postgres psql -U battery_user -d battery_intelligence -c "CREATE EXTENSION IF NOT EXISTS vector;" >/dev/null 2>&1
        echo -e "${GREEN}✓ PostgreSQL started with pgvector${NC}"
    else
        echo ""
        echo "Please start PostgreSQL manually:"
        echo "  sudo systemctl start postgresql"
        echo ""
        echo "Then run this script again."
        exit 1
    fi
fi

# Step 2: Check API keys
echo ""
echo -e "${YELLOW}Step 2: Checking API keys...${NC}"
cd backend

if grep -q "your-openai-api-key-here" .env || grep -q "your-anthropic-api-key-here" .env; then
    echo -e "${RED}✗ API keys not configured${NC}"
    echo ""
    echo "Please edit backend/.env and add your API keys:"
    echo "  1. Get OpenAI key: https://platform.openai.com/api-keys"
    echo "  2. Get Anthropic key: https://console.anthropic.com/account/keys"
    echo "  3. Edit backend/.env and replace the placeholder keys"
    echo ""
    read -p "Press Enter when you've added your API keys..."
    
    # Check again
    if grep -q "your-openai-api-key-here" .env || grep -q "your-anthropic-api-key-here" .env; then
        echo -e "${RED}API keys still not set. Please add them and run this script again.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ API keys configured${NC}"

# Step 3: Verify setup
echo ""
echo -e "${YELLOW}Step 3: Verifying setup...${NC}"
if python verify_setup.py >/dev/null 2>&1; then
    echo -e "${GREEN}✓ All checks passed${NC}"
else
    echo -e "${YELLOW}Running verification (with output)...${NC}"
    python verify_setup.py
    echo ""
    read -p "Press Enter to continue anyway, or Ctrl+C to abort..."
fi

# Step 4: Check if documents are processed
echo ""
echo -e "${YELLOW}Step 4: Checking document embeddings...${NC}"

# Simple check: does document_chunks table have data?
CHUNK_COUNT=$(psql -h localhost -U battery_user -d battery_intelligence -t -c "SELECT COUNT(*) FROM document_chunks;" 2>/dev/null | tr -d ' ' || echo "0")

if [ "$CHUNK_COUNT" = "0" ] || [ -z "$CHUNK_COUNT" ]; then
    echo -e "${YELLOW}⚠ No documents processed yet${NC}"
    echo ""
    echo "Would you like to process documents now? (Required for chatbot to work)"
    echo "This will:"
    echo "  - Read all .md files from the project"
    echo "  - Generate embeddings using OpenAI"
    echo "  - Store in PostgreSQL"
    echo "  - Take ~5-10 minutes"
    echo "  - Cost ~$0.004"
    echo ""
    read -p "Process documents now? (y/n): " process
    
    if [ "$process" = "y" ] || [ "$process" = "Y" ]; then
        echo -e "${YELLOW}Processing documents...${NC}"
        python scripts/process_documents.py
        echo -e "${GREEN}✓ Documents processed${NC}"
    else
        echo -e "${RED}Warning: Chatbot won't work without processed documents!${NC}"
        echo "Run manually later: python backend/scripts/process_documents.py"
    fi
else
    echo -e "${GREEN}✓ Found $CHUNK_COUNT document chunks${NC}"
fi

# Step 5: Start backend
echo ""
echo -e "${YELLOW}Step 5: Starting backend API...${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Backend API starting...${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "API will be available at:"
echo "  - Swagger UI: http://localhost:8000/docs"
echo "  - Health: http://localhost:8000/health"
echo "  - Chat API: http://localhost:8000/api/v1/chat/query"
echo ""
echo "To access the chat widget:"
echo "  1. Open a new terminal"
echo "  2. Run: python -m http.server 8080"
echo "  3. Visit: http://localhost:8080/chat-widget.html"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
