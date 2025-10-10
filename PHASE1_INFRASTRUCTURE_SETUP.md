# Phase 1: Infrastructure Setup & Validation

## 🚨 Current Status

**Digital Twin Service**: ❌ NOT RUNNING
- Response: `{"isRunning":false,"message":"Digital Twin service not initialized"}`
- Reason: Missing environment configuration

## Required Setup Steps

### Step 1: Create Environment Configuration

You need to create a `.env.local` file with the following variables:

```bash
# Create .env.local file
nano .env.local
# or
notepad .env.local
```

**Minimum Required Configuration**:
```env
# Enable Digital Twin
DIGITAL_TWIN_ENABLED=true

# Database
DATABASE_URL="postgresql://your-username:your-password@localhost:5432/your-database"

# Redis (Required for BullMQ)
REDIS_URL="redis://localhost:6379"

# OpenAI (Required for AI extraction)
OPENAI_API_KEY="sk-your-openai-key-here"
```

### Step 2: Install & Start Redis

**Option A: Local Redis (Recommended for testing)**

**Windows (using WSL2)**:
```bash
# In WSL2
sudo apt-get update
sudo apt-get install redis-server
sudo service redis-server start

# Test
redis-cli ping
# Should return: PONG
```

**Windows (using Docker)**:
```bash
docker run -d --name redis -p 6379:6379 redis:latest
```

**macOS**:
```bash
brew install redis
brew services start redis
```

**Option B: Cloud Redis (Upstash - Free tier available)**
1. Go to https://upstash.com
2. Create a free Redis database
3. Copy the `REDIS_URL` (starts with `rediss://`)
4. Add to `.env.local`

### Step 3: Verify Database Connection

```bash
# Test database connection
pnpm prisma db pull
```

If this fails, update `DATABASE_URL` in `.env.local` with correct credentials.

### Step 4: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)
4. Add to `.env.local`:
   ```env
   OPENAI_API_KEY="sk-your-actual-key"
   ```

### Step 5: Restart Dev Server

```bash
# Stop current server (Ctrl+C if running)
# Then restart
pnpm dev
```

**Look for these messages in the logs**:
```
🤖 Starting Digital Twin Background Service...
✅ Digital Twin service started (runs every 4 hours)
```

### Step 6: Verify Digital Twin is Running

```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/digital-twin/status" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "interval": "4h",
    "lastRunTime": null,
    "nextRunTime": "2025-01-XX..."
  }
}
```

## Checklist

Before proceeding to Phase 2, confirm:

- [ ] `.env.local` file exists with all required variables
- [ ] Redis is running (`redis-cli ping` returns `PONG` OR using cloud Redis)
- [ ] OpenAI API key is set
- [ ] Database connection works
- [ ] Dev server restarted successfully
- [ ] Digital Twin status shows `"isRunning": true`
- [ ] No errors in server logs

## Troubleshooting

### Issue: Redis Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution**:
```bash
# Check if Redis is running
redis-cli ping

# If not, start it
# Windows (WSL2)
sudo service redis-server start

# macOS
brew services start redis

# Docker
docker start redis
```

### Issue: OpenAI API Key Invalid
```
Error: Invalid API key
```

**Solution**:
- Verify key starts with `sk-`
- Check for extra spaces in `.env.local`
- Regenerate key if needed at platform.openai.com

### Issue: Database Connection Failed
```
Error: Can't reach database server
```

**Solution**:
- Verify PostgreSQL is running
- Check `DATABASE_URL` format:
  ```
  postgresql://username:password@host:port/database
  ```
- Test connection with a database client

### Issue: Digital Twin Still Not Starting

**Check Environment Variables**:
```bash
# PowerShell
$env:DIGITAL_TWIN_ENABLED
# Should output: true
```

If empty, the `.env.local` isn't being loaded. Make sure:
1. File is named exactly `.env.local` (not `.env.local.txt`)
2. File is in project root (same directory as `package.json`)
3. Server was restarted after creating the file

## Next Steps

Once all items in the checklist are ✅:
- ✅ Proceed to **Phase 2**: Test ingestion sources management

---

**Need Help?** Check the server logs for specific error messages and consult `DIGITAL_TWIN_TROUBLESHOOTING.md`

