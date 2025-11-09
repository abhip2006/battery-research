"""
Forecasts API router.
Endpoints for querying industry forecasts and projections.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models import Forecast
from app.config import settings

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def list_forecasts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    forecast_type: Optional[str] = Query(None),
    forecast_year: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Get list of forecasts with optional filters."""
    query = select(Forecast)

    if forecast_type:
        query = query.where(Forecast.forecast_type == forecast_type)
    if forecast_year:
        query = query.where(Forecast.forecast_year == forecast_year)
    if category:
        query = query.where(Forecast.category == category)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    forecasts = result.scalars().all()

    return {
        "forecasts": forecasts,
        "count": len(forecasts),
    }


@router.get("/{forecast_id}")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_forecast(
    forecast_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get detailed information about a specific forecast."""
    query = select(Forecast).where(Forecast.id == forecast_id)
    result = await db.execute(query)
    forecast = result.scalar_one_or_none()

    if not forecast:
        raise HTTPException(status_code=404, detail="Forecast not found")

    return {"forecast": forecast}
