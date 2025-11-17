"""
Application configuration using Pydantic Settings.
Loads configuration from environment variables and .env file.
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator


class Settings(BaseSettings):
    """Application settings with validation."""

    # Application
    APP_NAME: str = "US Battery Industry Intelligence Platform"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # API
    API_V1_PREFIX: str = "/api/v1"

    # Database
    POSTGRES_USER: str = "battery_user"
    POSTGRES_PASSWORD: str = "battery_pass"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "battery_intelligence"
    DATABASE_URL: str | None = None

    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: str | None, values: dict) -> str:
        """Construct database URL from components if not provided."""
        if isinstance(v, str):
            return v
        return (
            f"postgresql+asyncpg://{values.get('POSTGRES_USER')}:"
            f"{values.get('POSTGRES_PASSWORD')}@"
            f"{values.get('POSTGRES_HOST')}:"
            f"{values.get('POSTGRES_PORT')}/"
            f"{values.get('POSTGRES_DB')}"
        )

    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] | List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8080",
    ]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        raise ValueError(v)

    # Security
    SECRET_KEY: str = "change-this-to-a-random-secret-key-min-32-characters"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Provider Selection
    LLM_PROVIDER: str = "gemini"  # "anthropic" or "gemini"
    EMBEDDING_PROVIDER: str = "gemini"  # "openai", "gemini", "cohere", or "local"

    # Google Gemini Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_EMBEDDING_MODEL: str = "models/text-embedding-004"
    GEMINI_LLM_MODEL: str = "gemini-2.0-flash-exp"
    GEMINI_EMBEDDING_DIMENSIONS: int = 768

    # OpenAI / Embeddings
    OPENAI_API_KEY: str = ""
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSIONS: int = 1536

    # Anthropic Configuration
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"
    MAX_TOKENS: int = 4096

    # Cohere Configuration
    COHERE_API_KEY: str = ""

    # Local Embedding Configuration (sentence-transformers)
    LOCAL_EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # RAG Configuration
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    TOP_K_RESULTS: int = 5
    ENABLE_RERANKING: bool = True
    CONVERSATION_MEMORY_LIMIT: int = 10

    # Vector Search
    VECTOR_SIMILARITY_THRESHOLD: float = 0.7
    MAX_SEARCH_RESULTS: int = 10

    # Citation Configuration
    ENABLE_CITATIONS: bool = True
    MIN_CITATION_CONFIDENCE: float = 0.7

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
