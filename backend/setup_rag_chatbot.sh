#!/bin/bash

# RAG Chatbot Setup Script
# This script helps set up the RAG chatbot for the US Battery Industry Intelligence Platform

set -e

echo "====================================="
echo "RAG Chatbot Setup"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the backend directory
if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}Error: Please run this script from the backend directory${NC}"
    exit 1
fi

echo "Step 1: Checking Python dependencies..."
if python3 -c "import anthropic; import openai; import pgvector; import fastapi" 2>/dev/null; then
    echo -e "${GREEN}✓ Python dependencies are installed${NC}"
else
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    pip install -q -r requirements.txt
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

echo ""
echo "Step 2: Checking .env file..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    
    # Check if API keys are set
    if grep -q "your-openai-api-key-here" .env; then
        echo -e "${YELLOW}⚠ OpenAI API key not set in .env file${NC}"
        echo "  Please edit backend/.env and add your OpenAI API key"
    fi
    
    if grep -q "your-anthropic-api-key-here" .env; then
        echo -e "${YELLOW}⚠ Anthropic API key not set in .env file${NC}"
        echo "  Please edit backend/.env and add your Anthropic API key"
    fi
else
    echo -e "${RED}✗ .env file missing${NC}"
    echo "  Creating .env file from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}  Please edit backend/.env and add your API keys${NC}"
fi

echo ""
echo "Step 3: Checking PostgreSQL..."
if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
    
    # Check if database exists
    if psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw battery_intelligence 2>/dev/null; then
        echo -e "${GREEN}✓ Database 'battery_intelligence' exists${NC}"
    else
        echo -e "${YELLOW}Creating database...${NC}"
        echo "Please run the following commands:"
        echo ""
        echo "  sudo -u postgres createdb battery_intelligence"
        echo "  sudo -u postgres psql battery_intelligence -c \"CREATE EXTENSION vector;\""
        echo "  sudo -u postgres psql -c \"CREATE USER battery_user WITH PASSWORD 'battery_pass';\""
        echo "  sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE battery_intelligence TO battery_user;\""
        echo ""
    fi
else
    echo -e "${RED}✗ PostgreSQL is not running${NC}"
    echo "  Please start PostgreSQL:"
    echo ""
    echo "  sudo systemctl start postgresql"
    echo "  # or"
    echo "  sudo service postgresql start"
    echo ""
fi

echo ""
echo "====================================="
echo "Setup Instructions"
echo "====================================="
echo ""
echo "To complete the RAG chatbot setup:"
echo ""
echo "1. Start PostgreSQL (if not running):"
echo "   sudo systemctl start postgresql"
echo ""
echo "2. Create database and user:"
echo "   sudo -u postgres createdb battery_intelligence"
echo "   sudo -u postgres psql battery_intelligence -c \"CREATE EXTENSION vector;\""
echo "   sudo -u postgres psql -c \"CREATE USER battery_user WITH PASSWORD 'battery_pass';\""
echo "   sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE battery_intelligence TO battery_user;\""
echo ""
echo "3. Add your API keys to backend/.env:"
echo "   - OPENAI_API_KEY=your_actual_openai_key"
echo "   - ANTHROPIC_API_KEY=your_actual_anthropic_key"
echo ""
echo "4. Process documents and generate embeddings:"
echo "   cd backend"
echo "   python scripts/process_documents.py"
echo ""
echo "5. Start the backend API:"
echo "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "6. Open the chat widget:"
echo "   Open chat-widget.html in your browser"
echo "   Or serve it: python -m http.server 8080 (from project root)"
echo ""
echo "====================================="
