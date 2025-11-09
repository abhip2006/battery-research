"""
Script to process research documents and populate vector database.
Run this to initialize the RAG system with document embeddings.
"""
import asyncio
import sys
from pathlib import Path
from typing import List
import logging

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.config import settings
from app.models.document import DocumentChunk, DocumentMetadata
from app.database import Base
from app.services.document_processor import MarkdownDocumentProcessor, count_tokens_approximate
from app.services.embedding_service import create_embedding_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DocumentIngestionPipeline:
    """Pipeline for processing and ingesting documents into vector database."""
    
    def __init__(
        self,
        db_session: AsyncSession,
        embedding_service,
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ):
        self.db = db_session
        self.embedding_service = embedding_service
        self.processor = MarkdownDocumentProcessor(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
    
    async def process_document(self, file_path: str) -> None:
        """Process a single document."""
        logger.info(f"Processing document: {file_path}")
        
        try:
            # Check if document already processed
            result = await self.db.execute(
                select(DocumentMetadata).where(
                    DocumentMetadata.file_path == file_path
                )
            )
            existing = result.scalar_one_or_none()
            
            # Process document into chunks
            chunks, metadata = self.processor.process_document(file_path)
            
            # Check if file changed (compare hash)
            if existing and existing.file_hash == metadata["file_hash"]:
                logger.info(f"Document unchanged, skipping: {file_path}")
                return
            
            # Update metadata record
            if existing:
                logger.info(f"Document changed, reprocessing: {file_path}")
                existing.processing_status = "processing"
                await self.db.flush()
            else:
                doc_metadata = DocumentMetadata(
                    file_path=file_path,
                    file_name=metadata["file_name"],
                    file_type="markdown",
                    file_size=metadata["file_size"],
                    file_hash=metadata["file_hash"],
                    processing_status="processing"
                )
                self.db.add(doc_metadata)
                await self.db.flush()
            
            logger.info(f"Generated {len(chunks)} chunks")
            
            # Generate embeddings in batches
            batch_size = 50
            total_chunks = len(chunks)
            
            for i in range(0, total_chunks, batch_size):
                batch = chunks[i:i + batch_size]
                logger.info(f"Processing batch {i//batch_size + 1}/{(total_chunks-1)//batch_size + 1}")
                
                # Extract text content
                texts = [chunk.content for chunk in batch]
                
                # Generate embeddings
                embeddings = await self.embedding_service.embed_texts(texts)
                
                # Store in database
                for chunk, embedding in zip(batch, embeddings):
                    # Check if chunk already exists (by hash)
                    existing_chunk = await self.db.execute(
                        select(DocumentChunk).where(
                            DocumentChunk.content_hash == chunk.content_hash
                        )
                    )
                    existing_chunk = existing_chunk.scalar_one_or_none()
                    
                    if existing_chunk:
                        # Update existing chunk
                        existing_chunk.embedding = embedding
                    else:
                        # Create new chunk
                        db_chunk = DocumentChunk(
                            source_document=chunk.source_document,
                            chunk_index=chunk.chunk_index,
                            content=chunk.content,
                            content_hash=chunk.content_hash,
                            section_title=chunk.section_title,
                            chunk_metadata=chunk.chunk_metadata,
                            embedding=embedding,
                            token_count=count_tokens_approximate(chunk.content)
                        )
                        self.db.add(db_chunk)
                
                await self.db.flush()
            
            # Update metadata
            if existing:
                existing.processing_status = "completed"
                existing.total_chunks = len(chunks)
                existing.total_tokens = sum(count_tokens_approximate(c.content) for c in chunks)
                existing.error_message = None
            else:
                doc_metadata = await self.db.execute(
                    select(DocumentMetadata).where(
                        DocumentMetadata.file_path == file_path
                    )
                )
                doc_metadata = doc_metadata.scalar_one()
                doc_metadata.processing_status = "completed"
                doc_metadata.total_chunks = len(chunks)
                doc_metadata.total_tokens = sum(count_tokens_approximate(c.content) for c in chunks)
            
            await self.db.commit()
            logger.info(f"Successfully processed: {file_path}")
            
        except Exception as e:
            logger.error(f"Error processing {file_path}: {e}", exc_info=True)
            
            # Update metadata with error
            result = await self.db.execute(
                select(DocumentMetadata).where(
                    DocumentMetadata.file_path == file_path
                )
            )
            doc_metadata = result.scalar_one_or_none()
            if doc_metadata:
                doc_metadata.processing_status = "failed"
                doc_metadata.error_message = str(e)
                await self.db.commit()
            
            raise
    
    async def process_directory(self, directory: str) -> None:
        """Process all markdown files in a directory."""
        directory_path = Path(directory)
        
        # Find all markdown files
        md_files = list(directory_path.glob("*.md"))
        logger.info(f"Found {len(md_files)} markdown files in {directory}")
        
        for md_file in md_files:
            await self.process_document(str(md_file))


async def main():
    """Main function to run document processing."""
    # Create async engine
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    
    # Create tables
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session factory
    AsyncSessionLocal = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    # Initialize embedding service
    embedding_service = create_embedding_service(
        provider_type="openai",
        api_key=settings.OPENAI_API_KEY,
        model=settings.EMBEDDING_MODEL,
        dimensions=settings.EMBEDDING_DIMENSIONS
    )
    
    logger.info(f"Using embedding model: {settings.EMBEDDING_MODEL}")
    logger.info(f"Embedding dimensions: {settings.EMBEDDING_DIMENSIONS}")
    
    # Process documents
    async with AsyncSessionLocal() as session:
        pipeline = DocumentIngestionPipeline(
            db_session=session,
            embedding_service=embedding_service,
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )
        
        # Get project root directory (where markdown files are)
        project_root = Path(__file__).parent.parent.parent
        
        # Process all markdown files in project root
        logger.info(f"Processing documents in: {project_root}")
        await pipeline.process_directory(str(project_root))
        
        # Also process agent-outputs directory
        agent_outputs = project_root / "agent-outputs"
        if agent_outputs.exists():
            logger.info(f"Processing documents in: {agent_outputs}")
            await pipeline.process_directory(str(agent_outputs))
    
    await engine.dispose()
    logger.info("Document processing completed!")


if __name__ == "__main__":
    asyncio.run(main())
