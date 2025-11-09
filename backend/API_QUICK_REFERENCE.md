# Battery Intelligence Platform API - Quick Reference

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
```bash
X-API-Key: demo_free_tier_key_12345
```

## Quick Test Commands

### Health Check (No Auth)
```bash
curl http://localhost:8000/health
```

### List Companies
```bash
curl -H "X-API-Key: demo_free_tier_key_12345" \
     http://localhost:8000/api/v1/companies
```

### Search Companies
```bash
curl -H "X-API-Key: demo_free_tier_key_12345" \
     "http://localhost:8000/api/v1/companies/search?q=tesla&limit=5"
```

### Get Company Details
```bash
curl -H "X-API-Key: demo_free_tier_key_12345" \
     http://localhost:8000/api/v1/companies/tesla
```

### Capacity Forecast
```bash
curl -H "X-API-Key: demo_free_tier_key_12345" \
     "http://localhost:8000/api/v1/forecast/capacity?start_year=2020&end_year=2030"
```

### Cost Forecast
```bash
curl -H "X-API-Key: demo_free_tier_key_12345" \
     "http://localhost:8000/api/v1/forecast/cost?start_year=2015&end_year=2030"
```

### Market Share
```bash
curl -H "X-API-Key: demo_free_tier_key_12345" \
     http://localhost:8000/api/v1/analytics/market-share
```

### Regional Clusters
```bash
curl -H "X-API-Key: demo_free_tier_key_12345" \
     http://localhost:8000/api/v1/analytics/regional-clusters
```

### Supply Chain
```bash
curl -H "X-API-Key: demo_free_tier_key_12345" \
     "http://localhost:8000/api/v1/analytics/supply-chain?material=lithium"
```

### Chatbot Query
```bash
curl -X POST \
     -H "X-API-Key: demo_free_tier_key_12345" \
     -H "Content-Type: application/json" \
     -d '{"query": "What are the top battery companies in Tennessee?", "include_sources": true}' \
     http://localhost:8000/api/v1/chat/query
```

## Demo API Keys

| Tier | Key | Rate Limit |
|------|-----|------------|
| Free | demo_free_tier_key_12345 | 100 req/hour |
| Standard | standard_tier_key_67890 | 1,000 req/hour |
| Enterprise | enterprise_tier_key_abcde | 10,000 req/hour |

## All Endpoints

### Companies
- `GET /api/v1/companies` - List companies
- `GET /api/v1/companies/{id}` - Get company details
- `GET /api/v1/companies/search` - Search companies

### Facilities
- `GET /api/v1/facilities` - List facilities
- `GET /api/v1/facilities/{id}` - Get facility details
- `GET /api/v1/facilities/nearby` - Find nearby facilities

### Forecast
- `GET /api/v1/forecast/capacity` - Capacity forecast
- `GET /api/v1/forecast/cost` - Cost projections

### Analytics
- `GET /api/v1/analytics/market-share` - Market share data
- `GET /api/v1/analytics/regional-clusters` - Regional clusters
- `GET /api/v1/analytics/technology-trends` - Technology trends
- `GET /api/v1/analytics/supply-chain` - Supply chain analysis

### Policies
- `GET /api/v1/policies` - List policies
- `GET /api/v1/policies/{id}` - Policy details
- `GET /api/v1/policies/{id}/impact` - Policy impact

### Chatbot
- `POST /api/v1/chat/query` - Submit query
- `GET /api/v1/chat/history` - Get history

## Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Full Docs: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Deployment: [DEPLOYMENT.md](DEPLOYMENT.md)
- Summary: [AGENT-P02-API-DESIGN-SUMMARY.md](AGENT-P02-API-DESIGN-SUMMARY.md)
