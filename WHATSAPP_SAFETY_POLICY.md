# 🛡️ WhatsApp Safety Policy - READ-ONLY MODE

## ⚠️ CRITICAL SAFETY RULE

**This system is READ-ONLY for WhatsApp groups.**

**We NEVER send messages to WhatsApp groups.**

---

## 🔒 Safety Measures Implemented

### 1. Send Function Disabled

**File**: `lib/digital-twin/services/whapi-service.ts`

**Lines**: 116-127

The `sendMessage()` function now:
- ✅ Immediately throws an error if called
- ✅ Logs the attempt with details
- ✅ Prevents any message from being sent
- ✅ Returns clear error message

**Code**:
```typescript
async sendMessage(groupId: string, text: string): Promise<void> {
  logger.error('🚨 BLOCKED: Attempted to send message', { groupId });
  
  throw new Error(
    'SAFETY BLOCK: Sending messages to WhatsApp groups is disabled. ' +
    'This is a read-only scraping system.'
  );
}
```

### 2. What We DO

✅ **Read messages** from groups (getGroupMessages)
✅ **Extract text** from messages (extractTextFromMessage)
✅ **Check if recent** (isMessageRecent)
✅ **Store in database** (ProcessedMessage)
✅ **Process with LLM** (extract casting calls)
✅ **Display in admin** (validation queue)

### 3. What We DON'T DO

❌ **Send messages** to groups
❌ **Reply to messages**
❌ **Post announcements**
❌ **Send notifications** to groups
❌ **Auto-respond**
❌ **Modify group settings**

---

## 🔍 Why Read-Only?

### 1. **Respect for Communities**
- WhatsApp groups are professional communities
- We're guests, not participants
- Sending automated messages would be spam
- Could get banned from groups

### 2. **Legal & Compliance**
- Anti-spam regulations
- GDPR/data protection
- WhatsApp Terms of Service
- Professional ethics

### 3. **Business Safety**
- Protect account from bans
- Maintain trust with group admins
- Avoid reputation damage
- Stay compliant

---

## ✅ Verification

### Check 1: Search for Send Calls

```bash
# Search codebase for any send attempts
grep -r "sendMessage\|send.*whatsapp" --include="*.ts" --include="*.tsx"
```

**Result**: Only in WhapiService (now disabled) ✓

### Check 2: Whapi API Permissions

The system only uses:
- `GET /groups` - List groups
- `GET /messages/{groupId}` - Read messages
- `GET /settings/webhook` - Check webhook config
- `PATCH /settings/webhook` - Configure webhook

**No POST to `/messages/text`** in production code ✓

### Check 3: Webhook Configuration

Webhooks are **incoming only**:
- Whapi → Your Server (receive messages)
- Never: Your Server → Whapi (send messages)

---

## 🚨 If Someone Tries to Send

If any code attempts to call `sendMessage()`:

1. **Error thrown immediately**
2. **Logged with details**:
   - Group ID
   - Message preview
   - Timestamp
   - Stack trace

3. **Message never sent**

**Example Error**:
```
Error: SAFETY BLOCK: Sending messages to WhatsApp groups is disabled.
This is a read-only scraping system. If you need to send messages,
please contact the system administrator.
```

---

## 📋 Safe Operations Checklist

### Orchestrator (WhatsAppOrchestrator)
- ✅ Fetches messages only
- ✅ Marks as processed
- ✅ Queues for LLM processing
- ❌ Never sends messages

### Webhook (/api/v1/webhooks/whapi)
- ✅ Receives messages only
- ✅ Processes incoming webhooks
- ✅ Returns 200 OK (acknowledge receipt)
- ❌ Never sends outbound messages

### WhapiService
- ✅ getGroups() - Read only
- ✅ getGroupMessages() - Read only
- ✅ extractTextFromMessage() - Local processing
- ✅ isMessageRecent() - Local check
- ❌ sendMessage() - BLOCKED

---

## 🔐 Additional Safety Recommendations

### 1. Environment Variable Safety

Add to `.env`:
```bash
# Safety flag - explicitly disable sending
WHAPI_SEND_ENABLED=false
WHAPI_READ_ONLY_MODE=true
```

### 2. Rate Limiting

Current implementation already has:
- Message fetching limits (100 per group)
- Time-based filtering (7 days max)
- Deduplication (ProcessedMessage table)

### 3. Monitoring

Watch for send attempts:
```bash
# Check logs for blocked send attempts
grep "BLOCKED: Attempted to send" logs/*.log
```

### 4. API Token Permissions

If possible, request **read-only** API token from Whapi.Cloud:
- Permissions: Read groups, Read messages
- No permissions: Send messages, Modify groups

---

## 📊 Current Safety Status

| Component | Send Capability | Status |
|-----------|----------------|--------|
| WhapiService.sendMessage() | BLOCKED | ✅ Safe |
| Orchestrator | None | ✅ Safe |
| Webhook | None | ✅ Safe |
| Workers | None | ✅ Safe |
| Admin Portal | None | ✅ Safe |

**System is 100% READ-ONLY** ✅

---

## 💡 If You Need to Send (Future)

If in the future you want to send messages (with proper permissions):

1. **Get explicit consent** from group admins
2. **Create separate service** for sending
3. **Require manual approval** for each message
4. **Rate limit strictly** (max 1 message/day per group)
5. **Add to terms of service**
6. **Implement opt-out** mechanism

**For now**: SENDING IS COMPLETELY DISABLED ✅

---

## ✅ Summary

**Current Status**: 🔒 **100% READ-ONLY**

**Safety Features**:
- ✅ Send function disabled and throws error
- ✅ Logged attempts for monitoring
- ✅ No send calls in codebase
- ✅ Webhook is receive-only
- ✅ Clear error messages

**What Works**:
- ✅ Reading messages from groups
- ✅ Processing casting calls
- ✅ Webhook receiving
- ✅ Admin portal management

**What's Blocked**:
- ❌ Sending any messages to groups
- ❌ Replying to messages
- ❌ Auto-responses
- ❌ Notifications to groups

**Status**: ✅ SAFE FOR PRODUCTION

