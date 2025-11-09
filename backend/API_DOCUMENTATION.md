# Battery Intelligence Platform API - Complete Documentation

## Overview

The Battery Intelligence Platform API provides comprehensive access to US battery industry data, including companies, facilities, market forecasts, technology trends, supply chain analysis, and policy impacts. The API also features a RAG-powered chatbot for natural language queries.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [API Endpoints](#api-endpoints)
5. [Request/Response Formats](#requestresponse-formats)
6. [Error Handling](#error-handling)
7. [Code Examples](#code-examples)
8. [Best Practices](#best-practices)

---

## Getting Started

### Base URL

```
Production: https://api.batteryintel.com/v1
Development: http://localhost:8000/api/v1
```

### Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://user:pass@localhost/battery_db"
export OPENAI_API_KEY="your-key-here"

# Run the server
uvicorn app.main:app --reload --port 8000

# Access API documentation
open http://localhost:8000/docs
```

---

## Authentication

All API endpoints (except `/health`) require authentication via API key.

### Getting an API Key

1. Sign up at https://batteryintel.com/signup
2. Generate an API key from your dashboard
3. Include the key in the `X-API-Key` header

### Using Your API Key

```bash
curl -H "X-API-Key: your_api_key_here" \
     https://api.batteryintel.com/v1/companies
```

### API Tiers

| Tier | Rate Limit | Features |
|------|-----------|----------|
| **Free** | 100 req/hour | Basic data access |
| **Standard** | 1,000 req/hour | Advanced analytics, bulk queries |
| **Enterprise** | 10,000 req/hour | Custom endpoints, SLA, support |

---

## Rate Limiting

Rate limits are enforced per API key on an hourly rolling window.

### Rate Limit Headers

Every response includes rate limit information:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1699459200
```

### Handling Rate Limits

When you exceed your rate limit, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit of 1000 requests per hour exceeded. Try again later."
  },
  "rate_limit": {
    "limit": 1000,
    "remaining": 0,
    "reset": 1699459200,
    "reset_in_seconds": 3600
  }
}
```

**Best Practices:**
- Cache responses when possible
- Use pagination to reduce payload size
- Implement exponential backoff for retries
- Monitor the `X-RateLimit-Remaining` header

---

## API Endpoints

### Health Check

#### `GET /health`

Check API availability and status (no authentication required).

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-11-09T12:00:00Z",
  "database": "connected"
}
```

---

### Companies

#### `GET /api/v1/companies`

List all battery companies with filtering and pagination.

**Query Parameters:**
- `technology` (string): Filter by technology (e.g., "LFP", "Li-ion")
- `state` (string): Two-letter state code (e.g., "CA", "TX")
- `stage` (enum): Development stage (announced, construction, operational, expansion)
- `min_capacity` (number): Minimum capacity in GWh
- `max_capacity` (number): Maximum capacity in GWh
- `page` (integer): Page number (default: 1)
- `page_size` (integer): Items per page (default: 20, max: 100)
- `sort_by` (enum): Sort field (name, capacity, state)
- `sort_order` (enum): Sort order (asc, desc)

**Example:**
```bash
GET /api/v1/companies?technology=LFP&min_capacity=50&page=1&page_size=10
```

**Response:**
```json
{
  "data": [
    {
      "id": "tesla",
      "name": "Tesla",
      "capacity": 110,
      "technology": "Li-ion (4680, 2170)",
      "facilities": ["tesla-gigafactory-nevada", "tesla-texas"],
      "states": ["NV", "TX"],
      "partnerships": ["Panasonic"],
      "website": "https://tesla.com"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total_items": 45,
    "total_pages": 5,
    "has_next": true,
    "has_previous": false
  }
}
```

#### `GET /api/v1/companies/{id}`

Get detailed information about a specific company.

**Path Parameters:**
- `id` (string): Company ID or slug (e.g., "tesla", "lg-energy-solution")

**Response:**
```json
{
  "id": "tesla",
  "name": "Tesla",
  "capacity": 110,
  "technology": "Li-ion (4680, 2170)",
  "description": "Leading electric vehicle and battery manufacturer",
  "founded": 2003,
  "headquarters": {
    "city": "Austin",
    "state": "TX",
    "country": "USA"
  },
  "facilities_detail": [...],
  "financial_data": {
    "market_cap": 500000000000,
    "revenue": 96000000000,
    "investment": 5000000000
  }
}
```

#### `GET /api/v1/companies/search`

Full-text search for companies.

**Query Parameters:**
- `q` (string, required): Search query
- `fields` (string): Comma-separated fields to search (default: "name,technology,description")
- `limit` (integer): Max results (default: 10, max: 100)

**Example:**
```bash
GET /api/v1/companies/search?q=solid+state+battery&limit=5
```

---

### Facilities

#### `GET /api/v1/facilities`

List manufacturing facilities with filtering.

**Query Parameters:**
- `state` (string): State abbreviation
- `company` (string): Company name or ID
- `status` (enum): Facility status
- `min_capacity` (number): Minimum capacity in GWh
- `technology` (string): Technology type
- `bbox` (string): Bounding box (minLon,minLat,maxLon,maxLat)
- `page`, `page_size`: Pagination

**Example:**
```bash
GET /api/v1/facilities?state=TN&status=operational
```

#### `GET /api/v1/facilities/{id}`

Get detailed facility information.

#### `GET /api/v1/facilities/nearby`

Find facilities near a location (geospatial query).

**Query Parameters:**
- `lat` (number, required): Latitude
- `lng` (number, required): Longitude
- `radius` (number): Search radius in km (default: 100, max: 1000)
- `limit` (integer): Max results (default: 10, max: 50)

**Example:**
```bash
GET /api/v1/facilities/nearby?lat=36.1627&lng=-86.7816&radius=100
```

**Response:**
```json
{
  "query": {
    "latitude": 36.1627,
    "longitude": -86.7816,
    "radius": 100
  },
  "data": [
    {
      "id": "ultium-spring-hill",
      "name": "Ultium Cells Spring Hill",
      "company": "Ultium Cells",
      "distance": 25.5,
      "capacity": 50,
      "location": {...}
    }
  ]
}
```

---

### Forecast & Analytics

#### `GET /api/v1/forecast/capacity`

Get battery capacity forecast data.

**Query Parameters:**
- `start_year` (integer): Starting year (2000-2050)
- `end_year` (integer): Ending year (2000-2050)
- `technology` (string): Filter by technology
- `region` (string): Filter by region/state
- `granularity` (enum): yearly, quarterly, monthly (default: yearly)

**Response:**
```json
{
  "metadata": {
    "start_year": 2020,
    "end_year": 2030,
    "granularity": "yearly",
    "confidence_interval": "95%"
  },
  "data": [
    {
      "year": 2024,
      "capacity": 850,
      "growth_rate": 13.3,
      "breakdown": {
        "LFP": 340,
        "NMC": 425,
        "Other": 85
      }
    }
  ]
}
```

#### `GET /api/v1/forecast/cost`

Get battery cost projections.

**Query Parameters:**
- `start_year`, `end_year`: Year range
- `technology`: Technology filter
- `include_breakdown` (boolean): Include cost component breakdown (default: false)

**Response:**
```json
{
  "metadata": {
    "unit": "$/kWh",
    "base_year": 2015
  },
  "data": [
    {
      "year": 2024,
      "cost": 115,
      "reduction_rate": 4.3,
      "breakdown": {
        "cathode": 40,
        "anode": 15,
        "electrolyte": 10,
        "separator": 8,
        "manufacturing": 42
      }
    }
  ]
}
```

#### `GET /api/v1/analytics/market-share`

Get market share evolution by technology/chemistry.

**Query Parameters:**
- `start_year`, `end_year`: Year range
- `chemistry` (string): Filter by specific chemistry

**Response:**
```json
{
  "data": {
    "2024": [
      {"chemistry": "NMC", "share": 50},
      {"chemistry": "LFP", "share": 40},
      {"chemistry": "Other", "share": 10}
    ],
    "2030": [
      {"chemistry": "LFP/LMFP", "share": 40},
      {"chemistry": "NMC", "share": 35},
      {"chemistry": "Solid-state", "share": 10}
    ]
  }
}
```

#### `GET /api/v1/analytics/regional-clusters`

Get regional manufacturing cluster analysis.

#### `GET /api/v1/analytics/technology-trends`

Get technology adoption and innovation trends.

**Query Parameters:**
- `metric` (enum): energy_density, cycle_life, technology_mix

#### `GET /api/v1/analytics/supply-chain`

Get supply chain risk assessment.

**Query Parameters:**
- `material` (string): Filter by specific material (e.g., "lithium")

**Response:**
```json
{
  "data": {
    "materials": [
      {
        "name": "Lithium",
        "risk_level": "medium",
        "domestic_production": 0,
        "import_dependency": 100,
        "major_suppliers": ["Chile", "Australia", "Argentina"]
      }
    ]
  }
}
```

---

### Policies

#### `GET /api/v1/policies`

List government policies and incentives.

**Query Parameters:**
- `type` (enum): tax_credit, grant, loan, regulation, tariff
- `jurisdiction` (enum): federal, state, local
- `state` (string): State abbreviation for state-level policies
- `status` (enum): proposed, active, expired

#### `GET /api/v1/policies/{id}`

Get detailed policy information.

#### `GET /api/v1/policies/{id}/impact`

Get policy impact analysis.

**Response:**
```json
{
  "policy_id": "ira-45x",
  "impact_metrics": {
    "jobs_created": 50000,
    "investment_attracted": 25000000000,
    "capacity_added": 200,
    "companies_benefited": 35
  },
  "economic_analysis": {...}
}
```

---

### Chatbot (RAG-Powered)

#### `POST /api/v1/chat/query`

Submit a natural language query to the RAG-powered chatbot.

**Request Body:**
```json
{
  "query": "What are the top battery companies in Tennessee?",
  "session_id": "optional-session-id",
  "include_sources": true,
  "max_sources": 5
}
```

**Response:**
```json
{
  "query": "What are the top battery companies in Tennessee?",
  "response": "Tennessee hosts several major battery manufacturers including Ultium Cells and BlueOval SK...",
  "sources": [
    {
      "type": "company",
      "id": "ultium-cells",
      "relevance_score": 0.95,
      "snippet": "Ultium Cells operates a 50 GWh facility in Spring Hill, TN"
    }
  ],
  "session_id": "abc-123",
  "timestamp": "2025-11-09T12:00:00Z"
}
```

#### `GET /api/v1/chat/history`

Get conversation history for the authenticated user.

**Query Parameters:**
- `session_id` (string): Filter by session ID
- `limit` (integer): Max messages (default: 50, max: 100)

---

## Request/Response Formats

### Pagination

All list endpoints support pagination:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 100,
    "total_pages": 5,
    "has_next": true,
    "has_previous": false
  }
}
```

### Timestamps

All timestamps use ISO 8601 format with UTC timezone:
```
2025-11-09T12:00:00Z
```

### Geographic Coordinates

```json
{
  "latitude": 36.1627,
  "longitude": -86.7816
}
```

---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {...}
  },
  "timestamp": "2025-11-09T12:00:00Z",
  "path": "/api/v1/companies"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing or invalid API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Error Codes

- `BAD_REQUEST` - Invalid query parameters
- `UNAUTHORIZED` - Invalid or missing API key
- `FORBIDDEN` - Insufficient API tier
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `VALIDATION_ERROR` - Request validation failed
- `INTERNAL_SERVER_ERROR` - Unexpected server error

---

## Code Examples

### Python

```python
import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://api.batteryintel.com/v1"

headers = {
    "X-API-Key": API_KEY
}

# Get companies
response = requests.get(
    f"{BASE_URL}/companies",
    headers=headers,
    params={"technology": "LFP", "min_capacity": 50}
)
companies = response.json()

# Chat query
response = requests.post(
    f"{BASE_URL}/chat/query",
    headers=headers,
    json={
        "query": "What are the largest battery facilities in Nevada?",
        "include_sources": True
    }
)
chat_response = response.json()
print(chat_response["response"])
```

### JavaScript

```javascript
const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://api.batteryintel.com/v1';

const headers = {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json'
};

// Get companies
const response = await fetch(
  `${BASE_URL}/companies?technology=LFP&min_capacity=50`,
  { headers }
);
const companies = await response.json();

// Chat query
const chatResponse = await fetch(
  `${BASE_URL}/chat/query`,
  {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: 'What are the largest battery facilities in Nevada?',
      include_sources: true
    })
  }
);
const result = await chatResponse.json();
console.log(result.response);
```

### cURL

```bash
# Get companies
curl -H "X-API-Key: your_api_key_here" \
     "https://api.batteryintel.com/v1/companies?technology=LFP&min_capacity=50"

