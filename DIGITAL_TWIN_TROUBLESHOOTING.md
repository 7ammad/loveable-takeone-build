# Digital Twin Troubleshooting Guide

## Quick Diagnostics

### 1. Check if Digital Twin is Running

Look for these logs in your terminal when starting the server:

```
🤖 Starting Digital Twin Background Service...
🎬 BullMQ Workers started - listening for jobs
✅ Digital Twin service started (runs every 4 hours)
Queue system initialized successfully
```

If you **don't see** these logs:
- Check `.env` for `DIGITAL_TWIN_ENABLED` (should be `true` or not set)
- Check for errors in the console

### 2. Check API Keys

Run this command:
```powershell
pnpm tsx scripts/test-digital-twin.ts
```

You should see:
```
✅ APIFY_API_KEY: Set
✅ FIRE_CRAWL_API_KEY: Set
✅ REDIS_URL: Set
✅ OPENAI_API_KEY: Set (or ⚠️ for mock mode)
```

---

## Common Issues

### Issue 1: "Queue system initialization failed"

**Symptom:** You see an error about Redis connection

**Causes:**
- Invalid `REDIS_URL` in `.env`
- Redis server not accessible

**Solution:**
```powershell
# Check your REDIS_URL format
# Should be: rediss://:password@host:port
# or: redis://host:port (for local)

# Test Redis connection
echo $env:REDIS_URL
```

**Quick Fix:** Use a free Redis instance from:
- Upstash: https://upstash.com (Free tier)
- Redis Labs: https://redis.com/try-free

---

### Issue 2: "Digital Twin never runs"

**Symptom:** Server starts but no scraping happens after 30 seconds

**Possible Causes:**
1. Digital Twin is disabled
2. No active sources in database
3. Workers not starting

**Solution:**

```powershell
# 1. Check if enabled
grep "DIGITAL_TWIN_ENABLED" .env
# Should be 'true' or not present

# 2. Check active sources
pnpm tsx scripts/test-digital-twin.ts
# Should show: "🟢 Total Active: 19" (or more)

# 3. Look for worker logs
# You should see: "🎬 BullMQ Workers started"
```

---

### Issue 3: "Using mock LLM response (no API key)"

**Symptom:** Casting calls are created but all have generic "Mock" data

**Cause:** No `OPENAI_API_KEY` in `.env`

**Solution:**
```powershell
# Add to .env.local:
OPENAI_API_KEY=sk-your-api-key-here
```

**Get API Key:**
- OpenAI: https://platform.openai.com/api-keys
- Cost: ~$0.01-0.03 per casting call extraction

**Alternative:** Use Anthropic Claude instead:
- Modify `packages/core-lib/src/llm-casting-call-extraction-service.ts`
- Change endpoint to Anthropic API
- Usually cheaper than OpenAI

---

### Issue 4: "FireCrawl API error: 401"

**Symptom:** Web scraping fails with authentication error

**Solutions:**
```powershell
# 1. Verify API key is correct
echo $env:FIRE_CRAWL_API_KEY

# 2. Check if key is active at https://firecrawl.dev
# 3. Regenerate key if needed

# 4. Test manually:
curl -X POST "https://api.firecrawl.dev/v1/scrape" \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

---

### Issue 5: "Apify API error: 402 Payment Required"

**Symptom:** Instagram scraping fails with payment error

**Cause:** Exceeded free tier limit

**Solutions:**
1. **Check usage:** https://console.apify.com
2. **Reduce frequency:** Change `ORCHESTRATION_INTERVAL` in `lib/digital-twin/background-service.ts`
3. **Reduce accounts:** Deactivate some Instagram sources
4. **Upgrade plan:** Apify paid plans start at $49/month

**Temporary Fix:**
```powershell
# Deactivate Instagram sources temporarily
pnpm tsx -e "
  import { prisma } from './packages/core-db/src/client.js';
  await prisma.ingestionSource.updateMany({
    where: { sourceType: 'INSTAGRAM' },
    data: { isActive: false }
  });
  console.log('Instagram sources deactivated');
  await prisma.\$disconnect();
"
```

---

### Issue 6: "Duplicate casting calls keep appearing"

**Symptom:** Same casting call created multiple times

**Cause:** Content hash collision or hash not working

**Solution:**
```powershell
# Check for duplicates
pnpm tsx -e "
  import { prisma } from './packages/core-db/src/client.js';
  const calls = await prisma.castingCall.findMany({
    where: { isAggregated: true },
    select: { id: true, title: true, contentHash: true, createdAt: true }
  });
  const hashes = calls.map(c => c.contentHash);
  const dupes = hashes.filter((h, i) => hashes.indexOf(h) !== i);
  console.log('Duplicates:', dupes.length);
  await prisma.\$disconnect();
"
```

**Fix:**
- Check `lib/digital-twin/workers-init.ts` - validation worker creates `contentHash`
- Ensure `crypto` is properly imported

---

### Issue 7: "Workers processing jobs but nothing in admin portal"

**Symptom:** Logs show jobs completing but no pending calls in `/admin/validation-queue`

**Causes:**
1. Jobs failing silently
2. Status not set to 'pending_review'
3. Database connection issue

**Solution:**
```powershell
# Check database directly
pnpm tsx -e "
  import { prisma } from './packages/core-db/src/client.js';
  const pending = await prisma.castingCall.count({
    where: { isAggregated: true, status: 'pending_review' }
  });
  console.log('Pending calls:', pending);
  await prisma.\$disconnect();
