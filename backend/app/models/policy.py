"""
Policy database model for government policies and regulations.
"""
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from app.database import Base
from app.models.base import TimestampMixin


class Policy(Base, TimestampMixin):
    """
    Government policy and regulation entity.

    Tracks federal, state, and local policies affecting the
    battery industry including the Inflation Reduction Act,
    CHIPS Act, DOE grants, and state-level incentives.
    """

    __tablename__ = "policies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Basic Information
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    official_name: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    policy_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Type: legislation, grant_program, tax_credit, loan_guarantee, regulation",
    )

    # Jurisdiction
    jurisdiction: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Jurisdiction: federal, state, local",
    )
    state: Mapped[Optional[str]] = mapped_column(
        String(2),
        nullable=True,
        index=True,
        comment="Two-letter state code (if state/local policy)",
    )

    # Timeline
    enacted_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    effective_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    expiration_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # Financial Details
    total_funding_usd: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Total funding allocated under this policy",
    )
    funding_disbursed_usd: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Amount actually disbursed to date",
    )

    # Scope & Impact
    target_sector: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Target sector: EV manufacturing, battery production, supply chain, etc.",
    )
    eligibility_criteria: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    impact_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Details
    description: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    authority: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Administering authority: DOE, Treasury, IRS, etc.",
    )

    # References
    legislation_code: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="e.g., P.L. 117-169, USC Title",
    )
    official_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="active",
        comment="Status: proposed, enacted, active, expired, repealed",
    )

    # Relationships
    citations: Mapped[List["Citation"]] = relationship(
        "Citation",
        back_populates="policy",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Policy(id={self.id}, name='{self.name}', jurisdiction='{self.jurisdiction}')>"
