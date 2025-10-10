# 🤖 Digital Twin - Casting Call Aggregation System

## 📋 Overview

The Digital Twin is an automated system that discovers, extracts, and validates casting call opportunities from various sources on the web.

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DIGITAL TWIN FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. WEB ORCHESTRATOR
   ├─ Fetches active web sources from database
   ├─ Uses FireCrawl API to scrape content
   └─ Pushes raw markdown to "scraped-roles" queue
   
2. SCRAPED ROLE WORKER
   ├─ Processes raw markdown from queue
   ├─ Uses LLM to extract structured casting call data
   └─ Pushes structured data to "validation-queue"
   
3. VALIDATION WORKER
   ├─ Validates extracted data
   ├─ Checks for duplicates (content hash)
   ├─ Saves to database with status "pending_review"
   └─ Updates source lastProcessedAt timestamp

4. ADMIN REVIEW (Manual)
   ├─ Review pending casting calls in admin panel
   ├─ Approve, edit, or reject
   └─ Approved calls become visible to talent
```

---

## 🚀 Quick Start

### Prerequisites

1. **Redis** (for queues)
   - Get a Redis URL from [Redis Cloud](https://redis.com/try-free/) or [Upstash](https://upstash.com/)
   - Add to `.env`: `REDIS_URL=rediss://:password@host:port`