"

# Check dead letter queue
pnpm tsx -e "
  import { Queue } from 'bullmq';
  const dlq = new Queue('dlq', { connection: { /* redis config */ } });
  const failed = await dlq.getJobs(['failed']);
  console.log('Failed jobs:', failed.length);
  failed.forEach(j => console.log(j.data));
"
```

---

## Performance Optimization

### Reduce LLM Costs

```typescript
// In packages/core-lib/src/llm-casting-call-extraction-service.ts
// Change model to cheaper option:
model: 'gpt-3.5-turbo-1106', // Instead of 'gpt-4-turbo-preview'
// Saves ~90% on costs, slight quality reduction
```

### Speed Up Scraping

```typescript
// In lib/digital-twin/background-service.ts
// Run orchestrators in parallel:
await Promise.all([
  this.webOrchestrator.run(),
  this.instagramOrchestrator.run()
]);
```

### Reduce Memory Usage

```typescript
// In lib/digital-twin/workers-init.ts
// Reduce concurrency:
concurrency: 1, // Instead of 2 for scraped-role-worker
concurrency: 5, // Instead of 10 for validation-worker
```

---

## Monitoring

### Check Queue Status

```powershell
pnpm tsx -e "
  import { Queue } from 'bullmq';
  const url = new URL(process.env.REDIS_URL);
  const connection = {
    host: url.hostname,
    port: parseInt(url.port) || 6379,
    password: url.password
  };
  
  const scrapeQueue = new Queue('scraped-roles', { connection });
  const validationQueue = new Queue('validation-queue', { connection });
  
  console.log('Scraped Roles Queue:', await scrapeQueue.getJobCounts());
  console.log('Validation Queue:', await validationQueue.getJobCounts());
  
  await scrapeQueue.close();
  await validationQueue.close();
"
```

### Check Recent Activity

```powershell
# Via admin API
curl http://localhost:3000/api/v1/admin/digital-twin/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Manual Testing

### Trigger Manual Crawl

```powershell
pnpm tsx -e "
  import { getDigitalTwinService } from './lib/digital-twin/init.js';
  const service = getDigitalTwinService();
  if (service) {
    await service.triggerManualRun();
    console.log('Manual crawl triggered');
  } else {
    console.log('Service not running');
  }
"
```

### Test Single Source

```powershell
# Test FireCrawl
pnpm tsx -e "
  import { FireCrawlService } from './lib/digital-twin/services/firecrawl-service.js';
  const service = new FireCrawlService();
  const result = await service.scrapeUrl('https://www.mbcgroup.sa/careers');
  console.log('Scraped:', result ? result.markdown.substring(0, 500) : 'Failed');
"

# Test Instagram
pnpm tsx -e "
  import { InstagramScraperService } from './lib/digital-twin/services/instagram-scraper-service.js';
  const service = new InstagramScraperService();
  const posts = await service.scrapeRecentPosts('@saudicasting', 3);
  console.log('Posts found:', posts.length);
  posts.forEach(p => console.log('-', p.caption.substring(0, 100)));
"
```

---

## Getting Help

### Enable Debug Logging

```typescript
// In lib/digital-twin/background-service.ts
// Add at the start of runOrchestration():
console.log('[DEBUG] Starting orchestration at', new Date());
console.log('[DEBUG] Environment:', {
  DIGITAL_TWIN_ENABLED: process.env.DIGITAL_TWIN_ENABLED,
  hasApifyKey: !!process.env.APIFY_API_KEY,
  hasFireCrawlKey: !!process.env.FIRE_CRAWL_API_KEY,
  hasOpenAIKey: !!process.env.OPENAI_API_KEY,
});
```

### Logs to Include When Reporting Issues

1. Server startup logs (first 50 lines)
2. Output of `pnpm tsx scripts/test-digital-twin.ts`
3. Any error messages from console
4. Queue status (see Monitoring section)
5. Database counts for pending calls

### Community Support

- GitHub Issues: [Your repo URL]
- Discord: [Your server]
- Email: [Your support email]

---

## Production Checklist

Before deploying to production:

- [ ] All API keys set in production environment
- [ ] Redis configured with persistence
- [ ] OPENAI_API_KEY set (not using mock)
- [ ] Admin access granted to at least one user
- [ ] At least 10 active sources configured
- [ ] Tested end-to-end: crawl → extract → validate → approve
- [ ] Monitoring setup (e.g., error alerts)
- [ ] Budget limits set for API usage
- [ ] Backup strategy for casting call data
- [ ] Rate limiting configured if needed

---

## Cost Estimation

### Monthly Costs (10 Instagram + 9 Web sources, every 4 hours):

| Service | Usage | Cost |
|---------|-------|------|
| **Apify** | ~6 runs/day × 10 accounts × 30 days = 1,800 | Free tier (5K/mo) |
| **FireCrawl** | ~6 runs/day × 9 sites × 30 days = 1,620 | $5-10/mo |
| **OpenAI GPT-4** | ~20 calls/day × $0.02 × 30 = $12 | $12-15/mo |
| **Redis (Upstash)** | Small queue usage | Free tier |
| **Database** | ~500 calls/month | Included in hosting |

**Total: ~$17-25/month** for fully automated casting call aggregation from 19 sources.

To reduce costs:
- Use GPT-3.5 instead of GPT-4: Save ~$10/mo
- Reduce crawl frequency to every 8 hours: Save 50%
- Use only free-tier sources: $0/mo (with limitations)