# Chat query
curl -X POST \
     -H "X-API-Key: your_api_key_here" \
     -H "Content-Type: application/json" \
     -d '{"query": "What are the largest battery facilities in Nevada?"}' \
     "https://api.batteryintel.com/v1/chat/query"

# Nearby facilities
curl -H "X-API-Key: your_api_key_here" \
     "https://api.batteryintel.com/v1/facilities/nearby?lat=36.1627&lng=-86.7816&radius=100"
```

---

## Best Practices

### 1. Use Appropriate Filters

Always filter data at the API level rather than client-side:

```python
# Good - filter on server
response = requests.get(
    f"{BASE_URL}/companies",
    headers=headers,
    params={"state": "CA", "min_capacity": 50}
)

# Bad - fetch all and filter client-side
response = requests.get(f"{BASE_URL}/companies", headers=headers)
filtered = [c for c in response.json()["data"] if c["state"] == "CA"]
```

### 2. Implement Caching

Cache responses to reduce API calls:

```python
from functools import lru_cache
import time

@lru_cache(maxsize=128)
def get_companies_cached(technology, min_capacity):
    response = requests.get(
        f"{BASE_URL}/companies",
        headers=headers,
        params={"technology": technology, "min_capacity": min_capacity}
    )
    return response.json()
```

### 3. Handle Rate Limits Gracefully

```python
import time

