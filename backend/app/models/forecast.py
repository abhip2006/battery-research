"""
Forecast database model for industry projections and predictions.
"""
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import TimestampMixin


class Forecast(Base, TimestampMixin):
    """
    Industry forecast and projection entity.

    Tracks predictions for capacity growth, cost curves, technology
    adoption, market share, and other forward-looking metrics.
    """

    __tablename__ = "forecasts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Forecast Type & Category
    forecast_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        comment="Type: capacity, cost, market_share, technology_mix, demand, production",
    )
    category: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Subcategory: chemistry type, geographic region, application, etc.",
    )

    # Time Period
    forecast_year: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    base_year: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Reference year for the forecast",
    )

    # Forecast Values
    value: Mapped[float] = mapped_column(Float, nullable=False, comment="Primary forecast value")
    unit: Mapped[str] = mapped_column(String(50), nullable=False, comment="Unit: GWh, USD/kWh, percent, etc.")

    # Uncertainty & Confidence
    value_low: Mapped[Optional[float]] = mapped_column(Float, nullable=True, comment="Lower bound of forecast range")
    value_high: Mapped[Optional[float]] = mapped_column(Float, nullable=True, comment="Upper bound of forecast range")
    confidence_score: Mapped[float] = mapped_column(
        Float,
        default=0.5,
        nullable=False,
        comment="Confidence in forecast 0.0-1.0",
    )

    # Geographic Scope
    geographic_scope: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="US",
        comment="Geographic scope: US, global, state-level, regional",
    )
    state: Mapped[Optional[str]] = mapped_column(
        String(2),
        nullable=True,
        comment="Two-letter state code (if state-level forecast)",
    )
    region: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Regional grouping if applicable",
    )

    # Source & Methodology
    source_organization: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Organization making the forecast: DOE, Bloomberg, Wood Mackenzie, etc.",
    )
    methodology: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    assumptions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    scenario: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Scenario type: base_case, optimistic, pessimistic, etc.",
    )

    # Additional Context
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Data Quality
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    citations: Mapped[List["Citation"]] = relationship(
        "Citation",
        back_populates="forecast",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Forecast(id={self.id}, type='{self.forecast_type}', year={self.forecast_year}, value={self.value})>"
