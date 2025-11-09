"""
Chat API endpoints for RAG chatbot.
Provides endpoints for querying, conversation management, and feedback.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
import uuid
import time

from app.database import get_db
from app.config import settings
from app.services.rag_service import RAGService, ConversationManager
from app.services.embedding_service import create_embedding_service

router = APIRouter(prefix="/chat", tags=["chat"])

# Initialize services based on provider selection
if settings.EMBEDDING_PROVIDER == "gemini":
    embedding_service = create_embedding_service(
        provider_type="gemini",
        api_key=settings.GEMINI_API_KEY,
        model=settings.GEMINI_EMBEDDING_MODEL
    )
elif settings.EMBEDDING_PROVIDER == "openai":
    embedding_service = create_embedding_service(
        provider_type="openai",
        api_key=settings.OPENAI_API_KEY,
        model=settings.EMBEDDING_MODEL,
        dimensions=settings.EMBEDDING_DIMENSIONS
    )
else:
    # Default to OpenAI
    embedding_service = create_embedding_service(
        provider_type="openai",
        api_key=settings.OPENAI_API_KEY,
        model=settings.EMBEDDING_MODEL,
        dimensions=settings.EMBEDDING_DIMENSIONS
    )

# Initialize RAG service with selected LLM provider
if settings.LLM_PROVIDER == "gemini":
    rag_service = RAGService(
        embedding_service=embedding_service,
        llm_provider="gemini",
        llm_api_key=settings.GEMINI_API_KEY,
        model=settings.GEMINI_LLM_MODEL,
        top_k=settings.TOP_K_RESULTS,
        similarity_threshold=settings.VECTOR_SIMILARITY_THRESHOLD
    )
elif settings.LLM_PROVIDER == "anthropic":
    rag_service = RAGService(
        embedding_service=embedding_service,
        llm_provider="anthropic",
        llm_api_key=settings.ANTHROPIC_API_KEY,
        model=settings.ANTHROPIC_MODEL,
        top_k=settings.TOP_K_RESULTS,
        similarity_threshold=settings.VECTOR_SIMILARITY_THRESHOLD
    )
else:
    # Default to Gemini
    rag_service = RAGService(
        embedding_service=embedding_service,
        llm_provider="gemini",
        llm_api_key=settings.GEMINI_API_KEY,
        model=settings.GEMINI_LLM_MODEL,
        top_k=settings.TOP_K_RESULTS,
        similarity_threshold=settings.VECTOR_SIMILARITY_THRESHOLD
    )

conversation_manager = ConversationManager()


# Pydantic models for API
class ChatRequest(BaseModel):
    """Request model for chat queries."""
    query: str = Field(..., min_length=1, max_length=5000, description="User question")
    session_id: Optional[str] = Field(None, description="Session ID for conversation continuity")
    top_k: Optional[int] = Field(None, ge=1, le=20, description="Number of context chunks to retrieve")
    include_sources: bool = Field(True, description="Include source documents in response")


class Citation(BaseModel):
    """Citation metadata."""
    citation_id: int
    source_document: str
    section_title: Optional[str]
    similarity_score: float
    chunk_id: int


class ChatResponse(BaseModel):
    """Response model for chat queries."""
    response: str
    citations: List[Citation]
    confidence_score: float
    session_id: str
    model: str
    response_time_ms: int
    retrieved_chunks: int


class ConversationHistoryResponse(BaseModel):
    """Response model for conversation history."""
    session_id: str
    messages: List[dict]
    total_messages: int


class FeedbackRequest(BaseModel):
    """Request model for chat feedback."""
    message_id: int
    rating: int = Field(..., ge=1, le=5, description="Rating from 1-5")
    feedback_type: str = Field(..., description="helpful, unhelpful, incorrect, etc.")
    comment: Optional[str] = Field(None, max_length=1000)


@router.post("/query", response_model=ChatResponse)
async def chat_query(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Main chat endpoint for querying the RAG system.
    
    - **query**: User question about US battery industry
    - **session_id**: Optional session ID for conversation continuity
    - **top_k**: Number of context chunks to retrieve (default: 5)
    - **include_sources**: Include source citations (default: true)
    
    Returns detailed answer with citations and confidence score.
    """
    start_time = time.time()
    
    try:
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Get or create conversation
        conversation = await conversation_manager.get_conversation(db, session_id)
        if not conversation:
            conversation = await conversation_manager.create_conversation(
                db, session_id
            )
            await db.commit()
        
        # Add user message
        await conversation_manager.add_message(
            db=db,
            conversation_id=conversation.id,
            role="user",
            content=request.query
        )
        
        # Perform RAG query
        result = await rag_service.query(
            query=request.query,
            db=db,
            conversation_id=conversation.id,
            top_k=request.top_k
        )
        
        # Calculate response time
        response_time_ms = int((time.time() - start_time) * 1000)
        
        # Add assistant message
        await conversation_manager.add_message(
            db=db,
            conversation_id=conversation.id,
            role="assistant",
            content=result["response"],
            citations=result["citations"],
            source_chunks=result["source_contexts"] if request.include_sources else None,
            token_count=len(result["response"]) // 4,  # Approximate
            confidence_score=result["confidence_score"],
            model_used=result["model"],
            response_time_ms=response_time_ms
        )
        
        await db.commit()
        
        # Format response
        return ChatResponse(
            response=result["response"],
            citations=[Citation(**c) for c in result["citations"]],
            confidence_score=result["confidence_score"],
            session_id=session_id,
            model=result["model"],
            response_time_ms=response_time_ms,
            retrieved_chunks=result["retrieved_chunks"]
        )
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing query: {str(e)}"
        )


