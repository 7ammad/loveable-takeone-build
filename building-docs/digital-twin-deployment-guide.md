# 🚀 Digital Twin Deployment Guide

## Overview

The TakeOne Digital Twin has been successfully implemented! This guide covers deployment, configuration, and operation of the complete data aggregation system.

## 📊 Implementation Summary

### ✅ **Completed Components**

| Phase | Component | Status | Description |
|-------|-----------|--------|-------------|
| **1** | Database Schema | ✅ Deployed | `CastingCall` & `IngestionSource` models added |
| **2** | Web Scraping | ✅ Ready | Orchestrator service + BullMQ workers |
| **3** | WhatsApp Ingestion | ✅ Ready | Isolated service using Whapi.cloud |
| **4** | Admin UI | ✅ Deployed | Source management & validation queue |

### 🔧 **New Services Created**

```
scripts/
├── orchestrator.ts          # Web scraping orchestrator
├── whatsapp-ingestor.ts     # WhatsApp message ingestion
└── setup-cron-jobs.ts       # Cron job management

packages/core-queue/src/workers/
├── scraped-role-worker.ts   # Processes web-scraped casting calls
└── whatsapp-message-worker.ts # Processes WhatsApp messages

app/admin/digital-twin/
├── sources/page.tsx         # Source management UI
└── validation/page.tsx      # Content validation queue

app/api/admin/digital-twin/
├── sources/                 # CRUD APIs for sources
└── validation/              # Approve/reject APIs
```

## 🔐 Environment Variables Required

Add these to your `.env` file:

```bash
# Digital Twin - Web Scraping
FIRECRAWL_API_KEY=your_firecrawl_api_key
OPENAI_API_KEY=your_openai_api_key

# Digital Twin - WhatsApp (Optional)
WHAPI_TOKEN=your_whapi_token
WHAPI_BASE_URL=https://gate.whapi.cloud

# Existing (Redis for queues)
REDIS_URL=redis://localhost:6379
```

## 🚀 Deployment Steps

### 1. Database Migration
```bash
# Already applied via db push - verify schema
npx prisma studio
```

### 2. Start Queue Workers
```bash
# Start the scraped role worker
npx tsx packages/core-queue/src/workers/scraped-role-worker.ts &

# Start the WhatsApp message worker
npx tsx packages/core-queue/src/workers/whatsapp-message-worker.ts &
```

### 3. Set Up Cron Jobs
```bash
# For development testing
npx tsx scripts/setup-cron-jobs.ts --run-once orchestrator

# For production setup
npx tsx scripts/setup-cron-jobs.ts --setup
# Then add the output to crontab
```

### 4. Configure Data Sources
1. Visit `/admin/digital-twin/sources`
2. Add web sources (e.g., MBC Careers, casting company sites)
3. Add WhatsApp groups (if using Whapi.cloud)

## 🎯 Usage Guide

### **For Admins:**

1. **Manage Sources**: `/admin/digital-twin/sources`
   - Add websites to scrape (MBC, casting agencies, etc.)
   - Add WhatsApp groups for real-time updates
   - Toggle sources on/off

2. **Validate Content**: `/admin/digital-twin/validation`
   - Review AI-extracted casting calls
   - Approve legitimate opportunities
   - Reject spam/duplicates

### **For Users:**

The Digital Twin works transparently! Users see aggregated casting calls from:
- ✅ **Web sources**: Professional casting sites
- 📱 **WhatsApp groups**: Real-time industry updates
- 🔍 **Unified search**: All opportunities in one place

## 🔍 Monitoring & Maintenance

### **Queue Health**
```bash
# Check queue status
redis-cli --raw KEYS "bull:process-scraped-role:*"
redis-cli --raw KEYS "bull:process-whatsapp-message:*"
```

### **Data Quality**
- Monitor validation queue for spam/false positives
- Review content extraction accuracy
- Add more sources as you discover them

### **Performance**
- Web scraping: Every 4 hours
- WhatsApp polling: Every 15 minutes
- Queue concurrency: 2 web jobs, 1 WhatsApp job

## 🛡️ Risk Mitigation

### **WhatsApp Integration**
- **Isolated service**: Can be disabled without affecting core platform
- **Unofficial API**: May require updates if Whapi.cloud changes
- **Rate limiting**: Built-in delays and concurrency limits

### **Web Scraping**
- **Respectful crawling**: 2-second delays between sources
- **Legal compliance**: Only public data, no authentication required
- **Error handling**: Failed scrapes don't break the system

## 📈 Expected Results

### **Immediate Impact**
- **Day 1**: Users see casting calls from configured sources
- **Week 1**: Multiple sources feeding content continuously
- **Month 1**: Become the go-to destination for Saudi casting opportunities

### **Business Metrics**
- **User acquisition**: "We have everything in one place"
- **Engagement**: Users spend more time discovering opportunities
- **Market position**: Transform from marketplace to industry search engine

## 🔧 Troubleshooting

### **Orchestrator Issues**
```bash
# Test manually
npx tsx scripts/setup-cron-jobs.ts --run-once orchestrator
```

### **WhatsApp Issues**
- Check Whapi.cloud account status
- Verify group IDs are correct format
- Monitor API rate limits

### **Queue Issues**
- Check Redis connectivity
- Verify worker processes are running
- Monitor BullMQ dashboard (if available)

## 🎯 Next Steps

1. **Add More Sources**: Configure additional casting websites and WhatsApp groups
2. **Content Enrichment**: Add AI-powered content categorization and tagging
3. **Search Integration**: Connect to existing Algolia search system
4. **Analytics**: Track source performance and content quality metrics
5. **User Personalization**: Show relevant opportunities based on user profiles

---

## 🎬 **The Digital Twin is Live!**

TakeOne now has a **self-populating marketplace** that solves the cold start problem. Instead of asking users to populate an empty platform, you provide immediate, undeniable value by becoming the central hub for the entire Saudi casting ecosystem.

**Welcome to the future of marketplace GTM! 🚀**
