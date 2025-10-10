# Digital Twin Orchestration Test Report

Date: 2025-10-09  
Test Type: Manual Trigger with New 3-Layer Filtering System

---

## 🎯 Test Objective

Test the new 3-layer filtering system (pre-filter + LLM + validation) with 75 active sources (18 casting agencies, 43 individual accounts, 14 web platforms).

---

## ✅ What Worked

### 1. **Orchestration Cycle Completed Successfully** (414 seconds)
- **Web sources**: 13/14 processed (1 DNS error - MBC Careers)
- **Instagram sources**: 10/61 processed in this run
- **Total posts queued**: 14 new posts

### 2. **Instagram Scraping Results**
| Source | Posts Found | New Posts | Status |
|--------|-------------|-----------|--------|
| Saudi Casting Agency | 7 | 3 | ✅ Queued |
| Telfaz11 Productions | 10 | 10 | ✅ Queued |
| That Studio | 10 | 1 | ✅ Queued |
| MBC Casting | 0 | 0 | ⚠️  No posts |
| Rotana Casting | 0 | 0 | ⚠️  No posts |
| GEA Casting | 0 | 0 | ⚠️  No posts |
| Omar Asfour | N/A | 0 | ❌ API timeout |
| Others | Already processed | 0 | ⏭️  Skipped |

---

## ❌ What Didn't Work

### **Critical Issue: Workers Not Processing Jobs**

**Symptom:** 14 posts were queued, but ZERO new casting calls were created in the validation queue.

**Root Cause:** `REDIS_URL` environment variable not loaded in standalone scripts.

**Evidence:**
```
Queue system initialization failed: Error: REDIS_URL is not set.
```

**Impact:** 
- Posts are stuck in Redis queue
- Workers can't connect to process them
- New filtering system (pre-filter + LLM) **hasn't been tested yet**

---

## 📊 Current State

### Active Sources (ALL 75 ACTIVE):
- ✅ 18 Casting Agencies (Gulf Casting, Mr.Casting, Persona17, etc.)
- ✅ 14 Web Platforms (Mixfame, Casting Arabia, etc.)
- ✅ 43 Individual Accounts (directors/producers - per user request)

### Validation Queue (20 OLD posts):
All from **BEFORE** the new filtering was implemented:
- Film titles: "القيد", "فلسطين 36", "الزرفة"
- Personal posts: "تحدي سعود", "حرق ابو سلو"
- Generic: "Instagram Post from telfaz11"
- Web posts: Mix of legitimate and false positives

**False Positive Rate (OLD system): ~90%**

### Scraped Roles Queue:
- **14 posts waiting** to be processed
- Workers can't connect (no REDIS_URL)
- **New filtering NOT tested yet**

---

## 🔍 Key Findings

### 1. **Instagram Agency Posts Are Low Volume**
- MBC Casting: 0 recent posts
- Rotana Casting: 0 recent posts  
- GEA Casting: 0 recent posts

**Insight:** Casting agencies don't post daily. They post sporadically (weekly/monthly).

### 2. **Production Companies Post More Frequently**
- Telfaz11: 10 new posts
- Saudi Casting: 3 new posts
- That Studio: 1 new post

**But:** Most are NOT casting calls - they're film announcements, trailers, behind-the-scenes.

### 3. **Pre-Filter and LLM Haven't Run Yet**
Because workers can't connect:
- We don't know if pre-filter would reject non-casting content
- We don't know if LLM strict validation would work
- We don't know the actual false positive rate with new system

---

## 🚧 Blockers

### 1. **Environment Variable Loading**
**Issue:** `.env` not loaded in standalone scripts  
**Affected Files:**
- `scripts/run-orchestration-direct.ts`
- `scripts/process-queue-jobs.ts`
- `scripts/check-queue-status.ts`

**Fix Required:** Add `dotenv` loading at script start

