# 🎣 WhatsApp Webhook Setup Guide

This guide will help you set up real-time WhatsApp message processing using Whapi.Cloud webhooks.

## 📊 Benefits

| Feature | Polling (Every 4 hours) | Webhook (Real-time) |
|---------|------------------------|---------------------|
| **Latency** | Up to 4 hours | < 30 seconds ⚡ |
| **API Calls** | ~600/day | 0/day (saves costs!) 💰 |
| **Server Load** | Batch spikes | Distributed 📊 |
| **User Experience** | Delayed | Instant ✨ |

## 🚀 Quick Setup (5 minutes)

### Step 1: Add Environment Variables

Add these to your `.env` file:

```bash
# Your production webhook URL (replace with your actual domain)
WHAPI_WEBHOOK_URL=https://your-domain.com/api/v1/webhooks/whapi

# Webhook secret for signature verification (generate with command below)
WHAPI_WEBHOOK_SECRET=your-secret-key-here

# Optional: Verify token for webhook validation
WHAPI_WEBHOOK_VERIFY_TOKEN=your-verify-token
```

**Generate a secure webhook secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Deploy Webhook Endpoint

The webhook endpoint is already created at:
```
app/api/v1/webhooks/whapi/route.ts
```

**Deploy your application** to make the webhook accessible:
```bash
# For Vercel
vercel --prod

# For other platforms, deploy normally
```

### Step 3: Configure Whapi.Cloud

Run the configuration script:
```bash
npx tsx scripts/configure-whapi-webhook.ts
```

This will:
- ✅ Check current webhook configuration
- ✅ Set your webhook URL
- ✅ Configure event subscriptions
- ✅ Verify the setup

### Step 4: Test the Webhook

