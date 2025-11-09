# Battery Research Platform - Search & Filter API Documentation

## Overview

This document describes the RESTful API endpoints for search and filtering functionality in the Battery Research Platform.

**Base URL:** `https://api.batteryresearch.com/v1`

**Authentication:** Bearer token (JWT) for protected endpoints

**Rate Limiting:** 1000 requests per hour per API key

---

## Table of Contents

1. [Search Endpoints](#search-endpoints)
2. [Filter Endpoints](#filter-endpoints)
3. [Autocomplete Endpoints](#autocomplete-endpoints)
4. [Geospatial Endpoints](#geospatial-endpoints)
5. [Saved Searches](#saved-searches)
6. [Analytics](#analytics)
7. [Data Models](#data-models)
8. [Error Responses](#error-responses)

---

## Search Endpoints

### 1. Full-Text Search

Search across companies, facilities, technologies, and locations.

**Endpoint:** `GET /search`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `fuzzy` | boolean | No | Enable fuzzy matching (default: true) |
| `limit` | integer | No | Max results (default: 50, max: 100) |
| `offset` | integer | No | Pagination offset (default: 0) |

**Example Request:**

```bash
GET /search?q=solid%20state&fuzzy=true&limit=20
```

**Example Response:**

```json
{
  "query": "solid state",
  "totalResults": 5,
  "results": [
    {
      "id": "uuid-here",
      "name": "QuantumScape",
      "description": "Solid-state battery developer with breakthrough lithium-metal technology",
      "capacity": 5,
      "stage": "R&D",
      "technologies": ["Solid-State"],
      "chemistries": ["Lithium-Metal"],
      "facilities": [
        {
          "name": "QuantumScape QS-0",
          "location": "San Jose, California",
          "state": "CA",
          "capacity": 1,
          "status": "Pilot"
        }
      ],
      "relevanceScore": 0.95
    }
  ],
  "executionTime": 45
}
```

---

### 2. Advanced Search with Filters

Combined text search with multiple filters.

**Endpoint:** `POST /search/advanced`

**Request Body:**

```json
{
  "query": "battery",
  "filters": {
    "technologies": ["Li-ion", "Solid-State"],
    "chemistries": ["NMC", "LFP"],
    "states": ["CA", "NV", "TX"],
    "stages": ["Gigafactory", "Commercial"],
    "capacityMin": 10,
    "capacityMax": 200,
    "policies": ["IRA", "DOE Grant"],
    "statuses": ["Operational", "Under Construction"],
    "operator": "AND"
  },
  "sort": {
    "field": "capacity",
    "order": "desc"
  },
  "limit": 50,
  "offset": 0
}
```

**Response:** Same structure as full-text search.

---

## Filter Endpoints

### 3. Get Available Filters

Get all available filter options.

**Endpoint:** `GET /filters/options`

**Example Response:**

```json
{
  "technologies": [
    "Li-ion",
    "LFP",
    "Solid-State",
    "Sodium-ion",
    "4680",
    "2170"
  ],
  "chemistries": [
    "NMC",
    "LFP",
    "NCA",
    "NCMA",
    "Lithium-Metal"
  ],
  "states": [
    "AZ", "CA", "CO", "GA", "IL", "IN", "KS", "KY", "MI", "NC", "NV", "OH", "SC", "TN", "WV"
  ],
  "stages": [
    "R&D",
    "Pilot",
    "Commercial",
    "Gigafactory"
  ],
  "policies": [
    "IRA",
    "DOE Grant",
    "DOE Loans"
  ],
  "statuses": [
    "Planned",
    "Under Construction",
    "Operational",
    "Pilot",
    "Closed"
  ],
  "capacityRange": {
    "min": 0,
    "max": 200
  }
}
```

---

### 4. Filter by Technology

**Endpoint:** `GET /filter/technology`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `technologies` | string[] | Yes | Technology names (comma-separated) |
| `matchAll` | boolean | No | Match all (AND) or any (OR) (default: false) |

**Example Request:**

```bash
GET /filter/technology?technologies=Solid-State,Li-ion&matchAll=false
```

---

### 5. Filter by State/Region

**Endpoint:** `GET /filter/state`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `states` | string[] | Yes | State codes (comma-separated) |

**Example Request:**

```bash
GET /filter/state?states=CA,NV,TX
```

---

### 6. Filter by Capacity Range

**Endpoint:** `GET /filter/capacity`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `min` | number | No | Minimum capacity (GWh) |
| `max` | number | No | Maximum capacity (GWh) |

**Example Request:**

```bash
GET /filter/capacity?min=50&max=150
```

---

## Autocomplete Endpoints

### 7. Autocomplete Suggestions

Get autocomplete suggestions for search input.

**Endpoint:** `GET /autocomplete`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Partial query (min 2 chars) |
| `limit` | integer | No | Max suggestions (default: 10) |

**Example Request:**

```bash
GET /autocomplete?q=quan&limit=5
```

**Example Response:**

```json
{
  "suggestions": [
    {
      "text": "QuantumScape",
      "type": "company",
      "id": "uuid-here"
    },
    {
      "text": "Solid-State",
      "type": "technology"
    },
    {
      "text": "Queen Creek, AZ",
      "type": "location",
      "state": "AZ"
    }
  ]
}
```

---

## Geospatial Endpoints

### 8. Search by Radius

Find facilities within a radius of coordinates.

**Endpoint:** `GET /search/radius`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | Yes | Latitude |
| `lng` | number | Yes | Longitude |
| `radius` | number | No | Radius in miles (default: 100) |

**Example Request:**

```bash
GET /search/radius?lat=39.5378&lng=-119.4374&radius=50
```

**Example Response:**

```json
{
  "center": {
    "lat": 39.5378,
    "lng": -119.4374
  },
  "radius": 50,
  "results": [
    {
      "company": {
        "id": "uuid",
        "name": "Tesla"
      },
      "facility": {
        "id": "uuid",
        "name": "Gigafactory Nevada",
        "location": "Sparks, Nevada",
        "state": "NV",
        "coordinates": {
          "lat": 39.5378,
          "lng": -119.4374
        }
      },
      "distance": 0.5
    }
  ]
}
```

---

### 9. Search by Bounding Box

Find facilities within a geographic bounding box.

**Endpoint:** `GET /search/bbox`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `minLat` | number | Yes | Minimum latitude |
| `minLng` | number | Yes | Minimum longitude |
| `maxLat` | number | Yes | Maximum latitude |
| `maxLng` | number | Yes | Maximum longitude |

---

## Saved Searches

### 10. Get Saved Searches

Get user's saved searches.

**Endpoint:** `GET /searches/saved`

**Authentication:** Required

**Example Response:**

```json
{
  "savedSearches": [
    {
      "id": "uuid",
      "name": "Solid-State Companies in Southeast",
      "query": "solid state",
      "filters": {
        "technologies": ["Solid-State"],
        "states": ["GA", "TN", "NC"]
      },
      "createdAt": "2025-11-08T10:30:00Z",
      "updatedAt": "2025-11-08T10:30:00Z"
    }
  ]
}
```

---

### 11. Create Saved Search

Save a search for later use.

**Endpoint:** `POST /searches/saved`

**Authentication:** Required

**Request Body:**

```json
{
  "name": "Solid-State Companies in Southeast",
  "query": "solid state",
  "filters": {
    "technologies": ["Solid-State"],
    "states": ["GA", "TN", "NC"]
  }
}
```

**Response:**

```json
{
  "id": "uuid",
  "name": "Solid-State Companies in Southeast",
  "createdAt": "2025-11-08T10:30:00Z"
}
```

---

### 12. Delete Saved Search

**Endpoint:** `DELETE /searches/saved/:id`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Saved search deleted"
}
```

---

## Analytics

### 13. Get Recent Searches

Get recent search queries (user-specific if authenticated).

**Endpoint:** `GET /searches/recent`

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | integer | No | Max results (default: 10) |

**Example Response:**

```json
{
  "recentSearches": [
    {
      "query": "solid state",
      "timestamp": "2025-11-09T08:15:00Z"
    },
    {
      "query": "LFP gigafactory",
      "timestamp": "2025-11-09T07:45:00Z"
    }
  ]
}
```

---

### 14. Get Popular Searches

Get most popular search queries across all users.

**Endpoint:** `GET /searches/popular`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | integer | No | Max results (default: 10) |
| `period` | string | No | Time period: 'day', 'week', 'month' (default: 'week') |

**Example Response:**

```json
{
  "popularSearches": [
    {
      "query": "solid state",
      "count": 156,
      "lastSearched": "2025-11-09T08:15:00Z"
    },
    {
      "query": "LFP",
      "count": 142,
      "lastSearched": "2025-11-09T07:30:00Z"
    }
  ]
}
```

---

### 15. Export Results

Export search results to various formats.

**Endpoint:** `POST /search/export`

**Request Body:**

```json
{
  "query": "battery",
  "filters": {},
  "format": "csv"
}
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | Yes | Export format: 'json', 'csv', 'xlsx' |

**Response:** File download

---

## Data Models

### Company Model

```typescript
interface Company {
  id: string;
  name: string;
  slug: string;
  description: string;
  capacity: number;
  stage: 'R&D' | 'Pilot' | 'Commercial' | 'Gigafactory';
  website?: string;
  foundedYear?: number;
  technologies: string[];
  chemistries: string[];
  policies: string[];
  facilities: Facility[];
  createdAt: string;
  updatedAt: string;
}
```

### Facility Model

```typescript
interface Facility {
  id: string;
  companyId: string;
  name: string;
  location: string;
  city: string;
  state: string;
  zipCode?: string;
  capacity: number;
  status: 'Planned' | 'Under Construction' | 'Operational' | 'Pilot' | 'Closed';
  yearEstablished: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  employeesCount?: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid search query",
    "details": {
      "field": "q",
      "constraint": "minLength",
      "value": "a"
    }
  },
  "timestamp": "2025-11-09T10:30:00Z"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `DATABASE_ERROR` | 503 | Database unavailable |

---

## Performance Considerations

1. **Caching:** Search results are cached for 5 minutes
2. **Query Timeout:** Queries timeout after 10 seconds
3. **Max Results:** Maximum 100 results per request
4. **Pagination:** Use `offset` and `limit` for large result sets
5. **Index Usage:** Queries are optimized with PostgreSQL indexes

---

## Rate Limiting

**Limits:**
- **Anonymous:** 100 requests/hour
- **Authenticated:** 1000 requests/hour
- **Premium:** 10,000 requests/hour

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1699545600
```

---

## Webhooks (Optional)

Subscribe to search events:

**Events:**
- `search.executed` - When a search is performed
- `search.saved` - When a search is saved
- `filter.applied` - When filters are applied

**Webhook Payload:**

```json
{
  "event": "search.executed",
  "timestamp": "2025-11-09T10:30:00Z",
  "data": {
    "query": "solid state",
    "resultsCount": 5,
    "executionTime": 45
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { BatteryResearchClient } from '@battery-research/sdk';

const client = new BatteryResearchClient({ apiKey: 'your-api-key' });

// Full-text search
const results = await client.search({
  query: 'solid state',
  fuzzy: true,
  limit: 20
});

// Advanced search with filters
const filtered = await client.searchAdvanced({
  query: 'battery',
  filters: {
    technologies: ['Solid-State'],
    states: ['CA', 'NV'],
    capacityMin: 10
  }
});

// Geospatial search
const nearby = await client.searchByRadius({
  lat: 39.5378,
  lng: -119.4374,
  radius: 50
});

// Autocomplete
const suggestions = await client.autocomplete('quan');
```

### Python

```python
from battery_research import BatteryResearchClient

client = BatteryResearchClient(api_key='your-api-key')

# Full-text search
results = client.search(query='solid state', fuzzy=True, limit=20)

# Advanced search with filters
filtered = client.search_advanced(
    query='battery',
    filters={
        'technologies': ['Solid-State'],
        'states': ['CA', 'NV'],
        'capacity_min': 10
    }
)

# Geospatial search
nearby = client.search_by_radius(lat=39.5378, lng=-119.4374, radius=50)
```

---

## Support

For API support, contact: api-support@batteryresearch.com

API Documentation Version: 1.0.0
Last Updated: 2025-11-09
