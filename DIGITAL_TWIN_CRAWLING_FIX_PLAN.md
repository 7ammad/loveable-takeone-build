# Digital Twin Crawling & Extraction - Fix Plan

## 🔴 Current Problems

Based on the logs and your feedback:

1. **False Positives**: 49 out of 50 "casting calls" are NOT actual casting opportunities
   - Instagram posts about films/projects (not casting)
   - Workshops and courses (not casting)
   - Film screenings (not casting)
   - General portfolio/work posts (not casting)

2. **Source Verification**: The one "real" casting call from Rotana leads to their homepage, not an actual casting page

3. **Instagram Content**: Instagram posts are being scraped but they're:
   - Personal project updates
   - Behind-the-scenes content
   - Promotional posts
   - NOT casting calls

## 🎯 Root Causes

### Issue 1: Weak AI Filtering
The LLM is being too generous in what it considers a "casting call". It's extracting structure from ANY content that mentions film/production.

### Issue 2: Wrong Source Types
- **Instagram individual accounts** (directors, producers) rarely post public casting calls
- They usually post about their work, not open auditions
- Real casting calls are on dedicated Instagram accounts or websites

### Issue 3: No Content Validation
- No check if the source URL actually has casting content
- No verification that extracted data is a real opportunity
- No date/freshness validation

## 📋 Solution: 3-Phase Fix

---

## Phase 1: Improve AI Prompt & Validation ⚙️

### 1.1 Strengthen LLM Prompt
**Current Problem**: Prompt is too loose, accepts any film-related content

**Fix**: Update `packages/core-lib/src/llm-casting-call-extraction-service.ts`

```typescript
const prompt = `You are a casting call extraction expert. Your job is to identify ONLY legitimate casting opportunities.

STRICT CRITERIA - Content MUST have ALL of these:
1. Open call for actors/talent (not crew, not workshops)
2. Specific role(s) being cast
3. Clear submission instructions (how to apply)
4. Timeline or deadline information

REJECT if the content is:
- Personal project updates ("just finished filming...")
- Film screenings or premieres
- Workshops, courses, or training programs
- Behind-the-scenes content
- General portfolio posts
- Past projects (already filmed/completed)

Content to analyze:
${rawMarkdown}

If this is NOT a legitimate casting call, respond with: {"isCastingCall": false}

If it IS a legitimate casting call, extract the following...
`;
```

### 1.2 Add Pre-Filter Validation
Add keyword detection BEFORE sending to LLM (saves API costs):

```typescript
function isPotentiallyCastingCall(content: string): boolean {
  const castingKeywords = [
    'casting call', 'casting now', 'audition', 'seeking actors',
    'open call', 'submit', 'apply', 'talent needed', 'role available',
    'looking for', 'عملية اختيار', 'كاستنج', 'تقديم'
  ];
  
  const rejectKeywords = [
    'screening tonight', 'premiered', 'just finished', 'workshop',
    'course', 'training', 'film festival', 'congratulations'
  ];
  
  const hasC castingKeyword = castingKeywords.some(kw => 
    content.toLowerCase().includes(kw)
  );
  
  const hasRejectKeyword = rejectKeywords.some(kw => 
    content.toLowerCase().includes(kw)
  );
  
  return hasCastingKeyword && !hasRejectKeyword;
}
```

---

## Phase 2: Fix Source Strategy 🎯

### 2.1 Deactivate Low-Quality Sources
**Action**: Deactivate Instagram accounts that post personal content

**Keep Active**:
- ✅ Casting agency websites (Mr Casting, Gulf Casting, Persona17)
- ✅ Dedicated casting Instagram accounts (if they exist)
- ✅ Production company career pages (if they have casting sections)

**Deactivate**:
- ❌ Individual director/producer Instagram accounts
- ❌ Personal portfolio accounts
- ❌ General production company pages without casting sections

### 2.2 Add Better Sources
**New Saudi Casting Sources to Add**:

1. **Casting-Specific Platforms**:
   - Gulf Talent: https://www.gulftalent.com/jobs/casting
   - Bayt.com Entertainment: https://www.bayt.com/en/saudi-arabia/jobs/casting/
   - LinkedIn Jobs: Search "casting Saudi Arabia"

