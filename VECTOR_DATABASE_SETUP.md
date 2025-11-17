# Vector Database Setup for RAG Chatbot

This document describes the vector database implementation for the Battery Research RAG (Retrieval Augmented Generation) chatbot.

## Overview

The RAG chatbot uses PostgreSQL with the **pgvector** extension to store document chunks with vector embeddings, enabling semantic search over your battery research documents.

### Architecture

```
┌─────────────────────┐
│  Research Documents │
│  (.md, .json files) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Document Processor  │
│ - Chunking          │
│ - Metadata Extract  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Embedding Service   │
│ (OpenAI/Cohere)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  PostgreSQL +       │
│  pgvector           │
│  (Vector DB)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   RAG Service       │
│ - Similarity Search │
│ - Context Ranking   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   LLM (Claude)      │
│ - Response Gen      │
│ - Citations         │
└─────────────────────┘
```

## Database Schema

### Tables

#### `document_chunks`
Stores document chunks with vector embeddings.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| source_document | VARCHAR(500) | Source file name |
| chunk_index | INTEGER | Index within document |
| content | TEXT | Text content of chunk |
| content_hash | VARCHAR(64) | SHA-256 hash for deduplication |
| section_title | VARCHAR(500) | Section header (for citations) |
| page_number | INTEGER | Page number (for PDFs) |
| chunk_metadata | JSONB | Additional metadata |
| embedding | vector(1536) | Vector embedding (1536-dim) |
| token_count | INTEGER | Token count for cost tracking |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_document_chunks_source` - On source_document
- `idx_document_chunks_hash` - On content_hash (unique)
- `idx_document_chunks_embedding` - IVFFlat index for vector search

#### `document_metadata`
Tracks document processing status and statistics.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| file_path | VARCHAR(1000) | Full file path (unique) |
| file_name | VARCHAR(500) | File name |
| file_type | VARCHAR(50) | File type (markdown, json, pdf) |
| file_size | INTEGER | File size in bytes |
| processing_status | VARCHAR(50) | pending, processing, completed, failed |
| total_chunks | INTEGER | Number of chunks created |
| total_tokens | INTEGER | Total tokens processed |
| file_hash | VARCHAR(64) | SHA-256 hash for change detection |
| error_message | TEXT | Error details if failed |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### `conversations` & `messages`
Store chat history for conversation memory.

## Setup Instructions

### 1. Prerequisites

- PostgreSQL 14+ with pgvector extension
- Python 3.10+
- OpenAI API key (for embeddings)
- Anthropic API key (for Claude LLM)

### 2. Install pgvector Extension

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Run Database Schema

```bash
psql -U your_user -d your_database -f database/schema.sql
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/battery_research

# OpenAI (for embeddings)
OPENAI_API_KEY=sk-...
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small

# Anthropic (for LLM)
ANTHROPIC_API_KEY=sk-ant-...
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-5-sonnet-20241022

# App Config
ENVIRONMENT=development
DEBUG=True
LOG_LEVEL=INFO
```

### 5. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Key dependencies:
- `fastapi` - Web framework
- `sqlalchemy[asyncio]` - Database ORM
- `pgvector` - PostgreSQL vector extension
- `anthropic` - Claude API client
- `openai` - OpenAI API client
- `sentence-transformers` - (Optional) Local embeddings

### 6. Run Document Ingestion

Ingest your research documents into the vector database:

```bash
cd backend
python scripts/ingest_documents.py
```

This will:
1. Process markdown files (`battery-research.md`, `agents.md`, `readMe.md`)
2. Process JSON data files (companies, technologies, timeline)
3. Generate embeddings for all chunks
4. Store in PostgreSQL with pgvector

**Output:**
```
============================================================
INGESTING MARKDOWN FILES
============================================================
INFO - Processing markdown file: /path/to/battery-research.md
INFO - Generating embeddings for 15 chunks
INFO - Successfully ingested 15 chunks from battery-research.md

============================================================
INGESTION SUMMARY
============================================================
Files processed: 6
  ✓ Successful: 6
  ⊘ Skipped: 0
  ✗ Failed: 0

Total chunks created: 542
Total tokens: 145,230
Estimated cost (OpenAI): $0.0029
```

### 7. Start the API Server

```bash
cd backend
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Document Management

#### Get Document Statistics
```bash
GET /api/v1/documents/stats
```

Response:
```json
{
  "total_documents": 6,
  "total_chunks": 542,
  "total_tokens": 145230,
  "processing": 0,
  "completed": 6,
  "failed": 0,
  "pending": 0,
  "storage_size_mb": 2.34
}
```

#### List Documents
```bash
GET /api/v1/documents/list?status=completed&limit=10
```

#### Trigger Document Ingestion
```bash
POST /api/v1/documents/trigger-ingestion
```

### Chat Endpoints

#### Query the RAG Chatbot
```bash
POST /api/v1/chat/query
Content-Type: application/json

{
  "query": "What are the main battery companies in the US?",
  "session_id": "user-123",
  "include_sources": true,
  "max_chunks": 5
}
```

Response:
```json
{
  "response": "Based on the research documents, the main battery companies in the US include:\n\n1. **QuantumScape (QS)** [Source 1] - Solid-state battery developer with pilot production facilities\n2. **Amprius Technologies (AMPX)** [Source 2] - Silicon anode battery manufacturer\n...",
  "citations": [
    {
      "citation_id": 1,
      "source_document": "companies-detailed.json",
      "section_title": "Battery Companies Database",
      "similarity_score": 0.89,
      "chunk_id": 42
    }
  ],
  "confidence_score": 0.87,
  "model": "claude-3-5-sonnet-20241022",
  "retrieved_chunks": 5
}
```

