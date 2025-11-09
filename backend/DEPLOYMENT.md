# Battery Intelligence Platform API - Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Health Checks](#health-checks)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Python**: 3.10 or higher
- **PostgreSQL**: 14 or higher with pgvector extension
- **Redis**: 6.0+ (optional, for distributed rate limiting)
- **Docker**: 20.10+ (optional, for containerized deployment)
- **Git**: For version control

### API Keys

You'll need API keys for:
- **OpenAI**: For embeddings and chat (optional but recommended)
- **Anthropic**: For Claude-powered chat (alternative to OpenAI)
- **Cohere**: For embeddings/reranking (optional)

---

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/battery-research.git
cd battery-research/backend
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or vim, code, etc.
```

**Minimum required variables:**
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/battery_db
SECRET_KEY=your-secret-key-here-change-me
OPENAI_API_KEY=sk-your-openai-key  # Optional
```

### 5. Set Up Database

```bash
# Create database
createdb battery_db

# Enable pgvector extension
psql battery_db -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run migrations
alembic upgrade head

# Seed initial data (optional)
python scripts/seed_data.py
```

### 6. Run Development Server

```bash
# Start server with auto-reload
uvicorn app.main:app --reload --port 8000

# Or use the run script
python -m app.main
```

**Access the API:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

---

## Docker Deployment

### Using Docker Compose (Recommended)

#### 1. Create docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: battery_user
      POSTGRES_PASSWORD: secure_password_here
      POSTGRES_DB: battery_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U battery_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis (optional, for rate limiting)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # FastAPI Application
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://battery_user:secure_password_here@postgres:5432/battery_db
      REDIS_URL: redis://redis:6379/0
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      SECRET_KEY: ${SECRET_KEY}
      ENVIRONMENT: production
      DEBUG: false
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### 2. Create Dockerfile

```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directories
RUN mkdir -p uploads logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 3. Deploy

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f api

# Run migrations
docker-compose exec api alembic upgrade head

# Stop services
docker-compose down
```

### Using Docker (without Compose)

```bash
# Build image
docker build -t battery-api:latest .

# Run container
docker run -d \
  --name battery-api \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql+asyncpg://..." \
  -e OPENAI_API_KEY="sk-..." \
  -e SECRET_KEY="your-secret-key" \
  battery-api:latest

# View logs
docker logs -f battery-api

# Stop container
docker stop battery-api
```

---

## Production Deployment

### AWS Deployment

#### Option 1: ECS (Elastic Container Service)

```bash
# 1. Build and push Docker image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL
docker build -t battery-api .
docker tag battery-api:latest YOUR_ECR_URL/battery-api:latest
docker push YOUR_ECR_URL/battery-api:latest

# 2. Create ECS task definition (JSON)
# See: aws/ecs-task-definition.json

# 3. Deploy to ECS
aws ecs update-service --cluster battery-cluster --service battery-api --force-new-deployment
```

**RDS PostgreSQL Setup:**
```bash
# Create RDS instance with pgvector
aws rds create-db-instance \
  --db-instance-identifier battery-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.3 \
  --master-username admin \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 50

# Enable pgvector extension
psql -h battery-db.xxxxx.us-east-1.rds.amazonaws.com -U admin -d postgres
CREATE EXTENSION vector;
```

#### Option 2: EC2 Instance

```bash
# 1. Launch EC2 instance (Ubuntu 22.04)

# 2. SSH into instance
ssh -i key.pem ubuntu@ec2-instance-ip

# 3. Install dependencies
sudo apt update
sudo apt install -y python3.10 python3-pip postgresql-client git

# 4. Clone and setup
git clone https://github.com/yourusername/battery-research.git
cd battery-research/backend
pip install -r requirements.txt

# 5. Configure environment
nano .env

# 6. Setup systemd service
sudo nano /etc/systemd/system/battery-api.service
```

**systemd service file:**
```ini
[Unit]
Description=Battery Intelligence Platform API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/battery-research/backend
Environment="PATH=/home/ubuntu/battery-research/backend/venv/bin"
EnvironmentFile=/home/ubuntu/battery-research/backend/.env
ExecStart=/home/ubuntu/battery-research/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable battery-api
sudo systemctl start battery-api
sudo systemctl status battery-api
```

### Azure Deployment

#### App Service

```bash
# 1. Create resource group
az group create --name battery-api-rg --location eastus

# 2. Create App Service plan
az appservice plan create \
  --name battery-api-plan \
  --resource-group battery-api-rg \
  --sku B1 \
  --is-linux

# 3. Create web app
az webapp create \
  --resource-group battery-api-rg \
  --plan battery-api-plan \
  --name battery-intelligence-api \
  --runtime "PYTHON:3.11"

# 4. Configure deployment
az webapp deployment source config \
  --name battery-intelligence-api \
  --resource-group battery-api-rg \
  --repo-url https://github.com/yourusername/battery-research \
  --branch main \
  --manual-integration

# 5. Set environment variables
az webapp config appsettings set \
  --resource-group battery-api-rg \
  --name battery-intelligence-api \
  --settings \
    DATABASE_URL="postgresql://..." \
    OPENAI_API_KEY="sk-..."
```

### Google Cloud Platform

#### Cloud Run

