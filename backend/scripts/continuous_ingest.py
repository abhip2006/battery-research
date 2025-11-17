"""
Continuous research ingestion monitor for RAG system.
Monitors markdown files for changes and automatically ingests them into vector database.
"""
import asyncio
import sys
import time
from pathlib import Path
from typing import Dict, Set
import hashlib
import logging
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileModifiedEvent, FileCreatedEvent

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text

from app.config import settings
from app.database import Base
from app.services.embedding_service import create_embedding_service
from scripts.process_documents import DocumentIngestionPipeline

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ResearchFileHandler(FileSystemEventHandler):
    """Handler for markdown file changes."""

    def __init__(self, callback):
        self.callback = callback
        self.processing = set()

    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith('.md'):
            logger.info(f"New file detected: {event.src_path}")
            self._queue_processing(event.src_path)

    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith('.md'):
            logger.info(f"File modified: {event.src_path}")
            self._queue_processing(event.src_path)

    def _queue_processing(self, file_path: str):
        """Queue file for processing with debouncing."""
        if file_path not in self.processing:
            self.processing.add(file_path)
            # Schedule processing after a short delay to avoid multiple rapid changes
            asyncio.create_task(self._process_after_delay(file_path))

    async def _process_after_delay(self, file_path: str):
        """Process file after a delay to ensure file is fully written."""
        await asyncio.sleep(2)  # Wait 2 seconds
        try:
            await self.callback(file_path)
        finally:
            self.processing.discard(file_path)


class ContinuousIngestionMonitor:
    """Monitors and continuously ingests research documents."""

    def __init__(self):
        self.engine = None
        self.session_maker = None
        self.embedding_service = None
        self.observers = []
        self.watch_paths = []
        self.last_scan = {}

    async def initialize(self):
        """Initialize database connection and services."""
        logger.info("Initializing continuous ingestion monitor...")

        # Create async engine
        self.engine = create_async_engine(settings.DATABASE_URL, echo=False)

        # Ensure database and extensions are set up
        async with self.engine.begin() as conn:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            await conn.run_sync(Base.metadata.create_all)

        # Create session factory
        self.session_maker = async_sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )

        # Initialize embedding service
        if settings.EMBEDDING_PROVIDER == "gemini":
            self.embedding_service = create_embedding_service(
                provider_type="gemini",
                api_key=settings.GEMINI_API_KEY,
                model=settings.GEMINI_EMBEDDING_MODEL
            )
        elif settings.EMBEDDING_PROVIDER == "local":
            self.embedding_service = create_embedding_service(
                provider_type="local",
                model=settings.LOCAL_EMBEDDING_MODEL if hasattr(settings, 'LOCAL_EMBEDDING_MODEL') else "all-MiniLM-L6-v2"
            )
        else:
            # Default to OpenAI
            self.embedding_service = create_embedding_service(
                provider_type="openai",
                api_key=settings.OPENAI_API_KEY,
                model=settings.EMBEDDING_MODEL,
                dimensions=settings.EMBEDDING_DIMENSIONS
            )

        logger.info(f"Using embedding provider: {settings.EMBEDDING_PROVIDER}")
        logger.info(f"Embedding dimensions: {settings.EMBEDDING_DIMENSIONS}")

    async def process_file(self, file_path: str):
        """Process a single markdown file."""
        logger.info(f"Processing: {file_path}")

        async with self.session_maker() as session:
            pipeline = DocumentIngestionPipeline(
                db_session=session,
                embedding_service=self.embedding_service,
                chunk_size=settings.CHUNK_SIZE,
                chunk_overlap=settings.CHUNK_OVERLAP
            )

            try:
                await pipeline.process_document(file_path)
                logger.info(f"✓ Successfully processed: {file_path}")
            except Exception as e:
                logger.error(f"✗ Error processing {file_path}: {e}", exc_info=True)

    def setup_watchers(self):
        """Set up file system watchers for research directories."""
        project_root = Path(__file__).parent.parent.parent

        # Directories to watch
        watch_dirs = [
            project_root,  # Project root for main research files
            project_root / "agent-outputs",  # Agent outputs
            project_root / "research",  # Research directory if it exists
            project_root / "data",  # Data directory
        ]

        for watch_dir in watch_dirs:
            if watch_dir.exists():
                logger.info(f"Watching directory: {watch_dir}")

                handler = ResearchFileHandler(callback=self.process_file)
                observer = Observer()
                observer.schedule(handler, str(watch_dir), recursive=True)
                observer.start()

                self.observers.append(observer)
                self.watch_paths.append(watch_dir)

    async def initial_scan(self):
        """Perform initial scan of all markdown files."""
        logger.info("Performing initial scan of all markdown files...")

        project_root = Path(__file__).parent.parent.parent

        # Find all markdown files
        md_files = []
        for watch_path in self.watch_paths:
            md_files.extend(watch_path.glob("**/*.md"))

        # Remove duplicates
        md_files = list(set(md_files))

        logger.info(f"Found {len(md_files)} markdown files")

        # Process each file
        for md_file in md_files:
            await self.process_file(str(md_file))

        logger.info("Initial scan completed")

    async def periodic_scan(self, interval: int = 3600):
        """Periodically scan for new files (every hour by default)."""
        while True:
            await asyncio.sleep(interval)
            logger.info("Running periodic scan...")
            await self.initial_scan()

    async def run(self, initial_scan: bool = True, watch: bool = True):
        """Run the continuous ingestion monitor."""
        try:
            await self.initialize()

            if watch:
                self.setup_watchers()

            if initial_scan:
                await self.initial_scan()

            if watch:
                logger.info("Continuous monitoring active. Press Ctrl+C to stop.")
                # Run periodic scan in background
                periodic_task = asyncio.create_task(self.periodic_scan())

                # Keep running
                try:
                    while True:
                        await asyncio.sleep(1)
                except KeyboardInterrupt:
                    logger.info("Shutting down...")
                    periodic_task.cancel()

        finally:
            # Stop all observers
            for observer in self.observers:
                observer.stop()
                observer.join()

            # Close database
            if self.engine:
                await self.engine.dispose()


async def main():
    """Main function."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Continuous research ingestion monitor for RAG system"
    )
    parser.add_argument(
        "--no-initial-scan",
        action="store_true",
        help="Skip initial scan of existing files"
    )
    parser.add_argument(
        "--no-watch",
        action="store_true",
        help="Don't watch for file changes (just do initial scan and exit)"
    )

    args = parser.parse_args()

    monitor = ContinuousIngestionMonitor()
    await monitor.run(
        initial_scan=not args.no_initial_scan,
        watch=not args.no_watch
    )


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Stopped by user")