2. **Dedicated Casting Groups** (if accessible):
   - Facebook Groups: "Saudi Casting Calls", "Riyadh Actors"
   - WhatsApp casting groups (requires phone integration)

3. **Production Company Career Pages** (verified to have casting):
   - Rotana: https://www.rotana.net/en/careers (if they have a casting section)
   - MBC: https://careers.mbc.net (if they have acting roles)
   - Only if they have dedicated casting/talent sections

---

## Phase 3: Add Post-Extraction Validation 🔍

### 3.1 Verify Required Fields
After LLM extraction, validate that ALL critical fields are present:

```typescript
function validateCastingCall(data: any): boolean {
  const required = [
    'title',
    'roleTitle',
    'description',
    'requirements',
    'location'
  ];
  
  // All required fields must exist and be non-empty
  const hasAllFields = required.every(field => 
    data[field] && data[field].length > 10
  );
  
  // Must have application method
  const hasApplication = data.applicationEmail || 
                         data.applicationUrl || 
                         data.contactPhone;
  
  // Description must mention specific role characteristics
  const hasRoleDetails = data.description.match(
    /(age|gender|height|experience|arabic|english)/i
  );
  
  return hasAllFields && hasApplication && hasRoleDetails;
}
```

### 3.2 Add Freshness Check
```typescript
function isFreshContent(date?: Date): boolean {
  if (!date) return true; // Allow if no date
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return date > thirtyDaysAgo;
}
```

---

## 🔧 Implementation Steps

### Step 1: Update LLM Service (15 min)
- [ ] Update prompt in `llm-casting-call-extraction-service.ts`
- [ ] Add pre-filter function
- [ ] Add post-validation function
- [ ] Test with sample content

### Step 2: Filter Sources (10 min)
- [ ] Run script to deactivate individual Instagram accounts
- [ ] Keep only 5-10 high-quality sources
- [ ] Add new verified sources

### Step 3: Add Validation Layer (20 min)
- [ ] Update `workers-init.ts` to call validation
- [ ] Add rejection logging for debugging
- [ ] Update validation queue to show rejection reasons

### Step 4: Test & Monitor (30 min)
- [ ] Trigger orchestration with new logic
- [ ] Monitor validation queue
- [ ] Check rejection rate
- [ ] Verify quality of approved calls

---

## 🎯 Expected Results After Fix

### Quality Metrics:
- **False Positive Rate**: < 10% (currently ~98%)
- **Valid Casting Calls**: 80%+ of extracted items
- **Source Efficiency**: 50%+ of sources produce valid calls

### Success Criteria:
✅ Validation queue has mostly legitimate casting opportunities  
✅ Each casting call has clear role requirements  
✅ All calls have valid application methods  
✅ Sources are verified to contain actual casting content  
✅ Instagram content is filtered for casting-specific posts only  

---

## 🚀 Quick Fix (Can do right now)

### Option A: Disable Instagram Sources Temporarily
```bash
# Deactivate all Instagram sources
npx tsx scripts/deactivate-instagram-sources.ts
```

This will:
- Keep only website sources (5 sources)
- Higher quality, lower volume
- Test if web sources produce better results

### Option B: Add Strict Validation Immediately
Update the worker to reject anything without clear application info:

```typescript
// In workers-init.ts, after LLM extraction:
if (!extractionResult.data.applicationEmail && 
    !extractionResult.data.applicationUrl) {
  throw new Error('No application method found - not a casting call');
}
```

---

## 📊 Monitoring Dashboard

After fixes, we need to track:
1. **Extraction Rate**: % of scraped content that passes LLM
2. **Validation Rate**: % of LLM extractions that pass validation
3. **Admin Approval Rate**: % of queue items approved by admin
4. **Source Performance**: Which sources produce valid calls

Add these metrics to `/admin` dashboard.

---

## 🤔 Recommended Approach

**I recommend starting with**:
1. ✅ **Disable all Instagram sources** (they're producing 98% noise)
2. ✅ **Keep only 5 casting agency websites** (verified quality)
3. ✅ **Update LLM prompt** to be MUCH stricter
4. ✅ **Add post-validation** to require application methods
5. ✅ **Test for 1 cycle** (4 hours or manual trigger)
6. ✅ **Review results** in validation queue
7. ✅ **Gradually re-enable good sources**

This will give us a clean baseline to build from.

**Ready to implement?** I can start with any of these phases immediately.

