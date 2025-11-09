"""
Technologies API router.
Endpoints for querying battery technologies and chemistries.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models import Technology
from app.config import settings

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def list_technologies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    category: Optional[str] = Query(None, description="Filter by category"),
    chemistry_type: Optional[str] = Query(None, description="Filter by chemistry type"),
    development_stage: Optional[str] = Query(None, description="Filter by development stage"),
    db: AsyncSession = Depends(get_db),
):
    """Get list of technologies with optional filters."""
    query = select(Technology)

    if category:
        query = query.where(Technology.category == category)
    if chemistry_type:
        query = query.where(Technology.chemistry_type == chemistry_type)
    if development_stage:
        query = query.where(Technology.development_stage == development_stage)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    technologies = result.scalars().all()

    return {
        "technologies": technologies,
        "count": len(technologies),
    }


@router.get("/{technology_id}")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_technology(
    technology_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get detailed information about a specific technology."""
    query = select(Technology).where(Technology.id == technology_id)
    result = await db.execute(query)
    technology = result.scalar_one_or_none()

    if not technology:
        raise HTTPException(status_code=404, detail="Technology not found")

    return {"technology": technology}


@router.get("/stats/overview")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_technologies_overview(
    db: AsyncSession = Depends(get_db),
):
    """Get overview statistics about technologies."""
    total_query = select(func.count(Technology.id))
    total_result = await db.execute(total_query)
    total_technologies = total_result.scalar()

    by_category_query = select(Technology.category, func.count(Technology.id)).group_by(Technology.category)
    by_category_result = await db.execute(by_category_query)
    by_category = {row[0]: row[1] for row in by_category_result.all()}

    by_chemistry_query = select(Technology.chemistry_type, func.count(Technology.id)).group_by(Technology.chemistry_type)
    by_chemistry_result = await db.execute(by_chemistry_query)
    by_chemistry = {row[0]: row[1] for row in by_chemistry_result.all() if row[0]}

    return {
        "total_technologies": total_technologies,
        "by_category": by_category,
        "by_chemistry": by_chemistry,
    }
