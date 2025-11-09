# RAG Chatbot Troubleshooting

## "Chatbot not responding to any chats"

This means the chatbot widget is loading, but queries return errors or nothing happens.

### Root Causes Checklist

Work through these in order:

#### ✓ 1. Is PostgreSQL running?

```bash
pg_isready -h localhost -p 5432
```

**If not:**
```bash
# Ubuntu/Debian
sudo systemctl start postgresql

# Or use Docker (recommended)
docker run -d --name battery-postgres \
  -e POSTGRES_USER=battery_user \
  -e POSTGRES_PASSWORD=battery_pass \
  -e POSTGRES_DB=battery_intelligence \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

#### ✓ 2. Is the database initialized?

```bash
psql -h localhost -U battery_user -d battery_intelligence -c "\dt"
```

**Expected output:** Should show tables: `document_chunks`, `conversations`, `messages`, etc.

**If error:**
```bash
# Create database
sudo -u postgres createdb battery_intelligence
sudo -u postgres psql battery_intelligence -c "CREATE EXTENSION vector;"

# Or with Docker
docker exec battery-postgres psql -U battery_user -d battery_intelligence -c "CREATE EXTENSION vector;"
```

#### ✓ 3. Are API keys configured?

```bash
grep "OPENAI_API_KEY\|ANTHROPIC_API_KEY" backend/.env
```

**Should show:**
```
OPENAI_API_KEY=sk-proj-...actual_key...
ANTHROPIC_API_KEY=sk-ant-...actual_key...
```

**Not placeholder values like:**
```
OPENAI_API_KEY=your-openai-api-key-here  ← BAD
```

**Fix:**
```bash
nano backend/.env
# Add your actual keys
```

Get keys from:
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/account/keys

#### ✓ 4. Are documents processed?

```bash
psql -h localhost -U battery_user -d battery_intelligence -c "SELECT COUNT(*) FROM document_chunks;"
```

**Expected:** Should show > 0 (usually 400-500 chunks)

**If 0 or error:**
```bash
cd backend
python scripts/process_documents.py
```

This will:
- Read all `.md` files
- Generate embeddings
- Store in database
- Take ~5-10 minutes
- Cost ~$0.004

#### ✓ 5. Is the backend API running?

```bash
curl http://localhost:8000/health
```

**Expected:**
```json
{"status":"healthy","app":"US Battery Industry Intelligence Platform"}
```

**If error "Connection refused":**
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Check backend logs for errors**

#### ✓ 6. Can you query the chat API directly?

```bash
curl -X POST http://localhost:8000/api/v1/chat/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the US battery industry?",
    "session_id": "test-123",
    "include_sources": true
  }'
```

**Expected:** JSON response with answer and citations

**Common errors and fixes:**

**Error: "OpenAI API key not found"**
```bash
# Add key to .env
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
```

**Error: "Anthropic API key not found"**
```bash
# Add key to .env
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
```

**Error: "No documents found" or confidence_score: 0.0**
```bash
# Process documents
python backend/scripts/process_documents.py
```

**Error: "Database connection failed"**
```bash
# Start PostgreSQL
sudo systemctl start postgresql
```

#### ✓ 7. Is the chat widget served correctly?

```bash
# Start HTTP server
python -m http.server 8080
```

Then visit: http://localhost:8080/chat-widget.html

**Check browser console (F12) for errors**

Common issues:
- CORS error → Backend not running or wrong URL
- Network error → Backend API URL wrong in widget (line 360)
- 401/403 error → API key issues

## Quick Diagnostic Script

Run this to check everything:

```bash
cd backend
python verify_setup.py
```

This will show:
```
✓ Dependencies
✓ Environment
✓ Database
✓ pgvector
```

## Common Error Messages

### "Connection refused" in chat widget

**Cause:** Backend API not running

**Fix:**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Empty responses or "I don't know"

**Cause:** No documents processed

**Fix:**
```bash
cd backend
python scripts/process_documents.py
```

### "API key not found" in backend logs

**Cause:** .env file has placeholder values

**Fix:**
```bash
nano backend/.env
# Replace your-openai-api-key-here with actual key
```

### "pgvector extension not found"

**Cause:** pgvector not installed in PostgreSQL

**Fix:**
```bash
# Ubuntu
sudo apt install postgresql-16-pgvector

