# Digital Twin Casting Call Detection - Filtering System Implemented

## 🎯 Objective
Fix the 98% false positive rate (49/50 items) by implementing a 3-layer filtering system to eliminate non-casting content like workshops, screenings, and personal project updates.

---

## ✅ Implementation Complete

### Layer 1: Pre-Filter Keywords (Before LLM)
**File**: `lib/digital-twin/workers-init.ts`

**What Changed:**
- Added `isPotentiallyCastingCall()` function with 17 English + 9 Arabic casting keywords
- Added 15 English + 7 Arabic rejection keywords  
- Pre-filters content BEFORE expensive LLM API calls
- Returns `{status: 'skipped_not_casting'}` for non-casting content

**Expected Impact:**
- 60-70% of Instagram posts rejected before LLM
- Significant cost savings on OpenAI API calls
- Faster processing times

**Keywords Added:**
- **Casting**: "casting call", "now casting", "open audition", "seeking actors", "تقديم على الدور", "مطلوب ممثل"
- **Rejection**: "screening", "workshop", "training", "ورشة", "دورة", "مهرجان"

---

### Layer 2: Strict LLM Prompt with Validation
**File**: `packages/core-lib/src/llm-casting-call-extraction-service.ts`

**What Changed:**
1. **New Validation Step**: LLM must explicitly validate if content is a legitimate casting call
2. **Rejection Response**: `{"isCastingCall": false, "reason": "..."}` 
3. **Strict Criteria**: Content MUST have ALL of:
   - Explicit call for actors/talent (not crew/workshops)
   - Specific role(s) being cast
   - Clear application instructions
   - Timeline/deadline information
4. **Immediate Rejection Rules**: Personal updates, screenings, workshops, BTS content, past projects

**Expected Impact:**
- 20-30% additional rejection by LLM after pre-filter
- Higher quality extracted data
- Clear rejection reasons for debugging

---

### Layer 3: Instagram Account Analysis Tool
**File**: `scripts/analyze-instagram-sources.ts`

**Purpose:**
- Analyze historical data from each Instagram source
- Calculate false positive rate (casting keywords vs rejection keywords)
- Recommend KEEP (>30% accuracy), REVIEW (10-30%), or DEACTIVATE (<10%)

**How to Use:**
```powershell
pnpm tsx scripts/analyze-instagram-sources.ts
```

**Output:**
- Per-source accuracy metrics
- Categorized recommendations
- Summary statistics

---

### Layer 4: Cleanup Script
**File**: `scripts/deactivate-low-quality-sources.ts`

**Purpose:**
- Automatically deactivate sources with >70% false positive rate
- Based on last 20 casting calls from each source
- Checks for generic titles like "Instagram Post from..."

**How to Use:**
```powershell
pnpm tsx scripts/deactivate-low-quality-sources.ts
```

**Deactivation Criteria:**
- Title contains "Instagram Post from" (generic)
- Title contains "Screening", "Workshop", "ورشة"
- >70% of recent calls match these patterns

---

## 📊 Success Metrics

### Target Goals
| Metric | Before | Target | How to Measure |
|--------|--------|--------|----------------|
| **Pre-filter Rejection** | 0% | 60-70% | Check logs for "Skipped (not casting content)" |
| **LLM Rejection** | 0% | 20-30% | Check logs for "LLM rejected: ..." |
| **Final False Positive Rate** | 98% | <10% | Manual review of validation queue |
| **OpenAI API Cost** | 100% | 30-40% | Count LLM calls in logs |

### How to Monitor Next Cycle

1. **Watch Terminal Logs** for:
   ```
   ⏭️  Skipped (not casting content)  // Pre-filter working
   ⏭️  LLM rejected: [reason]          // LLM validation working
   ✅ Created casting call: [title]    // Legitimate casting call
   ```

2. **Check Validation Queue** at `/admin/validation-queue`:
   - Count legitimate casting calls vs false positives
   - Look for titles with "Screening", "Workshop", "Instagram Post from"
   - Calculate new false positive rate

3. **Review Source Quality**:
   ```powershell
   pnpm tsx scripts/analyze-instagram-sources.ts
   ```

---

## 🔄 Next Orchestration Cycle

The Digital Twin runs every 4 hours. The next cycle will:

1. **Pre-filter** Instagram posts using keywords
2. **LLM validate** remaining content with strict criteria
3. **Create** only legitimate casting calls
4. **Log** all rejections with reasons

**Expected Results:**
- Fewer items in validation queue
- Higher percentage of legitimate casting calls
- Lower OpenAI API costs
- Faster processing

---

## 🛠️ Maintenance & Monitoring

### Weekly Tasks
1. Run analysis script to review source quality
2. Deactivate sources with consistent false positives
3. Review rejection reasons to refine keywords

### Keyword Tuning
If false positives persist:
- **Add to Rejection Keywords**: Common false positive phrases
- **Add to Casting Keywords**: Legitimate casting phrases being missed
- **Update LLM Prompt**: Refine validation criteria

### Source Management
- Keep casting-specific agencies (Mr Casting, Gulf Casting, Persona17)
- Deactivate personal Instagram accounts (directors, producers)
- Focus on accounts that regularly post public casting calls

---

## 📝 Files Modified

1. `lib/digital-twin/workers-init.ts` - Pre-filter function
2. `packages/core-lib/src/llm-casting-call-extraction-service.ts` - LLM prompt & validation
3. `scripts/analyze-instagram-sources.ts` - Source analysis tool (NEW)
4. `scripts/deactivate-low-quality-sources.ts` - Cleanup automation (NEW)

---

## 🚀 Status: READY FOR TESTING

All layers implemented and deployed. Waiting for next orchestration cycle (every 4 hours) to validate improvements.

**Current Time**: Check server logs or `/api/digital-twin/status` endpoint  
**Next Run**: Automatically scheduled

