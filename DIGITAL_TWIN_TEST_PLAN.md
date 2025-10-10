# Digital Twin Test Plan

## Executive Summary

The Digital Twin is an AI-powered system that automatically discovers casting opportunities from external sources (web, Instagram, WhatsApp) and creates structured casting calls for the platform. This document outlines a comprehensive test plan.

---

## System Architecture Overview

### Components:
1. **Background Service** - Runs every 4 hours automatically
2. **Orchestrators** - Web, Instagram, WhatsApp content fetchers
3. **BullMQ Workers** - Process scraped content asynchronously
4. **LLM Extraction** - OpenAI GPT-4 extracts structured data
5. **Validation Queue** - Admin review before publication
6. **Admin Dashboard** - Monitor and control the system

### Data Flow:
```
Source (Web/IG/WA) 
  → Scraper 
  → BullMQ Queue 
  → LLM Extraction 
  → Validation Queue 
  → Admin Review 
  → Public Casting Call
```

---

## Prerequisites

### Environment Setup:
- [ ] PostgreSQL database running
- [ ] Redis instance (required for BullMQ workers)
- [ ] OpenAI API key configured (`OPENAI_API_KEY`)
- [ ] Digital Twin enabled (`DIGITAL_TWIN_ENABLED=true`)
- [ ] Admin user account created

### Required Dependencies:
```bash
# Check these are installed
- bullmq
- openai
- cheerio (for web scraping)
- instagram-scraper (if used)
```

---

## Test Plan Phases

### Phase 1: Infrastructure Validation ✅
**Goal**: Verify all required services are running

#### Tests:
1. **Database Connection**
   - [ ] PostgreSQL is accessible
   - [ ] Prisma client can connect
   - [ ] `IngestionSource` table exists
   - [ ] `CastingCall` table exists

2. **Redis Connection**
   - [ ] Redis is running (localhost:6379 or REDIS_URL)
   - [ ] BullMQ can connect
   - [ ] Queues can be created (`scraped-roles`, `validation-queue`, `dlq`)

3. **OpenAI API**
   - [ ] API key is set
   - [ ] API is accessible
   - [ ] Quota is available

4. **Digital Twin Service**
   - [ ] Service initializes on server start
   - [ ] No error logs during initialization
   - [ ] Status endpoint returns data

**How to Test**:
```bash
# 1. Check if dev server started successfully
pnpm dev

# Look for in logs:
# "🤖 Starting Digital Twin Background Service..."
# "✅ Digital Twin service started (runs every 4 hours)"

# 2. Test status endpoint
curl http://localhost:3000/api/digital-twin/status
# Should return: { "data": { "isRunning": true, ... } }
```

**Success Criteria**:
- Dev server starts without errors
- Digital Twin initializes successfully
- Status endpoint returns `isRunning: true`

---

### Phase 2: Ingestion Sources Management 📝
**Goal**: Create and manage test sources

#### Tests:
1. **Create Web Source**
   - [ ] Create a simple static web source
   - [ ] Verify source is persisted in database
   - [ ] Source appears in admin dashboard

2. **Create Instagram Source**
   - [ ] Create Instagram profile source
   - [ ] Verify source is persisted
   - [ ] Source appears in admin dashboard

3. **List Sources**
   - [ ] GET endpoint returns all sources
   - [ ] Pagination works
   - [ ] Filtering by type works

4. **Update Source**
   - [ ] Can toggle isActive status
   - [ ] Can update source name
   - [ ] Changes persist

5. **Delete Source**
   - [ ] Can delete a source
   - [ ] Soft delete if references exist

**Test Data**:
```json
// Test Web Source
{
  "sourceType": "WEB",
  "sourceIdentifier": "https://example.com/test-casting-call",
  "sourceName": "Test Web Source",
  "isActive": true
}

// Test Instagram Source
{
  "sourceType": "INSTAGRAM",
  "sourceIdentifier": "@testcasting",
  "sourceName": "Test Instagram Source",
  "isActive": true
}
```

**API Endpoints to Test**:
- `POST /api/v1/admin/sources` - Create source
- `GET /api/v1/admin/sources` - List sources
- `PATCH /api/v1/admin/sources/{id}` - Update source
- `DELETE /api/v1/admin/sources/{id}` - Delete source

**Success Criteria**:
- All CRUD operations work
- Sources appear in admin dashboard
- Database reflects changes

---

### Phase 3: Manual Orchestration Trigger 🚀
**Goal**: Test the orchestration process manually

#### Tests:
1. **Trigger Orchestration**
   - [ ] POST to status endpoint triggers orchestration
   - [ ] Service logs show orchestration started
   - [ ] Status updates to "Running"

2. **Monitor Progress**
   - [ ] Check BullMQ queue status
   - [ ] Watch server logs for scraping activity
   - [ ] Verify jobs are being processed

3. **Error Handling**
   - [ ] Invalid sources are caught
   - [ ] Failed jobs go to DLQ (dead letter queue)
   - [ ] Service continues despite individual failures

