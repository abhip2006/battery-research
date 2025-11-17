"""
Document management API endpoints.
Handles document ingestion and management for RAG system.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import logging

from app.database import get_db
from app.models.document import DocumentChunk, DocumentMetadata
from app.services.document_processor import MarkdownDocumentProcessor
from app.services.embedding_service import EmbeddingService
from app.config import settings

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])
logger = logging.getLogger(__name__)


# Response models
class DocumentMetadataResponse(BaseModel):
    id: int
    file_path: str
    file_name: str
    file_type: str
    file_size: int
    processing_status: str
    total_chunks: int
    total_tokens: int
    file_hash: str
    error_message: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class DocumentStatsResponse(BaseModel):
    total_documents: int
    total_chunks: int
    total_tokens: int
    processing: int
    completed: int
    failed: int
    pending: int
    storage_size_mb: float


class IngestionTriggerResponse(BaseModel):
    message: str
    status: str


# Request models
class ReprocessDocumentRequest(BaseModel):
    file_path: str


@router.get("/stats", response_model=DocumentStatsResponse)
async def get_document_stats(
    db: AsyncSession = Depends(get_db)
):
    """
    Get statistics about documents in the vector database.
    """
    try:
        # Count total documents
        total_docs_result = await db.execute(
            select(func.count(DocumentMetadata.id))
        )
        total_documents = total_docs_result.scalar()

        # Count total chunks
        total_chunks_result = await db.execute(
            select(func.count(DocumentChunk.id))
        )
        total_chunks = total_chunks_result.scalar()

        # Sum total tokens
        total_tokens_result = await db.execute(
            select(func.sum(DocumentMetadata.total_tokens))
        )
        total_tokens = total_tokens_result.scalar() or 0

        # Count by status
        status_counts = await db.execute(
            text("""
                SELECT processing_status, COUNT(*) as count
                FROM document_metadata
                GROUP BY processing_status
            """)
        )
        status_dict = {row.processing_status: row.count for row in status_counts}

        # Calculate storage size
        storage_size_result = await db.execute(
            select(func.sum(DocumentMetadata.file_size))
        )
        storage_bytes = storage_size_result.scalar() or 0
        storage_mb = storage_bytes / (1024 * 1024)

        return DocumentStatsResponse(
            total_documents=total_documents,
            total_chunks=total_chunks,
            total_tokens=total_tokens,
            processing=status_dict.get('processing', 0),
            completed=status_dict.get('completed', 0),
            failed=status_dict.get('failed', 0),
            pending=status_dict.get('pending', 0),
            storage_size_mb=round(storage_mb, 2)
        )

    except Exception as e:
        logger.error(f"Error getting document stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list", response_model=List[DocumentMetadataResponse])
async def list_documents(
    status: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    List all documents in the vector database.

    Args:
        status: Filter by processing status (pending, processing, completed, failed)
        limit: Maximum number of results
        offset: Number of results to skip
    """
    try:
        query = select(DocumentMetadata).order_by(DocumentMetadata.created_at.desc())

        if status:
            query = query.where(DocumentMetadata.processing_status == status)

        query = query.limit(limit).offset(offset)

        result = await db.execute(query)
        documents = result.scalars().all()

        return [
            DocumentMetadataResponse(
                id=doc.id,
                file_path=doc.file_path,
                file_name=doc.file_name,
                file_type=doc.file_type,
                file_size=doc.file_size,
                processing_status=doc.processing_status,
                total_chunks=doc.total_chunks,
                total_tokens=doc.total_tokens,
                file_hash=doc.file_hash,
                error_message=doc.error_message,
                created_at=doc.created_at.isoformat(),
                updated_at=doc.updated_at.isoformat()
            )
            for doc in documents
        ]

    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{document_id}", response_model=DocumentMetadataResponse)
async def get_document(
    document_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get details about a specific document.
    """
    try:
        result = await db.execute(
            select(DocumentMetadata).where(DocumentMetadata.id == document_id)
        )
        doc = result.scalar_one_or_none()

        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        return DocumentMetadataResponse(
            id=doc.id,
            file_path=doc.file_path,
            file_name=doc.file_name,
            file_type=doc.file_type,
            file_size=doc.file_size,
            processing_status=doc.processing_status,
            total_chunks=doc.total_chunks,
            total_tokens=doc.total_tokens,
            file_hash=doc.file_hash,
            error_message=doc.error_message,
            created_at=doc.created_at.isoformat(),
            updated_at=doc.updated_at.isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{document_id}/chunks")
async def get_document_chunks(
    document_id: int,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Get chunks for a specific document.
    """
    try:
        # Get document metadata
        doc_result = await db.execute(
            select(DocumentMetadata).where(DocumentMetadata.id == document_id)
        )
        doc = doc_result.scalar_one_or_none()

        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # Get chunks
        chunks_result = await db.execute(
            select(DocumentChunk)
            .where(DocumentChunk.source_document == doc.file_name)
            .order_by(DocumentChunk.chunk_index)
            .limit(limit)
            .offset(offset)
        )
        chunks = chunks_result.scalars().all()

        return {
            "document_id": document_id,
            "file_name": doc.file_name,
            "total_chunks": doc.total_chunks,
            "chunks": [
                {
                    "id": chunk.id,
                    "chunk_index": chunk.chunk_index,
                    "content": chunk.content,
                    "section_title": chunk.section_title,
                    "token_count": chunk.token_count,
                    "content_hash": chunk.content_hash
                }
                for chunk in chunks
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document chunks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/trigger-ingestion", response_model=IngestionTriggerResponse)
async def trigger_ingestion(
    background_tasks: BackgroundTasks
):
    """
    Trigger document ingestion process.
    This runs the ingestion script in the background.

    Note: For production, this should be secured with authentication.
    """
    try:
        # Add ingestion task to background
        background_tasks.add_task(run_ingestion_script)

        return IngestionTriggerResponse(
            message="Document ingestion started in background",
            status="processing"
        )

    except Exception as e:
        logger.error(f"Error triggering ingestion: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def run_ingestion_script():
    """
    Run the document ingestion script.
    This is executed as a background task.
    """
    import subprocess
    import sys
    from pathlib import Path

    try:
        logger.info("Starting document ingestion...")

        # Get script path
        script_path = Path(__file__).parent.parent.parent / "scripts" / "ingest_documents.py"

        # Run the ingestion script
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            timeout=600  # 10 minute timeout
        )

        if result.returncode == 0:
            logger.info("Document ingestion completed successfully")
            logger.info(result.stdout)
        else:
            logger.error(f"Document ingestion failed: {result.stderr}")

    except subprocess.TimeoutExpired:
        logger.error("Document ingestion timed out")
    except Exception as e:
        logger.error(f"Error running ingestion script: {e}", exc_info=True)


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a document and all its chunks from the database.
    """
    try:
        # Get document
        doc_result = await db.execute(
            select(DocumentMetadata).where(DocumentMetadata.id == document_id)
        )
        doc = doc_result.scalar_one_or_none()

        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # Delete chunks
        await db.execute(
            text("DELETE FROM document_chunks WHERE source_document = :source"),
            {"source": doc.file_name}
        )

        # Delete metadata
        await db.delete(doc)
        await db.commit()

        return {
            "message": f"Document {doc.file_name} deleted successfully",
            "deleted_chunks": doc.total_chunks
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
