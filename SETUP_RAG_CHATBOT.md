# RAG Chatbot Setup Guide

This guide will help you set up and run the RAG chatbot for the US Battery Industry Intelligence Platform.

## Quick Start

```bash
# 1. Install dependencies
cd backend
pip install -r requirements.txt

# 2. Set up environment
cp .env.example .env
# Edit .env and add your API keys (see below)

# 3. Start PostgreSQL and create database
sudo systemctl start postgresql
sudo -u postgres createdb battery_intelligence
sudo -u postgres psql battery_intelligence -c "CREATE EXTENSION vector;"
sudo -u postgres psql -c "CREATE USER battery_user WITH PASSWORD 'battery_pass';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE battery_intelligence TO battery_user;"

# 4. Verify setup
python verify_setup.py

# 5. Process documents (generate embeddings)
python scripts/process_documents.py

# 6. Start backend API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 7. In another terminal, open the chat widget
cd ..
python -m http.server 8080
# Then open http://localhost:8080/chat-widget.html
```

## Detailed Setup Instructions

### 1. Prerequisites

- **Python 3.11+** installed
- **PostgreSQL 14+** installed with pgvector extension
- **API Keys**:
  - OpenAI API key (for embeddings)
  - Anthropic API key (for LLM responses)

### 2. Install PostgreSQL with pgvector

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql-16 postgresql-16-pgvector
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS (Homebrew):
```bash
brew install postgresql@16 pgvector
brew services start postgresql@16
```

### 3. Create Database

```bash
# Create database
sudo -u postgres createdb battery_intelligence

# Enable pgvector extension
sudo -u postgres psql battery_intelligence -c "CREATE EXTENSION vector;"

# Create user and grant permissions
sudo -u postgres psql -c "CREATE USER battery_user WITH PASSWORD 'battery_pass';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE battery_intelligence TO battery_user;"
sudo -u postgres psql battery_intelligence -c "GRANT ALL ON SCHEMA public TO battery_user;"
```

### 4. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 5. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

**Required API Keys:**

Add your actual API keys to `.env`:

```bash
# OpenAI (for embeddings)
OPENAI_API_KEY=sk-...your-actual-key...

# Anthropic (for LLM responses)
ANTHROPIC_API_KEY=sk-ant-...your-actual-key...
```

**Get API Keys:**
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/account/keys

### 6. Verify Setup

Run the verification script to check if everything is configured correctly:

```bash
cd backend
python verify_setup.py
```

This will check:
- ✓ Python dependencies installed
- ✓ .env file configured
- ✓ Database connection working
- ✓ pgvector extension installed

### 7. Process Documents

Generate embeddings for all research documents:

```bash
cd backend
python scripts/process_documents.py
```

This will:
1. Read all `.md` files from the project root
2. Split them into chunks (1000 chars with 200 char overlap)
3. Generate embeddings using OpenAI text-embedding-3-small
4. Store in PostgreSQL with pgvector indices

**Expected processing time:** ~5-10 minutes for 15 documents  
**Cost:** ~$0.004 for embeddings

### 8. Start the Backend API

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

### 9. Open the Chat Widget

In a new terminal:

```bash
# From project root
python -m http.server 8080
```

Then open in your browser:
- **Chat Widget:** http://localhost:8080/chat-widget.html

## Troubleshooting

### PostgreSQL Connection Issues

**Error:** `Connection refused`

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check port
sudo netstat -nlp | grep 5432
```

### pgvector Extension Not Found

```bash
# Install pgvector
sudo apt install postgresql-16-pgvector

# Enable in database
sudo -u postgres psql battery_intelligence -c "CREATE EXTENSION vector;"
```

### OpenAI Rate Limit Errors

Reduce batch size in `scripts/process_documents.py`:

```python
batch_size = 25  # Default: 50
```

### Low Confidence Scores

Adjust similarity threshold in `.env`:

```bash
VECTOR_SIMILARITY_THRESHOLD=0.6  # Lower = more results
```

### Database Permission Errors

```bash
# Grant all permissions
sudo -u postgres psql battery_intelligence -c "GRANT ALL ON SCHEMA public TO battery_user;"
sudo -u postgres psql battery_intelligence -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO battery_user;"
```

## API Endpoints

### Chat Query

```bash
curl -X POST http://localhost:8000/api/v1/chat/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the top battery manufacturers in the US?",
    "session_id": "test-session-123",
    "include_sources": true
  }'
```

### Conversation History

```bash
curl http://localhost:8000/api/v1/chat/history/test-session-123
```

### Health Check

```bash
curl http://localhost:8000/api/v1/chat/health
```

## Architecture

```
User Query → Chat Widget → FastAPI Backend → RAG Service
                                              ↓
                                    1. Embedding (OpenAI)
                                    2. Vector Search (pgvector)
                                    3. LLM Generation (Anthropic)
                                              ↓
                            Response with Citations ← PostgreSQL
```

## Configuration

Key settings in `.env`:

```bash
# Chunking
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Retrieval
TOP_K_RESULTS=5
VECTOR_SIMILARITY_THRESHOLD=0.7

# Models
EMBEDDING_MODEL=text-embedding-3-small
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

## Next Steps

- **Add more documents:** Place `.md` files in project root and rerun `process_documents.py`
- **Customize prompts:** Edit system prompt in `app/services/rag_service.py`
- **Deploy to production:** See `RAG_CHATBOT_README.md` for Docker deployment
- **Monitor performance:** Check `app/main.py` for logging configuration

## Support

For issues or questions:
- See `RAG_CHATBOT_README.md` for detailed architecture
- Check backend logs: `tail -f logs/api.log`
- Verify setup: `python backend/verify_setup.py`

---

**Built with:**
- FastAPI + SQLAlchemy + PostgreSQL + pgvector
- OpenAI (embeddings) + Anthropic Claude (LLM)
- Async/await for high performance
