# Quick Start Guide - US Battery Industry Intelligence Platform Backend

Get the backend API running in under 5 minutes.

## Prerequisites

- Docker & Docker Compose installed
- Git

## Step 1: Navigate to Backend

```bash
cd /home/user/battery-research/backend
```

## Step 2: Create Environment File

```bash
cp .env.example .env
```

**Optional**: Edit `.env` to add your API keys:
```bash
# For RAG/Chatbot functionality (optional for basic API testing)
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
```

## Step 3: Start Services with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL with pgvector extension (port 5432)
- FastAPI backend (port 8000)

Wait ~10 seconds for services to be healthy.

## Step 4: Initialize Database

```bash
docker-compose exec backend python scripts/init_db.py
```

Expected output:
```
Initializing database...
Enabling pgvector extension...
Creating tables...
Database initialization complete!

Created tables:
  - companies
  - facilities
  - technologies
  - forecasts
  - policies
  - sources
  - citations
  - document_chunks
  - conversations
  - messages
  ...
```

## Step 5: Load Sample Data

```bash
docker-compose exec backend python scripts/load_data.py
```

This imports data from `visualization-data.json`:
- 10 companies (Tesla, SK Battery America, etc.)
- 15 facilities (one per state)
- 4 technologies (LFP, NMC, Solid-State, Other)
- 50+ forecasts (cost curve + capacity growth)

Expected output:
```
Loading companies...
Loaded 10 companies

Loading facilities...
Loaded 15 facilities

Loading technologies...
Loaded 4 technologies

Loading forecasts...
Loaded 50+ forecasts

Data loading complete!
```

## Step 6: Test the API

### Method 1: Open Swagger UI

Open your browser:
```
http://localhost:8000/docs
```

Try the interactive API documentation!

### Method 2: Use cURL

```bash
# Health check
curl http://localhost:8000/health

# List all companies
curl http://localhost:8000/api/v1/companies

# Get company statistics
curl http://localhost:8000/api/v1/companies/stats/overview

# List facilities in Nevada
curl "http://localhost:8000/api/v1/facilities/state/NV"

# Get state-level facility statistics
curl http://localhost:8000/api/v1/facilities/stats/by-state
```

### Method 3: Use Python

```python
import requests

# Get all companies
response = requests.get("http://localhost:8000/api/v1/companies")
companies = response.json()
print(f"Found {companies['count']} companies")

# Get facilities in Tennessee
response = requests.get("http://localhost:8000/api/v1/facilities/state/TN")
facilities = response.json()
print(f"Tennessee has {facilities['count']} facilities")
print(f"Total capacity: {facilities['total_capacity_gwh']} GWh")
```

## Success!

You now have:
- ✅ PostgreSQL database with pgvector
- ✅ 15 tables with relationships
- ✅ Sample data loaded
- ✅ FastAPI backend running
- ✅ 20+ API endpoints available

## Next Steps

### Explore the API

Visit **Swagger UI**: http://localhost:8000/docs

Try these endpoints:
- `/api/v1/companies` - List all companies
- `/api/v1/facilities` - List all facilities
- `/api/v1/technologies` - List battery technologies
- `/api/v1/forecasts` - Industry projections
- `/api/v1/companies/search/by-name?name=Tesla` - Search companies

### Load More Data

Extend `scripts/load_data.py` to import:
- Markdown reports as document chunks
- Generate embeddings for RAG
- Import comprehensive company data

### Develop Locally

```bash
# Install dependencies locally (optional)
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run without Docker
uvicorn app.main:app --reload
```

### View Database

Start pgAdmin (database management UI):

```bash
docker-compose --profile tools up -d pgadmin
```

Visit: http://localhost:5050
- Email: admin@battery.com
- Password: admin

Add server:
- Host: postgres
- Port: 5432
- Database: battery_intelligence
- Username: battery_user
- Password: battery_pass

### Check Logs

```bash
# View backend logs
docker-compose logs -f backend

# View database logs
docker-compose logs -f postgres
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Troubleshooting

### Port Already in Use

If port 8000 or 5432 is already in use:

Edit `docker-compose.yml`:
```yaml
services:
  backend:
    ports:
      - "8001:8000"  # Change 8000 to 8001
  postgres:
    ports:
      - "5433:5432"  # Change 5432 to 5433
```

### Database Connection Error

```bash
# Check if postgres is healthy
docker-compose ps

# Restart services
docker-compose restart
```

### Permission Denied

```bash
# On Linux, may need to change ownership
sudo chown -R $USER:$USER /home/user/battery-research/backend
```

## API Examples

### Get Companies with High Capacity

```bash
curl "http://localhost:8000/api/v1/companies?min_capacity=100"
```

### Get Publicly Traded Companies

```bash
curl "http://localhost:8000/api/v1/companies?is_publicly_traded=true"
```

### Get Facilities by Status

```bash
curl "http://localhost:8000/api/v1/facilities?status=operational"
```

### Search Companies by Name

```bash
curl "http://localhost:8000/api/v1/companies/search/by-name?name=Panasonic"
```

### Get Forecasts for Specific Year

```bash
curl "http://localhost:8000/api/v1/forecasts?forecast_year=2030"
```

## Documentation

- **README**: [backend/README.md](README.md)
- **API Documentation**: [backend/API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Deliverables**: [backend/AGENT_P01_DELIVERABLES.md](AGENT_P01_DELIVERABLES.md)
- **OpenAPI Spec**: http://localhost:8000/openapi.json
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Support

For issues or questions, refer to the comprehensive documentation in README.md.

---

**Ready to build!** The backend is now operational and ready for frontend development, data pipeline integration, and RAG chatbot implementation.
