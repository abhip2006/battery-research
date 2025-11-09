"""
Facility database model for manufacturing and research facilities.
"""
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import TimestampMixin


class Facility(Base, TimestampMixin):
    """
    Manufacturing and research facility entity.

    Tracks battery manufacturing plants, research facilities, and
    recycling centers across the United States.
    """

    __tablename__ = "facilities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Basic Information
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    facility_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Type: manufacturing, r&d, recycling, component_production",
    )

    # Company Relationship
    company_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Location
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[str] = mapped_column(String(2), nullable=False, index=True, comment="Two-letter state code")
    county: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Geospatial coordinates
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Capacity & Production
    capacity_gwh: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Annual production capacity in GWh",
    )
    capacity_year: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Year when capacity is expected to be reached",
    )
    current_capacity_gwh: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Current operational capacity",
    )

    # Status & Timeline
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Status: announced, under_construction, operational, delayed, cancelled",
    )
    announced_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    construction_start: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    operational_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Investment & Employment
    investment_usd: Mapped[Optional[float]] = mapped_column(Float, nullable=True, comment="Total investment in USD")
    employment_planned: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    employment_current: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Government Incentives
    state_incentives_usd: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    federal_incentives_usd: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_ira_project: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Additional Details
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    flagship: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether this is a flagship facility",
    )

    # Data Quality
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="facilities")

    technologies: Mapped[List["Technology"]] = relationship(
        "Technology",
        secondary="facility_technology",
        back_populates="facilities",
    )

    citations: Mapped[List["Citation"]] = relationship(
        "Citation",
        back_populates="facility",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Facility(id={self.id}, name='{self.name}', state='{self.state}')>"
