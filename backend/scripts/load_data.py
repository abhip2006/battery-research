"""
Data loading script to import visualization-data.json into the database.
"""
import asyncio
import json
import sys
from pathlib import Path
from typing import Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import AsyncSessionLocal
from app.models import Company, Facility, Technology, Forecast, Source
from datetime import datetime


async def load_companies_from_json(data: Dict[str, Any], session):
    """Load companies from topCompanies section of JSON."""
    print("\nLoading companies...")

    top_companies = data.get("topCompanies", [])

    for comp_data in top_companies:
        company = Company(
            name=comp_data["name"],
            company_type="public",  # Assume public for top companies
            primary_category="cell_manufacturing",
            technology=comp_data.get("technology"),
            capacity_gwh=comp_data.get("capacity"),
            capacity_year=2024,
            is_publicly_traded=True,
            confidence_score=0.95,
            verified=True,
        )
        session.add(company)

    await session.flush()
    print(f"Loaded {len(top_companies)} companies")


async def load_state_facilities(data: Dict[str, Any], session):
    """Load facilities from stateRankings section."""
    print("\nLoading facilities...")

    state_rankings = data.get("stateRankings", [])
    facility_count = 0

    for state_data in state_rankings:
        state = state_data["state"]
        companies = state_data.get("companies", [])
        flagship = state_data.get("flagship", "")

        # Create a flagship facility for each state
        if flagship:
            # Try to find the company (simplified - just use first company)
            company_name = companies[0] if companies else "Unknown"

            # Find or create company
            from sqlalchemy import select

            company_query = select(Company).where(Company.name == company_name)
            result = await session.execute(company_query)
            company = result.scalar_one_or_none()

            if not company:
                # Create company if not exists
                company = Company(
                    name=company_name,
                    company_type="public",
                    primary_category="cell_manufacturing",
                    is_publicly_traded=True,
                    confidence_score=0.8,
                )
                session.add(company)
                await session.flush()

            # Create facility
            facility = Facility(
                name=flagship.split(" (")[0],  # Extract name before capacity
                facility_type="manufacturing",
                company_id=company.id,
                state=state,
                capacity_gwh=state_data.get("capacity", 0) / state_data.get("facilities", 1),
                capacity_year=2024,
                status="operational",
                flagship=True,
                confidence_score=0.9,
                verified=True,
            )
            session.add(facility)
            facility_count += 1

    await session.flush()
    print(f"Loaded {facility_count} facilities")


async def load_technologies(data: Dict[str, Any], session):
    """Load technologies from technologyMix section."""
    print("\nLoading technologies...")

    tech_mix_2024 = data.get("technologyMix", {}).get("2024", {})
    technologies = []

    for tech_name, market_share in tech_mix_2024.items():
        technology = Technology(
            name=tech_name,
            category="chemistry",
            chemistry_type=tech_name,
            development_stage="commercial",
            market_share_percent=market_share,
            market_share_year=2024,
        )
        technologies.append(technology)
        session.add(technology)

    await session.flush()
    print(f"Loaded {len(technologies)} technologies")


async def load_forecasts(data: Dict[str, Any], session):
    """Load forecasts from various sections."""
    print("\nLoading forecasts...")

    forecast_count = 0

    # Cost curve forecasts
    cost_curve = data.get("costCurve", [])
    for entry in cost_curve:
        forecast = Forecast(
            forecast_type="cost",
            category="battery_pack",
            forecast_year=entry["year"],
            value=entry["cost"],
            unit="USD/kWh",
            geographic_scope="US",
            confidence_score=0.8,
        )
        session.add(forecast)
        forecast_count += 1

    # Capacity growth forecasts
    capacity_growth = data.get("capacityGrowth", [])
    for entry in capacity_growth:
        forecast = Forecast(
            forecast_type="capacity",
            category="total_us_capacity",
            forecast_year=entry["year"],
            value=entry["capacity"],
            unit="GWh",
            geographic_scope="US",
            confidence_score=0.85,
        )
        session.add(forecast)
        forecast_count += 1

    await session.flush()
    print(f"Loaded {forecast_count} forecasts")


async def load_metadata_as_source(data: Dict[str, Any], session):
    """Load metadata as source references."""
    print("\nLoading source metadata...")

    metadata = data.get("metadata", {})
    data_sources = metadata.get("dataSource", [])

    for source_doc in data_sources:
        source = Source(
            title=source_doc,
            source_type="research_report",
            organization="Battery Research Team",
            publication_date=datetime.strptime(metadata.get("reportDate", "2025-11-08"), "%Y-%m-%d").date(),
            credibility_score=0.95,
            is_primary_source=True,
            is_verified=True,
        )
        session.add(source)

    await session.flush()
    print(f"Loaded {len(data_sources)} source references")


async def main():
    """Main function to load all data."""
    print("=" * 60)
    print("US Battery Industry Intelligence Platform - Data Loader")
    print("=" * 60)

    # Load JSON data
    json_path = Path(__file__).parent.parent.parent / "visualization-data.json"

    if not json_path.exists():
        print(f"Error: visualization-data.json not found at {json_path}")
        sys.exit(1)

    print(f"\nLoading data from: {json_path}")

    with open(json_path, "r") as f:
        data = json.load(f)

    # Create database session
    async with AsyncSessionLocal() as session:
        try:
            # Load data in order (respecting foreign key constraints)
            await load_companies_from_json(data, session)
            await load_state_facilities(data, session)
            await load_technologies(data, session)
            await load_forecasts(data, session)
            await load_metadata_as_source(data, session)

            # Commit all changes
            await session.commit()

            print("\n" + "=" * 60)
            print("Data loading complete!")
            print("=" * 60)

        except Exception as e:
            print(f"\nError loading data: {e}")
            await session.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(main())
