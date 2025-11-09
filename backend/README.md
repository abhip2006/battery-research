# Battery Intelligence Platform API

## Overview

Production-ready REST API for the US Battery Industry Intelligence Platform, providing comprehensive access to battery manufacturer data, facility information, market forecasts, technology trends, and policy analysis. Features a RAG-powered chatbot for natural language queries.

## Features

- **🏢 Company Data**: Comprehensive battery manufacturer profiles and metrics
- **🏭 Facility Database**: Geospatial manufacturing facility data
- **📈 Market Forecasts**: Capacity projections and cost curve analysis
- **🔬 Technology Analytics**: Innovation trends and energy density evolution
- **🔗 Supply Chain**: Critical materials and risk assessment
- **🏛️ Policy Analysis**: Government incentives and impact metrics
- **💬 RAG Chatbot**: Natural language query interface with source attribution
- **🔐 Authentication**: API key-based access control with tiered rate limiting
- **📊 Pagination**: Efficient data retrieval for large datasets
- **🗺️ Geospatial**: Nearby facility searches and bounding box queries

## Architecture

```
backend/
├── app/
│   ├── api/                    # API route definitions
│   │   ├── routes.py          # Main route aggregator
│   │   ├── companies.py       # Company endpoints
│   │   ├── facilities.py      # Facility endpoints
│   │   └── chat.py            # Chatbot endpoints
│   ├── core/                  # Core functionality
│   │   ├── auth.py            # API key authentication
│   │   └── rate_limit.py      # Rate limiting logic
│   ├── models/                # Data models
│   │   └── schemas.py         # Pydantic schemas
│   ├── services/              # Business logic
│   │   ├── data_service.py    # Data access layer
│   │   ├── rag_service.py     # RAG implementation
│   │   └── embedding_service.py
│   ├── database.py            # Database connection
│   ├── config.py              # Configuration
│   └── main.py                # FastAPI application
├── alembic/                   # Database migrations
├── tests/                     # Test suite
├── scripts/                   # Utility scripts
├── openapi.yaml              # OpenAPI 3.0 specification
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## Technology Stack

- **Framework**: FastAPI 0.109.2
- **Database**: PostgreSQL with pgvector
- **ORM**: SQLAlchemy 2.0 (async)
- **Authentication**: API key with JWT
- **Rate Limiting**: Token bucket algorithm
- **RAG**: LangChain + OpenAI/Anthropic
- **Embeddings**: sentence-transformers
- **Validation**: Pydantic 2.6
- **Testing**: pytest + pytest-asyncio

## Quick Start

### Prerequisites

- Python 3.10+
- PostgreSQL 14+ with pgvector extension
- OpenAI/Anthropic API key (for RAG)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/battery-research.git
cd battery-research/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/battery_db

# API Keys
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Application
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]

# Rate Limiting
REDIS_URL=redis://localhost:6379/0
```

### Database Setup

```bash
# Create database
createdb battery_db

# Enable pgvector extension
psql battery_db -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run migrations
alembic upgrade head

# Seed data (optional)
python scripts/seed_data.py
```

### Running the Server

```bash
# Development server with hot reload
uvicorn app.main:app --reload --port 8000

# Production server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## API Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for comprehensive API documentation including:
- Authentication guide
- All endpoint specifications
- Request/response examples
- Error handling
- Rate limiting details
- Code examples in Python, JavaScript, and cURL

## Authentication

All endpoints (except `/health`) require API key authentication:

```bash
curl -H "X-API-Key: your_api_key_here" \
     http://localhost:8000/api/v1/companies
```

### API Tiers

| Tier | Rate Limit | Cost |
|------|-----------|------|
| Free | 100 req/hour | Free |
| Standard | 1,000 req/hour | $49/month |
| Enterprise | 10,000 req/hour | Custom |

## Key Endpoints

### Companies
```bash
# List companies
GET /api/v1/companies?technology=LFP&min_capacity=50

# Get company details
GET /api/v1/companies/tesla

# Search companies
GET /api/v1/companies/search?q=solid+state+battery
```

### Facilities
```bash
# List facilities
GET /api/v1/facilities?state=TN&status=operational

# Find nearby facilities
GET /api/v1/facilities/nearby?lat=36.16&lng=-86.78&radius=100
```

### Forecasts
```bash
# Capacity forecast
GET /api/v1/forecast/capacity?start_year=2020&end_year=2030

