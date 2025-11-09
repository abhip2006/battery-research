"""
FastAPI route definitions for Battery Intelligence Platform API
"""
from typing import Optional, List, Literal
from fastapi import APIRouter, Depends, Query, Path, HTTPException, status
from fastapi.responses import JSONResponse

from ..models.schemas import (
    # Company models
    Company, CompanyDetail, CompanyListResponse, SearchResponse,
    # Facility models
    FacilityBase, FacilityDetail, FacilityListResponse, NearbyFacilitiesResponse,
    # Forecast models
    CapacityForecast, CostForecast,
    # Analytics models
    MarketShareResponse, RegionalClusterResponse, TechnologyTrendsResponse, SupplyChainResponse,
    # Policy models
    PolicyBase, PolicyDetail, PolicyListResponse, PolicyImpactResponse,
    # Chat models
    ChatQueryRequest, ChatQueryResponse, ChatHistoryResponse,
    # Other
    HealthResponse, ErrorResponse,
    # Enums
    DevelopmentStage, PolicyType, Jurisdiction, PolicyStatus, SortOrder, Granularity
)
from ..core.auth import get_api_key
from ..core.rate_limit import check_rate_limit
from ..services.data_service import DataService


# Initialize routers
companies_router = APIRouter(prefix="/companies", tags=["Companies"])
facilities_router = APIRouter(prefix="/facilities", tags=["Facilities"])
forecast_router = APIRouter(prefix="/forecast", tags=["Forecast"])
analytics_router = APIRouter(prefix="/analytics", tags=["Analytics"])
policy_router = APIRouter(prefix="/policies", tags=["Policy"])
chat_router = APIRouter(prefix="/chat", tags=["Chatbot"])
health_router = APIRouter(tags=["Health"])


# ============================================================================
# HEALTH CHECK
# ============================================================================

@health_router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check endpoint",
    description="Check API availability and status"
)
async def health_check():
    """Health check endpoint - no authentication required"""
    from datetime import datetime
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.utcnow(),
        database="connected"
    )


# ============================================================================
# COMPANIES
# ============================================================================