@router.get("/history/{session_id}", response_model=ConversationHistoryResponse)
async def get_conversation_history(
    session_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve conversation history for a session.
    
    - **session_id**: Session identifier
    - **limit**: Maximum number of messages to return
    
    Returns list of messages in chronological order.
    """
    from sqlalchemy import select
    from app.models.conversation import Conversation, Message
    
    # Get conversation
    conversation = await conversation_manager.get_conversation(db, session_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Get messages
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at)
        .limit(limit)
    )
    messages = result.scalars().all()
    
    # Format response
    message_list = [
        {
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "citations": msg.citations,
            "confidence_score": msg.confidence_score,
            "created_at": msg.created_at.isoformat()
        }
        for msg in messages
    ]
    
    return ConversationHistoryResponse(
        session_id=session_id,
        messages=message_list,
        total_messages=len(messages)
    )


@router.post("/feedback")
async def submit_feedback(
    request: FeedbackRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit feedback on a chatbot response.
    
    - **message_id**: ID of the message being rated
    - **rating**: Rating from 1-5
    - **feedback_type**: Type of feedback (helpful, unhelpful, incorrect, etc.)
    - **comment**: Optional text feedback
    
    Helps improve the system over time.
    """
    from app.models.conversation import Message, ChatFeedback
    
    # Verify message exists
    result = await db.execute(
        select(Message).where(Message.id == request.message_id)
    )
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Create feedback record
    feedback = ChatFeedback(
        message_id=request.message_id,
        rating=request.rating,
        feedback_type=request.feedback_type,
        comment=request.comment,
        query=message.content if message.role == "user" else "",
        response=message.content if message.role == "assistant" else ""
    )
    
    db.add(feedback)
    await db.commit()
    
    return {"status": "success", "message": "Feedback recorded"}


@router.delete("/conversation/{session_id}")
async def delete_conversation(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a conversation and all its messages.
    
    - **session_id**: Session identifier
    
    Useful for privacy and testing.
    """
    from sqlalchemy import delete
    from app.models.conversation import Conversation
    
    conversation = await conversation_manager.get_conversation(db, session_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Delete conversation (cascade will delete messages)
    await db.execute(
        delete(Conversation).where(Conversation.id == conversation.id)
    )
    await db.commit()
    
    return {"status": "success", "message": "Conversation deleted"}


@router.get("/health")
async def health_check():
    """
    Health check endpoint for chatbot service.
    Verifies all required services are configured.
    """
    # Check embedding service health
    embedding_healthy = False
    embedding_model = "Not configured"
    if settings.EMBEDDING_PROVIDER == "gemini":
        embedding_healthy = bool(settings.GEMINI_API_KEY)
        embedding_model = settings.GEMINI_EMBEDDING_MODEL
    elif settings.EMBEDDING_PROVIDER == "openai":
        embedding_healthy = bool(settings.OPENAI_API_KEY)
        embedding_model = settings.EMBEDDING_MODEL

    # Check LLM service health
    llm_healthy = False
    llm_model = "Not configured"
    if settings.LLM_PROVIDER == "gemini":
        llm_healthy = bool(settings.GEMINI_API_KEY)
        llm_model = settings.GEMINI_LLM_MODEL
    elif settings.LLM_PROVIDER == "anthropic":
        llm_healthy = bool(settings.ANTHROPIC_API_KEY)
        llm_model = settings.ANTHROPIC_MODEL

    health_status = {
        "status": "healthy",
        "services": {
            "embedding": embedding_healthy,
            "llm": llm_healthy,
            "database": True  # If we got here, DB is working
        },
        "config": {
            "embedding_provider": settings.EMBEDDING_PROVIDER,
            "embedding_model": embedding_model,
            "llm_provider": settings.LLM_PROVIDER,
            "llm_model": llm_model,
            "top_k": settings.TOP_K_RESULTS,
            "similarity_threshold": settings.VECTOR_SIMILARITY_THRESHOLD
        }
    }

    if not all(health_status["services"].values()):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Some services are not properly configured"
        )

    return health_status
