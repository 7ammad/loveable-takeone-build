# 🚀 Webhook Deployment Guide

Complete guide for deploying the WhatsApp webhook to production.

## 📋 Prerequisites

- [ ] Application deployed to production (Vercel, Railway, etc.)
- [ ] Production domain configured (e.g., `takeone.app`)
- [ ] Whapi.Cloud account with active instance
- [ ] Database accessible from production

## 🔧 Deployment Steps

### Step 1: Generate Webhook Secret

```bash
# Generate a secure 256-bit secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output. You'll need it for the next step.

### Step 2: Add Environment Variables

Add these to your production environment:

**For Vercel:**
```bash
vercel env add WHAPI_WEBHOOK_URL production
# Enter: https://your-domain.vercel.app/api/v1/webhooks/whapi

vercel env add WHAPI_WEBHOOK_SECRET production
# Paste the secret from Step 1

vercel env add WHAPI_WEBHOOK_VERIFY_TOKEN production
# Optional: any string you choose
```

**For Railway:**
```bash
# Go to your Railway project
# Variables tab → Add Variable
WHAPI_WEBHOOK_URL=https://your-domain.railway.app/api/v1/webhooks/whapi
WHAPI_WEBHOOK_SECRET=<your-secret-from-step-1>
WHAPI_WEBHOOK_VERIFY_TOKEN=<optional-token>
```

**For other platforms:**
Add via your platform's environment variable UI.

### Step 3: Deploy Updated Code

```bash
# Commit webhook files
git add app/api/v1/webhooks/whapi/route.ts
git add scripts/configure-whapi-webhook.ts
git add WEBHOOK_SETUP_GUIDE.md
git add webhook.env.example
git commit -m "feat: add WhatsApp webhook for real-time processing"

# Push to production
git push origin main

# Or deploy with Vercel
vercel --prod
```

### Step 4: Verify Webhook Endpoint

Test that your webhook is publicly accessible:

```bash
# Should return health status
curl https://your-domain.vercel.app/api/v1/webhooks/whapi

# Expected response:
# {"status":"healthy","endpoint":"whapi-webhook","timestamp":"2024-..."}
```

### Step 5: Configure Whapi.Cloud

Update your local `.env` with production values:

```bash
# .env
WHAPI_WEBHOOK_URL=https://your-domain.vercel.app/api/v1/webhooks/whapi
WHAPI_WEBHOOK_SECRET=<your-secret>
```

Run the configuration script:

```bash
npx tsx scripts/configure-whapi-webhook.ts
```

Expected output:
```
✅ Webhook configured successfully!
✅ Webhook endpoint is accessible
✅ Webhook verification complete
```

### Step 6: Test with Real Message

1. Send a casting call message to one of your active WhatsApp groups
2. Check production logs:
   ```bash
   vercel logs --follow
   ```
3. Look for: `"📱 Webhook received"` and `"✅ Message queued"`
4. Visit admin panel: `https://your-domain.vercel.app/admin/validation-queue`

### Step 7: Monitor Performance

Run the health check:

```bash
# Point to production database
npx tsx scripts/check-pipeline-health.ts
```

Expected output:
```
🏥 Pipeline Health Report
✅ All systems healthy
📊 Queue Status: 0 waiting, 0 active
```

## 🔍 Verification Checklist

After deployment, verify:

- [ ] Webhook endpoint returns 200 on GET request
- [ ] Test message sent to group is received
- [ ] Message appears in logs within 30 seconds
- [ ] Message appears in validation queue
- [ ] Signature verification is working (no 401 errors)
- [ ] Old messages are being skipped
- [ ] Non-group messages are being ignored
- [ ] Duplicate messages are being filtered

## 🐛 Troubleshooting

### Webhook Returns 404

**Cause:** Endpoint not deployed or route mismatch

**Fix:**
```bash
# Verify file exists
ls app/api/v1/webhooks/whapi/route.ts

# Redeploy
vercel --prod
```

### Webhook Returns 401 (Unauthorized)

**Cause:** Signature verification failing