# Or use Docker
docker run -d pgvector/pgvector:pg16 ...
```

### "No 'request' or 'websocket' argument" error

**Cause:** Rate limiter issue in other API endpoints (NOT the chatbot)

**Fix:** This doesn't affect the chatbot. Chatbot endpoints work fine.

To suppress, you can access chatbot endpoints directly:
- `/api/v1/chat/query`
- `/api/v1/chat/health`

## Step-by-Step Recovery

If nothing works, start fresh:

```bash
# 1. Stop everything
pkill -f uvicorn
docker stop battery-postgres 2>/dev/null
docker rm battery-postgres 2>/dev/null

# 2. Start PostgreSQL fresh
docker run -d --name battery-postgres \
  -e POSTGRES_USER=battery_user \
  -e POSTGRES_PASSWORD=battery_pass \
  -e POSTGRES_DB=battery_intelligence \
  -p 5432:5432 \
  pgvector/pgvector:pg16

sleep 10

# 3. Enable pgvector
docker exec battery-postgres psql -U battery_user -d battery_intelligence \
  -c "CREATE EXTENSION vector;"

# 4. Add API keys
nano backend/.env
# Add your actual OpenAI and Anthropic keys

# 5. Verify
cd backend
python verify_setup.py

# 6. Process documents
python scripts/process_documents.py

# 7. Start backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Then in another terminal:
```bash
python -m http.server 8080
# Visit http://localhost:8080/chat-widget.html
```

## Still Not Working?

### Check logs

Backend logs:
```bash
cd backend
uvicorn app.main:app --log-level debug
# Watch for errors
```

Database logs:
```bash
# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log

# Docker logs
docker logs battery-postgres
```

### Test components individually

1. **Test database:**
```bash
psql -h localhost -U battery_user -d battery_intelligence
\dt  # List tables
SELECT COUNT(*) FROM document_chunks;
\q
```

2. **Test embeddings:**
```bash
python -c "
from app.services.embedding_service import create_embedding_service
from app.config import settings
svc = create_embedding_service('openai', settings.OPENAI_API_KEY)
import asyncio
emb = asyncio.run(svc.embed_text('test'))
print(f'Embedding dim: {len(emb)}')
"
```

3. **Test LLM:**
```bash
python -c "
from anthropic import Anthropic
from app.config import settings
client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
msg = client.messages.create(
    model='claude-3-5-sonnet-20241022',
    max_tokens=100,
    messages=[{'role': 'user', 'content': 'Hi'}]
)
print(msg.content[0].text)
"
```

## Environment Variables Reference

Required in `backend/.env`:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://battery_user:battery_pass@localhost:5432/battery_intelligence

# API Keys (REQUIRED)
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...

# Models
EMBEDDING_MODEL=text-embedding-3-small
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# RAG Settings
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K_RESULTS=5
VECTOR_SIMILARITY_THRESHOLD=0.7
```

## Getting Help

1. Run diagnostics:
```bash
cd backend
python verify_setup.py
```

2. Check documentation:
- `QUICK_START_GUIDE.md` - Quick setup
- `SETUP_RAG_CHATBOT.md` - Detailed setup
- `RAG_CHATBOT_README.md` - Architecture
- `RAG_CHATBOT_FIXES.md` - What was fixed

3. Check these files exist and are correct:
- `backend/.env` - Has actual API keys
- `backend/requirements.txt` - Dependencies list
- `chat-widget.html` - Frontend

4. Verify these are running:
- PostgreSQL on port 5432
- Backend API on port 8000
- HTTP server on port 8080 (for widget)

## Success Indicators

When everything works:

1. **Backend startup shows:**
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

2. **Health check returns:**
```bash
curl http://localhost:8000/api/v1/chat/health
```
```json
{
  "status": "healthy",
  "services": {
    "embedding": true,
    "llm": true,
    "database": true
  }
}
```

3. **Chat widget shows:**
- Welcome message with suggested questions
- Input box accepts text
- Queries return answers with citations
- Confidence scores displayed

4. **Example query works:**
```bash
curl -X POST http://localhost:8000/api/v1/chat/query \
  -H "Content-Type: application/json" \
  -d '{"query":"What are the top US battery manufacturers?"}'
```

Returns answer with sources.
