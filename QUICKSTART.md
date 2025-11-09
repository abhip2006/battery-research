# RAG Chatbot Quick Start Guide

Get the US Battery Industry RAG Chatbot running in 5 minutes!

## Prerequisites Check

```bash
# Check Python version (need 3.11+)
python --version

# Check PostgreSQL (need 14+)
psql --version

# Verify you have:
# - OpenAI API key
# - Anthropic API key
```

## Step 1: Database Setup (2 minutes)

```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Create database and enable pgvector
sudo -u postgres createdb battery_intelligence
sudo -u postgres psql battery_intelligence -c "CREATE EXTENSION vector;"

# Verify
sudo -u postgres psql battery_intelligence -c "\dx"
# Should see "vector" in the extensions list
```

## Step 2: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies (this may take 1-2 minutes)
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Edit .env - REQUIRED:
# Set OPENAI_API_KEY=your-key-here
# Set ANTHROPIC_API_KEY=your-key-here
nano .env  # or use your preferred editor
```

## Step 3: Process Documents (5-10 minutes)

```bash
# Still in backend directory
python scripts/process_documents.py

# Expected output:
# Processing document: /path/to/US_Battery_Industry_Mapping_Report.md
# Generated 45 chunks
# Processing batch 1/1
# Successfully processed: US_Battery_Industry_Mapping_Report.md
# ...
# Document processing completed!
```

**Note**: This processes ~15 markdown documents and generates ~450 embeddings. Takes 5-10 minutes depending on API response times.

## Step 4: Start the Backend (30 seconds)

```bash
# Still in backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete.
```

Verify it's working:
```bash
# In a new terminal
curl http://localhost:8000/health

# Should return:
# {"status":"healthy","app":"US Battery Industry Intelligence Platform","version":"0.1.0","environment":"development"}
```

## Step 5: Open Chat Interface (10 seconds)

```bash
# In a new terminal, from project root
cd ..
python -m http.server 8080

# Open in browser:
# http://localhost:8080/chat-widget.html
```

## Test the Chatbot

Try these example queries:

1. **"What are the top battery manufacturers in the US?"**
   - Should return list with citations from mapping report

2. **"How has battery cost changed since 2015?"**
   - Should cite historical evolution report with specific numbers

3. **"What is the difference between LFP and NMC batteries?"**
   - Should cite technology innovation report with technical details

4. **"Which states have the most manufacturing capacity?"**
   - Should cite geospatial facilities report with state rankings

## Troubleshooting

### Issue: "CREATE EXTENSION vector" fails

**Solution**: Install pgvector
```bash
# Ubuntu/Debian
sudo apt install postgresql-14-pgvector

# macOS
brew install pgvector

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Issue: "ModuleNotFoundError: No module named 'app'"

**Solution**: Make sure you're in the backend directory
```bash
cd backend
python scripts/process_documents.py
```

### Issue: "OpenAI API key not found"

**Solution**: Check .env file
```bash
cat .env | grep OPENAI_API_KEY
# Should show: OPENAI_API_KEY=sk-...
```

### Issue: Low confidence scores or "No relevant context found"

**Solution**: Verify documents were processed
```bash
# Connect to database
sudo -u postgres psql battery_intelligence

# Check chunks were created
SELECT COUNT(*) FROM document_chunks;
# Should return ~450

# Check a sample
SELECT source_document, section_title, LEFT(content, 100) 
FROM document_chunks 
LIMIT 3;
```

### Issue: Chat widget shows "API error"

**Solution**: Check CORS settings
```bash
# In backend/.env, ensure:
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8000","http://localhost:8080"]

# Restart backend
# Ctrl+C in backend terminal, then:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Architecture at a Glance

```
User Query → Frontend (port 8080)
           ↓
           API Call → Backend FastAPI (port 8000)
                    ↓
                    RAG Pipeline:
                    1. Embed query (OpenAI)
                    2. Search vectors (PostgreSQL + pgvector)
                    3. Retrieve top 5 chunks
                    4. Generate response (Anthropic Claude)
                    5. Extract citations
                    ↓
                    Response with Citations → Frontend
```

## Next Steps

1. **Explore API Documentation**
   - http://localhost:8000/docs (Swagger UI)
   - http://localhost:8000/redoc (ReDoc)

2. **Customize Configuration**
   - Edit `backend/.env` to adjust:
     - `CHUNK_SIZE` (default: 1000)
     - `TOP_K_RESULTS` (default: 5)
     - `VECTOR_SIMILARITY_THRESHOLD` (default: 0.7)

3. **Add Your Own Documents**
   ```bash
   # Add markdown files to project root
   cp your-research.md /path/to/battery-research/
   
   # Re-run processing
   cd backend
   python scripts/process_documents.py
   ```

4. **Monitor Performance**
   ```sql
   # Connect to database
   sudo -u postgres psql battery_intelligence
   
   # View recent queries
   SELECT role, content, confidence_score, created_at 
   FROM messages 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

## Success Indicators

You should see:
- ✅ Backend running without errors on port 8000
- ✅ Chat widget loads at http://localhost:8080/chat-widget.html
- ✅ Queries return responses with citations in 1-3 seconds
- ✅ Confidence scores typically ≥ 0.7
- ✅ 3-5 source citations per response

## Cost Estimation

For ~450 document chunks:
- **One-time embedding**: ~$0.004 (180K tokens)
- **Per query**: ~$0.002 (1K query tokens + 2K response tokens)
- **Per 1000 queries**: ~$2.00

## Production Deployment

See `RAG_CHATBOT_README.md` for:
- Docker deployment
- Production configuration
- Security hardening
- Monitoring setup

---

**You're all set!** Start asking questions about the US battery industry.
