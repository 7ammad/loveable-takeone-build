# Digital Twin Testing - Summary & Quick Start

## What We Have Built

The **Digital Twin** is an AI-powered content aggregation system that:
- 🌐 Scrapes casting opportunities from web sources
- 📷 Monitors Instagram accounts for casting announcements
- 🤖 Uses OpenAI GPT-4 to extract structured casting call data
- ✅ Routes extracted calls to an admin validation queue
- 📋 Allows admin review/edit before publishing
- 🚀 Automatically publishes approved calls to the public marketplace

## Current Status

✅ **Enabled**: Digital Twin initialization is now active in `app/layout.tsx`
✅ **API Routes**: All endpoints restored (renamed from `digital-twin-disabled`)
✅ **Documentation**: Comprehensive test plan and guide created

## Quick Start Testing

### Step 1: Start the Server (Already Running)
The dev server is running at http://localhost:3000 with Digital Twin enabled.

### Step 2: Check Digital Twin Status
```bash
curl http://localhost:3000/api/digital-twin/status
```

Expected response:
```json
{
  "data": {
    "isRunning": true,
    "interval": "4h",
    "lastRunTime": null,
    "nextRunTime": "..."
  }
}
```

### Step 3: Access Admin Dashboard
Navigate to: **http://localhost:3000/admin**

You should see:
- Digital Twin status widget
- Source statistics
- Pending casting calls count
- Manual "Run Now" button

### Step 4: Create Test Sources
Go to: **http://localhost:3000/admin/sources** or use the API:

```bash
# Create a web source
curl -X POST http://localhost:3000/api/v1/admin/sources \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType": "WEB",
    "sourceIdentifier": "https://www.mbc.net/en/careers",
    "sourceName": "MBC Careers",
    "isActive": true
  }'
```

### Step 5: Trigger Orchestration
From admin dashboard or via API:

```bash
curl -X POST http://localhost:3000/api/digital-twin/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Step 6: Monitor Validation Queue
After 30-60 seconds, check: **http://localhost:3000/admin/validation-queue**

AI-extracted casting calls should appear here for review.

### Step 7: Approve & Publish
- Review the extracted data
- Edit if needed
- Click "Approve"
- Casting call goes live on `/casting-calls`

## Required Environment Variables

Make sure these are set in your `.env.local`:

```env
# Database
DATABASE_URL="postgresql://..."

# Redis (required for BullMQ workers)
REDIS_URL="redis://localhost:6379"
# OR for cloud Redis:
# REDIS_URL="rediss://default:password@host:port"

# OpenAI (required for AI extraction)
OPENAI_API_KEY="sk-..."

# Digital Twin Control
DIGITAL_TWIN_ENABLED=true  # Set to 'false' to disable
```

## Test Phases Overview

We have 8 test phases documented in `DIGITAL_TWIN_TEST_PLAN.md`:

1. **Phase 1**: Infrastructure validation (DB, Redis, OpenAI)
2. **Phase 2**: Source management (CRUD operations)
3. **Phase 3**: Manual orchestration trigger
4. **Phase 4**: LLM extraction testing
5. **Phase 5**: Validation queue workflow
6. **Phase 6**: End-to-end testing
7. **Phase 7**: Performance & scale testing
8. **Phase 8**: Monitoring & alerting

## Key Files

### Core Implementation:
- `lib/digital-twin/init.ts` - Entry point (imported in app/layout.tsx)
- `lib/digital-twin/background-service.ts` - Main service & scheduler
- `lib/digital-twin/orchestrators/web-orchestrator.ts` - Web scraping
- `lib/digital-twin/orchestrators/instagram-orchestrator.ts` - Instagram scraping
- `lib/digital-twin/workers-init.ts` - BullMQ worker setup

### API Routes:
- `app/api/digital-twin/status/route.ts` - Status & manual trigger (public)
- `app/api/digital-twin/sources/route.ts` - List sources (public)
- `app/api/v1/admin/digital-twin/status/route.ts` - Admin status
- `app/api/v1/admin/digital-twin/validation-queue/route.ts` - Pending calls
- `app/api/v1/admin/casting-calls/[id]/approve/route.ts` - Approve call
- `app/api/v1/admin/casting-calls/[id]/reject/route.ts` - Reject call

### Admin UI:
- `app/admin/page.tsx` - Main admin dashboard
- `app/admin/sources/page.tsx` - Source management (if exists)
- `app/admin/validation-queue/page.tsx` - Validation queue UI

### Documentation:
- `DIGITAL_TWIN_TEST_PLAN.md` - Comprehensive test plan (this is the main one)
- `DIGITAL_TWIN_TEST_GUIDE.md` - User-friendly guide
- `DIGITAL_TWIN_TEST_SUMMARY.md` - This file
- `scripts/test-digital-twin.mjs` - Automated test script

## Common Issues & Solutions

### ❌ "Redis connection failed"
**Solution**: Install and start Redis
```bash
# macOS
brew install redis
brew services start redis

# Windows
# Use Docker or WSL2

# Or use cloud Redis (Upstash)
```

### ❌ "OpenAI API key not found"
**Solution**: Set in `.env.local`
```env
OPENAI_API_KEY=sk-your-key-here
```

### ❌ "Digital Twin not starting"
**Solution**: Check logs for initialization errors
```bash
# Look for these messages in pnpm dev output:
# "🤖 Starting Digital Twin Background Service..."
# "✅ Digital Twin service started (runs every 4 hours)"
```

### ❌ "No casting calls in validation queue"
**Reasons**:
1. Orchestration hasn't run yet (wait 30s after trigger)
2. Source URLs are invalid or unreachable
3. Content doesn't contain casting calls (LLM filtered it out)
4. LLM extraction failed (check OpenAI quota/errors)

**Solution**: Check server logs for detailed error messages

## Next Steps

### For Quick Testing (30 min):
1. ✅ Verify Digital Twin is running (check status endpoint)
2. ✅ Create 1-2 test sources
3. ✅ Trigger manual orchestration
4. ✅ Check validation queue after 60 seconds
5. ✅ Approve one casting call
6. ✅ Verify it appears on `/casting-calls`

### For Production Deployment:
1. 📝 Complete all 8 test phases
2. 🔍 Add real production sources (MBC, Rotana, etc.)
3. 📊 Set up monitoring dashboards
4. 🔔 Configure alerting for failures
5. 💰 Monitor OpenAI API costs
6. 👥 Train admins on validation queue workflow

## Testing Checklist

Quick pre-test checklist:

- [ ] Dev server is running
- [ ] Database is accessible
- [ ] Redis is running
- [ ] OpenAI API key is set
- [ ] Can access `/admin` (have admin account)
- [ ] Digital Twin shows "Running" in status endpoint

If all checked, you're ready to test! 🚀

## Support & Debugging

### View Logs:
The terminal running `pnpm dev` shows all Digital Twin activity:
- 🤖 Orchestration starts
- 🌐 Web scraping activity
- 📷 Instagram scraping activity  
- ✅ Successful extractions
- ❌ Errors and failures

### Check Queue Status:
If you have Redis CLI:
```bash
redis-cli KEYS "bull:*"
redis-cli LLEN bull:scraped-roles:wait
redis-cli LLEN bull:validation-queue:wait
```

### Review Database:
```sql
-- Check sources
SELECT * FROM "IngestionSource";

-- Check casting calls
SELECT id, title, status, "sourceId" FROM "CastingCall" 
WHERE status = 'pending';
```

---

**Ready?** Start with the Quick Start Testing section above! 🎬

