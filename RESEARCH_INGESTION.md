# Research Data Ingestion - Quick Start

This document explains how to automatically ingest research data into the RAG chatbot's vector database.

## TL;DR - Quick Start

```bash
cd backend/scripts
./start_ingestion.sh continuous
```

That's it! The system will:
1. ✅ Check and set up the database
2. ✅ Process all existing markdown files
3. ✅ Watch for new/updated research files
4. ✅ Automatically ingest changes in real-time

## What Gets Ingested?

The system automatically monitors and ingests:

### Markdown Files (.md)
- ✅ `agents.md` (4,195 lines)
- ✅ `battery-research.md` (109 lines)
- ✅ `readMe.md` (45 lines)
- ✅ Any new `.md` files you add to:
  - Project root (`/battery-research/`)
  - `agent-outputs/` directory
  - `research/` directory (create if needed)
  - `data/` directory

### How It Works

1. **Document Chunking**: Splits long documents into 1000-char chunks with 200-char overlap
2. **Embedding Generation**: Converts chunks to vector embeddings
3. **Vector Storage**: Stores in PostgreSQL with pgvector extension
4. **Smart Updates**: Only re-processes changed files (uses content hash)
5. **Continuous Monitoring**: Watches filesystem for new/updated files

## Usage Options

### Continuous Monitoring (Recommended)
Automatically watches for changes and ingests new research:
```bash
cd backend/scripts
./start_ingestion.sh continuous
```

### One-Time Ingestion
Process all files once and exit:
```bash
cd backend/scripts
./start_ingestion.sh once
```

### Manual Processing
```bash
cd backend
python3 scripts/process_documents.py
```

## Configuration

### Embedding Provider Options

Edit `backend/.env`:

#### Option 1: Local (No API keys needed) ⭐ Recommended for testing
```env
EMBEDDING_PROVIDER=local
LOCAL_EMBEDDING_MODEL=all-MiniLM-L6-v2
EMBEDDING_DIMENSIONS=384
```

#### Option 2: Google Gemini (Best quality/cost ratio)
```env
EMBEDDING_PROVIDER=gemini
GEMINI_API_KEY=your-api-key-here
EMBEDDING_DIMENSIONS=768
```

#### Option 3: OpenAI (High quality)
```env
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=your-api-key-here
EMBEDDING_DIMENSIONS=1536
```

#### Option 4: Cohere
```env
EMBEDDING_PROVIDER=cohere
COHERE_API_KEY=your-api-key-here
EMBEDDING_DIMENSIONS=1024
```

## Adding New Research

### Simple Workflow

1. **Create/update a markdown file**:
   ```bash
   echo "# New Research Findings" > research/new-findings.md
   echo "## Analysis" >> research/new-findings.md
   echo "Important discoveries..." >> research/new-findings.md
   ```

2. **Automatic ingestion** (if continuous mode running):
   - File change detected automatically
   - Processed within 2 seconds
   - Available for RAG queries immediately

3. **Manual trigger** (if not using continuous mode):
   ```bash
   cd backend
   python3 scripts/process_documents.py
   ```

### Recommended Folder Structure

```
battery-research/
├── agents.md                    # ✅ Already monitored
├── battery-research.md          # ✅ Already monitored
├── readMe.md                    # ✅ Already monitored
├── research/                    # Create for organized research
│   ├── technology-analysis.md
│   ├── market-trends.md
│   ├── company-profiles.md
│   └── policy-updates.md
├── agent-outputs/               # ✅ Already monitored
│   └── *.md files
└── data/                        # ✅ Already monitored
    └── research-summaries.md
```

## Monitoring Ingestion Status

### Real-time Logs
```bash
# Watch ingestion in real-time
tail -f backend/logs/ingestion.log

# Or see output directly
cd backend
python3 scripts/continuous_ingest.py
```

### Check Database
```bash
psql -U battery_user -d battery_intelligence

# View processed documents
SELECT file_name, processing_status, total_chunks, updated_at
FROM document_metadata
ORDER BY updated_at DESC;

# Count total chunks
SELECT COUNT(*) FROM document_chunks;
```

### Query via API
```bash
# Test RAG with your ingested data
curl -X POST http://localhost:8000/api/v1/chat/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What battery technologies are discussed in the research?",
    "session_id": "test123"
  }'
```

## Troubleshooting

### Database Issues
```bash
# Run database setup
cd backend/scripts
./setup_database.sh
```

### Dependency Issues
```bash
cd backend
pip install -r requirements.txt
```

### API Key Issues
```bash
# Use local embeddings (no API key needed)
cd backend
nano .env
# Change: EMBEDDING_PROVIDER=local
```

### Check Logs
```bash
# View recent errors
cd backend
grep -i error logs/*.log

# View processing status
grep -i "successfully processed" logs/*.log
```

## Advanced Usage

### Custom Chunk Size
Edit `backend/.env`:
```env
CHUNK_SIZE=1500
CHUNK_OVERLAP=300
```

### Periodic Ingestion (Cron)
```bash
# Add to crontab
crontab -e

# Run every hour
0 * * * * cd /home/user/battery-research/backend && python3 scripts/process_documents.py >> /var/log/battery-ingest.log 2>&1
```

### System Service (Always Running)
```bash
# Create systemd service
sudo nano /etc/systemd/system/battery-ingest.service

# Add service definition (see INGESTION_GUIDE.md)

# Enable and start
sudo systemctl enable battery-ingest
sudo systemctl start battery-ingest
```

## Files Modified/Created

### Configuration
- ✅ `backend/.env` - Environment configuration
- ✅ `backend/requirements.txt` - Added watchdog dependency

### Scripts
- ✅ `backend/scripts/setup_database.sh` - Database initialization
- ✅ `backend/scripts/continuous_ingest.py` - Continuous monitoring
- ✅ `backend/scripts/start_ingestion.sh` - Easy start script
- ✅ `backend/scripts/process_documents.py` - Existing (uses this)

### Documentation
- ✅ `backend/INGESTION_GUIDE.md` - Comprehensive guide
- ✅ `RESEARCH_INGESTION.md` - This quick start guide

## Current Research Data

Already tracked and ready to ingest:
- **agents.md**: 4,195 lines (main research content)
- **battery-research.md**: 109 lines
- **readMe.md**: 45 lines
- **Total**: ~4,349 lines of research

After ingestion, this data will be:
- Chunked into searchable segments
- Converted to vector embeddings
- Available for RAG queries
- Cited with source attribution

## Next Steps

1. ✅ Configure `.env` file (done - using local embeddings by default)
2. ⏭️ Run: `cd backend/scripts && ./start_ingestion.sh continuous`
3. 📝 Add new research to monitored directories
4. 🤖 Query via chat API: `POST /api/v1/chat/query`
5. 📊 Monitor ingestion status in logs

## Support & Documentation

- **Comprehensive Guide**: `backend/INGESTION_GUIDE.md`
- **API Documentation**: Start backend and visit `http://localhost:8000/docs`
- **Database Schema**: `database/schema.sql`
- **Backend README**: `backend/README.md`

---

**System Status**:
- ✅ Ingestion scripts ready
- ✅ Database configuration ready
- ✅ Embedding configuration ready (local mode)
- ✅ Continuous monitoring ready
- ⏭️ Ready to start ingestion!

**Start Now**:
```bash
cd backend/scripts && ./start_ingestion.sh continuous
```
