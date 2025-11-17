# Research Data Ingestion Guide

This guide explains how to continuously ingest research data into the vector database for the RAG chatbot.

## Overview

The battery research RAG system automatically processes markdown files and stores them in a PostgreSQL database with pgvector extension for semantic search.

### Architecture

- **Vector Database**: PostgreSQL 16 with pgvector extension
- **Embedding Models**: Supports OpenAI, Google Gemini, Cohere, and local (sentence-transformers)
- **Document Processing**: Automatic chunking with overlaps for optimal retrieval
- **Continuous Monitoring**: File system watching for automatic updates

## Quick Start

### 1. Initial Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up environment configuration
cp .env.example .env
# Edit .env with your API keys (or use local embeddings)

# Initialize database
chmod +x scripts/setup_database.sh
./scripts/setup_database.sh
```

### 2. Configure Embedding Provider

Edit `backend/.env` and choose your embedding provider:

#### Option A: Local Embeddings (No API keys needed)
```env
EMBEDDING_PROVIDER=local
LOCAL_EMBEDDING_MODEL=all-MiniLM-L6-v2
EMBEDDING_DIMENSIONS=384
```

#### Option B: Google Gemini
```env
EMBEDDING_PROVIDER=gemini
GEMINI_API_KEY=your-api-key-here
GEMINI_EMBEDDING_MODEL=models/text-embedding-004
EMBEDDING_DIMENSIONS=768
```

#### Option C: OpenAI
```env
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=your-api-key-here
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
```

#### Option D: Cohere
```env
EMBEDDING_PROVIDER=cohere
COHERE_API_KEY=your-api-key-here
EMBEDDING_DIMENSIONS=1024
```

### 3. Ingest Research Data

#### One-time Ingestion
Process all existing markdown files:

```bash
cd backend
python3 scripts/process_documents.py
```

This will:
- Find all `.md` files in project root
- Find all `.md` files in `agent-outputs/` directory
- Chunk documents (default: 1000 chars with 200 char overlap)
- Generate embeddings
- Store in vector database
- Skip unchanged files (uses content hash)

#### Continuous Monitoring
Automatically watch for new/updated markdown files:

```bash
cd backend
python3 scripts/continuous_ingest.py
```

This will:
- Perform initial scan of all existing files
- Watch for file changes in real-time
- Automatically process new or modified `.md` files
- Run periodic scans every hour
- Debounce rapid changes (2-second delay)

**Command-line options:**
```bash
# Skip initial scan, only watch for new changes
python3 scripts/continuous_ingest.py --no-initial-scan

# One-time scan without continuous monitoring
python3 scripts/continuous_ingest.py --no-watch
```

## Where to Place Research Files

The ingestion system monitors these directories:

### 1. Project Root (`/battery-research/`)
Place main research documents here:
- `agents.md` ✓ (already tracked)
- `battery-research.md` ✓ (already tracked)
- `readMe.md` ✓ (already tracked)
- Any new `.md` files you add

### 2. Agent Outputs (`/battery-research/agent-outputs/`)
Place agent-generated research here:
- Any `.md` files
- Currently contains CSV files (not indexed)

### 3. Research Directory (Optional: `/battery-research/research/`)
Create this directory for organized research:
```bash
mkdir research
```
Then place categorized research files:
- `research/technology-analysis.md`
- `research/market-trends.md`
- `research/company-profiles.md`

### 4. Data Directory (`/battery-research/data/`)
Already contains JSON files (not auto-ingested):
- Use `scripts/load_data.py` for structured data
- Place markdown summaries here for RAG ingestion

## Document Format Best Practices

### Recommended Markdown Structure

```markdown
# Document Title

## Section 1: Overview
Content with key information...

### Subsection 1.1
Detailed information...

## Section 2: Analysis
More content...

### Key Points
- Point 1
- Point 2

## Sources
- Source 1
- Source 2
```

### Tips for Better RAG Performance

1. **Use Clear Headings**: Helps with section-based chunking
2. **Include Context**: Each section should be self-contained
3. **Add Metadata**: Include dates, sources, and attributions
4. **Link Related Concepts**: Use consistent terminology
5. **Structure Information**: Use lists, tables, and hierarchies

## Monitoring Ingestion

### Check Ingestion Status

```bash
# View processing logs
python3 scripts/process_documents.py 2>&1 | tee ingestion.log

# Check database
psql -U battery_user -d battery_intelligence
```

```sql
-- View all processed documents
SELECT file_name, processing_status, total_chunks,
       created_at, updated_at
FROM document_metadata
ORDER BY updated_at DESC;

-- Count total chunks
SELECT COUNT(*) FROM document_chunks;

-- View chunk distribution
SELECT source_document, COUNT(*) as chunk_count
FROM document_chunks
GROUP BY source_document
ORDER BY chunk_count DESC;

-- Check embedding dimensions
SELECT source_document,
       array_length(embedding::vector, 1) as dimensions
FROM document_chunks
LIMIT 5;
```

### View Logs

```bash
# Real-time monitoring
tail -f backend/logs/ingestion.log

# Check for errors
grep ERROR backend/logs/ingestion.log
```

## Troubleshooting

### Database Connection Issues

**Error**: `could not connect to server`

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Or use the setup script
./scripts/setup_database.sh
```

