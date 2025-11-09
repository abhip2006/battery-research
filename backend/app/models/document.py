"""
Document and chunk models for RAG system.
Stores document chunks with vector embeddings for semantic search.
"""
from typing import Optional
from sqlalchemy import String, Text, Integer, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column
from pgvector.sqlalchemy import Vector
from app.database import Base
from app.models.base import TimestampMixin


class DocumentChunk(Base, TimestampMixin):
    """
    Represents a chunk of a source document with its embedding.
    
    Used for RAG (Retrieval Augmented Generation) to find relevant
    context for user queries through vector similarity search.
    """
    __tablename__ = "document_chunks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Document metadata
    source_document: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Content
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    
    # Metadata for citations
    section_title: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Vector embedding for similarity search
    embedding: Mapped[Vector] = mapped_column(Vector(1536), nullable=False)
    
    # Token count for cost tracking
    token_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    def __repr__(self) -> str:
        return f"<DocumentChunk(id={self.id}, source='{self.source_document}', chunk={self.chunk_index})>"


class DocumentMetadata(Base, TimestampMixin):
    """
    Stores metadata about source documents.
    Tracks processing status and statistics.
    """
    __tablename__ = "document_metadata"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Document info
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False, unique=True, index=True)
    file_name: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Processing status
    processing_status: Mapped[str] = mapped_column(
        String(50), 
        nullable=False, 
        default="pending",
        index=True
    )  # pending, processing, completed, failed
    
    # Statistics
    total_chunks: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Checksum for detecting changes
    file_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    
    # Error tracking
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    def __repr__(self) -> str:
        return f"<DocumentMetadata(id={self.id}, file='{self.file_name}', status='{self.processing_status}')>"