### 2. **Worker Process Management**
**Current:** Workers need to run as a separate long-running process  
**Alternative Needed:** Either:
- A. Run workers as part of dev server (already implemented in `background-service.ts`)
- B. Add `dotenv.config()` to standalone worker scripts

---

## 🎯 Next Steps

### Immediate (To Test Filtering):

1. **Fix Environment Loading**
   ```typescript
   // Add to top of worker scripts
   import 'dotenv/config';
   ```

2. **Run Workers with ENV**
   ```powershell
   # Option A: Start dev server (workers auto-start)
   pnpm dev
   
   # Option B: Standalone workers with dotenv
   pnpm tsx scripts/process-queue-jobs-with-env.ts
   ```

3. **Monitor Processing**
   - Watch for "⏭️  Skipped (not casting content)" = Pre-filter working
   - Watch for "⏭️  LLM rejected: [reason]" = LLM validation working
   - Watch for "✅ Created casting call: [title]" = Real calls found

4. **Check Results**
   ```powershell
   pnpm tsx scripts/check-validation-queue.ts
   ```

### Short-term (To Improve Results):

1. **Accept Reality: Agencies Don't Post Often**
   - MBC/Rotana/GEA may post 1-2 times per month
   - Need to scrape deeper history (last 30-50 posts, not just 10)
   
2. **Focus on Production Companies**
   - Telfaz11 posts frequently BUT most aren't calls
   - Need to analyze THEIR actual casting posts to refine keywords

3. **Deep Analysis of Agency Posts**
   - Manually check Gulf Casting, Mr.Casting, Persona17 Instagram
   - Extract real Arabic keywords from their actual casting calls
   - Refine pre-filter based on real agency language

### Long-term (Architectural):

1. **Scraping Frequency**
   - Agencies: Every 24-48 hours (low volume)
   - Production companies: Every 6-12 hours (higher volume)
   - Differentiate by source type

2. **Historical Backfill**
   - Scrape last 100 posts from each agency (one-time)
   - Build a corpus of real casting calls
   - Use for keyword extraction

3. **Alternative Sources**
   - Consider WhatsApp groups (if accessible)
   - Twitter/X accounts of casting directors
   - LinkedIn posts from agencies

---

## 💡 Critical Insight

**The filtering system (pre-filter + LLM) was never actually tested!**

We built it, deployed it, ran orchestration, but the workers couldn't process the queue due to missing `REDIS_URL`. The 14 queued posts are sitting there, unprocessed.

**We need to:**
1. Fix the env loading issue
2. Let the workers process those 14 posts
3. Then see if our filtering actually works

**Hypothesis:**  
If filtering works well, we expect:
- 10-12 posts rejected by pre-filter (film titles, no "مطلوب")
- 1-2 posts rejected by LLM (workshops, screenings)
- 0-2 posts pass to validation queue (actual casting calls)

**If we get 0 new posts:** Filtering is too strict, need to relax criteria.  
**If we get 10+ new posts:** Filtering is too loose, need to tighten.

---

## 📌 Recommendation

**Immediate action:**
1. Add `dotenv/config` to worker scripts
2. Start dev server (which initializes workers with proper env)
3. Monitor worker logs for 5 minutes
4. Check validation queue for new posts
5. Analyze results and adjust filtering

**Don't trigger another orchestration until we see the results of THIS one!**

---

## 🔗 Relevant Commands

```powershell
# Start dev server (workers auto-start)
cd C:\dev\builds\enter-tech
pnpm dev

# Check validation queue
pnpm tsx scripts/check-validation-queue.ts

# View active sources
pnpm tsx scripts/list-active-instagram-sources.ts

# Inspect recent posts
pnpm tsx scripts/inspect-recent-posts.ts
```

---

**Status:** ⏸️  Paused - Waiting for worker processing  
**Next Action:** Fix env loading and process queued jobs  
**Expected Completion:** 10 minutes after worker start

