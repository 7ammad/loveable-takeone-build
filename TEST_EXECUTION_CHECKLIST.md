# Digital Twin Test Execution Checklist

Use this checklist to track your testing progress. Check off each item as you complete it.

---

## 🎯 Test Objective
Verify that the Digital Twin can automatically discover casting opportunities from external sources, extract structured data using AI, and publish them to the platform after admin review.

---

## 📋 Phase 1: Infrastructure Validation

### Database
- [ ] PostgreSQL is running
- [ ] Can connect to DATABASE_URL
- [ ] Run: `curl http://localhost:3000/api/v1/casting-calls` (should return data or empty array)
- [ ] Tables exist: `IngestionSource`, `CastingCall`

### Redis
- [ ] Redis is installed and running
- [ ] Test connection: `redis-cli ping` (should return "PONG")
- [ ] Or verify REDIS_URL is set for cloud Redis

### OpenAI
- [ ] OPENAI_API_KEY is set in `.env.local`
- [ ] API key is valid (check on platform.openai.com)
- [ ] Account has available quota

### Digital Twin Service
- [ ] Dev server started successfully
- [ ] Check logs for: "🤖 Starting Digital Twin Background Service..."
- [ ] Check logs for: "✅ Digital Twin service started"
- [ ] Test status: `curl http://localhost:3000/api/digital-twin/status`
- [ ] Response shows `"isRunning": true`

**Phase 1 Result**: ✅ PASS / ❌ FAIL

---

## 📝 Phase 2: Ingestion Sources Management

### Create Sources
- [ ] Create web source via API or admin UI
- [ ] Create Instagram source
- [ ] Verify sources appear in database
- [ ] Verify sources appear in admin dashboard (`/admin`)

### List Sources
- [ ] GET `/api/v1/admin/sources` returns created sources
- [ ] Pagination works (if implemented)
- [ ] Can filter by sourceType

### Update Sources
- [ ] Can edit source name
- [ ] Can toggle `isActive` status
- [ ] Changes persist to database

### Delete Sources
- [ ] Can delete a source (if no references)
- [ ] Deleted source doesn't appear in list

**Test Commands**:
```bash
# Create source
curl -X POST http://localhost:3000/api/v1/admin/sources \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sourceType":"WEB","sourceIdentifier":"https://example.com","sourceName":"Test","isActive":true}'

# List sources
curl http://localhost:3000/api/v1/admin/sources \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Phase 2 Result**: ✅ PASS / ❌ FAIL

---

## 🚀 Phase 3: Manual Orchestration Trigger

### Trigger Orchestration
- [ ] POST to `/api/digital-twin/status` triggers orchestration
- [ ] Response confirms trigger was successful
- [ ] Status shows "Running" or updated timestamp

### Monitor Logs
- [ ] Watch server logs for next 60 seconds
- [ ] See: "🌐 Starting web orchestration..."
- [ ] See: "📷 Starting Instagram orchestration..."
- [ ] See: "🤖 Processing scraped content"
- [ ] See: "✅ Extracted structured data" (if valid content found)

### Error Handling
- [ ] Invalid URLs are caught gracefully
- [ ] Errors are logged but don't crash the service
- [ ] Failed jobs appear in logs

**Test Command**:
```bash
curl -X POST http://localhost:3000/api/digital-twin/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Phase 3 Result**: ✅ PASS / ❌ FAIL

---

## 🤖 Phase 4: LLM Extraction Testing

### Valid Content Extraction
- [ ] LLM extracts casting call title
- [ ] Role description is captured
- [ ] Requirements are extracted
- [ ] Location identified (if present)
- [ ] Data structure is correct

### Invalid Content Filtering
- [ ] Non-casting content is filtered out
- [ ] No invalid data enters validation queue
- [ ] LLM correctly identifies non-relevant content

### Check Logs
- [ ] LLM extraction logs show processing
- [ ] No OpenAI API errors
- [ ] Extraction time is reasonable (<10 seconds per job)

**Phase 4 Result**: ✅ PASS / ❌ FAIL

---

## ✅ Phase 5: Validation Queue Testing

### Queue Population
- [ ] Navigate to `/admin/validation-queue`
- [ ] Extracted casting calls appear in queue
- [ ] Status is "pending"
- [ ] All required fields are present (title, description, etc.)
- [ ] Source information is attached

### Approve Workflow
- [ ] Click "Approve" on a casting call
- [ ] Confirmation message appears
- [ ] Call status changes to "open"
- [ ] Call disappears from pending queue

