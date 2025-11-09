"""
Embedding generation service for RAG system.
Supports multiple embedding providers (OpenAI, Cohere, local models).
"""
from typing import List, Dict, Any, Optional
from abc import ABC, abstractmethod
import numpy as np
from openai import AsyncOpenAI
import logging

logger = logging.getLogger(__name__)


class EmbeddingProvider(ABC):
    """Abstract base class for embedding providers."""
    
    @abstractmethod
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text."""
        pass
    
    @abstractmethod
    async def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        pass
    
    @property
    @abstractmethod
    def dimensions(self) -> int:
        """Return embedding dimensions."""
        pass


class OpenAIEmbeddingProvider(EmbeddingProvider):
    """
    OpenAI embedding provider.
    Uses text-embedding-3-small or text-embedding-3-large models.
    """
    
    def __init__(
        self,
        api_key: str,
        model: str = "text-embedding-3-small",
        dimensions: int = 1536
    ):
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model
        self._dimensions = dimensions
        
        # Model dimension mapping
        self.model_dimensions = {
            "text-embedding-3-small": 1536,
            "text-embedding-3-large": 3072,
            "text-embedding-ada-002": 1536
        }
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for single text."""
        try:
            response = await self.client.embeddings.create(
                input=text,
                model=self.model,
                dimensions=self._dimensions
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    async def generate_embeddings_batch(
        self,
        texts: List[str],
        batch_size: int = 100
    ) -> List[List[float]]:
        """Generate embeddings for multiple texts in batches."""
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            try:
                response = await self.client.embeddings.create(
                    input=batch,
                    model=self.model,
                    dimensions=self._dimensions
                )
                embeddings = [item.embedding for item in response.data]
                all_embeddings.extend(embeddings)
            except Exception as e:
                logger.error(f"Error generating batch embeddings: {e}")
                raise
        
        return all_embeddings
    
    @property
    def dimensions(self) -> int:
        return self._dimensions


class CohereEmbeddingProvider(EmbeddingProvider):
    """
    Cohere embedding provider.
    Alternative to OpenAI with competitive quality.
    """
    
    def __init__(self, api_key: str, model: str = "embed-english-v3.0"):
        try:
            import cohere
            self.client = cohere.AsyncClient(api_key)
            self.model = model
            self._dimensions = 1024  # Cohere embed-english-v3.0 dimensions
        except ImportError:
            raise ImportError("Cohere package not installed. Install with: pip install cohere")
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for single text."""
        try:
            response = await self.client.embed(
                texts=[text],
                model=self.model,
                input_type="search_document"
            )
            return response.embeddings[0]
        except Exception as e:
            logger.error(f"Error generating Cohere embedding: {e}")
            raise
    
    async def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        try:
            response = await self.client.embed(
                texts=texts,
                model=self.model,
                input_type="search_document"
            )
            return response.embeddings
        except Exception as e:
            logger.error(f"Error generating Cohere batch embeddings: {e}")
            raise
    
    @property
    def dimensions(self) -> int:
        return self._dimensions


class GeminiEmbeddingProvider(EmbeddingProvider):
    """
    Google Gemini embedding provider.
    Uses models/text-embedding-004 (768 dimensions) or models/embedding-001 (768 dimensions).
    """

    def __init__(self, api_key: str, model: str = "models/text-embedding-004"):
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            self.model = model
            self._dimensions = 768  # Gemini text-embedding-004 dimensions
        except ImportError:
            raise ImportError("Google GenerativeAI package not installed. Install with: pip install google-generativeai")

    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for single text."""
        try:
            import google.generativeai as genai
            result = genai.embed_content(
                model=self.model,
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            logger.error(f"Error generating Gemini embedding: {e}")
            raise

    async def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        try:
            import google.generativeai as genai
            # Gemini supports batch embedding
            embeddings = []
            for text in texts:
                result = genai.embed_content(
                    model=self.model,
                    content=text,
                    task_type="retrieval_document"
                )
                embeddings.append(result['embedding'])
            return embeddings
        except Exception as e:
            logger.error(f"Error generating Gemini batch embeddings: {e}")
            raise

    @property
    def dimensions(self) -> int:
        return self._dimensions


class LocalEmbeddingProvider(EmbeddingProvider):
    """
    Local embedding provider using sentence-transformers.
    No API costs, runs on local hardware.
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(model_name)
            self._dimensions = self.model.get_sentence_embedding_dimension()
        except ImportError:
            raise ImportError(
                "sentence-transformers not installed. "
                "Install with: pip install sentence-transformers"
            )
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for single text."""
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    
    async def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        embeddings = self.model.encode(texts, convert_to_numpy=True, show_progress_bar=True)
        return embeddings.tolist()
    
    @property
    def dimensions(self) -> int:
        return self._dimensions


class EmbeddingService:
    """
    Main embedding service that manages providers.
    Handles caching, retries, and provider switching.
    """
    
    def __init__(
        self,
        provider: EmbeddingProvider,
        cache_enabled: bool = False
    ):
        self.provider = provider
        self.cache_enabled = cache_enabled
        self._cache: Dict[str, List[float]] = {}
    
    async def embed_text(self, text: str) -> List[float]:
        """Generate embedding with optional caching."""
        if self.cache_enabled and text in self._cache:
            return self._cache[text]
        
        embedding = await self.provider.generate_embedding(text)
        
        if self.cache_enabled:
            self._cache[text] = embedding
        
        return embedding
    
    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        # Check cache for already embedded texts
        if self.cache_enabled:
            uncached_texts = []
            uncached_indices = []
            results = [None] * len(texts)
            
            for i, text in enumerate(texts):
                if text in self._cache:
                    results[i] = self._cache[text]
                else:
                    uncached_texts.append(text)
                    uncached_indices.append(i)
            
            # Generate embeddings for uncached texts
            if uncached_texts:
                new_embeddings = await self.provider.generate_embeddings_batch(uncached_texts)
                
                for idx, embedding in zip(uncached_indices, new_embeddings):
                    results[idx] = embedding
                    self._cache[texts[idx]] = embedding
            
            return results
        else:
            return await self.provider.generate_embeddings_batch(texts)
    
    def clear_cache(self):
        """Clear embedding cache."""
        self._cache.clear()
    
    @property
    def dimensions(self) -> int:
        """Get embedding dimensions."""
        return self.provider.dimensions


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculate cosine similarity between two vectors.
    Returns value between -1 and 1 (1 = identical, 0 = orthogonal, -1 = opposite).
    """
    vec1_np = np.array(vec1)
    vec2_np = np.array(vec2)
    
    dot_product = np.dot(vec1_np, vec2_np)
    norm1 = np.linalg.norm(vec1_np)
    norm2 = np.linalg.norm(vec2_np)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return float(dot_product / (norm1 * norm2))


def create_embedding_service(
    provider_type: str = "openai",
    api_key: Optional[str] = None,
    model: Optional[str] = None,
    **kwargs
) -> EmbeddingService:
    """
    Factory function to create embedding service.

    Args:
        provider_type: "openai", "cohere", "gemini", or "local"
        api_key: API key for cloud providers
        model: Model name
        **kwargs: Additional provider-specific arguments

    Returns:
        Configured EmbeddingService instance
    """
    if provider_type == "openai":
        if not api_key:
            raise ValueError("OpenAI API key required")
        provider = OpenAIEmbeddingProvider(
            api_key=api_key,
            model=model or "text-embedding-3-small",
            **kwargs
        )
    elif provider_type == "cohere":
        if not api_key:
            raise ValueError("Cohere API key required")
        provider = CohereEmbeddingProvider(
            api_key=api_key,
            model=model or "embed-english-v3.0"
        )
    elif provider_type == "gemini":
        if not api_key:
            raise ValueError("Gemini API key required")
        provider = GeminiEmbeddingProvider(
            api_key=api_key,
            model=model or "models/text-embedding-004"
        )
    elif provider_type == "local":
        provider = LocalEmbeddingProvider(
            model_name=model or "all-MiniLM-L6-v2"
        )
    else:
        raise ValueError(f"Unknown provider type: {provider_type}")

    # Extract cache_enabled from kwargs if present, filter out provider-specific args
    cache_enabled = kwargs.get('cache_enabled', False)
    return EmbeddingService(provider=provider, cache_enabled=cache_enabled)