### SSL Certificate Error

**Error**: `private key file has group or world access`

```bash
# Fix permissions
sudo chmod 640 /etc/ssl/private/ssl-cert-snakeoil.key
sudo chgrp ssl-cert /etc/ssl/private/ssl-cert-snakeoil.key
sudo pg_ctlcluster 16 main restart
```

### Embedding API Errors

**Error**: `API key not found` or `Rate limit exceeded`

**Solutions**:
1. Switch to local embeddings (no API required):
   ```env
   EMBEDDING_PROVIDER=local
   ```

2. Check API key validity in `.env`

3. For rate limits, add delays between batches (already implemented)

### Memory Issues with Large Files

**Error**: `Out of memory` when processing large documents

**Solutions**:
1. Reduce chunk size in `.env`:
   ```env
   CHUNK_SIZE=500
   CHUNK_OVERLAP=100
   ```

2. Process files individually:
   ```python
   python3 -c "from scripts.process_documents import *; import asyncio; asyncio.run(process_single_file('path/to/file.md'))"
   ```

### Dimension Mismatch Error

**Error**: `embedding dimension mismatch`

**Cause**: Changed embedding provider without updating database

**Solution**:
```bash
# Clear existing embeddings
psql -U battery_user -d battery_intelligence -c "TRUNCATE document_chunks CASCADE;"

# Re-run ingestion
python3 scripts/process_documents.py
```

## Advanced Configuration

### Custom Chunking Strategy

Edit `backend/app/services/document_processor.py`:

```python
processor = MarkdownDocumentProcessor(
    chunk_size=1500,      # Larger chunks
    chunk_overlap=300     # More overlap for context
)
```

### Batch Processing Tuning

Edit `backend/scripts/process_documents.py`:

```python
# Line 90: Adjust batch size
batch_size = 20  # Smaller batches for rate limits
```

### Watched Directories

Edit `backend/scripts/continuous_ingest.py`:

```python
# Line 157: Add custom directories
watch_dirs = [
    project_root,
    project_root / "agent-outputs",
    project_root / "research",
    project_root / "custom-folder",  # Add your directory
]
```

## API Endpoints

After ingestion, query your research data:

### Chat with RAG
```bash
curl -X POST http://localhost:8000/api/v1/chat/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the latest battery technologies?",
    "session_id": "user123"
  }'
```

### Semantic Search
```bash
curl "http://localhost:8000/api/v1/search/semantic?query=solid+state+batteries&top_k=5"
```

### Check Health
```bash
curl http://localhost:8000/api/v1/chat/health
```

## Automation

### Systemd Service (Linux)

Create `/etc/systemd/system/battery-research-ingest.service`:

```ini
[Unit]
Description=Battery Research Continuous Ingestion
After=network.target postgresql.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/battery-research/backend
Environment="PATH=/usr/local/bin:/usr/bin"
ExecStart=/usr/bin/python3 scripts/continuous_ingest.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable battery-research-ingest
sudo systemctl start battery-research-ingest
sudo systemctl status battery-research-ingest
```

### Cron Job (Periodic Ingestion)

```bash
# Edit crontab
crontab -e

# Add hourly ingestion
0 * * * * cd /path/to/battery-research/backend && /usr/bin/python3 scripts/process_documents.py >> /var/log/battery-ingest.log 2>&1
```

### Docker Compose

Add to `docker-compose.yml`:

```yaml
ingestion-monitor:
  build: .
  command: python3 scripts/continuous_ingest.py
  volumes:
    - ./:/app
    - ../:/research-data:ro
  environment:
    - DATABASE_URL=${DATABASE_URL}
    - EMBEDDING_PROVIDER=${EMBEDDING_PROVIDER}
  depends_on:
    - db
  restart: unless-stopped
```

## Performance Optimization

### Database Indexing

Already optimized with:
- Vector index for similarity search (pgvector)
- B-tree indexes on source_document and chunk_index
- GiST index for full-text search

### Caching

Enable embedding cache in production:

```python
# In app/services/embedding_service.py
embedding_service = EmbeddingService(
    provider=provider,
    cache_enabled=True  # Enable caching
)
```

### Batch Size Tuning

- **Small files (<1MB)**: batch_size=50
- **Medium files (1-10MB)**: batch_size=20
- **Large files (>10MB)**: batch_size=10

## Security Considerations

1. **API Keys**: Never commit `.env` file to git
2. **Database**: Use strong passwords in production
3. **Network**: Restrict database access to localhost or VPN
4. **Rate Limits**: Implement API rate limiting (already configured)

## Next Steps

1. ✅ Set up database and environment
2. ✅ Run initial ingestion
3. ✅ Start continuous monitoring
4. 🔄 Add new research files as they're created
5. 📊 Monitor via API endpoints
6. 🚀 Deploy to production with systemd/Docker

## Support

- Documentation: `/backend/README.md`
- API Docs: `http://localhost:8000/docs`
- Database Schema: `/database/schema.sql`
- Issues: Check logs in `backend/logs/`

---

**Last Updated**: 2025-11-17
**Version**: 1.0.0
