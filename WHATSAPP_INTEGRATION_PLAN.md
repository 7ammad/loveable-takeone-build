# WhatsApp Integration - Full Implementation Plan
## From Setup to Production-Ready Casting Calls

**Status**: Phase 1 Complete ✅ | Ready for Phase 2  
**Timeline**: 2-3 days  
**Goal**: Automatically scrape WhatsApp groups → Extract casting calls → Publish to platform

---

## 📊 Current State

✅ **Completed:**
- Whapi.Cloud credentials configured
- 63 WhatsApp groups discovered
- 10 casting-related groups imported to database
- 75 non-performing sources (Instagram/Web) deleted

✅ **Active Sources:**
1. Actors & Actresses (3 groups)
2. 🎭 Talents & Auditions
3. Cast - فيلم الرجل الذي تعثر بكلماته
4. Cast | Jareesh Salam
5. تصوير نايس ون ٢٥
6. ممثلين | شرهبان
7. فيلم توف
8. The Actors Club - نادي الممثلين

---

## 🎯 Implementation Phases

### **PHASE 1: Infrastructure Setup** ✅ COMPLETE
**Duration**: 1 hour  
**Status**: DONE

- [x] Create Whapi.Cloud account
- [x] Connect WhatsApp number
- [x] List all groups
- [x] Import casting-related groups
- [x] Clean up non-WhatsApp sources

---

### **PHASE 2: Core Services** 🔄 IN PROGRESS
**Duration**: 3-4 hours  
**Goal**: Build the foundation for WhatsApp message fetching

#### 2.1 Create WhapiService
**File**: `lib/digital-twin/services/whapi-service.ts`

```typescript
/**
 * Wrapper for Whapi.Cloud API
 * Handles all communication with WhatsApp
 */
export class WhapiService {
  - getGroups(): List all groups
  - getGroupMessages(groupId, limit): Fetch messages
  - sendMessage(groupId, text): Send message (optional)
}
```

**Key Features:**
- Automatic token refresh
- Rate limiting (1000 requests/hour)
- Error handling
- Retry logic

#### 2.2 Create ProcessedMessage Tracker
**File**: `packages/core-db/prisma/schema.prisma`

```prisma
model ProcessedMessage {
  id                String   @id @default(cuid())
  whatsappMessageId String   @unique // WhatsApp message ID
  sourceId          String   // IngestionSource ID
  processedAt       DateTime @default(now())
  
  @@index([whatsappMessageId])
  @@index([sourceId])
}
```

**Purpose**: Prevent duplicate processing of the same message

#### 2.3 Test Message Fetching
**Script**: `scripts/test-whapi-fetch.ts`

Test fetching from one group to verify:
- API connection works
- Messages are retrieved
- Rate limiting is respected

---

### **PHASE 3: WhatsApp Orchestrator** 
**Duration**: 4-5 hours  
**Goal**: Build the orchestration engine that processes WhatsApp messages

#### 3.1 Create WhatsAppOrchestrator
**File**: `lib/digital-twin/orchestrators/whatsapp-orchestrator.ts`

```typescript
export class WhatsAppOrchestrator {
  async run() {
    1. Fetch all active WhatsApp sources
    2. For each group:
       - Fetch last 100 messages
       - Filter messages < 7 days old
       - Check if already processed
       - Extract text content
       - Queue for LLM processing
    3. Log summary stats
  }
}
```

**Key Logic:**
- Process messages chronologically
- Skip messages older than 7 days (avoid old content)
- Deduplicate using `ProcessedMessage` table
- Handle API rate limits gracefully

#### 3.2 Integrate with Background Service
**File**: `lib/digital-twin/background-service.ts`

Add WhatsApp to orchestration cycle:
```typescript
async runOrchestrationCycle() {
  // Run WhatsApp orchestrator
  const whatsappOrchestrator = new WhatsAppOrchestrator();
  await whatsappOrchestrator.run();
  
  // Keep existing web orchestrator as backup
  // (but it won't find much)
}
```

#### 3.3 Test Orchestration
Run a full cycle and verify:
- Messages are fetched
- Deduplication works
- Messages are queued for processing

---

### **PHASE 4: Message Processing Pipeline**
**Duration**: 2-3 hours  
**Goal**: Ensure WhatsApp messages flow through the existing pipeline

#### 4.1 Verify Pre-Filter Works
Test that WhatsApp messages pass through:
- `isPotentiallyCastingCall()` function
- Arabic keyword detection
- Rejection keyword filtering

#### 4.2 Verify LLM Extraction
Test that LLM correctly extracts from WhatsApp messages:
- Arabic text handling
- Role descriptions
- Contact information
- Deadlines

#### 4.3 Verify Validation Queue
Ensure extracted calls reach admin panel:
- Proper formatting
- All fields populated
- Source attribution (which group)

