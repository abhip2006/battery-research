"""
RAG (Retrieval Augmented Generation) service.
Handles query processing, similarity search, and context augmentation.
"""
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.models.document import DocumentChunk
from app.models.conversation import Conversation, Message
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class RetrievedContext:
    """Represents a retrieved document chunk with similarity score."""
    
    def __init__(
        self,
        content: str,
        source_document: str,
        section_title: Optional[str],
        similarity_score: float,
        chunk_id: int,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.content = content
        self.source_document = source_document
        self.section_title = section_title
        self.similarity_score = similarity_score
        self.chunk_id = chunk_id
        self.metadata = metadata or {}
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "content": self.content,
            "source_document": self.source_document,
            "section_title": self.section_title,
            "similarity_score": self.similarity_score,
            "chunk_id": self.chunk_id,
            "metadata": self.metadata
        }


class RAGService:
    """
    Main RAG service for query processing and response generation.
    
    Pipeline:
    1. Query embedding generation
    2. Vector similarity search
    3. Context ranking and filtering
    4. LLM response generation with citations
    """
    
    def __init__(
        self,
        embedding_service: EmbeddingService,
        llm_provider: str = "anthropic",
        llm_api_key: str = None,
        model: str = None,
        top_k: int = 5,
        similarity_threshold: float = 0.7
    ):
        self.embedding_service = embedding_service
        self.llm_provider = llm_provider
        self.top_k = top_k
        self.similarity_threshold = similarity_threshold

        # Initialize LLM client based on provider
        if llm_provider == "anthropic":
            from anthropic import AsyncAnthropic
            self.llm_client = AsyncAnthropic(api_key=llm_api_key)
            self.model = model or "claude-3-5-sonnet-20241022"
        elif llm_provider == "gemini":
            import google.generativeai as genai
            genai.configure(api_key=llm_api_key)
            self.llm_client = genai
            self.model = model or "gemini-2.0-flash-exp"
        else:
            raise ValueError(f"Unsupported LLM provider: {llm_provider}")
    
    async def search_similar_chunks(
        self,
        query: str,
        db: AsyncSession,
        top_k: Optional[int] = None,
        similarity_threshold: Optional[float] = None
    ) -> List[RetrievedContext]:
        """
        Search for document chunks similar to query using vector similarity.
        
        Args:
            query: User query text
            db: Database session
            top_k: Number of results to return (default: self.top_k)
            similarity_threshold: Minimum similarity score (default: self.similarity_threshold)
        
        Returns:
            List of RetrievedContext objects sorted by similarity
        """
        top_k = top_k or self.top_k
        similarity_threshold = similarity_threshold or self.similarity_threshold
        
        # Generate query embedding
        query_embedding = await self.embedding_service.embed_text(query)
        
        # Convert to pgvector format
        embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'
        
        # Perform vector similarity search using pgvector
        # Using cosine distance: 1 - cosine_similarity
        query_text = text("""
            SELECT 
                id,
                content,
                source_document,
                section_title,
                metadata,
                chunk_index,
                1 - (embedding <=> :query_embedding) as similarity
            FROM document_chunks
            WHERE 1 - (embedding <=> :query_embedding) > :threshold
            ORDER BY embedding <=> :query_embedding
            LIMIT :limit
        """)
        
        result = await db.execute(
            query_text,
            {
                "query_embedding": embedding_str,
                "threshold": similarity_threshold,
                "limit": top_k
            }
        )
        
        rows = result.fetchall()
        
        # Convert to RetrievedContext objects
        contexts = []
        for row in rows:
            context = RetrievedContext(
                content=row.content,
                source_document=row.source_document,
                section_title=row.section_title,
                similarity_score=float(row.similarity),
                chunk_id=row.id,
                chunk_metadata=row.chunk_metadata or {}
            )
            contexts.append(context)
        
        return contexts
    
    def format_context(self, contexts: List[RetrievedContext]) -> str:
        """
        Format retrieved contexts into a single string for LLM.
        Includes source citations.
        """
        if not contexts:
            return "No relevant context found."
        
        formatted_parts = []
        for i, ctx in enumerate(contexts, 1):
            section_info = f" - {ctx.section_title}" if ctx.section_title else ""
            source_info = f"[Source {i}: {ctx.source_document}{section_info}]"
            formatted_parts.append(
                f"{source_info}\n{ctx.content}\n"
            )
        
        return "\n---\n".join(formatted_parts)
    
    def generate_citations(self, contexts: List[RetrievedContext]) -> List[Dict[str, Any]]:
        """
        Generate citation metadata from retrieved contexts.
        """
        citations = []
        for i, ctx in enumerate(contexts, 1):
            citation = {
                "citation_id": i,
                "source_document": ctx.source_document,
                "section_title": ctx.section_title,
                "similarity_score": ctx.similarity_score,
                "chunk_id": ctx.chunk_id
            }
            citations.append(citation)
        return citations
    
    async def generate_response(
        self,
        query: str,
        contexts: List[RetrievedContext],
        conversation_history: Optional[List[Dict[str, str]]] = None,
        system_prompt: Optional[str] = None
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Generate LLM response using retrieved contexts.
        
        Args:
            query: User question
            contexts: Retrieved document chunks
            conversation_history: Previous messages in conversation
            system_prompt: Custom system prompt (optional)
        
        Returns:
            Tuple of (response_text, citations)
        """
        # Format context for prompt
        context_text = self.format_context(contexts)
        
        # Default system prompt for battery research domain
        if system_prompt is None:
            system_prompt = """You are an expert research assistant specializing in the US battery industry. 
You provide accurate, well-cited answers based on the research documents provided.

Guidelines:
- Always cite your sources using [Source X] notation
- If information is not in the provided context, clearly state that
- Provide specific numbers, dates, and facts when available
- Maintain objectivity and accuracy
- If asked about topics outside the research scope, politely redirect to battery industry topics"""
        
        # Build messages
        messages = []
        
        # Add conversation history if provided
        if conversation_history:
            for msg in conversation_history[-10:]:  # Last 10 messages for context
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
        
        # Add current query with context
        user_message = f"""Context from research documents:

{context_text}

---

Question: {query}

Please provide a detailed answer based on the context above. Always cite sources using [Source X] notation."""
        
        messages.append({
            "role": "user",
            "content": user_message
        })

        # Call LLM API based on provider
        try:
            if self.llm_provider == "anthropic":
                response = await self.llm_client.messages.create(
                    model=self.model,
                    max_tokens=4096,
                    system=system_prompt,
                    messages=messages,
                    temperature=0.3  # Lower temperature for more factual responses
                )
                response_text = response.content[0].text

            elif self.llm_provider == "gemini":
                # Convert messages to Gemini format
                gemini_model = self.llm_client.GenerativeModel(
                    model_name=self.model,
                    system_instruction=system_prompt
                )

                # Build conversation history
                chat_history = []
                for msg in messages:
                    role = "user" if msg["role"] == "user" else "model"
                    chat_history.append({"role": role, "parts": [msg["content"]]})

                # Generate response
                response = gemini_model.generate_content(
                    chat_history,
                    generation_config={
                        "temperature": 0.3,
                        "max_output_tokens": 4096,
                    }
                )
                response_text = response.text

            # Generate citations
            citations = self.generate_citations(contexts)

            return response_text, citations

        except Exception as e:
            logger.error(f"Error generating response with {self.llm_provider}: {e}")
            raise
    
    async def query(
        self,
        query: str,
        db: AsyncSession,
        conversation_id: Optional[int] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Main RAG query method.
        
        Args:
            query: User question
            db: Database session
            conversation_id: Optional conversation ID for history
            **kwargs: Additional arguments for customization
        
        Returns:
            Dictionary with response, citations, and metadata
        """
        # 1. Retrieve similar contexts
        contexts = await self.search_similar_chunks(
            query=query,
            db=db,
            top_k=kwargs.get('top_k'),
            similarity_threshold=kwargs.get('similarity_threshold')
        )
        
        # 2. Get conversation history if provided
        conversation_history = None
        if conversation_id:
            conversation_history = await self._get_conversation_history(
                db, conversation_id
            )
        
        # 3. Generate response
        response_text, citations = await self.generate_response(
            query=query,
            contexts=contexts,
            conversation_history=conversation_history,
            system_prompt=kwargs.get('system_prompt')
        )
        
        # 4. Calculate confidence score
        confidence = self._calculate_confidence(contexts)
        
        return {
            "response": response_text,
            "citations": citations,
            "source_contexts": [ctx.to_dict() for ctx in contexts],
            "confidence_score": confidence,
            "model": self.model,
            "retrieved_chunks": len(contexts)
        }
    
    async def _get_conversation_history(
        self,
        db: AsyncSession,
        conversation_id: int
    ) -> List[Dict[str, str]]:
        """Retrieve conversation history from database."""
        result = await db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at)
            .limit(20)  # Last 20 messages
        )
        messages = result.scalars().all()
        
        return [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in messages
        ]
    
    def _calculate_confidence(self, contexts: List[RetrievedContext]) -> float:
        """
        Calculate confidence score based on retrieved contexts.
        Higher similarity scores = higher confidence.
        """
        if not contexts:
            return 0.0
        
        # Average of top similarity scores
        avg_similarity = sum(ctx.similarity_score for ctx in contexts) / len(contexts)
        
        # Bonus for having multiple high-quality sources
        high_quality_count = sum(1 for ctx in contexts if ctx.similarity_score > 0.85)
        quality_bonus = min(high_quality_count * 0.05, 0.15)
        
        confidence = min(avg_similarity + quality_bonus, 1.0)
        return round(confidence, 3)


class ConversationManager:
    """Manages conversation sessions and message history."""
    
    async def create_conversation(
        self,
        db: AsyncSession,
        session_id: str,
        user_id: Optional[str] = None
    ) -> Conversation:
        """Create a new conversation."""
        conversation = Conversation(
            session_id=session_id,
            user_id=user_id,
            is_active=True
        )
        db.add(conversation)
        await db.flush()
        return conversation
    
    async def add_message(
        self,
        db: AsyncSession,
        conversation_id: int,
        role: str,
        content: str,
        citations: Optional[List[Dict[str, Any]]] = None,
        source_chunks: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ) -> Message:
        """Add a message to conversation."""
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            citations=citations,
            source_chunks=source_chunks,
            **kwargs
        )
        db.add(message)
        await db.flush()
        return message
    
    async def get_conversation(
        self,
        db: AsyncSession,
        session_id: str
    ) -> Optional[Conversation]:
        """Get conversation by session ID."""
        result = await db.execute(
            select(Conversation).where(Conversation.session_id == session_id)
        )
        return result.scalar_one_or_none()