## Usage Examples

### Python Client

```python
import requests

# Query the chatbot
response = requests.post(
    "http://localhost:8000/api/v1/chat/query",
    json={
        "query": "What battery technologies are being developed?",
        "session_id": "my-session",
        "include_sources": True
    }
)

data = response.json()
print(data["response"])
print("\nSources:")
for citation in data["citations"]:
    print(f"- {citation['source_document']} (similarity: {citation['similarity_score']:.2f})")
```

### JavaScript/Frontend

```javascript
const response = await fetch('http://localhost:8000/api/v1/chat/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "What are solid-state batteries?",
    session_id: sessionStorage.getItem('chatSession'),
    include_sources: true
  })
});

const data = await response.json();
console.log(data.response);
console.log(data.citations);
```

## Configuration Options

### Chunking Parameters

In `backend/app/services/document_processor.py`:

```python
processor = MarkdownDocumentProcessor(
    chunk_size=1000,        # Characters per chunk
    chunk_overlap=200,      # Overlap for context continuity
    min_chunk_size=100      # Minimum viable chunk size
)
```

### RAG Parameters

In `backend/app/services/rag_service.py`:

```python
rag_service = RAGService(
    embedding_service=embedding_service,
    llm_provider="anthropic",
    model="claude-3-5-sonnet-20241022",
    top_k=5,                    # Number of chunks to retrieve
    similarity_threshold=0.7    # Minimum similarity score
)
```

### Embedding Providers

Supported embedding providers:
- **OpenAI** (default): `text-embedding-3-small` (1536 dimensions)
- **Cohere**: `embed-english-v3.0`
- **Google Gemini**: `models/embedding-001`
- **Local**: `sentence-transformers` models

## Performance Optimization

### Vector Index Tuning

The IVFFlat index can be tuned for better performance:

```sql
-- Rebuild index with different list count
DROP INDEX idx_document_chunks_embedding;
CREATE INDEX idx_document_chunks_embedding
ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 200);  -- Increase for more data
```

**Rule of thumb:** `lists = sqrt(total_rows)`

### Caching

Enable Redis caching for frequent queries:

```python
# In app/services/embedding_service.py
embedding_service = EmbeddingService(
    provider="openai",
    api_key=api_key,
    cache_embeddings=True,
    redis_url="redis://localhost:6379"
)
```

## Monitoring & Debugging

### Check Vector Search Performance

```sql
-- Find most similar chunks to a query
SELECT
    source_document,
    section_title,
    content,
    1 - (embedding <=> '[0.1, 0.2, ...]') as similarity
FROM document_chunks
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 5;
```

### View Ingestion Logs

```bash
tail -f backend/logs/ingestion.log
```

### Database Stats

```sql
-- Count chunks per document
SELECT
    source_document,
    COUNT(*) as chunk_count,
    SUM(token_count) as total_tokens
FROM document_chunks
GROUP BY source_document
ORDER BY chunk_count DESC;
```

## Troubleshooting

### Issue: Embeddings API Rate Limit

**Solution:** Use batch processing with delays:

```python
embeddings = await embedding_service.embed_batch(
    texts,
    batch_size=100,
    delay_between_batches=1.0
)
```

### Issue: Out of Memory During Ingestion

**Solution:** Process documents in smaller batches:

```python
# In scripts/ingest_documents.py
for batch in batch_files(all_files, batch_size=10):
    await process_batch(batch)
```

### Issue: Low Quality Search Results

**Solutions:**
1. Lower `similarity_threshold` (try 0.6 instead of 0.7)
2. Increase `top_k` to retrieve more chunks
3. Improve chunking (smaller chunks, more overlap)
4. Use better section titles for context

## Production Deployment

### Render.com Setup

The project includes a `render.yaml` configuration:

```yaml
databases:
  - name: battery-research-db
    databaseName: battery_research
    plan: free
    postgresMajorVersion: 15
    # pgvector extension enabled automatically

services:
  - type: web
    name: battery-research-api
    env: python
    buildCommand: "pip install -r backend/requirements.txt"
    startCommand: "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
```

### Post-Deployment Steps

1. **Run migrations:**
   ```bash
   psql $DATABASE_URL -f database/schema.sql
   ```

2. **Ingest documents:**
   ```bash
   python scripts/ingest_documents.py
   ```

3. **Verify setup:**
   ```bash
   curl https://your-app.onrender.com/api/v1/documents/stats
   ```

## Cost Estimation

### OpenAI Embeddings

- Model: `text-embedding-3-small`
- Cost: $0.02 / 1M tokens
- Average document (5000 words) ≈ 6,500 tokens
- **Cost per document:** ~$0.00013

### Anthropic LLM (Claude)

- Model: `claude-3-5-sonnet-20241022`
- Input: $3.00 / 1M tokens
- Output: $15.00 / 1M tokens
- Average query: 2,000 input tokens, 500 output tokens
- **Cost per query:** ~$0.0135

### Storage (PostgreSQL)

- Vector storage: ~6KB per chunk (1536 dims × 4 bytes)
- 1,000 chunks ≈ 6MB
- 100,000 chunks ≈ 600MB

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- GitHub Issues: [Your Repo URL]
- Documentation: [Docs URL]
- Email: support@example.com
