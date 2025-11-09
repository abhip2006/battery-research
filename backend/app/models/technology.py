"""
Technology database models for battery chemistries and innovations.
"""
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import TimestampMixin


# Association table for many-to-many relationship between facilities and technologies
facility_technology_association = Table(
    "facility_technology",
    Base.metadata,
    Column("facility_id", Integer, ForeignKey("facilities.id", ondelete="CASCADE"), primary_key=True),
    Column("technology_id", Integer, ForeignKey("technologies.id", ondelete="CASCADE"), primary_key=True),
)


class Technology(Base, TimestampMixin):
    """
    Battery technology and chemistry entity.

    Tracks different battery chemistries, cell formats, and
    technological innovations in the battery industry.
    """

    __tablename__ = "technologies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Basic Information
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Category: chemistry, cell_format, component, manufacturing_process",
    )

    # Chemistry Details (if applicable)
    chemistry_type: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="e.g., LFP, NMC, NCA, Solid-State, Sodium-ion",
    )
    cathode_material: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    anode_material: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    electrolyte_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Cell Format (if applicable)
    cell_format: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="e.g., cylindrical (2170, 4680), prismatic, pouch",
    )

    # Performance Metrics
    energy_density_wh_kg: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Energy density at cell level in Wh/kg",
    )
    energy_density_wh_l: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Volumetric energy density in Wh/L",
    )
    cycle_life_max: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Maximum cycle life under laboratory conditions",
    )
    cycle_life_typical: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Typical cycle life in real-world conditions",
    )
    degradation_rate_percent: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Degradation rate per 1000 cycles",
    )

    # Cost & Timeline
    cost_per_kwh_usd: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Current cost per kWh in USD",
    )
    cost_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Development Stage
    development_stage: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="commercial",
        comment="Stage: research, pilot, pre_commercial, commercial, mature",
    )
    commercialization_year: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Year when technology became/will become commercially available",
    )

    # Market Information
    market_share_percent: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Current market share as percentage",
    )
    market_share_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Additional Details
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    advantages: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="Key advantages of this technology")
    disadvantages: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Key disadvantages or challenges",
    )

    # Relationships
    facilities: Mapped[List["Facility"]] = relationship(
        "Facility",
        secondary=facility_technology_association,
        back_populates="technologies",
    )

    def __repr__(self) -> str:
        return f"<Technology(id={self.id}, name='{self.name}', chemistry='{self.chemistry_type}')>"


class FacilityTechnology(Base, TimestampMixin):
    """
    Explicit association model for facility-technology relationships with production details.
    """

    __tablename__ = "facility_technology_details"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    facility_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("facilities.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    technology_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("technologies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Production-specific details
    production_capacity_gwh: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Capacity for this specific technology at this facility",
    )
    is_primary_technology: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether this is the primary technology produced at this facility",
    )
    start_date: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="When production of this technology started",
    )

    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<FacilityTechnology(facility_id={self.facility_id}, technology_id={self.technology_id})>"
