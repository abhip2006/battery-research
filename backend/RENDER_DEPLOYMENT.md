# Deploy Backend API to Render.com (FREE)

This guide will help you deploy the Battery Intelligence Platform API to Render.com with a custom domain `api.battery-research.net` using the **FREE tier**.

## Why Render.com?

✅ **Free PostgreSQL** with pgvector support
✅ **Free web service** (with cold starts after 15 min inactivity)
✅ **Automatic HTTPS** and SSL certificates
✅ **GitHub integration** for auto-deploy
✅ **Custom domains** supported on free tier
✅ **No credit card required** to start

## Prerequisites

1. [Render account](https://render.com/) (sign up with GitHub - **FREE**)
2. **ONE** API key from:
   - **Anthropic Claude** (recommended): https://console.anthropic.com/
   - **OpenAI**: https://platform.openai.com/
   - **Google Gemini**: https://makersuite.google.com/

## Step-by-Step Deployment

### Step 1: Fork or Access Repository

Make sure you have access to `abhip2006/battery-research` on GitHub.

### Step 2: Sign Up for Render

1. Go to [Render.com](https://render.com/)
2. Click **"Get Started"**
3. Sign up with **GitHub** (easiest)
4. Authorize Render to access your repositories

### Step 3: Create PostgreSQL Database

1. From Render Dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Configure:
   - **Name**: `battery-intelligence-db`
   - **Database**: `battery_intelligence`
   - **User**: `battery_user`
   - **Region**: Oregon (US West) or closest to you
   - **Plan**: **Free** (no credit card required)
4. Click **"Create Database"**
5. Wait 2-3 minutes for provisioning

### Step 4: Enable pgvector Extension

1. Once database is created, click on it
2. Go to **"Console"** tab (or click "Access Database")
3. This opens a psql terminal
4. Run this command:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
5. Press Enter
6. You should see: `CREATE EXTENSION`
7. Verify with:
   ```sql
   \dx
   ```
8. You should see `vector` in the list

### Step 5: Create Web Service for Backend

1. From Render Dashboard, click **"New +"**
2. Select **"Web Service"**
3. Click **"Build and deploy from a Git repository"**
4. Click **"Connect" next to your repository** (`battery-research`)
   - If not listed, click "Configure account" to grant access
5. Configure the service:
   - **Name**: `battery-api` (or `battery-intelligence-api`)
   - **Region**: Same as your database (Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend` ⚠️ **IMPORTANT**
   - **Runtime**: **Docker**
   - **Plan**: **Free** ⚠️ **Select Free tier**

### Step 6: Add Environment Variables

Scroll down to **"Environment Variables"** section. Add these variables:

#### Database Connection:
Click **"Add from database"**:
- Select your `battery-intelligence-db`
- This automatically adds `DATABASE_URL`

#### Application Settings:
Add these manually (click "+ Add Environment Variable"):

```
APP_NAME = US Battery Industry Intelligence Platform
APP_VERSION = 0.1.0
ENVIRONMENT = production
DEBUG = False
API_V1_PREFIX = /api/v1
```

#### Generate Secret Key:
```
SECRET_KEY = (click "Generate" button to create random value)
```

#### CORS Configuration:
```
BACKEND_CORS_ORIGINS = ["https://battery-research.net","https://www.battery-research.net"]
```

#### Choose Your LLM Provider (Pick ONE):

**Option A: Anthropic Claude (Recommended)**
```
LLM_PROVIDER = anthropic
ANTHROPIC_API_KEY = sk-ant-xxxxxx (your key from console.anthropic.com)
ANTHROPIC_MODEL = claude-3-5-sonnet-20241022
MAX_TOKENS = 4096
```

**Option B: OpenAI**
```
LLM_PROVIDER = openai
OPENAI_API_KEY = sk-xxxxxx (your key from platform.openai.com)
```

**Option C: Google Gemini**
```
LLM_PROVIDER = gemini
GEMINI_API_KEY = xxxxxx (your key from makersuite.google.com)
GEMINI_LLM_MODEL = gemini-1.5-pro
```

#### Choose Your Embedding Provider (Pick ONE):

**Option A: OpenAI (Recommended)**
```
EMBEDDING_PROVIDER = openai
OPENAI_API_KEY = sk-xxxxxx (same as above if using OpenAI)
EMBEDDING_MODEL = text-embedding-3-small
EMBEDDING_DIMENSIONS = 1536
```

**Option B: Google Gemini**
```
EMBEDDING_PROVIDER = gemini
GEMINI_API_KEY = xxxxxx (same as above if using Gemini)
GEMINI_EMBEDDING_MODEL = text-embedding-004
```

#### RAG Configuration:
```
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
TOP_K_RESULTS = 5
VECTOR_SIMILARITY_THRESHOLD = 0.7
ENABLE_CITATIONS = True
MIN_CITATION_CONFIDENCE = 0.7
CONVERSATION_MEMORY_LIMIT = 10
LOG_LEVEL = INFO
RATE_LIMIT_PER_MINUTE = 60
```

### Step 7: Deploy

1. Click **"Create Web Service"** at the bottom
2. Render will start building your Docker container
3. This takes **5-10 minutes** for first deploy
4. Watch the logs in real-time
5. Wait for: **"Your service is live 🎉"**

### Step 8: Test Your API

Once deployed, Render gives you a URL like:
```
https://battery-api.onrender.com
```

Test it:

**Health Check:**
```bash
curl https://battery-api.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "app": "US Battery Industry Intelligence Platform",
  "version": "0.1.0",
  "environment": "production"
}
```

**Chat Health Check:**
```bash
curl https://battery-api.onrender.com/api/v1/chat/health
```

Expected response shows all services configured.

**Test RAG Query:**
```bash
curl -X POST https://battery-api.onrender.com/api/v1/chat/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the top solid-state battery companies?",
    "top_k": 5,
    "include_sources": true
  }'
```

Should return a response with citations!

### Step 9: Configure Custom Domain

#### In Render Dashboard:

1. Click on your web service (`battery-api`)
2. Go to **"Settings"** tab
3. Scroll to **"Custom Domain"**
4. Click **"+ Add Custom Domain"**
5. Enter: `api.battery-research.net`
6. Click **"Save"**

Render will show you DNS records to add.

#### In Your DNS Provider:

Add a **CNAME record**:
- **Name/Host**: `api`
- **Type**: `CNAME`
- **Value/Target**: `battery-api.onrender.com` (your Render URL)
- **TTL**: 3600 (or Auto)

**Wait 5-30 minutes** for DNS propagation.

Render will automatically provision an SSL certificate once DNS resolves.

### Step 10: Update Frontend to Use API

Update `.github/workflows/deploy-vite.yml`:

```yaml
- name: Build Vite app
  working-directory: 'Battery Industry DeepDive Website'
  run: npm run build
  env:
    VITE_API_BASE_URL: https://api.battery-research.net
    VITE_DATA_SOURCE: api  # ⚠️ Change from 'local' to 'api'
    VITE_ENABLE_RAG_CHATBOT: true
```

Commit and push this change to redeploy frontend.

### Step 11: Initialize Database (Optional)

To populate with battery industry data:

1. Go to your web service in Render
2. Click **"Shell"** tab (opens terminal in your container)
3. Run:
   ```bash
   python scripts/seed_data.py
   ```

Or use the API endpoints to upload data.

## Free Tier Limitations

### What's Included FREE:
✅ PostgreSQL database (90 days, then $7/month)
✅ Web service with 750 hours/month
✅ Automatic HTTPS & SSL
✅ Custom domains
✅ Auto-deploy from GitHub
✅ Basic monitoring & logs

### Limitations:
⚠️ **Cold Starts**: Service spins down after 15 minutes of inactivity
⚠️ **First request after sleep**: Takes 30-60 seconds to wake up
⚠️ **Database**: Free for 90 days, then $7/month (still cheap!)

### Workaround for Cold Starts:
Set up a free uptime monitor (like UptimeRobot.com) to ping your API every 10 minutes to keep it warm.

## Cost After Free Tier

If you want to eliminate cold starts:

**Render Paid Plans:**
- Starter: $7/month (no cold starts)
- PostgreSQL: $7/month (after 90 days)
- **Total**: ~$14/month for production

Still cheaper than most alternatives!

## Verification Checklist

- [ ] PostgreSQL database created with pgvector extension
- [ ] Web service deployed successfully
- [ ] All environment variables set
- [ ] Health endpoint returns 200 OK
- [ ] Chat health shows all services configured
- [ ] Can send test query and get response with citations
- [ ] Custom domain `api.battery-research.net` added
- [ ] DNS CNAME record configured
- [ ] SSL certificate issued (automatic, may take 30 min)
- [ ] Frontend updated to use API instead of local data

## Monitoring & Logs

**Access Logs:**
1. Click on your web service
2. Go to **"Logs"** tab
3. See real-time logs

**Metrics:**
1. Go to **"Metrics"** tab
2. View CPU, memory, bandwidth

**Alerts:**
- Render sends email on deployment failures
- Configure additional alerts in Settings

## Troubleshooting

### Build Fails
- Check **"Logs"** tab during build
- Verify Dockerfile builds locally: `docker build -t test ./backend`
- Ensure `backend/` is set as Root Directory

### Database Connection Errors
- Verify DATABASE_URL is set (should be automatic from database link)
- Check PostgreSQL service is running
- Ensure pgvector extension is installed: `\dx` in psql

### API Key Errors
- Double-check API keys are correct (no extra spaces)
- Verify provider matches: `LLM_PROVIDER` must match your key
- Test keys independently before deploying

### CORS Errors from Frontend
- Verify `BACKEND_CORS_ORIGINS` includes your frontend URL
- URLs must match exactly: `https://battery-research.net` (no trailing slash)
- Check browser console for specific CORS error

### Cold Start Issues
- Expected on free tier
- First request after 15 min takes ~30-60 seconds
- Subsequent requests are fast
- Solution: Upgrade to Starter plan ($7/month) or use uptime monitor

### Custom Domain Not Working
- Wait 30 minutes for DNS propagation
- Verify CNAME record: `dig api.battery-research.net`
- Check Render shows "SSL certificate issued"
- Try in incognito/private window (clear DNS cache)

## Auto-Deploy from GitHub

Render automatically deploys when you push to `main` branch!

To deploy changes:
```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render detects the push and redeploys automatically (takes ~5 min).

## Scaling in Future

If your app grows:

1. **Upgrade web service**: $7/month removes cold starts
2. **Upgrade database**: $7/month for persistent PostgreSQL
3. **Add caching**: Connect Redis for faster responses
4. **Load balancing**: Render handles automatically
5. **Auto-scaling**: Available on higher tiers

## Support Resources

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com/
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Backend Issues**: https://github.com/abhip2006/battery-research/issues

## API Documentation

Once deployed, access interactive API docs:

- **Swagger UI**: `https://api.battery-research.net/docs`
- **ReDoc**: `https://api.battery-research.net/redoc`
- **OpenAPI JSON**: `https://api.battery-research.net/api/v1/openapi.json`

## Next Steps After Deployment

1. ✅ Test chatbot on battery-research.net
2. ✅ Monitor logs for errors
3. ✅ Set up uptime monitoring (UptimeRobot.com - free)
4. ✅ Configure database backups (Render handles this)
5. ✅ Add analytics/monitoring (optional)
6. ✅ Seed database with battery industry data
7. ✅ Share your live chatbot! 🎉

---

**Questions?** Open an issue on GitHub or check Render's documentation.

**Total Setup Time**: ~30 minutes
**Monthly Cost**: $0 (free tier) or $14/month (no cold starts)
**Maintenance**: Near-zero (auto-deploys from GitHub)
