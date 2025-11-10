# Deploy Backend API to Railway

This guide will help you deploy the Battery Intelligence Platform API to Railway.app with a custom domain `api.battery-research.net`.

## Prerequisites

1. [Railway account](https://railway.app/) (sign up with GitHub)
2. Anthropic API key or OpenAI API key or Gemini API key
3. Access to battery-research.net DNS settings

## Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose `abhip2006/battery-research` repository
5. Railway will detect the repository

## Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database" → "PostgreSQL"**
3. Railway will provision a PostgreSQL instance
4. Click on the PostgreSQL service
5. Go to **"Variables"** tab
6. Copy the `DATABASE_URL` value (starts with `postgresql://`)

## Step 3: Configure Backend Service

1. Click **"+ New" → "GitHub Repo"**
2. Select `abhip2006/battery-research`
3. Set **"Root Directory"** to `backend`
4. Railway will auto-detect the Dockerfile

## Step 4: Add Environment Variables

Click on the backend service, go to **"Variables"** tab, and add:

### Required Variables:
```
DATABASE_URL=${database.DATABASE_URL}
APP_NAME=US Battery Industry Intelligence Platform
APP_VERSION=0.1.0
ENVIRONMENT=production
DEBUG=False
API_V1_PREFIX=/api/v1
SECRET_KEY=<generate-random-32-char-string>
```

### CORS Configuration:
```
BACKEND_CORS_ORIGINS=["https://battery-research.net","https://www.battery-research.net"]
```

### LLM Provider (Choose ONE):

**Option A: Anthropic Claude (Recommended)**
```
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=<your-anthropic-api-key>
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
MAX_TOKENS=4096
```

**Option B: OpenAI**
```
LLM_PROVIDER=openai
OPENAI_API_KEY=<your-openai-api-key>
```

**Option C: Google Gemini**
```
LLM_PROVIDER=gemini
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_LLM_MODEL=gemini-1.5-pro
```

### Embedding Provider (Choose ONE):

**Option A: OpenAI (Recommended)**
```
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=<your-openai-api-key>
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
```

**Option B: Google Gemini**
```
EMBEDDING_PROVIDER=gemini
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_EMBEDDING_MODEL=text-embedding-004
```

### RAG Configuration:
```
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K_RESULTS=5
VECTOR_SIMILARITY_THRESHOLD=0.7
ENABLE_CITATIONS=True
MIN_CITATION_CONFIDENCE=0.7
CONVERSATION_MEMORY_LIMIT=10
```

### Logging:
```
LOG_LEVEL=INFO
```

## Step 5: Enable pgvector Extension

1. Click on the PostgreSQL service
2. Go to **"Data"** tab
3. Click **"Query"**
4. Run this SQL command:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
5. Click **"Execute"**

## Step 6: Initialize Database

Railway will automatically run migrations on deployment. The backend uses Alembic for database migrations.

If you need to manually run migrations:
1. Go to backend service
2. Click **"Deploy"** tab
3. Click **"..." → "Run Command"**
4. Enter: `alembic upgrade head`

## Step 7: Deploy

1. Railway will automatically deploy when you push to GitHub
2. Wait for deployment to complete (check **"Deployments"** tab)
3. Once deployed, you'll see a URL like: `backend-production-xxxx.up.railway.app`

## Step 8: Test Deployment

Test the health endpoint:
```bash
curl https://backend-production-xxxx.up.railway.app/health
```

Should return:
```json
{
  "status": "healthy",
  "app": "US Battery Industry Intelligence Platform",
  "version": "0.1.0",
  "environment": "production"
}
```

Test the chat health endpoint:
```bash
curl https://backend-production-xxxx.up.railway.app/api/v1/chat/health
```

## Step 9: Configure Custom Domain

### In Railway:
1. Click on backend service
2. Go to **"Settings"** tab
3. Scroll to **"Domains"**
4. Click **"+ Custom Domain"**
5. Enter: `api.battery-research.net`
6. Railway will show you DNS records to add

### In Your DNS Provider (where battery-research.net is hosted):
1. Add a **CNAME record**:
   - **Name/Host**: `api`
   - **Value/Target**: The value Railway provides (e.g., `backend-production-xxxx.up.railway.app`)
   - **TTL**: 3600 (or default)

2. Wait for DNS propagation (1-15 minutes)

3. Railway will automatically provision SSL certificate

## Step 10: Update Frontend

Update the frontend environment variable in GitHub Actions workflow:

`.github/workflows/deploy-vite.yml`:
```yaml
env:
  VITE_API_BASE_URL: https://api.battery-research.net
  VITE_DATA_SOURCE: api  # Change from 'local' to 'api'
  VITE_ENABLE_RAG_CHATBOT: true
```

Commit and push this change to trigger redeployment.

## Step 11: Seed Data (Optional)

To populate the database with battery industry data:

1. Go to backend service in Railway
2. Click **"Deploy"** → **"Run Command"**
3. Enter: `python scripts/seed_data.py`
4. Wait for completion

Or upload data via the API endpoints using the scripts in `backend/scripts/`.

## Verification Checklist

- [ ] PostgreSQL service running with pgvector enabled
- [ ] Backend service deployed successfully
- [ ] Health endpoint returns 200 OK
- [ ] Chat health endpoint shows all services healthy
- [ ] Custom domain `api.battery-research.net` resolves
- [ ] HTTPS certificate issued (automatic)
- [ ] CORS allows battery-research.net origin
- [ ] Frontend can connect to API

## Monitoring

Railway provides:
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Alerts**: Configure in Settings

Access logs:
1. Click on backend service
2. Go to **"Logs"** tab
3. View real-time logs

## Cost Estimate

**Railway Pricing:**
- Free tier: $5/month credit (should cover small usage)
- PostgreSQL: ~$5-10/month for basic usage
- Backend API: ~$5/month for light traffic
- Total: ~$10-15/month for production use

**Alternative Free Tiers:**
- Render.com: Free PostgreSQL + Web Service (slower cold starts)
- Fly.io: Free allowances (more complex setup)

## Troubleshooting

### Database Connection Errors
- Verify `DATABASE_URL` environment variable is set
- Check PostgreSQL service is running
- Ensure pgvector extension is installed

### API Key Errors
- Verify API keys are correct
- Check API key has proper permissions
- Ensure LLM_PROVIDER and EMBEDDING_PROVIDER match your keys

### CORS Errors
- Add frontend URL to `BACKEND_CORS_ORIGINS`
- Ensure URLs match exactly (https vs http)
- Check for trailing slashes

### Deployment Failures
- Check build logs in Railway
- Verify Dockerfile builds locally: `docker build -t test .`
- Ensure all dependencies in requirements.txt

## Support

- Railway Docs: https://docs.railway.app/
- Backend Issues: https://github.com/abhip2006/battery-research/issues
- FastAPI Docs: https://fastapi.tiangolo.com/

---

**Next Steps After Deployment:**
1. Test RAG chatbot on battery-research.net
2. Monitor performance and logs
3. Set up database backups in Railway
4. Configure environment-specific settings
5. Add monitoring/alerting
