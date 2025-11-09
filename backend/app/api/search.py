"""
Search API router.
Endpoints for semantic search using vector embeddings.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models import DocumentChunk
from app.config import settings

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/semantic")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def semantic_search(
    query: str = Query(..., min_length=3, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results"),
    db: AsyncSession = Depends(get_db),
):
    """
    Perform semantic search using vector embeddings.

    Note: This endpoint requires the query to be embedded first.
    For production use, integrate with OpenAI or other embedding service.
    """
    # TODO: Implement actual vector search with embeddings
    # This is a placeholder that returns empty results
    # In production, you would:
    # 1. Embed the query using OpenAI/Cohere
    # 2. Perform vector similarity search using pgvector
    # 3. Return ranked results with citations

    return {
        "query": query,
        "results": [],
        "message": "Vector search endpoint - requires embedding service integration",
    }


@router.get("/fulltext")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def fulltext_search(
    query: str = Query(..., min_length=3, description="Search query"),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """
    Perform full-text search across document chunks.
    """
    # Simple ILIKE search (for PostgreSQL full-text search, use to_tsquery)
    search_query = select(DocumentChunk).where(
        DocumentChunk.content.ilike(f"%{query}%")
    ).limit(limit)

    result = await db.execute(search_query)
    chunks = result.scalars().all()

    return {
        "query": query,
        "results": [
            {
                "id": chunk.id,
                "source": chunk.source_document,
                "content": chunk.content[:200] + "..." if len(chunk.content) > 200 else chunk.content,
                "section": chunk.section_title,
            }
            for chunk in chunks
        ],
        "count": len(chunks),
    }