### Edit Workflow
- [ ] Click "Edit" on a casting call
- [ ] Can modify title, description, requirements
- [ ] Save changes
- [ ] Changes persist
- [ ] Can approve after editing

### Reject Workflow
- [ ] Click "Reject" on a casting call
- [ ] Confirmation dialog appears
- [ ] Call status changes to "rejected"
- [ ] Call disappears from pending queue

**Test Commands**:
```bash
# Get validation queue
curl http://localhost:3000/api/v1/admin/digital-twin/validation-queue \
  -H "Authorization: Bearer YOUR_TOKEN"

# Approve casting call
curl -X POST http://localhost:3000/api/v1/admin/casting-calls/{ID}/approve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Phase 5 Result**: ✅ PASS / ❌ FAIL

---

## 🔄 Phase 6: End-to-End Testing

### Complete Flow
- [ ] Start with a test source (create if not exists)
- [ ] Trigger orchestration
- [ ] Wait 60 seconds
- [ ] Check validation queue (call should appear)
- [ ] Approve the casting call
- [ ] Navigate to `/casting-calls` (public page)
- [ ] Approved call is visible
- [ ] Click on the call to view details
- [ ] Details page loads correctly
- [ ] "Apply" button works

### Data Integrity
- [ ] Title matches approved data
- [ ] Description is intact
- [ ] Requirements are displayed correctly
- [ ] Source attribution is present (if shown)
- [ ] Dates are formatted correctly (if present)

### Talent User Flow
- [ ] Log in as a talent user
- [ ] Browse casting calls
- [ ] Click "Apply" on the digital twin generated call
- [ ] Application form loads
- [ ] Can submit application successfully

**Phase 6 Result**: ✅ PASS / ❌ FAIL

---

## 📊 Phase 7: Performance Testing

### Multiple Sources
- [ ] Create 5-10 test sources
- [ ] Trigger orchestration
- [ ] All sources processed within 5 minutes
- [ ] No timeout errors
- [ ] No memory issues

### Concurrent Processing
- [ ] Multiple jobs processed simultaneously
- [ ] No race conditions in database
- [ ] BullMQ workers show concurrency

### Large Content
- [ ] Test with a very long web page (>50KB)
- [ ] Test with multiple Instagram posts
- [ ] System handles without crashing
- [ ] Memory usage remains stable

### Rate Limiting
- [ ] OpenAI API calls respect rate limits
- [ ] Failed jobs retry appropriately
- [ ] Costs remain within budget (<$1 for test)

**Phase 7 Result**: ✅ PASS / ❌ FAIL

---

## 📈 Phase 8: Monitoring & Alerting

### Admin Dashboard
- [ ] Navigate to `/admin`
- [ ] Status widget shows correct state (Running/Stopped)
- [ ] Source statistics are accurate
- [ ] Pending items count is correct
- [ ] Recent activity log shows latest events
- [ ] Can manually trigger orchestration from dashboard

### Logging
- [ ] Important events are logged
- [ ] Error logs include stack traces
- [ ] Log levels are appropriate (info, warn, error)
- [ ] Logs are searchable/readable

### Dead Letter Queue (DLQ)
- [ ] Failed jobs appear in DLQ
- [ ] Can view failed job details
- [ ] Can retry failed jobs (if implemented)
- [ ] Failure reasons are clear

**Phase 8 Result**: ✅ PASS / ❌ FAIL

---

## 📊 Final Summary

### Pass/Fail Status
- Phase 1 (Infrastructure): ___________
- Phase 2 (Sources): ___________
- Phase 3 (Orchestration): ___________
- Phase 4 (LLM Extraction): ___________
- Phase 5 (Validation Queue): ___________
- Phase 6 (End-to-End): ___________
- Phase 7 (Performance): ___________
- Phase 8 (Monitoring): ___________

**Overall Result**: ✅ PASS / ⚠️ PARTIAL / ❌ FAIL

### Issues Found
```
1. 
2. 
3. 
```

### Recommendations
```
1. 
2. 
3. 
```

---

## 🎬 Ready for Production?

Before going live, ensure:
- [ ] All 8 phases PASS
- [ ] Critical issues are resolved
- [ ] Real production sources are added
- [ ] OpenAI costs are acceptable
- [ ] Admin team is trained on validation queue
- [ ] Monitoring is set up
- [ ] Backup/recovery plan exists

**Production Readiness**: ✅ YES / ❌ NO / ⚠️ PARTIAL

---

**Tested by**: _______________
**Date**: _______________
**Duration**: _______________ minutes

