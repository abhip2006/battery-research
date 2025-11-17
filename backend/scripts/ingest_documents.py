"""
Document ingestion script for RAG system.
Processes markdown and JSON files, generates embeddings, and stores in PostgreSQL.
"""
import asyncio
import json
import logging
from pathlib import Path
from typing import List, Dict, Any
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select, text
from app.database import AsyncSessionLocal, engine
from app.models.document import DocumentChunk as DocumentChunkModel, DocumentMetadata
from app.services.document_processor import MarkdownDocumentProcessor, DocumentChunk
from app.services.embedding_service import EmbeddingService
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DocumentIngestionService:
    """Service to ingest documents into the vector database."""

    def __init__(self):
        self.embedding_service = EmbeddingService(
            provider=settings.EMBEDDING_PROVIDER,
            api_key=settings.OPENAI_API_KEY
        )
        self.markdown_processor = MarkdownDocumentProcessor(
            chunk_size=1000,
            chunk_overlap=200,
            min_chunk_size=100
        )

    async def ingest_markdown_file(
        self,
        file_path: str,
        db_session
    ) -> Dict[str, Any]:
        """
        Ingest a single markdown file.

        Args:
            file_path: Path to markdown file
            db_session: Database session

        Returns:
            Dictionary with ingestion statistics
        """
        logger.info(f"Processing markdown file: {file_path}")

        # Check if already processed
        result = await db_session.execute(
            select(DocumentMetadata).where(DocumentMetadata.file_path == file_path)
        )
        existing_metadata = result.scalar_one_or_none()

        # Process document
        chunks, metadata = self.markdown_processor.process_document(file_path)

        # Check if file has changed (compare hashes)
        if existing_metadata:
            if existing_metadata.file_hash == metadata['file_hash']:
                logger.info(f"File {file_path} unchanged, skipping")
                return {
                    "file": file_path,
                    "status": "skipped",
                    "chunks": 0
                }
            else:
                logger.info(f"File {file_path} changed, re-processing")
                # Delete old chunks
                await db_session.execute(
                    text("DELETE FROM document_chunks WHERE source_document = :source"),
                    {"source": metadata['file_name']}
                )
                existing_metadata.processing_status = "processing"
        else:
            # Create new metadata entry
            existing_metadata = DocumentMetadata(
                file_path=file_path,
                file_name=metadata['file_name'],
                file_type='markdown',
                file_size=metadata['file_size'],
                file_hash=metadata['file_hash'],
                processing_status='processing'
            )
            db_session.add(existing_metadata)

        await db_session.flush()

        # Generate embeddings for all chunks
        logger.info(f"Generating embeddings for {len(chunks)} chunks")
        chunk_texts = [chunk.content for chunk in chunks]
        embeddings = await self.embedding_service.embed_batch(chunk_texts)

        # Store chunks with embeddings
        total_tokens = 0
        for chunk, embedding in zip(chunks, embeddings):
            # Calculate approximate token count
            token_count = len(chunk.content) // 4
            total_tokens += token_count

            db_chunk = DocumentChunkModel(
                source_document=chunk.source_document,
                chunk_index=chunk.chunk_index,
                content=chunk.content,
                content_hash=chunk.content_hash,
                section_title=chunk.section_title,
                chunk_metadata=chunk.chunk_metadata,
                embedding=embedding,
                token_count=token_count
            )
            db_session.add(db_chunk)

        # Update metadata
        existing_metadata.total_chunks = len(chunks)
        existing_metadata.total_tokens = total_tokens
        existing_metadata.processing_status = 'completed'

        await db_session.commit()

        logger.info(f"Successfully ingested {len(chunks)} chunks from {file_path}")

        return {
            "file": file_path,
            "status": "completed",
            "chunks": len(chunks),
            "tokens": total_tokens
        }

    async def ingest_json_as_document(
        self,
        file_path: str,
        db_session,
        title: str = None
    ) -> Dict[str, Any]:
        """
        Ingest JSON data as a structured document.
        Converts JSON to readable text format for embedding.

        Args:
            file_path: Path to JSON file
            db_session: Database session
            title: Optional title for the document

        Returns:
            Dictionary with ingestion statistics
        """
        logger.info(f"Processing JSON file: {file_path}")

        file_name = Path(file_path).name

        # Check if already processed
        result = await db_session.execute(
            select(DocumentMetadata).where(DocumentMetadata.file_path == file_path)
        )
        existing_metadata = result.scalar_one_or_none()

        # Load JSON
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Generate hash
        import hashlib
        file_hash = hashlib.sha256(
            json.dumps(data, sort_keys=True).encode()
        ).hexdigest()

        # Check if changed
        if existing_metadata and existing_metadata.file_hash == file_hash:
            logger.info(f"File {file_path} unchanged, skipping")
            return {
                "file": file_path,
                "status": "skipped",
                "chunks": 0
            }

        # Convert JSON to text chunks based on structure
        chunks = []

        if isinstance(data, list):
            # Array of objects (like companies, technologies)
            for idx, item in enumerate(data):
                if isinstance(item, dict):
                    # Format as readable text
                    text = self._format_json_object(item, title or file_name)
                    chunks.append({
                        "content": text,
                        "index": idx,
                        "metadata": {"original_index": idx}
                    })
        elif isinstance(data, dict):
            # Single object or nested structure
            text = self._format_json_object(data, title or file_name)
            chunks.append({
                "content": text,
                "index": 0,
                "metadata": {}
            })

        # Clean up old chunks if re-processing
        if existing_metadata:
            await db_session.execute(
                text("DELETE FROM document_chunks WHERE source_document = :source"),
                {"source": file_name}
            )
            existing_metadata.processing_status = "processing"
        else:
            # Create new metadata
            existing_metadata = DocumentMetadata(
                file_path=file_path,
                file_name=file_name,
                file_type='json',
                file_size=Path(file_path).stat().st_size,
                file_hash=file_hash,
                processing_status='processing'
            )
            db_session.add(existing_metadata)

        await db_session.flush()

        # Generate embeddings
        logger.info(f"Generating embeddings for {len(chunks)} JSON chunks")
        chunk_texts = [c["content"] for c in chunks]
        embeddings = await self.embedding_service.embed_batch(chunk_texts)

        # Store chunks
        total_tokens = 0
        for chunk_data, embedding in zip(chunks, embeddings):
            content = chunk_data["content"]
            token_count = len(content) // 4
            total_tokens += token_count

            # Generate content hash
            content_hash = hashlib.sha256(content.encode()).hexdigest()

            db_chunk = DocumentChunkModel(
                source_document=file_name,
                chunk_index=chunk_data["index"],
                content=content,
                content_hash=content_hash,
                section_title=title,
                chunk_metadata=chunk_data["metadata"],
                embedding=embedding,
                token_count=token_count
            )
            db_session.add(db_chunk)

        # Update metadata
        existing_metadata.total_chunks = len(chunks)
        existing_metadata.total_tokens = total_tokens
        existing_metadata.processing_status = 'completed'

        await db_session.commit()

        logger.info(f"Successfully ingested {len(chunks)} chunks from {file_path}")

        return {
            "file": file_path,
            "status": "completed",
            "chunks": len(chunks),
            "tokens": total_tokens
        }

    def _format_json_object(self, obj: Dict[str, Any], title: str) -> str:
        """Format JSON object as readable text."""
        lines = [f"# {title}\n"]

        for key, value in obj.items():
            # Convert camelCase/snake_case to readable format
            readable_key = key.replace('_', ' ').replace('-', ' ').title()

            if isinstance(value, (list, dict)):
                # Complex nested structures
                lines.append(f"\n## {readable_key}")
                if isinstance(value, list):
                    for item in value:
                        if isinstance(item, str):
                            lines.append(f"- {item}")
                        else:
                            lines.append(f"- {json.dumps(item)}")
                else:
                    lines.append(json.dumps(value, indent=2))
            else:
                # Simple key-value
                lines.append(f"**{readable_key}**: {value}")

        return '\n'.join(lines)


