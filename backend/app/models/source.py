"""
Source and Citation database models for data provenance tracking.
"""
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from app.database import Base
from app.models.base import TimestampMixin


class Source(Base, TimestampMixin):
    """
    Source entity for tracking data sources and references.

    Tracks SEC filings, DOE announcements, company press releases,
    research reports, and other primary sources.
    """

    __tablename__ = "sources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Basic Information
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    source_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        comment="Type: sec_filing, press_release, government_announcement, research_report, news_article, website",
    )

    # Organization & Author
    organization: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Publishing organization",
    )
    author: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Publication Details
    publication_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    access_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)

    # SEC Filing Details (if applicable)
    filing_type: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="SEC filing type: 10-K, 10-Q, 8-K, S-1, etc.",
    )
    ticker: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    cik: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, comment="SEC CIK number")

    # Document Details
    document_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    doi: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, comment="Digital Object Identifier")
    isbn: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    full_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Credibility & Quality
    credibility_score: Mapped[float] = mapped_column(
        Float,
        default=0.5,
        nullable=False,
        comment="Source credibility 0.0-1.0",
    )
    is_primary_source: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    citations: Mapped[List["Citation"]] = relationship(
        "Citation",
        back_populates="source",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Source(id={self.id}, type='{self.source_type}', title='{self.title[:50]}...')>"


class Citation(Base, TimestampMixin):
    """
    Citation entity linking data points to their sources.

    Implements full citation tracking for every data point in the system,
    enabling transparency and verification of all information.
    """

    __tablename__ = "citations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Source Reference
    source_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("sources.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Entity References (nullable - citation can point to any entity type)
    company_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    facility_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("facilities.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    policy_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("policies.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    forecast_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("forecasts.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    # Citation Details
    field_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Specific field being cited (e.g., 'capacity_gwh', 'revenue_usd')",
    )
    quoted_text: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Exact text from source supporting this data point",
    )
    page_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    section: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Confidence & Verification
    confidence_score: Mapped[float] = mapped_column(
        Float,
        default=0.5,
        nullable=False,
        comment="Confidence in this specific citation 0.0-1.0",
    )
    is_direct_quote: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_inferred: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether the data point was inferred rather than directly stated",
    )

    # Additional Context
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    source: Mapped["Source"] = relationship("Source", back_populates="citations")
    company: Mapped[Optional["Company"]] = relationship("Company", back_populates="citations")
    facility: Mapped[Optional["Facility"]] = relationship("Facility", back_populates="citations")
    policy: Mapped[Optional["Policy"]] = relationship("Policy", back_populates="citations")
    forecast: Mapped[Optional["Forecast"]] = relationship("Forecast", back_populates="citations")

    def __repr__(self) -> str:
        entity_type = "unknown"
        entity_id = None
        if self.company_id:
            entity_type = "company"
            entity_id = self.company_id
        elif self.facility_id:
            entity_type = "facility"
            entity_id = self.facility_id
        elif self.policy_id:
            entity_type = "policy"
            entity_id = self.policy_id
        elif self.forecast_id:
            entity_type = "forecast"
            entity_id = self.forecast_id

        return f"<Citation(id={self.id}, source_id={self.source_id}, {entity_type}_id={entity_id})>"
