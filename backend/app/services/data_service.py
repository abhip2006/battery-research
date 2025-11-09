"""
Data service for Battery Intelligence Platform
Handles data retrieval and business logic
"""
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid
from pathlib import Path

from ..models.schemas import (
    Company, CompanyDetail, CompanyListResponse,
    FacilityBase, FacilityDetail, FacilityListResponse,
    NearbyFacilitiesResponse, SearchResponse,
    CapacityForecast, CostForecast,
    MarketShareResponse, RegionalClusterResponse, TechnologyTrendsResponse, SupplyChainResponse,
    PolicyBase, PolicyDetail, PolicyListResponse, PolicyImpactResponse,
    ChatQueryRequest, ChatQueryResponse, ChatHistoryResponse,
    Pagination, SearchResult, ChatSource, ChatHistoryItem,
    CapacityForecastMetadata, CapacityDataPoint,
    CostForecastMetadata, CostDataPoint
)


class DataService:
    """Service for data access and business logic"""

    def __init__(self):
        # Load visualization data
        self.data = self._load_data()

    def _load_data(self) -> dict:
        """Load data from visualization-data.json"""
        # In production, this would connect to a database
        # For now, loading from the JSON file
        data_path = Path(__file__).parent.parent.parent.parent / "visualization-data.json"

        try:
            with open(data_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            # Return empty structure if file not found
            return {
                "topCompanies": [],
                "stateRankings": [],
                "costCurve": [],
                "capacityGrowth": [],
                "technologyMix": {},
                "energyDensity": {},
                "marketShare": {},
                "cycleLife": {},
                "regionalClusters": [],
                "timeline": {},
                "keyMetrics": {}
            }

    # ========================================================================
    # COMPANIES
    # ========================================================================

    async def get_companies(
        self,
        filters: dict,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "capacity",
        sort_order: str = "desc"
    ) -> CompanyListResponse:
        """Get list of companies with filtering and pagination"""

        # Get companies from data
        companies_data = self.data.get("topCompanies", [])

        # Convert to Company objects
        companies = []
        for idx, comp in enumerate(companies_data):
            # Extract states from stateRankings
            states = []
            for state_data in self.data.get("stateRankings", []):
                if comp["name"] in state_data.get("companies", []):
                    states.append(state_data["state"])

            company = Company(
                id=comp["name"].lower().replace(" ", "-").replace("(", "").replace(")", ""),
                name=comp["name"],
                capacity=comp["capacity"],
                technology=comp["technology"],
                states=states,
                facilities=[],
                partnerships=[]
            )
            companies.append(company)

        # Apply filters
        filtered = self._apply_company_filters(companies, filters)

        # Sort
        filtered = self._sort_companies(filtered, sort_by, sort_order)

        # Paginate
        total_items = len(filtered)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated = filtered[start_idx:end_idx]

        # Create pagination metadata
        pagination = Pagination(
            page=page,
            page_size=page_size,
            total_items=total_items,
            total_pages=(total_items + page_size - 1) // page_size,
            has_next=end_idx < total_items,
            has_previous=page > 1
        )

        return CompanyListResponse(
            data=paginated,
            pagination=pagination,
            filters_applied=filters
        )

    def _apply_company_filters(self, companies: List[Company], filters: dict) -> List[Company]:
        """Apply filters to company list"""
        filtered = companies

        if filters.get("technology"):
            tech = filters["technology"].lower()
            filtered = [c for c in filtered if tech in c.technology.lower()]

        if filters.get("state"):
            state = filters["state"].upper()
            filtered = [c for c in filtered if state in c.states]

        if filters.get("min_capacity") is not None:
            min_cap = filters["min_capacity"]
            filtered = [c for c in filtered if c.capacity >= min_cap]

        if filters.get("max_capacity") is not None:
            max_cap = filters["max_capacity"]
            filtered = [c for c in filtered if c.capacity <= max_cap]

        return filtered

    def _sort_companies(self, companies: List[Company], sort_by: str, sort_order: str) -> List[Company]:
        """Sort companies"""
        reverse = sort_order.lower() == "desc"

        if sort_by == "name":
            return sorted(companies, key=lambda c: c.name, reverse=reverse)
        elif sort_by == "capacity":
            return sorted(companies, key=lambda c: c.capacity, reverse=reverse)
        else:
            return companies

    async def get_company_by_id(self, company_id: str) -> Optional[CompanyDetail]:
        """Get detailed company information"""
        # Find company in data
        for comp in self.data.get("topCompanies", []):
            slug = comp["name"].lower().replace(" ", "-").replace("(", "").replace(")", "")
            if slug == company_id or comp["name"].lower() == company_id.lower():
                # Build detailed company
                states = []
                for state_data in self.data.get("stateRankings", []):
                    if comp["name"] in state_data.get("companies", []):
                        states.append(state_data["state"])

                return CompanyDetail(
                    id=slug,
                    name=comp["name"],
                    capacity=comp["capacity"],
                    technology=comp["technology"],
                    states=states,
                    facilities=[],
                    partnerships=[],
                    description=f"{comp['name']} is a leading battery manufacturer with {comp['capacity']} GWh capacity.",
                    founded=None,
                    headquarters=None,
                    facilities_detail=None,
                    financial_data=None,
                    key_executives=None
                )

        return None

    async def search_companies(self, query: str, fields: List[str], limit: int) -> SearchResponse:
        """Full-text search for companies"""
        results = []
        query_lower = query.lower()

        for comp in self.data.get("topCompanies", [])[:limit]:
            score = 0.0

            # Simple scoring based on field matches
            if "name" in fields and query_lower in comp["name"].lower():
                score += 0.5
            if "technology" in fields and query_lower in comp["technology"].lower():
                score += 0.3

            if score > 0:
                slug = comp["name"].lower().replace(" ", "-").replace("(", "").replace(")", "")
                results.append(SearchResult(
                    type="company",
                    item={
                        "id": slug,
                        "name": comp["name"],
                        "capacity": comp["capacity"],
                        "technology": comp["technology"]
                    },
                    score=score,
                    highlights=[comp["name"]] if query_lower in comp["name"].lower() else []
                ))

        # Sort by score
        results.sort(key=lambda r: r.score, reverse=True)

        return SearchResponse(
            query=query,
            total_results=len(results),
            data=results[:limit]
        )

    # ========================================================================
    # FACILITIES
    # ========================================================================

    async def get_facilities(
        self,
        filters: dict,
        page: int = 1,
        page_size: int = 20
    ) -> FacilityListResponse:
        """Get list of facilities with filtering and pagination"""

        # For now, return empty list as we don't have detailed facility data
        # In production, this would query from a facilities database
        facilities = []

        pagination = Pagination(
            page=page,
            page_size=page_size,
            total_items=0,
            total_pages=0,
            has_next=False,
            has_previous=False
        )

        return FacilityListResponse(
            data=facilities,
            pagination=pagination
        )

    async def get_facility_by_id(self, facility_id: str) -> Optional[FacilityDetail]:
        """Get detailed facility information"""
        # In production, query from database
        return None

    async def find_nearby_facilities(
        self,
        latitude: float,
        longitude: float,
        radius_km: float,
        limit: int
    ) -> NearbyFacilitiesResponse:
        """Find facilities near a location"""

        # In production, use geospatial database query
        return NearbyFacilitiesResponse(
            query={
                "latitude": latitude,
                "longitude": longitude,
                "radius": radius_km
            },
            data=[]
        )

    # ========================================================================
    # FORECAST
    # ========================================================================

    async def get_capacity_forecast(
        self,
        start_year: Optional[int],
        end_year: Optional[int],
        technology: Optional[str],
        region: Optional[str],
        granularity: str
    ) -> CapacityForecast:
        """Get capacity forecast data"""

        capacity_data = self.data.get("capacityGrowth", [])

        # Filter by year range
        if start_year:
            capacity_data = [d for d in capacity_data if d["year"] >= start_year]
        if end_year:
            capacity_data = [d for d in capacity_data if d["year"] <= end_year]

        # Convert to data points
        data_points = []
        for i, point in enumerate(capacity_data):
            growth_rate = None
            if i > 0:
                prev = capacity_data[i-1]
                growth_rate = ((point["capacity"] - prev["capacity"]) / prev["capacity"]) * 100

            data_points.append(CapacityDataPoint(
                year=point["year"],
                capacity=point["capacity"],
                growth_rate=growth_rate,
                breakdown=None
            ))

        metadata = CapacityForecastMetadata(
            start_year=capacity_data[0]["year"] if capacity_data else 2015,
            end_year=capacity_data[-1]["year"] if capacity_data else 2030,
            granularity=granularity,
            confidence_interval="95%"
        )

        return CapacityForecast(
            metadata=metadata,
            data=data_points
        )

    async def get_cost_forecast(
        self,
        start_year: Optional[int],
        end_year: Optional[int],
        technology: Optional[str],
        include_breakdown: bool
    ) -> CostForecast:
        """Get cost forecast data"""

        cost_data = self.data.get("costCurve", [])

        # Filter by year range
        if start_year:
            cost_data = [d for d in cost_data if d["year"] >= start_year]
        if end_year:
            cost_data = [d for d in cost_data if d["year"] <= end_year]

        # Convert to data points
        data_points = []
        for i, point in enumerate(cost_data):
            reduction_rate = None
            if i > 0:
                prev = cost_data[i-1]
                reduction_rate = ((prev["cost"] - point["cost"]) / prev["cost"]) * 100

            data_points.append(CostDataPoint(
                year=point["year"],
                cost=point["cost"],
                reduction_rate=reduction_rate,
                breakdown=None
            ))

        metadata = CostForecastMetadata(
            unit="$/kWh",
            base_year=cost_data[0]["year"] if cost_data else 2015
        )

        return CostForecast(
            metadata=metadata,
            data=data_points
        )

    # ========================================================================
    # ANALYTICS
    # ========================================================================

    async def get_market_share(
        self,
        start_year: Optional[int],
        end_year: Optional[int],
        chemistry: Optional[str]
    ) -> MarketShareResponse:
        """Get market share evolution data"""

        market_share = self.data.get("marketShare", {})

        # Filter by year range
        filtered_data = {}
        for year, data in market_share.items():
            year_int = int(year)
            if start_year and year_int < start_year:
                continue
            if end_year and year_int > end_year:
                continue
            filtered_data[year] = data

        return MarketShareResponse(data=filtered_data)

    async def get_regional_clusters(self) -> RegionalClusterResponse:
        """Get regional cluster analysis"""

        clusters = self.data.get("regionalClusters", [])
        return RegionalClusterResponse(data=clusters)

    async def get_technology_trends(self, metric: str) -> TechnologyTrendsResponse:
        """Get technology trends"""

        if metric == "energy_density":
            data = self.data.get("energyDensity", {})
        elif metric == "cycle_life":
            data = self.data.get("cycleLife", {})
        elif metric == "technology_mix":
            data = self.data.get("technologyMix", {})
        else:
            data = {}

        return TechnologyTrendsResponse(
            metric=metric,
            data=data
        )

    async def get_supply_chain_analysis(self, material: Optional[str]) -> SupplyChainResponse:
        """Get supply chain analysis"""

        # In production, this would query from a supply chain database
        supply_chain_data = {
            "materials": [
                {
                    "name": "Lithium",
                    "risk_level": "medium",
                    "domestic_production": 0,
                    "import_dependency": 100,
                    "major_suppliers": ["Chile", "Australia", "Argentina"]
                },
                {
                    "name": "Cobalt",
                    "risk_level": "high",
                    "domestic_production": 0,
                    "import_dependency": 100,
                    "major_suppliers": ["Congo (DRC)", "Russia", "Australia"]
                },
                {
                    "name": "Nickel",
                    "risk_level": "medium",
                    "domestic_production": 5,
                    "import_dependency": 95,
                    "major_suppliers": ["Indonesia", "Philippines", "Russia"]
                },
                {
                    "name": "Graphite",
                    "risk_level": "critical",
                    "domestic_production": 0,
                    "import_dependency": 100,
                    "major_suppliers": ["China"]
                }
            ]
        }

        if material:
            supply_chain_data["materials"] = [
                m for m in supply_chain_data["materials"]
                if material.lower() in m["name"].lower()
            ]

        return SupplyChainResponse(data=supply_chain_data)

    # ========================================================================
    # POLICIES
    # ========================================================================

    async def get_policies(
        self,
        filters: dict,
        page: int = 1,
        page_size: int = 20
    ) -> PolicyListResponse:
        """Get list of policies"""

        # Sample policy data - in production, query from database
        policies = []

        pagination = Pagination(
            page=page,
            page_size=page_size,
            total_items=0,
            total_pages=0,
            has_next=False,
            has_previous=False
        )

        return PolicyListResponse(
            data=policies,
            pagination=pagination
        )

    async def get_policy_by_id(self, policy_id: str) -> Optional[PolicyDetail]:
        """Get detailed policy information"""
        # In production, query from database
        return None

    async def get_policy_impact(self, policy_id: str) -> Optional[PolicyImpactResponse]:
        """Get policy impact analysis"""
        # In production, query from database and run analysis
        return None

    # ========================================================================
    # CHATBOT
    # ========================================================================

    async def process_chat_query(
        self,
        query: str,
        session_id: Optional[str],
        include_sources: bool,
        max_sources: int
    ) -> ChatQueryResponse:
        """Process a chat query using RAG"""

        # Generate session ID if not provided
        if not session_id:
            session_id = str(uuid.uuid4())

        # In production, this would:
        # 1. Use embeddings to find relevant documents
        # 2. Send to LLM with context
        # 3. Return generated response with sources

        # For now, return a simple response
        response_text = f"I received your query: '{query}'. In production, this would use RAG to provide detailed insights about the US battery industry."

        sources = []
        if include_sources:
            # Sample sources
            sources = [
                ChatSource(
                    type="data",
                    id="visualization-data",
                    relevance_score=0.95,
                    snippet="Battery industry data from visualization-data.json"
                )
            ]

        return ChatQueryResponse(
            query=query,
            response=response_text,
            sources=sources,
            session_id=session_id,
            timestamp=datetime.utcnow()
        )

    async def get_chat_history(
        self,
        api_key: str,
        session_id: Optional[str],
        limit: int
    ) -> ChatHistoryResponse:
        """Get chat history for a user"""

        # In production, query from database
        history = []

        return ChatHistoryResponse(data=history)