2. **FireCrawl API Key**
   - Sign up at [FireCrawl.dev](https://firecrawl.dev)
   - Get your API key
   - Add to `.env`: `FIRE_CRAWL_API_KEY=fc-...`

3. **OpenAI API Key** (Optional - for LLM extraction)
   - Currently uses mock LLM
   - To enable real LLM: Get key from [OpenAI](https://platform.openai.com/)
   - Add to `.env`: `OPENAI_API_KEY=sk-...`

---

## 📦 Installation Steps

### 1. Environment Setup

Add these to your `.env` or `.env.local`:

```env
# Required
REDIS_URL=rediss://default:password@redis-host.com:6379
FIRE_CRAWL_API_KEY=fc-your-api-key-here

# Optional (for production LLM)
OPENAI_API_KEY=sk-your-openai-key
```

### 2. Add Ingestion Sources

Run the setup script to add sample web sources:

```powershell
pnpm tsx scripts/setup-digital-twin.ts
```

This will add:
- ✅ Backstage - Casting Calls (Active)
- ✅ Mandy - Middle East Jobs (Active)
- ⏸️  Production Hub - Casting (Inactive)

### 3. Start the Workers

In a **new terminal**, start all workers:

```powershell
pnpm tsx scripts/start-workers.ts
```

This starts:
- 📦 Scraped Role Worker (processes raw content)
- 📦 Validation Worker (validates and saves to DB)

Keep this running in the background.

### 4. Run the Web Orchestrator

In **another terminal**, run the web crawler:

```powershell
pnpm tsx scripts/orchestrator-web.ts
```

Or add to package.json scripts:

```json
{
  "scripts": {
    "workers": "tsx scripts/start-workers.ts",
    "crawl:web": "tsx scripts/orchestrator-web.ts"
  }
}
```

---

## 🧪 Testing the System

### Manual Test Flow

1. **Start Dev Server** (if not running):
   ```powershell
   pnpm dev
   ```

2. **Start Workers** (separate terminal):
   ```powershell
   pnpm tsx scripts/start-workers.ts
   ```

3. **Run Web Orchestrator** (separate terminal):
   ```powershell
   pnpm tsx scripts/orchestrator-web.ts
   ```

4. **Check Results**:
   - Check terminal logs for scraping activity
   - Login to app as admin
   - Navigate to `/admin/validation-queue`
   - Review pending casting calls
   - Approve or reject them

### Expected Output

**Web Orchestrator:**
```
🌐 Starting Web Orchestrator...
📋 Found 2 active web sources to process
🔍 Processing source: Backstage - Casting Calls (https://...)
🔥 Scraping URL: https://...
✅ Successfully queued content from Backstage - Casting Calls
🎉 Web Orchestrator completed: 2 processed, 0 errors
```

**Scraped Role Worker:**
```
Processing raw content from source: https://...
🤖 Successfully extracted structured data from https://...
✅ Pushed extracted data to validation queue
```

**Validation Worker:**
```
🕵️‍♀️ Validating casting call: "Lead Actor for Historical Drama"
✅ Successfully created new casting call: "..." (ID: xyz123)
```

---

## 📊 Managing Sources

### View All Sources

```typescript
// In Prisma Studio or your DB client
SELECT * FROM "IngestionSource" WHERE "sourceType" = 'WEB';
```

### Add a New Source Manually

```typescript
await prisma.ingestionSource.create({
  data: {
    sourceType: 'WEB',
    sourceIdentifier: 'https://example.com/casting',
    sourceName: 'Example Casting Site',
    isActive: true,
  },
});
```

### Activate/Deactivate a Source

```typescript
await prisma.ingestionSource.update({
  where: { id: 'source-id' },
  data: { isActive: false },
});
```

---

## 🔄 Automation (Production)

### Cron Schedule Recommendations

**Web Orchestrator:**
- Run every 4-6 hours
- Avoid peak hours (12pm-2pm, 6pm-8pm Saudi time)
- Suggested: 3am, 9am, 3pm, 9pm

**Using node-cron:**

```typescript
import cron from 'node-cron';
import { WebOrchestrator } from './scripts/orchestrator-web';

// Run every 6 hours
cron.schedule('0 */6 * * *', async () => {
  const orchestrator = new WebOrchestrator();
  await orchestrator.run();
});
```

**Using PM2:**

```json
{
  "apps": [
    {
      "name": "digital-twin-workers",
      "script": "scripts/start-workers.ts",
      "interpreter": "tsx",
      "instances": 1,
      "autorestart": true
    },
    {
      "name": "web-orchestrator",
      "script": "scripts/orchestrator-web.ts",
      "interpreter": "tsx",
      "cron_restart": "0 */6 * * *",
      "autorestart": false
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Workers Not Processing Jobs

**Check Redis Connection:**
```typescript
// In your app
import { redis } from '@packages/core-queue';
console.log('Redis connected:', redis ? 'Yes' : 'No');
```

**Check Queue Status:**
```typescript
import { scrapedRolesQueue } from '@packages/core-queue';
const counts = await scrapedRolesQueue.getJobCounts();
console.log('Queue status:', counts);
```

### FireCrawl API Errors

**Rate Limits:**
- Free tier: 500 requests/month
- Paid tier: Unlimited
- Check your usage at https://firecrawl.dev/dashboard

**403 Forbidden:**
- Website may block scrapers
- Try different user agent
- Use rotating proxies (not implemented yet)

### LLM Extraction Failures

**Current Implementation:**
- Uses mock LLM (always returns sample data)
- To enable real LLM, update `packages/core-lib/src/llm-casting-call-extraction-service.ts`

**Replace mock with OpenAI:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const llmClient = {
  async generateJson(prompt: string, schema: any): Promise<any> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a casting call data extraction expert.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });
    return JSON.parse(response.choices[0].message.content);
  },
};
```

### Jobs Stuck in Queue

**Check Dead Letter Queue:**
```typescript
import { dlq } from '@packages/core-queue';
const failedJobs = await dlq.getJobs(['failed'], 0, 10);
console.log('Failed jobs:', failedJobs);
```

**Retry Failed Jobs:**
```typescript
for (const job of failedJobs) {
  await job.retry();
}
```

---

## 📈 Monitoring & Analytics

### Key Metrics to Track

1. **Scraping Success Rate**
   - Sources processed / Sources attempted
   - Target: >90%

2. **LLM Extraction Success Rate**
   - Jobs processed / Jobs attempted
   - Target: >85%

3. **Duplicate Detection Rate**
   - Duplicates found / Total scraped
   - Expected: 30-50% (normal)

4. **Average Processing Time**
   - Time from scrape to DB insert
   - Target: <5 minutes

### Database Queries

**Count Pending Calls:**
```sql
SELECT COUNT(*) FROM "CastingCall" 
WHERE status = 'pending_review' AND "isAggregated" = true;
```

**Recent Aggregated Calls:**
```sql
SELECT title, company, location, "createdAt" 
FROM "CastingCall" 
WHERE "isAggregated" = true 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

**Source Performance:**
```sql
SELECT 
  s."sourceName",
  COUNT(c.id) as calls_found,
  MAX(c."createdAt") as last_call
FROM "IngestionSource" s
LEFT JOIN "CastingCall" c ON c."sourceUrl" = s."sourceIdentifier"
WHERE s."sourceType" = 'WEB'
GROUP BY s.id, s."sourceName"
ORDER BY calls_found DESC;
```

---

## 🔐 Security Considerations

### API Keys
- ✅ Never commit API keys to git
- ✅ Use environment variables
- ✅ Rotate keys regularly (quarterly)
- ✅ Use separate keys for dev/staging/prod

### Rate Limiting
- ✅ Respect robots.txt
- ✅ Add delays between requests
- ✅ Use polite user agents
- ✅ Cache scraped content

### Data Privacy
- ✅ Only scrape public data
- ✅ Don't store personal information
- ✅ Add opt-out mechanism
- ✅ GDPR/PDPL compliance

---

## 🚀 Next Steps

### Phase 1: Testing (Current)
- [x] Set up workers
- [x] Test web orchestrator
- [ ] Review extracted calls
- [ ] Fine-tune LLM prompts
- [ ] Monitor for 1 week

### Phase 2: Production
- [ ] Set up cron jobs
- [ ] Enable real LLM (OpenAI/Anthropic)
- [ ] Add monitoring/alerting
- [ ] Create admin review UI
- [ ] Document approval workflow

### Phase 3: Scaling
- [ ] Add more sources (50+)
- [ ] Implement smart scheduling
- [ ] Add source quality scoring
- [ ] Implement ML-based validation
- [ ] Auto-approve high-confidence calls

---

## 📚 Related Documentation

- `scripts/orchestrator-web.ts` - Web orchestrator implementation
- `packages/core-queue/src/workers/scraped-role-worker.ts` - LLM processing worker
- `packages/core-queue/src/workers/validation-worker.ts` - Validation and DB insertion
- `packages/core-lib/src/llm-casting-call-extraction-service.ts` - LLM service
- `scripts/services/firecrawl-service.ts` - Web scraping service

---

**Last Updated:** October 8, 2025  
**Status:** ✅ Ready for Testing  
**Maintainer:** AI Assistant

Need help? Check the logs or create an issue.

