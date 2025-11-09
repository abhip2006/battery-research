"""
Policies API router.
Endpoints for querying government policies and regulations.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models import Policy
from app.config import settings

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def list_policies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    policy_type: Optional[str] = Query(None),
    jurisdiction: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Get list of policies with optional filters."""
    query = select(Policy)

    if policy_type:
        query = query.where(Policy.policy_type == policy_type)
    if jurisdiction:
        query = query.where(Policy.jurisdiction == jurisdiction)
    if state:
        query = query.where(Policy.state == state.upper())
    if status:
        query = query.where(Policy.status == status)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    policies = result.scalars().all()

    return {
        "policies": policies,
        "count": len(policies),
    }


@router.get("/{policy_id}")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_policy(
    policy_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get detailed information about a specific policy."""
    query = select(Policy).where(Policy.id == policy_id)
    result = await db.execute(query)
    policy = result.scalar_one_or_none()

    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    return {"policy": policy}
