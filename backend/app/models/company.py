"""
Company-related database models.
"""
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import TimestampMixin


# Association table for many-to-many relationship between companies and investors
company_investor_association = Table(
    "company_investor",
    Base.metadata,
    Column("company_id", Integer, ForeignKey("companies.id", ondelete="CASCADE"), primary_key=True),
    Column("investor_id", Integer, ForeignKey("investors.id", ondelete="CASCADE"), primary_key=True),
    Column("investment_amount", Float, nullable=True),
    Column("investment_date", String(50), nullable=True),
)


class Company(Base, TimestampMixin):
    """
    Company entity representing battery industry companies.

    Tracks publicly traded companies, private companies, joint ventures,
    and subsidiaries operating in the US battery industry value chain.
    """

    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Basic Information
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    ticker: Mapped[Optional[str]] = mapped_column(String(20), unique=True, nullable=True, index=True)
    headquarters: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    founded_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Classification
    company_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Type: public, private, joint_venture, subsidiary",
    )
    primary_category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Category: cell_manufacturing, components, recycling, energy_storage, etc.",
    )

    # Technology & Stage
    technology: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    development_stage: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Stage: r&d, pilot, commercial, scaled",
    )

    # Capacity & Scale
    capacity_gwh: Mapped[Optional[float]] = mapped_column(Float, nullable=True, comment="Annual capacity in GWh")
    capacity_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, comment="Year of capacity data")
    employment: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, comment="Number of employees")

    # Financial
    is_publicly_traded: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    market_cap_usd: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    revenue_usd: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    revenue_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Government Support
    doe_funding_usd: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Department of Energy funding amount",
    )
    ira_beneficiary: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Inflation Reduction Act beneficiary",
    )

    # Additional Details
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Data Quality
    confidence_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
        comment="Data confidence score 0.0-1.0",
    )
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    facilities: Mapped[List["Facility"]] = relationship(
        "Facility",
        back_populates="company",
        cascade="all, delete-orphan",
    )

    investors: Mapped[List["Investor"]] = relationship(
        "Investor",
        secondary=company_investor_association,
        back_populates="portfolio_companies",
    )

    citations: Mapped[List["Citation"]] = relationship(
        "Citation",
        back_populates="company",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Company(id={self.id}, name='{self.name}', ticker='{self.ticker}')>"


class Investor(Base, TimestampMixin):
    """
    Investor entity for tracking company funding sources.
    """

    __tablename__ = "investors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    investor_type: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Type: government, venture_capital, strategic, private_equity",
    )
    country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    portfolio_companies: Mapped[List["Company"]] = relationship(
        "Company",
        secondary=company_investor_association,
        back_populates="investors",
    )

    def __repr__(self) -> str:
        return f"<Investor(id={self.id}, name='{self.name}')>"


# Explicit association class if we need to query investment details
class CompanyInvestor(Base, TimestampMixin):
    """
    Explicit association model for company-investor relationships with additional metadata.
    """

    __tablename__ = "company_investor_details"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    investor_id: Mapped[int] = mapped_column(Integer, ForeignKey("investors.id", ondelete="CASCADE"), nullable=False)

    investment_amount_usd: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    investment_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    investment_type: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Type: equity, loan, grant, loan_guarantee",
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<CompanyInvestor(company_id={self.company_id}, investor_id={self.investor_id})>"
