#!/bin/bash

###############################################################################
# RAG System Setup Script
# This script sets up and initializes the complete RAG system for the
# US Battery Industry Intelligence Platform
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0.31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}US Battery Industry RAG System Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Step 1: Check for .env file
echo -e "${YELLOW}[1/7] Checking environment configuration...${NC}"
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo -e "${RED}ERROR: .env file not found${NC}"
    echo ""
    echo "Please create a .env file with your API keys:"
    echo "  cp $SCRIPT_DIR/.env.example $SCRIPT_DIR/.env"
    echo "  nano $SCRIPT_DIR/.env"
    echo ""
    echo "Required API keys:"
    echo "  - OPENAI_API_KEY (for embeddings)"
    echo "  - ANTHROPIC_API_KEY (for chat responses)"
    echo ""
    exit 1
fi

# Check for required API keys
source "$SCRIPT_DIR/.env"

if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your-openai-api-key-here" ]; then
    echo -e "${RED}ERROR: OPENAI_API_KEY not configured in .env${NC}"
    exit 1
fi

if [ -z "$ANTHROPIC_API_KEY" ] || [ "$ANTHROPIC_API_KEY" = "your-anthropic-api-key-here" ]; then
    echo -e "${RED}ERROR: ANTHROPIC_API_KEY not configured in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment configuration found${NC}"
echo ""

# Step 2: Check Python dependencies
echo -e "${YELLOW}[2/7] Checking Python dependencies...${NC}"
cd "$SCRIPT_DIR"

if ! python3 -c "import sqlalchemy, asyncpg, pgvector, openai, anthropic" 2>/dev/null; then
    echo "Installing core dependencies..."
    pip install sqlalchemy asyncpg pgvector openai anthropic pydantic python-dotenv markdown beautifulsoup4 tiktoken
fi

echo -e "${GREEN}✓ Python dependencies installed${NC}"
echo ""

# Step 3: Start PostgreSQL database
echo -e "${YELLOW}[3/7] Starting PostgreSQL database...${NC}"

# Check if Docker is available
if command -v docker &> /dev/null; then
    # Check if container already exists
    if docker ps -a --format '{{.Names}}' | grep -q "^battery-postgres$"; then
        echo "Starting existing PostgreSQL container..."
        docker start battery-postgres || true
    else
        echo "Creating new PostgreSQL container..."
        docker run -d \
            --name battery-postgres \
            -e POSTGRES_USER=battery_user \
            -e POSTGRES_PASSWORD=battery_pass \
            -e POSTGRES_DB=battery_intelligence \
            -p 5432:5432 \
            ankane/pgvector:latest
    fi

    # Wait for PostgreSQL to be ready
    echo "Waiting for PostgreSQL to be ready..."
    for i in {1..30}; do
        if pg_isready -h localhost -p 5432 &>/dev/null; then
            echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
            break
        fi
        sleep 1
        if [ $i -eq 30 ]; then
            echo -e "${RED}ERROR: PostgreSQL did not start in time${NC}"
            exit 1
        fi
    done
else
    echo -e "${YELLOW}Docker not found. Please ensure PostgreSQL with pgvector is running manually.${NC}"
    echo "You can start it with: docker run -d -p 5432:5432 ankane/pgvector:latest"
fi

echo ""

# Step 4: Initialize database schema
echo -e "${YELLOW}[4/7] Initializing database schema...${NC}"
cd "$SCRIPT_DIR"

python3 << EOF
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.database import Base
from app.config import settings

async def init_db():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)

    async with engine.begin() as conn:
        # Enable pgvector extension
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

    await engine.dispose()
    print("Database schema created successfully")

asyncio.run(init_db())
EOF

echo -e "${GREEN}✓ Database initialized${NC}"
echo ""

# Step 5: Process research documents
echo -e "${YELLOW}[5/7] Processing research documents for RAG...${NC}"
echo "This will:"
echo "  - Process ALL_62_COMPANIES_COMPLETE_RESEARCH.md"
echo "  - Generate embeddings using OpenAI"
echo "  - Store 450+ chunks in vector database"
echo ""

cd "$SCRIPT_DIR"
python3 scripts/process_documents.py

echo -e "${GREEN}✓ Documents processed${NC}"
echo ""

# Step 6: Verify data
echo -e "${YELLOW}[6/7] Verifying processed data...${NC}"
cd "$SCRIPT_DIR"

python3 << EOF
import asyncio
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import settings
from app.models.document import DocumentMetadata, DocumentChunk

async def verify():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as session:
        # Check document metadata
        result = await session.execute(select(DocumentMetadata))
        docs = result.scalars().all()
        print(f"✓ Documents processed: {len(docs)}")

        for doc in docs:
            print(f"  - {doc.file_name}: {doc.total_chunks} chunks, Status: {doc.processing_status}")

        # Check document chunks
        result = await session.execute(select(DocumentChunk))
        chunks = result.scalars().all()
        print(f"✓ Total chunks in database: {len(chunks)}")

        # Check vector dimension
        result = await session.execute(
            text("SELECT vector_dims(embedding) as dims FROM document_chunks LIMIT 1")
        )
        dims = result.scalar()
        print(f"✓ Vector dimensions: {dims}")

    await engine.dispose()

asyncio.run(verify())
EOF

echo -e "${GREEN}✓ Data verification complete${NC}"
echo ""

# Step 7: Test RAG queries
echo -e "${YELLOW}[7/7] Testing RAG system...${NC}"
cd "$SCRIPT_DIR"

python3 << EOF
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import settings
from app.services.rag_service import RAGService
from app.services.embedding_service import create_embedding_service

async def test_rag():
    # Initialize services
    embedding_service = create_embedding_service(
        provider_type="openai",
        api_key=settings.OPENAI_API_KEY,
        model=settings.EMBEDDING_MODEL,
        dimensions=settings.EMBEDDING_DIMENSIONS
    )

    rag_service = RAGService(
        embedding_service=embedding_service,
        anthropic_api_key=settings.ANTHROPIC_API_KEY,
        model=settings.ANTHROPIC_MODEL
    )

    # Create database session
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as session:
        # Test query
        print("Testing query: 'What is QuantumScape's cash runway?'")
        result = await rag_service.query(
            query="What is QuantumScape's cash runway?",
            db=session
        )

        print(f"\n✓ Retrieved {result['retrieved_chunks']} relevant chunks")
        print(f"✓ Confidence score: {result['confidence_score']}")
        print(f"\nResponse preview:")
        print(result['response'][:200] + "...")

    await engine.dispose()

asyncio.run(test_rag())
EOF

echo -e "${GREEN}✓ RAG system test complete${NC}"
echo ""

# Final summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ RAG System Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Start the backend API server:"
echo "     cd $SCRIPT_DIR && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "  2. Test the RAG API:"
echo "     curl -X POST http://localhost:8000/api/v1/rag/query \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"query\": \"What is QuantumScape'\"'\"'s cash runway?\"}'"
echo ""
echo "  3. Try asking about any of the 62 US battery companies!"
echo ""
