"""
Pydantic models for request/response validation
"""
from datetime import datetime, date
from typing import Optional, List, Dict, Any, Literal
from enum import Enum
from pydantic import BaseModel, Field, validator, HttpUrl


# ============================================================================
# ENUMS
# ============================================================================

class DevelopmentStage(str, Enum):
    """Facility development stage"""
    ANNOUNCED = "announced"
    CONSTRUCTION = "under_construction"
    OPERATIONAL = "operational"
    EXPANSION = "expansion"
    DECOMMISSIONED = "decommissioned"


class PolicyType(str, Enum):
    """Type of government policy"""
    TAX_CREDIT = "tax_credit"
    GRANT = "grant"
    LOAN = "loan"
    REGULATION = "regulation"
    TARIFF = "tariff"


class Jurisdiction(str, Enum):
    """Policy jurisdiction level"""
    FEDERAL = "federal"
    STATE = "state"
    LOCAL = "local"


class PolicyStatus(str, Enum):
    """Policy status"""
    PROPOSED = "proposed"
    ACTIVE = "active"
    EXPIRED = "expired"


class RiskLevel(str, Enum):
    """Supply chain risk level"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SortOrder(str, Enum):
    """Sort order"""
    ASC = "asc"
    DESC = "desc"


class Granularity(str, Enum):
    """Time granularity"""
    YEARLY = "yearly"
    QUARTERLY = "quarterly"
    MONTHLY = "monthly"


# ============================================================================
# SHARED MODELS
# ============================================================================

class Coordinates(BaseModel):
    """Geographic coordinates"""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude")

    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 36.1627,
                "longitude": -86.7816
            }
        }


class Location(BaseModel):
    """Physical location"""
    address: Optional[str] = None
    city: str
    state: str = Field(..., min_length=2, max_length=2, description="Two-letter state code")
    zip_code: Optional[str] = None
    country: str = Field(default="USA")
    coordinates: Optional[Coordinates] = None

    class Config:
        json_schema_extra = {
            "example": {
                "city": "Nashville",
                "state": "TN",
                "zip_code": "37201",
                "country": "USA",
                "coordinates": {
                    "latitude": 36.1627,
                    "longitude": -86.7816
                }
            }
        }


class Pagination(BaseModel):
    """Pagination metadata"""
    page: int = Field(..., ge=1)
    page_size: int = Field(..., ge=1, le=100)
    total_items: int = Field(..., ge=0)
    total_pages: int = Field(..., ge=0)
    has_next: bool
    has_previous: bool

    class Config:
        json_schema_extra = {
            "example": {
                "page": 1,
                "page_size": 20,
                "total_items": 45,
                "total_pages": 3,
                "has_next": True,
                "has_previous": False
            }
        }


class ErrorDetail(BaseModel):
    """Error detail"""
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    """Standard error response"""
    error: ErrorDetail
    timestamp: datetime
    path: str

    class Config:
        json_schema_extra = {
            "example": {
                "error": {
                    "code": "BAD_REQUEST",
                    "message": "Invalid query parameters"
                },
                "timestamp": "2025-11-09T12:00:00Z",
                "path": "/api/v1/companies"
            }
        }


# ============================================================================
# COMPANY MODELS
# ============================================================================

class CompanyBase(BaseModel):
    """Base company information"""
    id: str = Field(..., description="Unique company identifier or slug")
    name: str = Field(..., min_length=1)
    capacity: float = Field(..., ge=0, description="Total capacity in GWh")
    technology: str = Field(..., description="Battery technology types")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "tesla",
                "name": "Tesla",
                "capacity": 110,
                "technology": "Li-ion (4680, 2170)"
            }
        }


class Company(CompanyBase):
    """Company summary for list views"""
    facilities: Optional[List[str]] = Field(default=[], description="Facility IDs")
    states: Optional[List[str]] = Field(default=[], description="States with facilities")
    partnerships: Optional[List[str]] = Field(default=[], description="Partner companies")
    website: Optional[HttpUrl] = None


class Headquarters(BaseModel):
    """Company headquarters"""
    city: str
    state: str
    country: str = "USA"


class FinancialData(BaseModel):
    """Company financial information"""
    market_cap: Optional[float] = Field(None, description="Market capitalization in USD")
    revenue: Optional[float] = Field(None, description="Annual revenue in USD")
    investment: Optional[float] = Field(None, description="Total investment in battery operations in USD")


class Executive(BaseModel):
    """Company executive"""
    name: str
    title: str
    bio: Optional[str] = None


class CompanyDetail(Company):
    """Detailed company information"""
    description: Optional[str] = None
    founded: Optional[int] = Field(None, ge=1800, le=2100)
    headquarters: Optional[Headquarters] = None
    facilities_detail: Optional[List['FacilityBase']] = None
    financial_data: Optional[FinancialData] = None
    key_executives: Optional[List[Executive]] = None


class CompanyListResponse(BaseModel):
    """Response for company list endpoint"""
    data: List[Company]
    pagination: Pagination
    filters_applied: Optional[Dict[str, Any]] = None


class SearchResult(BaseModel):
    """Single search result"""
    type: str = Field(..., description="Type of result (company, facility, etc.)")
    item: Dict[str, Any] = Field(..., description="The actual result object")
    score: float = Field(..., ge=0, le=1, description="Relevance score")
    highlights: Optional[List[str]] = Field(default=[], description="Highlighted matching text")


class SearchResponse(BaseModel):
    """Full-text search response"""
    query: str
    total_results: int = Field(..., ge=0)
    data: List[SearchResult]

    class Config:
        json_schema_extra = {
            "example": {
                "query": "solid state battery",
                "total_results": 3,
                "data": [
                    {
                        "type": "company",
                        "item": {"id": "quantumscape", "name": "QuantumScape"},
                        "score": 0.95,
                        "highlights": ["solid-state lithium-metal battery"]
                    }
                ]
            }
        }


# ============================================================================
# FACILITY MODELS
# ============================================================================

class FacilityBase(BaseModel):
    """Base facility information"""
    id: str
    name: str
    company: str = Field(..., description="Company name or ID")
    location: Location
    capacity: float = Field(..., ge=0, description="Capacity in GWh")
    technology: str
    status: DevelopmentStage
    operational_date: Optional[date] = None
    investment: Optional[float] = Field(None, description="Investment in USD")
    employees: Optional[int] = Field(None, ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "tesla-gigafactory-nevada",
                "name": "Tesla Gigafactory Nevada",
                "company": "Tesla",
                "location": {
                    "city": "Sparks",
                    "state": "NV",
                    "coordinates": {"latitude": 39.5362, "longitude": -119.4383}
                },
                "capacity": 100,
                "technology": "Li-ion (2170)",
                "status": "operational",
                "operational_date": "2016-07-29",
                "investment": 5000000000,
                "employees": 7000
            }
        }


class FacilityDetail(FacilityBase):
    """Detailed facility information"""
    description: Optional[str] = None
    production_lines: Optional[int] = Field(None, ge=0)
    energy_source: Optional[str] = None
    certifications: Optional[List[str]] = None
    supply_chain: Optional[Dict[str, Any]] = None


class FacilityListResponse(BaseModel):
    """Response for facility list endpoint"""
    data: List[FacilityBase]
    pagination: Pagination


class NearbyFacility(FacilityBase):
    """Facility with distance information"""
    distance: float = Field(..., ge=0, description="Distance in kilometers")


class NearbyFacilitiesResponse(BaseModel):
    """Response for nearby facilities query"""
    query: Dict[str, Any] = Field(..., description="Query parameters")
    data: List[NearbyFacility]

    class Config:
        json_schema_extra = {
            "example": {
                "query": {
                    "latitude": 36.1627,
                    "longitude": -86.7816,
                    "radius": 100
                },
                "data": []
            }
        }


# ============================================================================
# FORECAST MODELS
# ============================================================================

class CapacityDataPoint(BaseModel):
    """Single capacity data point"""
    year: int
    capacity: float = Field(..., description="Capacity in GWh")
    growth_rate: Optional[float] = Field(None, description="Year-over-year growth percentage")
    breakdown: Optional[Dict[str, float]] = None


class CapacityForecastMetadata(BaseModel):
    """Capacity forecast metadata"""
    start_year: int
    end_year: int
    granularity: Granularity
    confidence_interval: Optional[str] = None


class CapacityForecast(BaseModel):
    """Capacity forecast data"""
    metadata: CapacityForecastMetadata
    data: List[CapacityDataPoint]


class CostBreakdown(BaseModel):
    """Cost component breakdown"""
    cathode: Optional[float] = None
    anode: Optional[float] = None
    electrolyte: Optional[float] = None
    separator: Optional[float] = None
    manufacturing: Optional[float] = None


class CostDataPoint(BaseModel):
    """Single cost data point"""
    year: int
    cost: float = Field(..., description="Cost in $/kWh")
    reduction_rate: Optional[float] = Field(None, description="Year-over-year cost reduction percentage")
    breakdown: Optional[CostBreakdown] = None


class CostForecastMetadata(BaseModel):
    """Cost forecast metadata"""
    unit: str = Field(default="$/kWh")
    base_year: int


class CostForecast(BaseModel):
    """Cost forecast data"""
    metadata: CostForecastMetadata
    data: List[CostDataPoint]


# ============================================================================
# ANALYTICS MODELS
# ============================================================================

class MarketShareItem(BaseModel):
    """Market share for a chemistry"""
    chemistry: str
    share: float = Field(..., ge=0, le=100, description="Market share percentage")


class MarketShareResponse(BaseModel):
    """Market share evolution over time"""
    data: Dict[str, List[MarketShareItem]] = Field(..., description="Year -> market share data")

    class Config:
        json_schema_extra = {
            "example": {
                "data": {
                    "2024": [
                        {"chemistry": "NMC", "share": 50},
                        {"chemistry": "LFP", "share": 40}
                    ],
                    "2030": [
                        {"chemistry": "LFP/LMFP", "share": 40},
                        {"chemistry": "NMC", "share": 35}
                    ]
                }
            }
        }


class RegionalCluster(BaseModel):
    """Regional manufacturing cluster"""
    name: str
    states: List[str]
    total_capacity: float = Field(..., description="Total capacity in GWh")
    num_facilities: int
    employment: int
    dominant_players: List[str]
    advantages: List[str]


class RegionalClusterResponse(BaseModel):
    """Regional cluster analysis"""
    data: List[RegionalCluster]


class TechnologyTrendsResponse(BaseModel):
    """Technology trends analysis"""
    metric: str
    data: Dict[str, Any]


class SupplyChainMaterial(BaseModel):
    """Supply chain material information"""
    name: str
    risk_level: RiskLevel
    domestic_production: Optional[float] = Field(None, description="Domestic production capacity")
    import_dependency: Optional[float] = Field(None, ge=0, le=100, description="Import dependency percentage")
    major_suppliers: Optional[List[str]] = None


class SupplyChainResponse(BaseModel):
    """Supply chain analysis"""
    data: Dict[str, Any]

    class Config:
        json_schema_extra = {
            "example": {
                "data": {
                    "materials": [
                        {
                            "name": "Lithium",
                            "risk_level": "medium",
                            "import_dependency": 75,
                            "major_suppliers": ["Chile", "Australia", "Argentina"]
                        }
                    ]
                }
            }
        }


# ============================================================================
# POLICY MODELS
# ============================================================================

class PolicyBase(BaseModel):
    """Base policy information"""
    id: str
    name: str
    type: PolicyType
    jurisdiction: Jurisdiction
    state: Optional[str] = Field(None, min_length=2, max_length=2)
    status: PolicyStatus
    effective_date: Optional[date] = None
    expiration_date: Optional[date] = None
    summary: str


class PolicyDetail(PolicyBase):
    """Detailed policy information"""
    full_text: Optional[str] = None
    requirements: Optional[List[str]] = None
    benefits: Optional[Dict[str, Any]] = None
    affected_companies: Optional[List[str]] = None


class PolicyListResponse(BaseModel):
    """Response for policy list endpoint"""
    data: List[PolicyBase]
    pagination: Pagination


class PolicyImpactMetrics(BaseModel):
    """Policy impact metrics"""
    jobs_created: Optional[int] = None
    investment_attracted: Optional[float] = None
    capacity_added: Optional[float] = None
    companies_benefited: Optional[int] = None


class PolicyImpactResponse(BaseModel):
    """Policy impact analysis"""
    policy_id: str
    impact_metrics: PolicyImpactMetrics
    economic_analysis: Optional[Dict[str, Any]] = None


# ============================================================================
# CHATBOT MODELS
# ============================================================================

class ChatQueryRequest(BaseModel):
    """Chat query request"""
    query: str = Field(..., min_length=1, max_length=1000)
    session_id: Optional[str] = None
    include_sources: bool = Field(default=True)
    max_sources: int = Field(default=5, ge=1, le=10)

    class Config:
        json_schema_extra = {
            "example": {
                "query": "What are the top battery companies in Tennessee?",
                "include_sources": True,
                "max_sources": 5
            }
        }


class ChatSource(BaseModel):
    """Source reference for chat response"""
    type: str = Field(..., description="Source type (company, facility, report, etc.)")
    id: str
    relevance_score: float = Field(..., ge=0, le=1)
    snippet: str


class ChatQueryResponse(BaseModel):
    """Chat query response"""
    query: str
    response: str
    sources: Optional[List[ChatSource]] = None
    session_id: str
    timestamp: datetime


class ChatHistoryItem(BaseModel):
    """Chat history item"""
    session_id: str
    query: str
    response: str
    timestamp: datetime


class ChatHistoryResponse(BaseModel):
    """Chat history response"""
    data: List[ChatHistoryItem]


# ============================================================================
# HEALTH CHECK
# ============================================================================

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    timestamp: datetime
    database: str

    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "version": "1.0.0",
                "timestamp": "2025-11-09T12:00:00Z",
                "database": "connected"
            }
        }


# Update forward references
CompanyDetail.model_rebuild()