---

### **PHASE 5: Auto-Detection of New Groups** 
**Duration**: 2 hours  
**Goal**: Automatically add new casting-related groups when user joins them

#### 5.1 Create Auto-Sync Script
**File**: `scripts/sync-new-whatsapp-groups.ts`

```typescript
async function syncNewGroups() {
  1. Fetch all groups from Whapi
  2. Check which ones are new (not in database)
  3. Auto-detect if casting-related using keywords
  4. Auto-import if match found
  5. Notify admin of new groups
}
```

**Keywords to Watch:**
```typescript
const castingKeywords = [
  // English
  'cast', 'casting', 'actor', 'actress', 'talent', 'audition',
  'role', 'film', 'movie', 'series', 'commercial', 'ad',
  
  // Arabic
  'كاست', 'كاستنج', 'كاستينج', 'ممثل', 'ممثلة', 'ممثلين',
  'تمثيل', 'دور', 'أدوار', 'فيلم', 'مسلسل', 'إعلان',
  'تصوير', 'بطولة', 'فرص', 'تجارب أداء'
];
```

#### 5.2 Schedule Auto-Sync
Run daily via cron or manually:
```bash
# Check for new groups every 24 hours
pnpm tsx scripts/sync-new-whatsapp-groups.ts
```

---

### **PHASE 6: Webhook Integration** (OPTIONAL)
**Duration**: 3-4 hours  
**Goal**: Real-time message processing instead of polling

#### 6.1 Create Webhook Endpoint
**File**: `app/api/v1/webhooks/whatsapp/route.ts`

Already exists! Just needs:
- Verify webhook signature
- Parse WhatsApp message
- Queue immediately for processing

#### 6.2 Configure Whapi Webhook
In Whapi.Cloud dashboard:
- URL: `https://your-domain.com/api/v1/webhooks/whatsapp`
- Events: `messages.upsert`
- Secret: Generate random string

**Benefit**: Instant processing (<10 seconds from post to platform)

---

### **PHASE 7: Testing & Validation**
**Duration**: 4-6 hours  
**Goal**: Ensure end-to-end flow works perfectly

#### 7.1 Integration Tests
Test scenarios:
1. **Legitimate Casting Call** (Arabic)
   - Post in test group
   - Verify extraction
   - Verify validation queue

2. **Non-Casting Message** (Film announcement)
   - Verify pre-filter rejects
   - Verify not sent to LLM

3. **Empty/Short Message**
   - Verify skipped appropriately

4. **Duplicate Message**
   - Post same message twice
   - Verify only processed once

#### 7.2 Performance Tests
- Process 100 messages
- Measure processing time
- Verify no rate limit errors
- Check LLM cost

#### 7.3 Admin Panel Tests
- Verify casting calls appear
- Test approve/reject flow
- Verify published to platform

---

### **PHASE 8: Monitoring & Alerts**
**Duration**: 2-3 hours  
**Goal**: Know when things go wrong

#### 8.1 Create Monitoring Dashboard
**Page**: `/admin/digital-twin-status`

Display:
- WhatsApp connection status
- Messages processed today
- Casting calls extracted
- Error rate
- Last successful sync

#### 8.2 Add Health Checks
Monitor:
- Whapi.Cloud API availability
- Redis connection
- BullMQ workers running
- LLM API status

#### 8.3 Alert System
Send notifications when:
- No messages processed in 24 hours
- Error rate > 10%
- WhatsApp connection lost
- Redis queue backed up

---

### **PHASE 9: Production Launch**
**Duration**: 2 hours  
**Goal**: Go live with confidence

#### 9.1 Pre-Launch Checklist
- [ ] All 10 groups actively monitored
- [ ] Pre-filter tested with real messages
- [ ] LLM extraction accuracy > 80%
- [ ] Admin can approve/reject calls
- [ ] Casting calls appear on `/casting-calls`
- [ ] Monitoring dashboard live

#### 9.2 Launch Steps
1. Enable automatic orchestration (every 4 hours)
2. Monitor first 3 cycles closely
3. Adjust filters based on results
4. Scale up if successful

#### 9.3 Success Metrics (First Week)
- **Target**: 20-30 casting calls found
- **Quality**: <20% false positive rate
- **Speed**: <5 minutes from WhatsApp to validation queue
- **Coverage**: All 10 groups scraped successfully

---

## 🗓️ Detailed Timeline

### **Day 1: Core Infrastructure** (8 hours)
| Time | Phase | Deliverable |
|------|-------|-------------|
| 0-2h | Phase 2.1 | WhapiService complete |
| 2-3h | Phase 2.2 | ProcessedMessage model |
| 3-4h | Phase 2.3 | Test message fetching |
| 4-7h | Phase 3.1 | WhatsAppOrchestrator |
| 7-8h | Phase 3.2 | Integration with background service |