1. Send a casting call message to one of your WhatsApp groups
2. Check application logs: `npx vercel logs` (or your platform's logs)
3. Verify the message appears in validation queue: `/admin/validation-queue`

## 🔒 Security Best Practices

### 1. Webhook Signature Verification

The webhook endpoint verifies signatures to prevent unauthorized requests:

```typescript
// Automatic verification when WHAPI_WEBHOOK_SECRET is set
const signature = req.headers.get('x-webhook-signature');
const isValid = verifyWebhookSignature(rawBody, signature, secret);
```

**Always use WHAPI_WEBHOOK_SECRET in production!**

### 2. HTTPS Only

Webhooks should only be served over HTTPS. Most platforms (Vercel, Railway, etc.) provide this automatically.

### 3. Rate Limiting

Consider adding rate limiting to your webhook endpoint:

```typescript
// Example with @upstash/ratelimit
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
});
```

## 📡 Webhook Event Flow

```
WhatsApp Message Sent
  ↓
Whapi.Cloud detects message
  ↓
POST /api/v1/webhooks/whapi
  ├── Verify signature ✓
  ├── Check if group message ✓
  ├── Check if already processed ✓
  ├── Extract text content ✓
  └── Queue to scraped-roles ✓
  ↓
Worker processes message
  ├── Pre-filter (isPotentiallyCastingCall)
  ├── LLM extraction
  └── Validation queue
  ↓
Appears in /admin/validation-queue
  ↓
Admin approves
  ↓
Published to /casting-calls
```

## 🧪 Testing

### Test Webhook Locally (ngrok)

For local development:

```bash
# 1. Start your local server
npm run dev

# 2. Expose with ngrok
npx ngrok http 3000

# 3. Update .env with ngrok URL
WHAPI_WEBHOOK_URL=https://abc123.ngrok.io/api/v1/webhooks/whapi

# 4. Configure webhook
npx tsx scripts/configure-whapi-webhook.ts

# 5. Send a test message to your WhatsApp group
```

### Test Webhook in Production

```bash
# 1. Check webhook health
curl https://your-domain.com/api/v1/webhooks/whapi

# 2. Send a test message to your group

# 3. Check logs
npx vercel logs --follow

# 4. Verify in admin panel
# Visit: https://your-domain.com/admin/validation-queue
```

## 🛠️ Troubleshooting

### Webhook Not Receiving Messages

**Check 1: Verify webhook is configured**
```bash
curl -H "Authorization: Bearer $WHAPI_CLOUD_TOKEN" \
  https://gate.whapi.cloud/settings/webhook
```

**Check 2: Verify webhook is accessible**
```bash
curl https://your-domain.com/api/v1/webhooks/whapi
```

**Check 3: Check Whapi.Cloud webhook logs**
Visit: https://panel.whapi.cloud → Your Instance → Webhooks

**Check 4: Verify group is active**
```bash
npx tsx scripts/check-ingestion-sources.ts
```

### Messages Not Being Processed

**Check 1: Verify message is being queued**
```bash
# Check application logs for "Message queued for processing"
npx vercel logs --follow | grep "queued"
```

**Check 2: Check queue status**
```bash
npx tsx scripts/check-pipeline-health.ts
```

**Check 3: Check worker logs**
```bash
# Look for pre-filter or LLM extraction logs
npx vercel logs --follow | grep "scraped-roles"
```

### Duplicate Messages

If you see duplicate processing:

1. **Check ProcessedMessage table**
   ```sql
   SELECT * FROM "ProcessedMessage" 
   WHERE "whatsappMessageId" = 'your-message-id';
   ```

2. **Verify deduplication logic**
   - Line 149 in webhook endpoint checks for existing processed messages

3. **Clear duplicate records** (if needed)
   ```sql
   DELETE FROM "ProcessedMessage" 
   WHERE "whatsappMessageId" = 'duplicate-message-id';
   ```

## 🔄 Fallback to Polling

If webhooks fail, the system automatically falls back to 4-hour polling:

```typescript
// lib/digital-twin/background-service.ts
// Polling runs every 4 hours as backup
const ORCHESTRATION_INTERVAL = 4 * 60 * 60 * 1000;
```

You can disable polling once webhooks are stable:

```typescript
// Comment out the polling interval
// orchestrationInterval = setInterval(async () => {
//   await this.runOrchestrationCycle();
// }, ORCHESTRATION_INTERVAL);
```

## 📈 Monitoring

### Key Metrics to Watch

1. **Webhook Response Time**: Should be < 500ms
2. **Queue Processing Time**: Pre-filter to validation queue < 60s
3. **Error Rate**: Should be < 1%
4. **Duplicate Rate**: Should be 0%

### Health Check Script

```bash
# Run health check
npx tsx scripts/check-pipeline-health.ts

# Expected output:
# ✅ All systems healthy
# 📊 Queue Status: 0 waiting, 0 active
# 🗄️  Database: 5 pending, 20 open calls
```

## 🎯 Production Checklist

Before going live with webhooks:

- [ ] `WHAPI_WEBHOOK_URL` set to production domain
- [ ] `WHAPI_WEBHOOK_SECRET` generated and configured
- [ ] Webhook endpoint deployed and accessible via HTTPS
- [ ] Webhook configured on Whapi.Cloud
- [ ] Test message successfully processed
- [ ] Signature verification enabled
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Rate limiting configured
- [ ] Backup polling still enabled (as fallback)
- [ ] Documentation updated for team

## 💡 Tips

1. **Keep polling as backup**: Don't disable the 4-hour polling immediately. Let webhooks run for a week first.

2. **Monitor closely**: Watch logs for the first 24 hours after webhook deployment.

3. **Test thoroughly**: Send various message types (text, images with captions, etc.)

4. **Document downtime**: If webhooks go down, polling ensures no messages are missed.

5. **Rate limit wisely**: Set reasonable limits to prevent abuse while allowing normal traffic.

## 🆘 Support

If you encounter issues:

1. Check webhook logs: `/admin/validation-queue`
2. Run health check: `npx tsx scripts/check-pipeline-health.ts`
3. Check Whapi.Cloud dashboard: https://panel.whapi.cloud
4. Review application logs
5. Test with sample message

## 🎉 Success!

Once configured, your casting call detection will be **near-instant**:
- Message sent → Detected in < 30 seconds
- Admin can approve within seconds
- Published to /casting-calls immediately

**No additional API costs, just better performance!** 🚀