**How to Test**:
```bash
# 1. Trigger manual orchestration
curl -X POST http://localhost:3000/api/digital-twin/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 2. Watch logs
# Look for:
# "🌐 Starting web orchestration..."
# "📷 Starting Instagram orchestration..."
# "🤖 Processing scraped content"
# "✅ Extracted structured data"

# 3. Check queue status (if BullMQ dashboard available)
# Or check Redis keys
redis-cli KEYS "bull:*"
```

**Success Criteria**:
- Orchestration triggers without errors
- Logs show processing activity
- Jobs appear in BullMQ queues
- No crashes or unhandled exceptions

---

### Phase 4: LLM Extraction Testing 🤖
**Goal**: Verify AI can extract casting call data

#### Tests:
1. **Valid Casting Call Content**
   - [ ] LLM extracts title correctly
   - [ ] Role description is captured
   - [ ] Requirements are extracted
   - [ ] Location is identified (if present)
   - [ ] Dates are parsed (if present)

2. **Invalid/Non-Casting Content**
   - [ ] LLM identifies content is not a casting call
   - [ ] Job is marked as failed or filtered out
   - [ ] No invalid data enters validation queue

3. **Edge Cases**
   - [ ] Arabic content is handled
   - [ ] Mixed language content works
   - [ ] Incomplete data is handled gracefully
   - [ ] Very long content doesn't break extraction

**Test Content Examples**:
```markdown
# Good Content
"MBC is looking for male actor, 25-35 years old, for new drama series.
Location: Riyadh. Experience required. Send CV to casting@mbc.net"

# Bad Content
"Check out our new restaurant! Best food in Riyadh!"

# Edge Case
"ممثل ذكر مطلوب للعمل في مسلسل درامي جديد - العمر 25-35 سنة"
```

**Success Criteria**:
- Valid casting calls are extracted accurately (>80% accuracy)
- Non-casting content is filtered out
- No crashes on malformed content
- Arabic content is processed correctly

---

### Phase 5: Validation Queue Testing ✅
**Goal**: Test admin review workflow

#### Tests:
1. **Queue Population**
   - [ ] Extracted casting calls appear in queue
   - [ ] Correct status ("pending")
   - [ ] All required fields are present
   - [ ] Source information is attached

2. **Approval Workflow**
   - [ ] Admin can approve a casting call
   - [ ] Status changes to "open"
   - [ ] Casting call becomes publicly visible
   - [ ] Approval timestamp is recorded

3. **Edit Before Approval**
   - [ ] Admin can edit casting call details
   - [ ] Changes are persisted
   - [ ] Can then approve after editing
   - [ ] Original source link is preserved

4. **Rejection Workflow**
   - [ ] Admin can reject a casting call
   - [ ] Status changes to "rejected"
   - [ ] Call is not publicly visible
   - [ ] Reason for rejection can be recorded

**API Endpoints to Test**:
- `GET /api/v1/admin/digital-twin/validation-queue` - List pending calls
- `POST /api/v1/admin/casting-calls/{id}/approve` - Approve call
- `PATCH /api/v1/admin/digital-twin/validation/{id}/edit` - Edit call
- `POST /api/v1/admin/casting-calls/{id}/reject` - Reject call

**Success Criteria**:
- All workflow actions work correctly
- Status changes persist to database
- Public visibility matches approval status
- No data loss during edits

---

### Phase 6: End-to-End Testing 🔄
**Goal**: Complete flow from source to public listing

#### Test Scenario:
1. Create a test web page with a casting call
2. Add it as an ingestion source
3. Trigger orchestration
4. Wait for it to appear in validation queue
5. Review and approve
6. Verify it's visible on public `/casting-calls` page
7. Verify talent users can apply

#### Steps:
1. **Setup**
   - [ ] Create test HTML page with casting call
   - [ ] Host it (use ngrok or similar for localhost)
   - [ ] Add as source via admin API

2. **Ingestion**
   - [ ] Trigger orchestration
   - [ ] Monitor logs for 30-60 seconds
   - [ ] Check validation queue

3. **Review**
   - [ ] Navigate to `/admin/validation-queue`
   - [ ] Verify casting call data looks correct
   - [ ] Edit if needed
   - [ ] Approve

4. **Public Verification**
   - [ ] Log out or use incognito mode
   - [ ] Go to `/casting-calls`
   - [ ] Verify casting call is visible
   - [ ] Click to view details
   - [ ] Verify "Apply" button works

**Success Criteria**:
- Complete flow works without manual intervention
- Data integrity maintained throughout
- Public listing matches approved data
- Apply functionality works

---

### Phase 7: Performance & Scale Testing 📊
**Goal**: Verify system handles realistic load

#### Tests:
1. **Multiple Sources**
   - [ ] Add 10+ sources
   - [ ] Trigger orchestration
   - [ ] All sources processed within reasonable time (<5 min)