async def main():
    """Main ingestion process."""

    # Initialize database
    async with engine.begin() as conn:
        # Enable pgvector extension
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))

    # Create ingestion service
    service = DocumentIngestionService()

    # Get project root
    project_root = Path(__file__).parent.parent.parent

    # Define files to ingest
    markdown_files = [
        project_root / "battery-research.md",
        project_root / "agents.md",
        project_root / "readMe.md",
    ]

    json_files = [
        {
            "path": project_root / "data" / "companies-detailed.json",
            "title": "Battery Companies Database"
        },
        {
            "path": project_root / "data" / "technology-specs.json",
            "title": "Battery Technology Specifications"
        },
        {
            "path": project_root / "data" / "timeline-complete.json",
            "title": "Battery Industry Timeline"
        },
    ]

    results = []

    async with AsyncSessionLocal() as session:
        # Process markdown files
        logger.info("=" * 60)
        logger.info("INGESTING MARKDOWN FILES")
        logger.info("=" * 60)

        for md_file in markdown_files:
            if md_file.exists():
                try:
                    result = await service.ingest_markdown_file(str(md_file), session)
                    results.append(result)
                except Exception as e:
                    logger.error(f"Error processing {md_file}: {e}", exc_info=True)
                    results.append({
                        "file": str(md_file),
                        "status": "failed",
                        "error": str(e)
                    })
            else:
                logger.warning(f"File not found: {md_file}")

        # Process JSON files
        logger.info("\n" + "=" * 60)
        logger.info("INGESTING JSON FILES")
        logger.info("=" * 60)

        for json_file_config in json_files:
            json_file = json_file_config["path"]
            title = json_file_config.get("title")

            if json_file.exists():
                try:
                    result = await service.ingest_json_as_document(
                        str(json_file),
                        session,
                        title=title
                    )
                    results.append(result)
                except Exception as e:
                    logger.error(f"Error processing {json_file}: {e}", exc_info=True)
                    results.append({
                        "file": str(json_file),
                        "status": "failed",
                        "error": str(e)
                    })
            else:
                logger.warning(f"File not found: {json_file}")

    # Print summary
    logger.info("\n" + "=" * 60)
    logger.info("INGESTION SUMMARY")
    logger.info("=" * 60)

    total_chunks = sum(r.get("chunks", 0) for r in results)
    total_tokens = sum(r.get("tokens", 0) for r in results)
    successful = sum(1 for r in results if r["status"] == "completed")
    failed = sum(1 for r in results if r["status"] == "failed")
    skipped = sum(1 for r in results if r["status"] == "skipped")

    logger.info(f"Files processed: {len(results)}")
    logger.info(f"  ✓ Successful: {successful}")
    logger.info(f"  ⊘ Skipped: {skipped}")
    logger.info(f"  ✗ Failed: {failed}")
    logger.info(f"\nTotal chunks created: {total_chunks}")
    logger.info(f"Total tokens: {total_tokens:,}")
    logger.info(f"Estimated cost (OpenAI): ${(total_tokens * 0.00002):.4f}")

    # Print detailed results
    logger.info("\nDetailed results:")
    for result in results:
        status_symbol = "✓" if result["status"] == "completed" else "✗" if result["status"] == "failed" else "⊘"
        logger.info(f"  {status_symbol} {result['file']}: {result['status']}")
        if result.get("chunks"):
            logger.info(f"      Chunks: {result['chunks']}, Tokens: {result.get('tokens', 0):,}")
        if result.get("error"):
            logger.info(f"      Error: {result['error']}")


if __name__ == "__main__":
    asyncio.run(main())
