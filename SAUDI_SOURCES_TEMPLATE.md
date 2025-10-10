# 🇸🇦 Saudi Casting Sources - Template

## 📝 How to Provide Your 40+ Sources

Please provide your sources in **any** of these formats:

---

## **Option 1: JSON Format** (Recommended)

Create a file named `saudi-sources.json`:

```json
[
  {
    "sourceType": "INSTAGRAM",
    "sourceIdentifier": "@saudicasting",
    "sourceName": "Saudi Casting Agency - Instagram",
    "isActive": true
  },
  {
    "sourceType": "WEB",
    "sourceIdentifier": "https://www.riyadhproductions.sa/careers",
    "sourceName": "Riyadh Productions - Careers Page",
    "isActive": true
  },
  {
    "sourceType": "INSTAGRAM",
    "sourceIdentifier": "https://instagram.com/mbc_casting",
    "sourceName": "MBC Casting - Instagram",
    "isActive": true
  }
]
```

---

## **Option 2: CSV Format**

Create a file named `saudi-sources.csv`:

```csv
sourceType,sourceIdentifier,sourceName,isActive
INSTAGRAM,@saudicasting,Saudi Casting Agency - Instagram,true
WEB,https://www.riyadhproductions.sa/careers,Riyadh Productions - Careers Page,true
INSTAGRAM,https://instagram.com/mbc_casting,MBC Casting - Instagram,true
WEB,https://www.telfaz11.com/casting,Telfaz11 - Casting Page,true
```

---

## **Option 3: Simple List** (Easiest)

Just send me a list in any format you prefer:

```
Instagram Accounts:
- @saudicasting
- @mbc_casting  
- @telfaz11
- @rotanacasting
- @gea_casting

Websites:
- https://www.riyadhproductions.sa/careers
- https://www.telfaz11.com/casting
- https://www.mbcgroup.sa/jobs

LinkedIn Pages:
- https://linkedin.com/company/mbc-group

Twitter/X Accounts:
- @saudicasting_sa
- @mbc_careers
```

---

## 📋 Source Types Supported

### 1. **INSTAGRAM**
- Format: `@username` OR `https://instagram.com/username`
- Best for: Casting agencies, production companies, talent scouts
- Examples:
  - `@saudicasting`
  - `https://instagram.com/mbc_casting`

### 2. **WEB**
- Format: Full URL
- Best for: Company websites, job boards, casting platforms
- Examples:
  - `https://www.riyadhproductions.sa/careers`
  - `https://www.telfaz11.com/casting`

### 3. **WHATSAPP**
- Format: Group invite link OR phone number
- Best for: WhatsApp groups, business accounts
- Examples:
  - `https://chat.whatsapp.com/ABC123...`
  - `+966501234567`
- **Note:** WhatsApp requires special permissions

### 4. **OTHER**
- Format: Any URL or identifier
- Best for: LinkedIn, Twitter, Telegram, etc.
- Examples:
  - `https://linkedin.com/company/mbc-group`
  - `https://t.me/saudicasting`

---

## ✅ Source Information Required

For each source, provide:

1. **Source Type**: WEB, INSTAGRAM, WHATSAPP, or OTHER
2. **Identifier**: URL, username, or handle
3. **Name**: Descriptive name (e.g., "MBC Casting - Instagram")
4. **Active**: true/false (whether to start scraping immediately)

---

## 🎯 Examples of Good Saudi Sources

### **Instagram Accounts**
- `@saudicasting` - Saudi Casting Agency
- `@mbc_casting` - MBC Casting
- `@rotanacasting` - Rotana Media Casting
- `@gea_casting` - General Entertainment Authority
- `@telfaz11` - Telfaz11 Productions
- `@aflam_productions` - AFLAM Productions
- `@specter_productions` - Specter Productions
- `@useffilms` - Usef Films
- `@manga_productions` - Manga Productions

### **Websites**
- `https://www.mbcgroup.sa/careers`
- `https://www.rotana.net/jobs`
- `https://www.telfaz11.com/casting`
- `https://www.gea.sa/opportunities`
- `https://www.shahid.net/careers`
- `https://www.sbc.sa/jobs`

### **LinkedIn Companies**
- `https://linkedin.com/company/mbc-group`
- `https://linkedin.com/company/rotana-group`
- `https://linkedin.com/company/telfaz11`

---

## 🚀 How to Add Your Sources

Once you provide your list in ANY format, I'll:

1. ✅ Convert it to the proper format
2. ✅ Add all sources to the database
3. ✅ Set up Instagram scraping (if you provide Apify key)
4. ✅ Configure web scraping (if you provide FireCrawl key)
5. ✅ Test a few sources to make sure they work
6. ✅ Enable automatic crawling

---

## 🔑 API Keys Needed

### **For Instagram Scraping:**
- **Apify API Key** (recommended)
  - Sign up: https://apify.com
  - Free tier: 5-10K requests/month
  - Add to `.env`: `APIFY_API_KEY=apify_api_...`

OR

- **RapidAPI Instagram Scraper**
  - Sign up: https://rapidapi.com
  - Subscribe to Instagram Scraper API
  - Add to `.env`: `RAPIDAPI_KEY=...`

### **For Website Scraping:**
- **FireCrawl API Key**
  - Sign up: https://firecrawl.dev
  - Free tier: 500 requests/month
  - Add to `.env`: `FIRE_CRAWL_API_KEY=fc-...`

---

## 📊 What Happens After Adding Sources

1. **Immediate:**
   - Sources added to database
   - Status visible at `/api/digital-twin/sources`

2. **Within 30 seconds:**
   - Digital Twin runs first crawl
   - Scrapes all active sources
   - Extracts casting calls using AI

3. **Every 4 hours:**
   - Automatic crawl runs
   - New posts/pages scraped
   - Casting calls added to database

4. **Admin Review:**
   - New calls appear in `/admin/validation-queue`
   - Review and approve
   - Approved calls visible to talent

---

## 📩 How to Send Your Sources

Just paste them here in chat in ANY format:
- ✅ Copy-paste from Excel
- ✅ Comma-separated list
- ✅ Line-by-line
- ✅ JSON/CSV file
- ✅ Even a screenshot (I'll type them out)

**Don't worry about formatting** - I'll clean it up and add them all!

---

## 🎯 Quick Start

**Fastest way to get started:**

```
Just send me a list like this:

Instagram:
@saudicasting
@mbc_casting
@telfaz11

Websites:
https://www.mbcgroup.sa/careers
https://www.rotana.net/jobs
```

I'll handle the rest! 🚀