@companies_router.get(
    "",
    response_model=CompanyListResponse,
    summary="List all companies",
    description="Get a paginated list of battery companies with optional filtering"
)
async def list_companies(
    technology: Optional[str] = Query(None, description="Filter by battery technology"),
    state: Optional[str] = Query(None, min_length=2, max_length=2, description="Filter by state abbreviation"),
    stage: Optional[DevelopmentStage] = Query(None, description="Filter by development stage"),
    min_capacity: Optional[float] = Query(None, ge=0, description="Minimum capacity in GWh"),
    max_capacity: Optional[float] = Query(None, description="Maximum capacity in GWh"),
    page: int = Query(1, ge=1, description="Page number for pagination"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page"),
    sort_by: Literal["name", "capacity", "state"] = Query("capacity", description="Sort field"),
    sort_order: SortOrder = Query(SortOrder.DESC, description="Sort order"),
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    List companies with filtering and pagination.

    Example queries:
    - /companies?technology=LFP&min_capacity=50
    - /companies?state=TN&sort_by=name
    - /companies?page=2&page_size=10
    """
    service = DataService()

    filters = {
        "technology": technology,
        "state": state,
        "stage": stage,
        "min_capacity": min_capacity,
        "max_capacity": max_capacity
    }

    result = await service.get_companies(
        filters=filters,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order.value
    )

    return result


@companies_router.get(
    "/{id}",
    response_model=CompanyDetail,
    summary="Get company details",
    description="Retrieve detailed information about a specific company"
)
async def get_company(
    id: str = Path(..., description="Company ID or slug"),
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    Get detailed company information by ID.

    Example: /companies/tesla
    """
    service = DataService()
    company = await service.get_company_by_id(id)

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company '{id}' not found"
        )

    return company


@companies_router.get(
    "/search",
    response_model=SearchResponse,
    summary="Full-text search companies",
    description="Search companies by name, technology, or other attributes"
)
async def search_companies(
    q: str = Query(..., min_length=1, description="Search query"),
    fields: str = Query("name,technology,description", description="Fields to search (comma-separated)"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of results"),
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    Full-text search across companies.

    Example: /companies/search?q=solid+state+battery&limit=5
    """
    service = DataService()
    search_fields = [field.strip() for field in fields.split(",")]

    results = await service.search_companies(
        query=q,
        fields=search_fields,
        limit=limit
    )

    return results


# ============================================================================
# FACILITIES
# ============================================================================

@facilities_router.get(
    "",
    response_model=FacilityListResponse,
    summary="List all facilities",
    description="Get a paginated list of manufacturing facilities with optional filtering"
)
async def list_facilities(
    state: Optional[str] = Query(None, min_length=2, max_length=2, description="Filter by state abbreviation"),
    company: Optional[str] = Query(None, description="Filter by company name or ID"),
    status: Optional[DevelopmentStage] = Query(None, description="Filter by operational status"),
    min_capacity: Optional[float] = Query(None, ge=0, description="Minimum capacity in GWh"),
    technology: Optional[str] = Query(None, description="Filter by technology type"),
    bbox: Optional[str] = Query(
        None,
        description="Bounding box for geospatial filtering (minLon,minLat,maxLon,maxLat)",
        regex=r"^-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*$"
    ),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    List facilities with filtering and pagination.

    Example queries:
    - /facilities?state=TN&status=operational
    - /facilities?company=tesla&min_capacity=50
    - /facilities?bbox=-125.0,24.0,-66.0,49.0 (all US facilities)
    """
    service = DataService()

    # Parse bounding box if provided
    bbox_coords = None
    if bbox:
        try:
            coords = [float(x) for x in bbox.split(",")]
            bbox_coords = {
                "min_lon": coords[0],
                "min_lat": coords[1],
                "max_lon": coords[2],
                "max_lat": coords[3]
            }
        except (ValueError, IndexError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid bounding box format. Use: minLon,minLat,maxLon,maxLat"
            )

    filters = {
        "state": state,
        "company": company,
        "status": status,
        "min_capacity": min_capacity,
        "technology": technology,
        "bbox": bbox_coords
    }

    result = await service.get_facilities(
        filters=filters,
        page=page,
        page_size=page_size
    )

    return result


@facilities_router.get(
    "/{id}",
    response_model=FacilityDetail,
    summary="Get facility details",
    description="Retrieve detailed information about a specific facility"
)
async def get_facility(
    id: str = Path(..., description="Facility ID"),
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    Get detailed facility information by ID.

    Example: /facilities/tesla-gigafactory-nevada
    """
    service = DataService()
    facility = await service.get_facility_by_id(id)

    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facility '{id}' not found"
        )

    return facility


@facilities_router.get(
    "/nearby",
    response_model=NearbyFacilitiesResponse,
    summary="Find nearby facilities",
    description="Geospatial query to find facilities within a radius"
)
async def find_nearby_facilities(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lng: float = Query(..., ge=-180, le=180, description="Longitude"),
    radius: float = Query(100, ge=1, le=1000, description="Search radius in kilometers"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results"),
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    Find facilities near a location.

    Example: /facilities/nearby?lat=36.1627&lng=-86.7816&radius=100
    """
    service = DataService()

    results = await service.find_nearby_facilities(
        latitude=lat,
        longitude=lng,
        radius_km=radius,
        limit=limit
    )

    return results


# ============================================================================
# FORECAST & ANALYTICS
# ============================================================================

@forecast_router.get(
    "/capacity",
    response_model=CapacityForecast,
    summary="Get capacity forecast",
    description="Historical and projected battery capacity data"
)
async def get_capacity_forecast(
    start_year: Optional[int] = Query(None, ge=2000, le=2050, description="Starting year for forecast"),
    end_year: Optional[int] = Query(None, ge=2000, le=2050, description="Ending year for forecast"),
    technology: Optional[str] = Query(None, description="Filter by technology type"),
    region: Optional[str] = Query(None, description="Filter by region (state or cluster)"),
    granularity: Granularity = Query(Granularity.YEARLY, description="Data granularity"),
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    Get capacity forecast data.

    Example: /forecast/capacity?start_year=2020&end_year=2030&granularity=yearly
    """
    service = DataService()

    forecast = await service.get_capacity_forecast(
        start_year=start_year,
        end_year=end_year,
        technology=technology,
        region=region,
        granularity=granularity.value
    )

    return forecast


@forecast_router.get(
    "/cost",
    response_model=CostForecast,
    summary="Get cost projections",
    description="Historical and projected battery cost curve data"
)
async def get_cost_forecast(
    start_year: Optional[int] = Query(None, ge=2000, le=2050),
    end_year: Optional[int] = Query(None, ge=2000, le=2050),
    technology: Optional[str] = Query(None, description="Filter by technology type"),
    include_breakdown: bool = Query(False, description="Include cost component breakdown"),
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    Get cost forecast data.

    Example: /forecast/cost?start_year=2015&end_year=2030&include_breakdown=true
    """
    service = DataService()

    forecast = await service.get_cost_forecast(
        start_year=start_year,
        end_year=end_year,
        technology=technology,
        include_breakdown=include_breakdown
    )

    return forecast


@analytics_router.get(
    "/market-share",
    response_model=MarketShareResponse,
    summary="Get market share evolution",
    description="Market share data by technology/chemistry over time"
)
async def get_market_share(
    start_year: Optional[int] = Query(None, ge=2000, le=2050),
    end_year: Optional[int] = Query(None, ge=2000, le=2050),
    chemistry: Optional[str] = Query(None, description="Filter by specific chemistry"),
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    Get market share evolution data.

    Example: /analytics/market-share?start_year=2015&end_year=2030
    """
    service = DataService()

    data = await service.get_market_share(
        start_year=start_year,
        end_year=end_year,
        chemistry=chemistry
    )

    return data


@analytics_router.get(
    "/regional-clusters",
    response_model=RegionalClusterResponse,
    summary="Get regional cluster analysis",
    description="Analysis of battery manufacturing regional clusters"
)
async def get_regional_clusters(
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    Get regional cluster data.

    Example: /analytics/regional-clusters
    """
    service = DataService()
    data = await service.get_regional_clusters()
    return data


@analytics_router.get(
    "/technology-trends",
    response_model=TechnologyTrendsResponse,
    summary="Get technology trends",
    description="Technology adoption and innovation trends"
)
async def get_technology_trends(
    metric: Literal["energy_density", "cycle_life", "technology_mix"] = Query(
        "technology_mix",
        description="Metric to analyze"
    ),
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    Get technology trends data.

    Example: /analytics/technology-trends?metric=energy_density
    """
    service = DataService()
    data = await service.get_technology_trends(metric=metric)
    return data


@analytics_router.get(
    "/supply-chain",
    response_model=SupplyChainResponse,
    summary="Get supply chain analysis",
    description="Critical materials and supply chain risk assessment"
)
async def get_supply_chain_analysis(
    material: Optional[str] = Query(None, description="Filter by specific material"),
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    Get supply chain analysis.

    Example: /analytics/supply-chain?material=lithium
    """
    service = DataService()
    data = await service.get_supply_chain_analysis(material=material)
    return data


# ============================================================================
# POLICIES
# ============================================================================

@policy_router.get(
    "",
    response_model=PolicyListResponse,
    summary="List policies and incentives",
    description="Government policies, incentives, and regulations"
)
async def list_policies(
    type: Optional[PolicyType] = Query(None, description="Policy type"),
    jurisdiction: Optional[Jurisdiction] = Query(None, description="Federal, state, or local"),
    state: Optional[str] = Query(None, min_length=2, max_length=2, description="State abbreviation for state-level policies"),
    status: Optional[PolicyStatus] = Query(None, description="Policy status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    List policies with filtering.

    Example: /policies?type=tax_credit&jurisdiction=federal&status=active
    """
    service = DataService()

    filters = {
        "type": type,
        "jurisdiction": jurisdiction,
        "state": state,
        "status": status
    }

    result = await service.get_policies(
        filters=filters,
        page=page,
        page_size=page_size
    )

    return result


@policy_router.get(
    "/{id}",
    response_model=PolicyDetail,
    summary="Get policy details",
    description="Detailed information about a specific policy"
)
async def get_policy(
    id: str = Path(..., description="Policy ID"),
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    Get detailed policy information.

    Example: /policies/ira-45x
    """
    service = DataService()
    policy = await service.get_policy_by_id(id)

    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Policy '{id}' not found"
        )

    return policy


@policy_router.get(
    "/{id}/impact",
    response_model=PolicyImpactResponse,
    summary="Get policy impact analysis",
    description="Analysis of a policy's economic and market impact"
)
async def get_policy_impact(
    id: str = Path(..., description="Policy ID"),
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    Get policy impact analysis.

    Example: /policies/ira-45x/impact
    """
    service = DataService()
    impact = await service.get_policy_impact(id)

    if not impact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Policy '{id}' not found"
        )

    return impact


# ============================================================================
# CHATBOT
# ============================================================================

@chat_router.post(
    "/query",
    response_model=ChatQueryResponse,
    summary="Submit natural language query",
    description="Query the battery intelligence system using natural language (RAG-powered)"
)
async def chat_query(
    request: ChatQueryRequest,
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    Submit a natural language query to the RAG-powered chatbot.

    Example request:
    {
        "query": "What are the top battery companies in Tennessee?",
        "include_sources": true,
        "max_sources": 5
    }
    """
    service = DataService()

    response = await service.process_chat_query(
        query=request.query,
        session_id=request.session_id,
        include_sources=request.include_sources,
        max_sources=request.max_sources
    )

    return response


@chat_router.get(
    "/history",
    response_model=ChatHistoryResponse,
    summary="Get conversation history",
    description="Retrieve past conversation history for the authenticated user"
)
async def get_chat_history(
    session_id: Optional[str] = Query(None, description="Filter by session ID"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of messages"),
    api_key: str = Depends(get_api_key),
    rate_limit: bool = Depends(check_rate_limit)
):
    """
    Get conversation history.

    Example: /chat/history?session_id=abc123&limit=20
    """
    service = DataService()

    history = await service.get_chat_history(
        api_key=api_key,
        session_id=session_id,
        limit=limit
    )

    return history


# ============================================================================
# EXPORT ALL ROUTERS
# ============================================================================

def get_all_routers():
    """Get all API routers"""
    return [
        health_router,
        companies_router,
        facilities_router,
        forecast_router,
        analytics_router,
        policy_router,
        chat_router
    ]