**Fix:**
1. Check `WHAPI_WEBHOOK_SECRET` matches in both .env and production
2. Verify Whapi is sending signature header
3. Temporarily disable verification for testing:
   ```typescript
   // In route.ts, comment out signature check
   // if (webhookSecret) { ... }
   ```

### Messages Not Being Processed

**Cause:** Group not in active sources

**Fix:**
```bash
# Check active sources
npx tsx scripts/check-ingestion-sources.ts

# Ensure your group is listed with isActive: true
```

### Signature Mismatch

**Cause:** Different secrets in different environments

**Fix:**
```bash
# Check production secret
vercel env ls

# Update if needed
vercel env rm WHAPI_WEBHOOK_SECRET production
vercel env add WHAPI_WEBHOOK_SECRET production
# Paste correct secret

# Redeploy
vercel --prod
```

## 📊 Performance Monitoring

### Expected Metrics

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Webhook Response Time | < 500ms | > 2s |
| Queue Processing | < 60s | > 5min |
| Success Rate | > 95% | < 80% |
| Duplicate Rate | 0% | > 1% |

### Monitoring Commands

```bash
# Check pipeline health
npx tsx scripts/check-pipeline-health.ts

# Check recent logs
vercel logs --follow | grep webhook

# Check queue sizes
npx tsx scripts/check-queue-status.ts
```

## 🔄 Rollback Plan

If webhooks cause issues:

### Quick Rollback

1. **Disable webhook on Whapi:**
   ```bash
   curl -X PATCH https://gate.whapi.cloud/settings/webhook \
     -H "Authorization: Bearer $WHAPI_CLOUD_TOKEN" \
     -d '{"url": "", "events": []}'
   ```

2. **System automatically falls back to 4-hour polling**
   - No code changes needed
   - Polling is still active in background

### Full Rollback

```bash
# Revert webhook commit
git revert <webhook-commit-hash>
git push origin main

# Remove environment variables
vercel env rm WHAPI_WEBHOOK_URL production
vercel env rm WHAPI_WEBHOOK_SECRET production

# Redeploy
vercel --prod
```

## 💰 Cost Optimization

### Before Webhook (Polling)
- **API Calls:** ~600/day = ~18,000/month
- **Cost:** $0-5/month (depending on plan)
- **Latency:** Up to 4 hours

### After Webhook
- **API Calls:** 0/day (webhooks are free)
- **Cost:** $0/month for API calls
- **Latency:** < 30 seconds
- **Savings:** ~18,000 API calls/month

### Optional: Disable Polling

Once webhooks are stable (after 1 week), you can disable polling to save resources:

```typescript
// lib/digital-twin/background-service.ts
start() {
  // ... existing code ...
  
  // Comment out polling interval
  // orchestrationInterval = setInterval(async () => {
  //   await this.runOrchestrationCycle();
  // }, ORCHESTRATION_INTERVAL);
}
```

**Warning:** Keep polling enabled for at least 1 week as a fallback!

## 🎯 Success Metrics

After 24 hours of webhook operation, you should see:

- ✅ 100% of messages received within 30 seconds
- ✅ 0 API calls to `/messages` endpoint (for polling)
- ✅ Processing time: < 1 minute per casting call
- ✅ No missed messages
- ✅ No duplicate processing

## 📞 Support

If you encounter issues during deployment:

1. **Check webhook logs:** `vercel logs --follow | grep webhook`
2. **Test endpoint:** `curl https://your-domain/api/v1/webhooks/whapi`
3. **Verify Whapi config:** Check Whapi dashboard → Webhooks
4. **Run health check:** `npx tsx scripts/check-pipeline-health.ts`
5. **Check error logs:** Look for 401, 500 errors in logs

## ✅ Post-Deployment

After successful deployment:

1. **Update documentation** with your production webhook URL
2. **Set up monitoring alerts** for webhook failures
3. **Schedule weekly health checks**
4. **Monitor cost savings** in Whapi dashboard
5. **Consider disabling polling** after 1 week of stable operation

## 🎉 Deployment Complete!

Your WhatsApp webhook is now live and processing messages in real-time!

**Next steps:**
1. Monitor for 24 hours
2. Review performance metrics
3. Consider disabling polling (after stability confirmed)
4. Celebrate the improved performance! 🎊

