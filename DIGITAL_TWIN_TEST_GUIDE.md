# Digital Twin & AI Casting Call Population Test Guide

## Overview
This guide walks you through testing the Digital Twin functionality that automatically discovers and creates casting calls from various sources (Instagram, Web, etc.).

## Prerequisites

1. **Development server running**: `pnpm dev`
2. **Database setup**: Ensure your PostgreSQL database is running and migrated
3. **Admin account**: You need an admin user to access the digital twin controls

## Test Steps

### Step 1: Access Admin Dashboard

1. Navigate to `http://localhost:3000/admin`
2. You'll see the Digital Twin Dashboard with:
   - Current status (Running/Stopped)
   - Source statistics
   - Pending casting calls count
   - Recent activity

### Step 2: Create Ingestion Sources

Navigate to `http://localhost:3000/admin/sources` and create test sources:

#### Example Web Source:
```json
{
  "sourceType": "WEB",
  "sourceIdentifier": "https://www.mbc.net/en/careers",
  "sourceName": "MBC Careers - Saudi Productions",
  "isActive": true
}
```

#### Example Instagram Source:
```json
{
  "sourceType": "INSTAGRAM",
  "sourceIdentifier": "@saudicastingcalls",
  "sourceName": "Saudi Casting Calls Instagram",
  "isActive": true
}
```

### Step 3: Trigger Digital Twin Orchestration

The Digital Twin runs automatically every hour, but you can manually trigger it:

1. **From the Admin Dashboard** (`/admin`):
   - Click the "Run Now" button
   - Status will update to show "Running"

2. **Via API** (using curl or Postman):
```bash
# Trigger orchestration
curl -X POST http://localhost:3000/api/digital-twin/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

The orchestration will:
- Fetch content from all active sources
- Use AI (OpenAI GPT-4) to extract casting call details
- Create structured casting calls
- Add them to the validation queue

**Note**: This process takes 30-60 seconds depending on the number of sources.

### Step 4: Monitor Validation Queue

Navigate to `http://localhost:3000/admin/validation-queue`

You should see AI-generated casting calls with:
- Title (extracted by AI)
- Role details
- Location (if detected)
- Requirements
- Source information
- Status: "pending"

Each casting call will show:
- ✅ **Approve** button - Makes it live to talent users
- ✏️ **Edit** button - Modify details before approval
- ❌ **Reject** button - Removes from queue

### Step 5: Review and Approve Casting Calls

1. **Review each casting call** for accuracy
2. **Edit if needed** - Fix any AI extraction errors
3. **Approve** to make it visible on the public casting calls page
4. **Reject** if it's not a valid casting opportunity

### Step 6: Verify Public Visibility

1. Log out or use incognito mode
2. Navigate to `http://localhost:3000/casting-calls`
3. You should see the approved casting calls
4. Talent users can now view and apply to these opportunities

## Testing with the Automated Script

If you prefer automated testing, use the provided script:

```bash
# Set your admin token
$env:ADMIN_TOKEN="your-admin-jwt-token-here"

# Run the test script
node scripts/test-digital-twin.mjs
```

The script will:
1. Create test sources
2. Check digital twin status
3. Trigger orchestration
4. Wait 30 seconds
5. Check validation queue
6. Approve the first casting call
7. Verify public listing

## Expected Results

### Successful Test Indicators:
- ✅ Digital twin shows "Running" status
- ✅ Sources are created and active
- ✅ Validation queue populates with casting calls
- ✅ Approved calls appear on `/casting-calls`
- ✅ Each call has proper structure (title, description, requirements)

### Common Issues:

#### No casting calls generated
- Check source URLs are valid
- Verify OpenAI API key is set (`OPENAI_API_KEY` in `.env`)
- Check logs for scraping errors

#### AI extraction is inaccurate
- This is expected with test/placeholder sources
- Real production sources (MBC, Rotana, etc.) will have better results
- You can edit the casting calls before approval

#### Permission errors
- Ensure you're logged in as an admin
- Check JWT token is valid and has admin role

## API Endpoints for Testing

### Get Digital Twin Status
```bash
GET /api/digital-twin/status
```

### Trigger Manual Run
```bash
POST /api/digital-twin/status
```

### Create Source
```bash
POST /api/v1/admin/sources
Content-Type: application/json

{
  "sourceType": "WEB",
  "sourceIdentifier": "https://example.com",
  "sourceName": "Example Source",
  "isActive": true
}
```

### Get Validation Queue
```bash
GET /api/v1/admin/digital-twin/validation-queue
```

### Approve Casting Call
```bash
POST /api/v1/admin/casting-calls/{id}/approve
```

### Reject Casting Call
```bash
POST /api/v1/admin/casting-calls/{id}/reject
```

## Architecture Notes

The Digital Twin consists of:

1. **Orchestrators** - Coordinate the ingestion process
   - `web-orchestrator.ts` - Scrapes web content
   - `instagram-orchestrator.ts` - Fetches Instagram posts
   - `whatsapp-orchestrator.ts` - Processes WhatsApp messages

2. **AI Extraction** - Uses OpenAI GPT-4 to:
   - Identify casting opportunities in raw content
   - Extract structured data (title, role, requirements, etc.)
   - Classify content type

3. **Validation Queue** - Admin review before publication:
   - Prevents spam/invalid content
   - Allows editing for accuracy
   - Maintains quality control

4. **Scheduler** - Runs automatically every hour
   - Configurable interval
   - Can be triggered manually
   - Processes all active sources

## Next Steps

After successful testing:

1. **Add Real Production Sources**:
   - MBC Careers: `https://www.mbc.net/en/careers`
   - Rotana Casting: (actual URL)
   - Saudi Film Commission: (actual URL)

2. **Configure OpenAI**:
   - Set `OPENAI_API_KEY` in environment
   - Configure model preferences if needed

3. **Set Up Monitoring**:
   - Check logs regularly
   - Monitor validation queue
   - Review approved casting calls quality

4. **Fine-tune AI Prompts**:
   - Edit prompts in orchestrator files for better extraction
   - Adjust based on specific source formats

## Troubleshooting

### Digital Twin not starting
```bash
# Check logs
pnpm dev

# Look for initialization message:
# "Digital Twin initialized - interval: 1h"
```

### Sources not processing
- Verify source URLs are accessible
- Check network/firewall settings
- Review logs for scraping errors

### AI extraction failing
- Confirm OpenAI API key is valid
- Check API quota/limits
- Review raw content being sent to AI

---

**Ready to test?** Start with Step 1 and work through each step. The entire test should take about 5-10 minutes.