2. **Concurrent Processing**
   - [ ] BullMQ workers process jobs concurrently
   - [ ] No deadlocks or race conditions
   - [ ] Database handles concurrent writes

3. **Large Content**
   - [ ] Test with very long web pages (>50KB)
   - [ ] Test with 100+ Instagram posts
   - [ ] System handles without memory issues

4. **Rate Limiting**
   - [ ] Verify OpenAI rate limits are respected
   - [ ] Failed jobs retry appropriately
   - [ ] No excessive API charges

**Success Criteria**:
- 10 sources processed in < 5 minutes
- No memory leaks or crashes
- API costs remain reasonable
- Error recovery works

---

### Phase 8: Monitoring & Alerting 📈
**Goal**: Ensure system is observable

#### Tests:
1. **Admin Dashboard**
   - [ ] Shows current status (running/stopped)
   - [ ] Displays source statistics
   - [ ] Shows pending items count
   - [ ] Recent activity log is accurate

2. **Logs**
   - [ ] Important events are logged
   - [ ] Error logs include context
   - [ ] Log levels are appropriate
   - [ ] Logs are searchable

3. **Error Tracking**
   - [ ] Failed jobs go to DLQ
   - [ ] Admin can view failed jobs
   - [ ] Can retry failed jobs
   - [ ] Can diagnose failure reasons

**Success Criteria**:
- Dashboard reflects real-time status
- Logs provide enough debugging info
- Failed jobs are traceable
- System health is visible at a glance

---

## Test Execution Order

### Quick Test (30 minutes):
1. Phase 1: Infrastructure (5 min)
2. Phase 2: Create 2 test sources (5 min)
3. Phase 3: Trigger orchestration (5 min)
4. Phase 5: Check validation queue (5 min)
5. Phase 5: Approve one casting call (5 min)
6. Phase 6: Verify public listing (5 min)

### Comprehensive Test (2-3 hours):
Execute all phases in order

### Regression Test (1 hour):
Run Phases 1, 2, 3, 5, 6 to verify nothing broke

---

## Known Issues & Workarounds

### Issue: Redis not available
**Symptom**: Workers fail to start, logs show connection errors
**Workaround**: 
- Install Redis locally: `brew install redis` (Mac) or use Docker
- Or use cloud Redis (Upstash, Redis Labs)

### Issue: OpenAI API quota exceeded
**Symptom**: LLM extraction fails with 429 errors
**Workaround**:
- Reduce number of sources being tested
- Use smaller test content
- Wait for quota reset

### Issue: Instagram scraping blocked
**Symptom**: Instagram orchestrator fails to fetch content
**Workaround**:
- Instagram has strict anti-scraping measures
- May need official API or third-party service
- For testing, use web sources instead

---

## Success Metrics

### Functional Success:
- ✅ All 8 test phases pass
- ✅ No critical errors in logs
- ✅ End-to-end flow completes

### Quality Metrics:
- **Extraction Accuracy**: >80% of valid casting calls extracted correctly
- **False Positives**: <10% of non-casting content makes it to validation queue
- **Processing Time**: <2 minutes per source
- **Uptime**: Service runs continuously without crashes

### Business Metrics:
- **Cost per Casting Call**: <$0.50 in API costs
- **Admin Review Time**: <5 minutes per casting call
- **Public Listing Time**: <1 hour from source publish to public visibility

---

## Next Steps After Testing

### If All Tests Pass:
1. ✅ Add real production sources (MBC, Rotana, etc.)
2. ✅ Set up monitoring/alerting
3. ✅ Schedule regular admin reviews
4. ✅ Monitor costs and adjust accordingly

### If Tests Fail:
1. 🔍 Identify which phase failed
2. 📝 Document the failure
3. 🐛 Debug using logs and error messages
4. 🔧 Fix the issue
5. ♻️ Re-run tests from that phase

---

## Automated Test Script

For convenience, use the automated test script:

```bash
# Set your admin token
export ADMIN_TOKEN="your-jwt-token"

# Run the test
node scripts/test-digital-twin.mjs
```

This script automates Phases 2, 3, 5, and 6.

---

## Appendix: Manual Test Commands

### Check if Digital Twin is Running:
```bash
curl http://localhost:3000/api/digital-twin/status | jq
```

### Create a Source:
```bash
curl -X POST http://localhost:3000/api/v1/admin/sources \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType": "WEB",
    "sourceIdentifier": "https://example.com/casting",
    "sourceName": "Test Source",
    "isActive": true
  }'
```

### Trigger Orchestration:
```bash
curl -X POST http://localhost:3000/api/digital-twin/status \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Check Validation Queue:
```bash
curl http://localhost:3000/api/v1/admin/digital-twin/validation-queue \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

### Approve a Casting Call:
```bash
curl -X POST http://localhost:3000/api/v1/admin/casting-calls/{ID}/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

**Ready to Start Testing?** Begin with Phase 1 and work through systematically.

