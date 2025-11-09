"""
Companies API router.
Endpoints for querying battery industry companies.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models import Company, Facility
from app.config import settings

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def list_companies(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of records to return"),
    company_type: Optional[str] = Query(None, description="Filter by company type"),
    primary_category: Optional[str] = Query(None, description="Filter by primary category"),
    state: Optional[str] = Query(None, description="Filter by headquarters state"),
    is_publicly_traded: Optional[bool] = Query(None, description="Filter by public/private status"),
    min_capacity: Optional[float] = Query(None, description="Minimum capacity in GWh"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get list of companies with optional filters.

    Returns paginated list of battery industry companies with their key attributes.
    """
    query = select(Company)

    # Apply filters
    if company_type:
        query = query.where(Company.company_type == company_type)
    if primary_category:
        query = query.where(Company.primary_category == primary_category)
    if state:
        query = query.where(Company.headquarters.like(f"%{state}%"))
    if is_publicly_traded is not None:
        query = query.where(Company.is_publicly_traded == is_publicly_traded)
    if min_capacity is not None:
        query = query.where(Company.capacity_gwh >= min_capacity)

    # Add pagination
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    companies = result.scalars().all()

    return {
        "companies": companies,
        "count": len(companies),
        "skip": skip,
        "limit": limit,
    }


@router.get("/{company_id}")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_company(
    company_id: int,
    include_facilities: bool = Query(False, description="Include related facilities"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get detailed information about a specific company.

    Returns company details including optional related facilities.
    """
    query = select(Company).where(Company.id == company_id)
    result = await db.execute(query)
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    response = {
        "company": company,
    }

    if include_facilities:
        facilities_query = select(Facility).where(Facility.company_id == company_id)
        facilities_result = await db.execute(facilities_query)
        response["facilities"] = facilities_result.scalars().all()

    return response


@router.get("/search/by-name")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def search_companies_by_name(
    name: str = Query(..., min_length=1, description="Company name to search"),
    db: AsyncSession = Depends(get_db),
):
    """
    Search companies by name (case-insensitive partial match).
    """
    query = select(Company).where(Company.name.ilike(f"%{name}%")).limit(50)
    result = await db.execute(query)
    companies = result.scalars().all()

    return {
        "companies": companies,
        "count": len(companies),
    }


@router.get("/stats/overview")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_companies_overview(
    db: AsyncSession = Depends(get_db),
):
    """
    Get overview statistics about companies.
    """
    # Total companies
    total_query = select(func.count(Company.id))
    total_result = await db.execute(total_query)
    total_companies = total_result.scalar()

    # By type
    type_query = select(Company.company_type, func.count(Company.id)).group_by(Company.company_type)
    type_result = await db.execute(type_query)
    by_type = {row[0]: row[1] for row in type_result.all()}

    # By category
    category_query = select(Company.primary_category, func.count(Company.id)).group_by(Company.primary_category)
    category_result = await db.execute(category_query)
    by_category = {row[0]: row[1] for row in category_result.all()}

    # Total capacity
    capacity_query = select(func.sum(Company.capacity_gwh))
    capacity_result = await db.execute(capacity_query)
    total_capacity = capacity_result.scalar() or 0.0

    # Public vs Private
    public_query = select(func.count(Company.id)).where(Company.is_publicly_traded == True)
    public_result = await db.execute(public_query)
    public_companies = public_result.scalar()

    return {
        "total_companies": total_companies,
        "by_type": by_type,
        "by_category": by_category,
        "total_capacity_gwh": round(total_capacity, 2),
        "public_companies": public_companies,
        "private_companies": total_companies - public_companies,
    }
