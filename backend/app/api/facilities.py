"""
Facilities API router.
Endpoints for querying manufacturing and research facilities.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models import Facility, Company
from app.config import settings

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def list_facilities(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of records to return"),
    state: Optional[str] = Query(None, description="Filter by state (2-letter code)"),
    facility_type: Optional[str] = Query(None, description="Filter by facility type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    min_capacity: Optional[float] = Query(None, description="Minimum capacity in GWh"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get list of facilities with optional filters.
    """
    query = select(Facility)

    # Apply filters
    if state:
        query = query.where(Facility.state == state.upper())
    if facility_type:
        query = query.where(Facility.facility_type == facility_type)
    if status:
        query = query.where(Facility.status == status)
    if min_capacity is not None:
        query = query.where(Facility.capacity_gwh >= min_capacity)

    # Add pagination
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    facilities = result.scalars().all()

    return {
        "facilities": facilities,
        "count": len(facilities),
        "skip": skip,
        "limit": limit,
    }


@router.get("/{facility_id}")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_facility(
    facility_id: int,
    include_company: bool = Query(False, description="Include company details"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get detailed information about a specific facility.
    """
    query = select(Facility).where(Facility.id == facility_id)
    result = await db.execute(query)
    facility = result.scalar_one_or_none()

    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")

    response = {
        "facility": facility,
    }

    if include_company:
        company_query = select(Company).where(Company.id == facility.company_id)
        company_result = await db.execute(company_query)
        response["company"] = company_result.scalar_one_or_none()

    return response


@router.get("/state/{state}")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_facilities_by_state(
    state: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get all facilities in a specific state with aggregated statistics.
    """
    state_code = state.upper()

    # Get facilities
    facilities_query = select(Facility).where(Facility.state == state_code)
    facilities_result = await db.execute(facilities_query)
    facilities = facilities_result.scalars().all()

    if not facilities:
        raise HTTPException(status_code=404, detail=f"No facilities found in {state_code}")

    # Calculate statistics
    total_capacity_query = select(func.sum(Facility.capacity_gwh)).where(Facility.state == state_code)
    total_capacity_result = await db.execute(total_capacity_query)
    total_capacity = total_capacity_result.scalar() or 0.0

    total_employment_query = select(func.sum(Facility.employment_planned)).where(Facility.state == state_code)
    total_employment_result = await db.execute(total_employment_query)
    total_employment = total_employment_result.scalar() or 0

    return {
        "state": state_code,
        "facilities": facilities,
        "count": len(facilities),
        "total_capacity_gwh": round(total_capacity, 2),
        "total_employment": total_employment,
    }


@router.get("/stats/by-state")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_facilities_stats_by_state(
    db: AsyncSession = Depends(get_db),
):
    """
    Get aggregated facility statistics grouped by state.
    """
    query = select(
        Facility.state,
        func.count(Facility.id).label("facility_count"),
        func.sum(Facility.capacity_gwh).label("total_capacity"),
        func.sum(Facility.employment_planned).label("total_employment"),
    ).group_by(Facility.state).order_by(func.sum(Facility.capacity_gwh).desc())

    result = await db.execute(query)
    stats = [
        {
            "state": row[0],
            "facility_count": row[1],
            "total_capacity_gwh": round(row[2] or 0.0, 2),
            "total_employment": row[3] or 0,
        }
        for row in result.all()
    ]

    return {
        "states": stats,
        "total_states": len(stats),
    }


@router.get("/stats/overview")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_facilities_overview(
    db: AsyncSession = Depends(get_db),
):
    """
    Get overview statistics about facilities.
    """
    # Total facilities
    total_query = select(func.count(Facility.id))
    total_result = await db.execute(total_query)
    total_facilities = total_result.scalar()

    # By status
    status_query = select(Facility.status, func.count(Facility.id)).group_by(Facility.status)
    status_result = await db.execute(status_query)
    by_status = {row[0]: row[1] for row in status_result.all()}

    # By type
    type_query = select(Facility.facility_type, func.count(Facility.id)).group_by(Facility.facility_type)
    type_result = await db.execute(type_query)
    by_type = {row[0]: row[1] for row in type_result.all()}

    # Total capacity
    capacity_query = select(func.sum(Facility.capacity_gwh))
    capacity_result = await db.execute(capacity_query)
    total_capacity = capacity_result.scalar() or 0.0

    # Total employment
    employment_query = select(func.sum(Facility.employment_planned))
    employment_result = await db.execute(employment_query)
    total_employment = employment_result.scalar() or 0

    return {
        "total_facilities": total_facilities,
        "by_status": by_status,
        "by_type": by_type,
        "total_capacity_gwh": round(total_capacity, 2),
        "total_planned_employment": total_employment,
    }