def make_request_with_retry(url, max_retries=3):
    for attempt in range(max_retries):
        response = requests.get(url, headers=headers)

        if response.status_code == 429:
            # Rate limited - wait and retry
            reset_time = int(response.headers.get('X-RateLimit-Reset', 0))
            wait_time = max(reset_time - time.time(), 60)
            print(f"Rate limited. Waiting {wait_time}s...")
            time.sleep(wait_time)
            continue

        return response.json()

    raise Exception("Max retries exceeded")
```

### 4. Use Pagination for Large Datasets

```python
def fetch_all_companies():
    all_companies = []
    page = 1

    while True:
        response = requests.get(
            f"{BASE_URL}/companies",
            headers=headers,
            params={"page": page, "page_size": 100}
        )
        data = response.json()

        all_companies.extend(data["data"])

        if not data["pagination"]["has_next"]:
            break

        page += 1

    return all_companies
```

### 5. Monitor Your Usage

```python
def check_rate_limit_status():
    response = requests.get(f"{BASE_URL}/companies", headers=headers)

    print(f"Limit: {response.headers['X-RateLimit-Limit']}")
    print(f"Remaining: {response.headers['X-RateLimit-Remaining']}")
    print(f"Reset: {response.headers['X-RateLimit-Reset']}")
```

### 6. Use Webhooks for Updates (Enterprise Tier)

Subscribe to data change notifications instead of polling:

```python
# Contact support for webhook setup
# POST /api/v1/webhooks/subscribe
{
    "url": "https://your-server.com/webhook",
    "events": ["company.updated", "facility.created"]
}
```

---

## Support

- **Documentation**: https://docs.batteryintel.com
- **API Status**: https://status.batteryintel.com
- **Email**: api-support@batteryintel.com
- **GitHub Issues**: https://github.com/batteryintel/api/issues

---

## Changelog

### Version 1.0.0 (2025-11-09)
- Initial API release
- Companies, facilities, forecasts, analytics endpoints
- RAG-powered chatbot
- API key authentication
- Rate limiting by tier
- Comprehensive OpenAPI documentation
