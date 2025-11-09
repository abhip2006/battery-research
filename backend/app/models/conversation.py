"""
Conversation and message models for chatbot.
Tracks conversation history and enables conversation memory.
"""
from typing import Optional
from sqlalchemy import String, Text, Integer, Float, JSON, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import TimestampMixin


class Conversation(Base, TimestampMixin):
    """
    Represents a conversation session with the chatbot.
    Groups related messages together.
    """
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Session identifier (for tracking anonymous users)
    session_id: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    
    # Optional user identifier
    user_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    
    # Conversation metadata
    title: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    
    # Relationships
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Conversation(id={self.id}, session='{self.session_id}', messages={len(self.messages)})>"


class Message(Base, TimestampMixin):
    """
    Represents a single message in a conversation.
    Can be from user or assistant.
    """
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Foreign key to conversation
    conversation_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Message details
    role: Mapped[str] = mapped_column(String(50), nullable=False)  # "user" or "assistant"
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Citations and sources
    citations: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    source_chunks: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    
    # Metadata
    token_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    model_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Response time tracking
    response_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # User feedback
    user_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-5 stars
    user_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    
    def __repr__(self) -> str:
        preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"<Message(id={self.id}, role='{self.role}', content='{preview}')>"


class ChatFeedback(Base, TimestampMixin):
    """
    Stores user feedback on chatbot responses.
    Used for improving the system over time.
    """
    __tablename__ = "chat_feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Reference to message
    message_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("messages.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Feedback details
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    feedback_type: Mapped[str] = mapped_column(String(50), nullable=False)  # helpful, unhelpful, incorrect, etc.
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Context
    query: Mapped[str] = mapped_column(Text, nullable=False)
    response: Mapped[str] = mapped_column(Text, nullable=False)
    
    def __repr__(self) -> str:
        return f"<ChatFeedback(id={self.id}, message_id={self.message_id}, rating={self.rating})>"