```bash
# 1. Build and push image
gcloud builds submit --tag gcr.io/PROJECT_ID/battery-api

# 2. Deploy to Cloud Run
gcloud run deploy battery-api \
  --image gcr.io/PROJECT_ID/battery-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="postgresql://...",OPENAI_API_KEY="sk-..."
```

### Heroku Deployment

```bash
# 1. Create Heroku app
heroku create battery-intelligence-api

# 2. Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# 3. Set environment variables
heroku config:set OPENAI_API_KEY="sk-..."
heroku config:set SECRET_KEY="your-secret-key"

# 4. Deploy
git push heroku main

# 5. Run migrations
heroku run alembic upgrade head
```

---

## Database Setup

### PostgreSQL with pgvector

#### Installation

**Ubuntu/Debian:**
```bash
sudo apt install postgresql-15 postgresql-15-pgvector
```

**macOS:**
```bash
brew install postgresql@15 pgvector
```

**From source:**
```bash
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

#### Configuration

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create indexes
CREATE INDEX ON companies USING GIN (to_tsvector('english', name || ' ' || description));
CREATE INDEX ON facilities USING GIST (coordinates);

-- Vector index for embeddings
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Add new table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1

# View history
alembic history
```

---

## Environment Configuration

### Production Settings

```env
# Application
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING

# Security
SECRET_KEY=<generate-with-openssl-rand-hex-32>
BACKEND_CORS_ORIGINS=https://yourdomain.com

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@prod-db:5432/battery_db
DB_POOL_SIZE=50
DB_MAX_OVERFLOW=100

# Rate Limiting
REDIS_URL=redis://prod-redis:6379/0

# Performance
WORKERS=4
TIMEOUT=60
KEEPALIVE=5
```

### Secrets Management

**AWS Secrets Manager:**
```python
import boto3
import json

def get_secret(secret_name):
    client = boto3.client('secretsmanager', region_name='us-east-1')
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])

secrets = get_secret('battery-api-secrets')
DATABASE_URL = secrets['database_url']
```

**Azure Key Vault:**
```python
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

credential = DefaultAzureCredential()
client = SecretClient(vault_url="https://your-vault.vault.azure.net", credential=credential)
DATABASE_URL = client.get_secret("database-url").value
```

---

## Health Checks

### Endpoint

```bash
curl http://localhost:8000/health
```

### Kubernetes Liveness Probe

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10
```

### Docker Healthcheck

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1
```

---

## Monitoring

### Application Performance

**New Relic:**
```bash
pip install newrelic
newrelic-admin generate-config LICENSE_KEY newrelic.ini
newrelic-admin run-program uvicorn app.main:app
```

**DataDog:**
```bash
pip install ddtrace
ddtrace-run uvicorn app.main:app
```

### Logging

**Structured logging with Loguru:**
```python
from loguru import logger

logger.add("logs/app.log", rotation="500 MB", retention="10 days")
logger.info("API started", environment=os.getenv("ENVIRONMENT"))
```

### Metrics

Track key metrics:
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Database query time
- Cache hit rate
- Rate limit violations

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Verify pgvector extension
psql -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

### Performance Issues

```bash
# Check database indexes
psql -c "SELECT schemaname, tablename, indexname FROM pg_indexes WHERE schemaname = 'public';"

# Analyze slow queries
psql -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Monitor connections
psql -c "SELECT count(*) FROM pg_stat_activity;"
```

### Memory Issues

```bash
# Monitor memory usage
docker stats battery-api

# Adjust worker processes
uvicorn app.main:app --workers 2  # Reduce workers

# Configure pool size
export DB_POOL_SIZE=10
```

---

## Security Checklist

- [ ] Use HTTPS/TLS in production
- [ ] Store secrets in environment variables or secrets manager
- [ ] Enable CORS only for trusted origins
- [ ] Use strong SECRET_KEY (min 32 characters)
- [ ] Set DEBUG=false in production
- [ ] Implement rate limiting
- [ ] Keep dependencies updated
- [ ] Use prepared statements (SQLAlchemy does this)
- [ ] Validate all user inputs
- [ ] Enable database connection encryption
- [ ] Use firewall to restrict database access
- [ ] Implement API versioning
- [ ] Log security events
- [ ] Regular security audits

---

## Maintenance

### Backup Database

```bash
# Full backup
pg_dump -h localhost -U battery_user battery_db > backup.sql

# Restore
psql -h localhost -U battery_user battery_db < backup.sql

# Automated backups (cron)
0 2 * * * pg_dump -h localhost -U battery_user battery_db | gzip > /backups/battery_db_$(date +\%Y\%m\%d).sql.gz
```

### Update Dependencies

```bash
# Check for updates
pip list --outdated

# Update specific package
pip install --upgrade fastapi

# Update all
pip install --upgrade -r requirements.txt

# Freeze updated versions
pip freeze > requirements.txt
```

### Rotate API Keys

```python
# Generate new API key
from app.core.auth import APIKeyManager

manager = APIKeyManager()
new_key = manager.create_key(user_id="user123", tier="standard", name="Production Key")
print(f"New API key: {new_key}")

# Revoke old key
manager.revoke_key(old_key)
```

---

## Support

For deployment issues:
- Check logs: `docker-compose logs -f api`
- Review [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Open GitHub issue
- Email: devops@batteryintel.com
