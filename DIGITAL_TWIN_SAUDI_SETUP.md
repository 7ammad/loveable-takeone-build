# 🇸🇦 Digital Twin - Saudi Casting Sources

## ✅ What's Changed

### 1. **Embedded in Backend** ✅
The Digital Twin now runs automatically when you start the server:
- ✅ No separate scripts needed
- ✅ Starts 30 seconds after server starts
- ✅ Runs every 4 hours automatically
- ✅ Works in background (doesn't slow down your app)

### 2. **Saudi Sources Support** ✅
Now supports Saudi-specific sources:
- 📸 **Instagram** - Casting agencies, production companies
- 🌐 **Websites** - Company career pages, job boards
- 💬 **WhatsApp** - Business accounts, groups (coming soon)
- 📱 **Other** - LinkedIn, Twitter, Telegram, etc.

### 3. **Easy to Add Sources** ✅
Multiple ways to add your 40+ sources:
- Simple list format
- JSON file
- CSV file
- API endpoint

---

## 🚀 Quick Start

### **Step 1: Add Your API Keys**

Add these to your `.env` file:

```env
# Required: For Instagram scraping
APIFY_API_KEY=apify_api_your-key-here

# Required: For website scraping
FIRE_CRAWL_API_KEY=fc-your-key-here

# Optional: Enable/disable Digital Twin
DIGITAL_TWIN_ENABLED=true
```

**Get API Keys:**
- **Apify:** https://apify.com (Free tier: 5K requests/month)
- **FireCrawl:** https://firecrawl.dev (Free tier: 500 requests/month)

### **Step 2: Provide Your Saudi Sources**

**Option A: Simple List (Easiest)**

Just send me your sources in chat like this:

```
Instagram:
@saudicasting
@mbc_casting
@rotanacasting
@telfaz11

Websites:
https://www.mbcgroup.sa/careers
https://www.rotana.net/jobs
```

I'll format and add them for you!

**Option B: JSON File**

Create `saudi-sources.json` in your project root:

```json
[
  {
    "sourceType": "INSTAGRAM",
    "sourceIdentifier": "@saudicasting",
    "sourceName": "Saudi Casting Agency",
    "isActive": true
  },
  {
    "sourceType": "WEB",
    "sourceIdentifier": "https://www.mbcgroup.sa/careers",
    "sourceName": "MBC Group Careers",
    "isActive": true
  }
]
```

Then run:
```powershell
pnpm digital-twin:add-sources
```

**Option C: API Endpoint**

Send sources via API:
```bash
POST /api/digital-twin/sources
Authorization: Bearer YOUR_TOKEN

[
  {
    "sourceType": "INSTAGRAM",
    "sourceIdentifier": "@saudicasting",
    "sourceName": "Saudi Casting Agency",
    "isActive": true
  }
]
```

### **Step 3: Start the Server**

```powershell
pnpm dev
```

**You'll see:**
```
🤖 Starting Digital Twin Background Service...
✅ Digital Twin service started (runs every 4 hours)
```

After 30 seconds, the first crawl will start automatically!

---

## 📊 Monitor Digital Twin

### **Check Status**
```bash
GET /api/digital-twin/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "interval": "4 hours",
    "nextRun": "Automatic"
  }
}
```

### **View All Sources**
```bash
GET /api/digital-twin/sources
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sources": [...],
    "stats": {
      "total": 45,
      "active": 40,
      "byType": {
        "INSTAGRAM": 25,
        "WEB": 15,
        "WHATSAPP": 3,
        "OTHER": 2
      }
    }
  }
}
```

### **Manual Trigger**
```bash
POST /api/digital-twin/trigger
Authorization: Bearer YOUR_ADMIN_TOKEN
```

Forces an immediate crawl (useful for testing).

---

## 🎯 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                  DIGITAL TWIN FLOW                           │
└─────────────────────────────────────────────────────────────┘

1. SERVER STARTS
   └─> Digital Twin initializes automatically
   
2. AFTER 30 SECONDS (First Run)
   ├─> Web Orchestrator
   │   ├─> Fetches active WEB sources
   │   ├─> Scrapes with FireCrawl
   │   └─> Queues for processing
   │
   └─> Instagram Orchestrator
       ├─> Fetches active INSTAGRAM sources
       ├─> Scrapes with Apify
       └─> Queues for processing

3. BACKGROUND WORKERS (Auto-start with server)
   ├─> Scraped Role Worker
   │   ├─> Reads from queue
   │   ├─> Uses LLM to extract casting call data
   │   └─> Sends to validation queue
   │
   └─> Validation Worker
       ├─> Validates extracted data
       ├─> Checks for duplicates
       ├─> Saves to database as "pending_review"
       └─> Updates source lastProcessedAt

4. EVERY 4 HOURS
   └─> Repeat step 2

5. ADMIN REVIEW
   ├─> Login to /admin/validation-queue
   ├─> Review pending casting calls
   └─> Approve or reject
```

---

## 📝 Source Format Examples

### Instagram Sources

```json
{
  "sourceType": "INSTAGRAM",
  "sourceIdentifier": "@saudicasting",
  "sourceName": "Saudi Casting Agency - Instagram",
  "isActive": true
}
```

**Supported formats:**
- `@saudicasting`
- `saudicasting`
- `https://instagram.com/saudicasting`
- `https://www.instagram.com/saudicasting/`

### Website Sources

```json
{
  "sourceType": "WEB",
  "sourceIdentifier": "https://www.mbcgroup.sa/careers",
  "sourceName": "MBC Group - Careers Page",
  "isActive": true
}
```

### WhatsApp Sources (Coming Soon)

```json
{
  "sourceType": "WHATSAPP",
  "sourceIdentifier": "+966501234567",
  "sourceName": "Saudi Casting WhatsApp",
  "isActive": false
}
```

### Other Sources

```json
{
  "sourceType": "OTHER",
  "sourceIdentifier": "https://linkedin.com/company/mbc-group",
  "sourceName": "MBC Group - LinkedIn",
  "isActive": true
}
```

---

## 🔧 Configuration

### Environment Variables

```env
# Enable/Disable Digital Twin
DIGITAL_TWIN_ENABLED=true  # Set to 'false' to disable

# Instagram Scraping
APIFY_API_KEY=apify_api_...

# Web Scraping
FIRE_CRAWL_API_KEY=fc-...

# Database (required)
DATABASE_URL=postgresql://...

# Redis (required for queues)
REDIS_URL=rediss://...
```

### Customization

To change the crawl interval, edit `lib/digital-twin/background-service.ts`:

```typescript
const ORCHESTRATION_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

// Change to 2 hours:
const ORCHESTRATION_INTERVAL = 2 * 60 * 60 * 1000;
```

---

## 📈 Expected Results

### **For 40 Saudi Sources:**

**Instagram (25 accounts):**
- Average: 3-5 posts per account per day
- Daily: ~100-125 posts
- Casting calls: ~10-20 per day (10-20% conversion)

**Websites (15 sites):**
- Average: 2-3 new jobs per site per week
- Weekly: ~30-45 jobs
- Casting calls: ~20-30 per week (70% conversion)

**Total:**
- ~70-100 casting calls per week
- ~300-400 per month

**After deduplication:**
- ~40-60 unique casting calls per week
- ~160-240 per month

---

## 🐛 Troubleshooting

### Digital Twin Not Starting

**Check:**
```powershell
# Look for this in server logs:
🤖 Starting Digital Twin Background Service...
✅ Digital Twin service started (runs every 4 hours)
```

**If you see:**
```
ℹ️  Digital Twin is disabled (set DIGITAL_TWIN_ENABLED=true to enable)
```

**Fix:** Add to `.env`:
```env
DIGITAL_TWIN_ENABLED=true
```

### No Instagram Posts Scraped

**Possible causes:**
1. Missing `APIFY_API_KEY`
2. Instagram account is private
3. No new posts since last crawl

**Check logs:**
```
📸 Running Instagram Orchestrator...
📋 Found 25 active Instagram source(s)
   📸 Processing: @saudicasting
      ⚠️  No new posts found
```

### Websites Not Scraping

**Possible causes:**
1. Missing `FIRE_CRAWL_API_KEY`
2. Website blocks scrapers
3. Rate limit reached

**Check logs:**
```
🌐 Running Web Orchestrator...
📋 Found 15 active web source(s)
   🔍 Processing: MBC Careers
      ❌ Failed: FireCrawl API error: 429
```

**Fix:** Wait for rate limit reset or upgrade plan

### No Casting Calls in Database

**Check the flow:**

1. **Sources added?**
   ```sql
   SELECT * FROM "IngestionSource" WHERE "isActive" = true;
   ```

2. **Workers running?**
   Check server logs for:
   ```
   🎬 Scraped Role Worker started
   🕵️‍♀️ Validation Worker started
   ```

3. **Queue processing?**
   ```
   Processing raw content from source: https://...
   🤖 Successfully extracted structured data
   ✅ Successfully created new casting call
   ```

4. **Check database:**
   ```sql
   SELECT * FROM "CastingCall" WHERE "isAggregated" = true;
   ```

---

## 📚 Files Reference

### Core Files
- `lib/digital-twin/background-service.ts` - Main service
- `lib/digital-twin/orchestrators/web-orchestrator.ts` - Web scraping
- `lib/digital-twin/orchestrators/instagram-orchestrator.ts` - Instagram scraping
- `lib/digital-twin/init.ts` - Initialization

### API Routes
- `app/api/digital-twin/status/route.ts` - Status & trigger
- `app/api/digital-twin/sources/route.ts` - Source management

### Scripts
- `scripts/add-saudi-sources.ts` - Bulk add sources

### Workers (Auto-start)
- `packages/core-queue/src/workers/scraped-role-worker.ts`
- `packages/core-queue/src/workers/validation-worker.ts`

---

## 🎯 Next Steps

1. **Provide Your 40+ Sources**
   - Just paste them in chat (any format works!)
   - I'll format and add them

2. **Get API Keys**
   - Apify (Instagram): https://apify.com
   - FireCrawl (Web): https://firecrawl.dev

3. **Test One Source**
   - Add one Instagram account
   - Check if it scrapes
   - Review in admin panel

4. **Add All Sources**
   - Bulk add all 40+ sources
   - Enable gradually
   - Monitor for 1 week

5. **Production**
   - Set up monitoring
   - Configure alerts
   - Fine-tune LLM prompts

---

**Ready? Just paste your Saudi sources list in chat!** 📝

Format doesn't matter - I'll handle it! 🚀

