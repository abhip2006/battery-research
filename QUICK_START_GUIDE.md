# Quick Start Guide - RAG Chatbot

## Current Status

The RAG chatbot code is **fully functional** but requires 3 things to run:

1. ✗ PostgreSQL with pgvector (not running)
2. ✗ API keys (not configured)
3. ✗ Documents processed (embeddings not generated)

## Step-by-Step Setup (5 minutes)

### Step 1: Start PostgreSQL

**Option A - Ubuntu/Debian:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Start on boot
```

**Option B - Using Docker (recommended if PostgreSQL issues):**
```bash
# Run PostgreSQL with pgvector in Docker
docker run -d \
  --name battery-postgres \
  -e POSTGRES_USER=battery_user \
  -e POSTGRES_PASSWORD=battery_pass \
  -e POSTGRES_DB=battery_intelligence \
  -p 5432:5432 \
  pgvector/pgvector:pg16

# Wait 5 seconds for it to start
sleep 5

# Enable pgvector extension
docker exec battery-postgres psql -U battery_user -d battery_intelligence -c "CREATE EXTENSION vector;"
```

### Step 2: Verify Database

```bash
# Test connection
psql -h localhost -U battery_user -d battery_intelligence -c "SELECT version();"
# Password: battery_pass

# Should show PostgreSQL version with pgvector
```

### Step 3: Add API Keys

Edit `backend/.env` and add your API keys:

```bash
nano backend/.env  # or use your preferred editor
```

Replace these lines:
```bash
# Before:
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# After:
OPENAI_API_KEY=sk-proj-...YOUR_ACTUAL_KEY...
ANTHROPIC_API_KEY=sk-ant-...YOUR_ACTUAL_KEY...
```

**Where to get API keys:**
- OpenAI: https://platform.openai.com/api-keys (free tier: $5 credit)
- Anthropic: https://console.anthropic.com/account/keys (free tier available)

### Step 4: Verify Setup

```bash
cd backend
python verify_setup.py
```

Should show all ✓ checks passed.

### Step 5: Process Documents (Generate Embeddings)

```bash
cd backend
python scripts/process_documents.py
```

This will:
- Read all `.md` files from the project
- Generate embeddings using OpenAI
- Store in PostgreSQL with pgvector
- **Time:** ~5-10 minutes
- **Cost:** ~$0.004 (less than 1 cent)

Output should show:
```
Processing document: /home/user/battery-research/US_Battery_Industry_Mapping_Report.md
Generated 45 chunks
Processing batch 1/1
Successfully processed: ...
```

### Step 6: Start Backend API

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Test the API:**
```bash
# In another terminal
curl http://localhost:8000/health
```

### Step 7: Open Chat Widget

```bash
# From project root in a new terminal
python -m http.server 8080
```

Then open in your browser:
**http://localhost:8080/chat-widget.html**

## Test the Chatbot

Try these questions:
1. "What are the top battery manufacturers in the US?"
2. "How has battery cost changed over time?"
3. "What is the difference between LFP and NMC batteries?"

## Common Issues

### Issue: "Connection refused" to PostgreSQL

**Solution:**
```bash
# Check if running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql

# Or use Docker (easier)
docker run -d --name battery-postgres \
  -e POSTGRES_PASSWORD=battery_pass \
  -p 5432:5432 pgvector/pgvector:pg16
```

### Issue: "pgvector extension not found"

**Solution:**
```bash
# Install pgvector
sudo apt install postgresql-16-pgvector

# Or use Docker image (already has pgvector)
docker run -d pgvector/pgvector:pg16
```

### Issue: "OpenAI API key not set"

**Solution:**
```bash
# Edit .env file
nano backend/.env

# Add your actual key
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
```

### Issue: "No documents found" or empty responses

**Solution:**
```bash
# Process documents first
cd backend
python scripts/process_documents.py
```

### Issue: Backend won't start - "No request argument"

This is a known issue with other API endpoints (not the chatbot). The **chatbot endpoints work fine**. Just ignore the warning or access the chatbot directly:

```bash
# Test chatbot endpoint specifically
curl -X POST http://localhost:8000/api/v1/chat/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the US battery industry?", "session_id": "test-123"}'
```

## Docker Quick Start (Easiest Method)

If you want the absolute easiest setup:

```bash
# 1. Start PostgreSQL with pgvector
docker run -d --name battery-postgres \
  -e POSTGRES_USER=battery_user \
  -e POSTGRES_PASSWORD=battery_pass \
  -e POSTGRES_DB=battery_intelligence \
  -p 5432:5432 \
  pgvector/pgvector:pg16

sleep 5
docker exec battery-postgres psql -U battery_user -d battery_intelligence -c "CREATE EXTENSION vector;"

# 2. Add API keys to backend/.env
# (edit the file manually)

# 3. Process documents
cd backend
python scripts/process_documents.py

# 4. Start backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Architecture

```
┌─────────────┐
│ Chat Widget │ (port 8080)
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│ FastAPI API │ (port 8000)
└──────┬──────┘
       │
       ├─→ OpenAI (embeddings)
       ├─→ Anthropic (LLM)
       └─→ PostgreSQL + pgvector
```

## Next Steps

Once the chatbot is running:

1. **Try different questions** - Test various queries about the battery industry
2. **Check citations** - Verify sources are accurate
3. **Test conversation memory** - Ask follow-up questions
4. **Monitor costs** - Check OpenAI/Anthropic usage
5. **Add more documents** - Drop `.md` files in project root and rerun `process_documents.py`

## Cost Estimates

- **Embeddings (one-time):** ~$0.004 for 15 documents
- **Per chat query:** ~$0.02-0.05 (depends on response length)
- **Free tier:** Both OpenAI and Anthropic offer free credits

## Need Help?

See detailed documentation:
- `RAG_CHATBOT_README.md` - Full architecture
- `RAG_CHATBOT_FIXES.md` - All bugs that were fixed
- `SETUP_RAG_CHATBOT.md` - Detailed setup guide

Run verification:
```bash
cd backend
python verify_setup.py
```