# Cost projections
GET /api/v1/forecast/cost?include_breakdown=true
```

### Analytics
```bash
# Market share
GET /api/v1/analytics/market-share

# Regional clusters
GET /api/v1/analytics/regional-clusters

# Technology trends
GET /api/v1/analytics/technology-trends?metric=energy_density

# Supply chain
GET /api/v1/analytics/supply-chain?material=lithium
```

### Chatbot (RAG)
```bash
# Natural language query
POST /api/v1/chat/query
{
  "query": "What are the top battery companies in Tennessee?",
  "include_sources": true
}
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_companies.py

# Run with verbose output
pytest -v
```

## Development

### Code Formatting

```bash
# Format code with black
black app/ tests/

# Lint with flake8
flake8 app/ tests/

# Type checking with mypy
mypy app/
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```

### Adding New Endpoints

1. Define Pydantic schemas in `app/models/schemas.py`
2. Create route in `app/api/` directory
3. Implement business logic in `app/services/`
4. Add tests in `tests/`
5. Update OpenAPI documentation

Example:

```python
# app/api/new_endpoint.py
from fastapi import APIRouter, Depends
from ..core.auth import get_api_key
from ..models.schemas import MyResponse

router = APIRouter()

@router.get("/my-endpoint", response_model=MyResponse)
async def my_endpoint(api_key: str = Depends(get_api_key)):
    return {"data": "..."}
```

## Deployment

### Docker

```bash
# Build image
docker build -t battery-api .

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL="..." \
  -e OPENAI_API_KEY="..." \
  battery-api
```

### Docker Compose

```bash
docker-compose up -d
```

### Production Considerations

- Use environment variables for secrets (never commit .env)
- Enable HTTPS/TLS
- Set up database connection pooling
- Configure logging and monitoring
- Implement health checks
- Use a reverse proxy (nginx)
- Set up database backups
- Configure CORS appropriately
- Use rate limiting per user/IP
- Implement request timeout

## Performance Optimization

### Caching

```python
from functools import lru_cache

@lru_cache(maxsize=128)
async def get_company_data(company_id: str):
    # Expensive database query
    return await db.query(...)
```

### Database Indexing

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_companies_capacity ON companies(capacity DESC);
CREATE INDEX idx_facilities_state ON facilities(state);
CREATE INDEX idx_facilities_coords ON facilities USING GIST(coordinates);
```

### Connection Pooling

Configure in `database.py`:

```python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True
)
```

## Monitoring

### Health Checks

```bash
# API health
curl http://localhost:8000/health

# Database health
curl http://localhost:8000/health/db
```

### Logging

Logs are structured and include:
- Request ID
- User ID (from API key)
- Endpoint
- Response time
- Error details

### Metrics

Track:
- Requests per second
- Response times (p50, p95, p99)
- Error rates by endpoint
- Rate limit violations
- Database query times

## Security

- ✅ API key authentication
- ✅ Rate limiting by tier
- ✅ Input validation with Pydantic
- ✅ SQL injection protection (SQLAlchemy)
- ✅ CORS configuration
- ✅ Secrets in environment variables
- ✅ HTTPS/TLS in production
- ✅ Request size limits
- ✅ Query complexity limits

## Troubleshooting

### Common Issues

**Database connection errors:**
```bash
# Check PostgreSQL is running
pg_isready

# Verify credentials
psql $DATABASE_URL
```

**Rate limit errors:**
```bash
# Clear rate limit cache (Redis)
redis-cli FLUSHDB
```

**Import errors:**
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

- **Documentation**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Issues**: GitHub Issues
- **Email**: api-support@batteryintel.com

## Roadmap

- [ ] GraphQL API
- [ ] WebSocket support for real-time updates
- [ ] Enhanced RAG with multi-modal support
- [ ] Export to CSV/Excel/PDF
- [ ] Webhook notifications
- [ ] Advanced analytics dashboard
- [ ] Machine learning predictions
- [ ] Multi-language support

## Authors

- **API Design**: AGENT-P02
- **Backend Implementation**: AGENT-P01

## Acknowledgments

- Data sources: DOE, SEC filings, company press releases
- Built with FastAPI, PostgreSQL, and LangChain
- Powered by OpenAI and Anthropic LLMs