**End of Day 1**: Can fetch messages from WhatsApp groups ✅

---

### **Day 2: Pipeline & Processing** (8 hours)
| Time | Phase | Deliverable |
|------|-------|-------------|
| 0-2h | Phase 3.3 | Test full orchestration |
| 2-4h | Phase 4 | Verify processing pipeline |
| 4-6h | Phase 7.1 | Integration tests |
| 6-8h | Phase 8 | Monitoring dashboard |

**End of Day 2**: Messages flow through to validation queue ✅

---

### **Day 3: Launch & Optimize** (6 hours)
| Time | Phase | Deliverable |
|------|-------|-------------|
| 0-2h | Phase 5 | Auto-detection of new groups |
| 2-3h | Phase 7.2-7.3 | Performance & admin tests |
| 3-4h | Phase 9.1 | Pre-launch checklist |
| 4-6h | Phase 9.2 | Production launch |

**End of Day 3**: Live with 10 groups, finding real casting calls! ✅

---

## 📋 Implementation Checklist

### Infrastructure
- [x] Whapi.Cloud account created
- [x] WhatsApp number connected
- [x] Groups discovered and imported
- [x] Non-performing sources deleted

### Code Files to Create
- [ ] `lib/digital-twin/services/whapi-service.ts`
- [ ] `lib/digital-twin/orchestrators/whatsapp-orchestrator.ts`
- [ ] `scripts/test-whapi-fetch.ts`
- [ ] `scripts/sync-new-whatsapp-groups.ts`
- [ ] `app/api/v1/webhooks/whatsapp/route.ts` (update existing)
- [ ] `app/admin/digital-twin-status/page.tsx`

### Database Changes
- [ ] Add `ProcessedMessage` model to Prisma schema
- [ ] Run `pnpm prisma generate`
- [ ] Run `pnpm prisma db push`

### Configuration
- [ ] Add `WHAPI_CLOUD_TOKEN` to `.env` ✅
- [ ] Add `WHAPI_CLOUD_URL` to `.env` ✅
- [ ] Add `WHAPI_WEBHOOK_SECRET` to `.env`

### Testing
- [ ] Test fetching from 1 group
- [ ] Test pre-filter with WhatsApp messages
- [ ] Test LLM extraction with Arabic text
- [ ] Test end-to-end flow
- [ ] Test duplicate detection

### Launch
- [ ] Monitor first orchestration cycle
- [ ] Review first casting calls
- [ ] Adjust filters if needed
- [ ] Enable automatic scheduling

---

## 🚨 Important Notes

### Redis Limit Issue ⚠️
**Your Upstash Redis hit 500K requests**. You need to either:
1. Upgrade Upstash plan
2. Use a different Redis provider
3. Reduce BullMQ operations

**Temporary Fix**: Clear Redis data
```bash
# Connect to Redis and flush
redis-cli -u $REDIS_URL
FLUSHALL
```

### Rate Limits
- **Whapi.Cloud**: 1000 requests/hour
- **OpenAI GPT-4o-mini**: 10,000 requests/day
- **Upstash Redis**: 500K requests/month (REACHED!)

### Cost Estimates
- **Whapi.Cloud**: $49/month (Business plan)
- **OpenAI**: ~$5-10/month (assuming 500 casting calls)
- **Upstash Redis**: Need to upgrade (~$10/month)

**Total**: ~$65-70/month

---

## 🎯 Success Criteria

After full implementation, you should see:

### Week 1:
- ✅ 20-30 casting calls found
- ✅ <20% false positive rate
- ✅ Admin can review and approve
- ✅ Published calls appear on platform

### Month 1:
- ✅ 100+ casting calls published
- ✅ <10% false positive rate
- ✅ 5-10 new groups auto-detected
- ✅ Talent applying through platform

### Month 3:
- ✅ 300+ casting calls published
- ✅ Casters discovering platform
- ✅ Network effects kicking in
- ✅ WhatsApp groups → Primary source

---

## 🔧 Maintenance Plan

### Daily:
- Check monitoring dashboard
- Review rejected messages (false negatives?)
- Approve casting calls in validation queue

### Weekly:
- Run `sync-new-whatsapp-groups.ts`
- Review error logs
- Adjust filters if needed

### Monthly:
- Analyze false positive rate
- Optimize LLM prompt
- Review group performance (which groups are best?)
- Add/remove groups based on quality

---

## 🚀 Ready to Start?

**Current Status**: Phase 1 Complete ✅

**Next Step**: Create `WhapiService` and `WhatsAppOrchestrator`

Would you like me to:
1. **Start Phase 2** - Create WhapiService and orchestrator?
2. **Fix Redis first** - Clear Redis or upgrade plan?
3. **Review the plan** - Any changes needed?

Let me know and I'll proceed! 🎬

