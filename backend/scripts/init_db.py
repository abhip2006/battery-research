"""
Database initialization script.
Creates all tables and enables pgvector extension.
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import engine, Base
from app.models import (
    Company,
    Facility,
    Technology,
    Policy,
    Forecast,
    Source,
    Citation,
    DocumentChunk,
    DocumentMetadata,
    Conversation,
    Message,
)
from sqlalchemy import text


async def init_database():
    """Initialize database by creating all tables and enabling extensions."""
    print("Initializing database...")

    async with engine.begin() as conn:
        # Enable pgvector extension
        print("Enabling pgvector extension...")
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))

        # Drop all tables (for development - comment out in production!)
        # print("Dropping existing tables...")
        # await conn.run_sync(Base.metadata.drop_all)

        # Create all tables
        print("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)

    print("Database initialization complete!")
    print("\nCreated tables:")
    for table in Base.metadata.sorted_tables:
        print(f"  - {table.name}")


if __name__ == "__main__":
    asyncio.run(init_database())
