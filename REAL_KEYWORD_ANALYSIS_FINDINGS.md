# Real Keyword Analysis from Actual Instagram Posts

## 🔍 Analysis Results

**Total Posts Analyzed**: 41 Instagram posts
- **Legitimate**: 22 (53.7%)  
- **False Positives**: 19 (46.3%)

## ✅ REAL Casting Calls Found (Examples)

From the analysis, these are **actual** casting-related posts:

1. **"Casting incredible Saudi talents for our latest project with Apple."**
   - Description: "سعدنا باختيار مواهب سعودية رائعة لمشروعنا الأخير مع Apple"
   - ✅ This is a REAL casting announcement

2. **"AlGaid 2025"**
   - Description: "إختيار وإعداد ممثلين: ستوديو ذات" (Actor selection and preparation by That Studio)
   - ✅ Credits post mentioning casting

3. **"بسمة" & "صيفي" & "فرسان_قريح"**
   - Description: "تدريب ممثلين: ستوديو ذات" (Actor training by That Studio)
   - ✅ Credits mentioning actor work

4. **"يصلح_يطلع_في_إعلان مع @SaudiCasting"**
   - Hashtag campaign by SaudiCasting
   - ✅ Casting-related content

## ❌ FALSE POSITIVES Found

1. **"Instagram Post from [username]"** (Most common - 13 occurrences)
   - These are generic titles when caption extraction fails
   - Content is usually personal updates, red carpet photos, magazine features

2. **"ورشة كتابة الفيلم القصير"** (Workshop)
   - Description: "سجل في ورشة كتابة الفيلم القصير لمدة ١٠ أسابيع" (Register for screenwriting workshop for 10 weeks)
   - ❌ This is a TRAINING workshop, NOT a casting call

3. **"ورشة عمل تمثيلية في سينما حي"** (Acting workshop)
   - Description: "انضموا إلينا في ورشة عمل تمثيلية... لمدة أربعة أيام" (Join our acting workshop for 4 days)
   - ❌ This is a WORKSHOP, NOT a casting call

4. **"Screening tonight at Nitehawk Cinema"**
   - ❌ Film screening event

5. **Film titles**: "Me & Aydarous", "AlZarfah", "Darwin Taif"
   - ❌ Personal project announcements, NOT casting calls

6. **"انتم محزمنا #الزرفة ☝️ الحمد لله ٣٨٦ الف تذكرة"**
   - Translation: "You rock #AlZarfah, thank God 386 thousand tickets"
   - ❌ Box office celebration, NOT a casting call

## 🎯 KEY FINDINGS

### Real Arabic Keywords Used in Actual Casting Content:

**From legitimate posts**:
- **"اختيار ممثلين"** (actor selection) - appears in credits
- **"إعداد ممثلين"** (actor preparation)
- **"تدريب ممثلين"** (actor training) - BUT this is post-production, not casting
- **"كاستينغ"** (casting)
- **"ممثلين"** (actors) - when used with "اختيار" or in casting context

### Real Arabic Keywords Used in FALSE POSITIVES:

**Workshop/Training indicators**:
- **"ورشة"** (workshop) - 5 occurrences
- **"لمدة"** (for a duration of) - indicates training program
- **"أسابيع"** (weeks) - training duration
- **"تعلم"** (learn) - educational content
- **"تدريب"** (training) - when standalone, it's a workshop

**Past tense/Completion indicators**:
- **"انتهى"**, **"اكتمل"** (finished, completed)
- **"شكرا"** (thank you) - often in celebration posts
- **"الحمد لله"** (thank God) - celebration/gratitude

**Event/Screening indicators**:
- **"عرض"** (screening/show)
- **"مهرجان"** (festival)
- **"سينما"** (cinema) - when used with "عرض"

## 🚨 CRITICAL INSIGHT

**The MAIN problem**: Most posts classified as "legitimate" are actually:
1. **Credits posts** ("تدريب ممثلين: ستوديو ذات") - NOT casting calls, but credits for completed work
2. **Workshop announcements** - training programs, NOT casting opportunities
3. **Film titles/project announcements** - personal updates, NOT casting calls
4. **Failed caption extraction** ("Instagram Post from...") - scraper issue

**True casting calls** are EXTREMELY RARE in the current dataset:
- Only **1-2 out of 41** are actual casting calls where actors can apply
- Example: "Casting incredible Saudi talents for our latest project with Apple"

## ✅ SOLUTION: Much Stricter Filtering

### Pre-Filter Must Require:
1. **Explicit casting action words**:
   - "مطلوب" (wanted/needed)
   - "نبحث عن" (we are looking for)
   - "كاستنج مفتوح" (open casting)
   - "اختيار ممثلين" (actor selection) - ONLY if paired with application info

2. **Application instructions**:
   - "للتقديم" (to apply)
   - "أرسل" / "إرسال" (send)
   - "التواصل" (contact)
   - "سيرة ذاتية" (CV/resume)

3. **Timeline/Deadline**:
   - "آخر موعد" (deadline)
   - "حتى تاريخ" (until date)

### Pre-Filter Must Reject:
1. **Workshop/Training**:
   - "ورشة" + "لمدة" (workshop for X duration)
   - "ورشة عمل" (workshop)
   - "تدريب" alone (training)
   - "تعلم" (learn)
   - "أسابيع" / "أيام" (weeks/days) in training context

2. **Credits/Past work**:
   - "تدريب ممثلين: [studio name]" (actor training by: ...)
   - "إخراج:" (directed by:)
   - "إنتاج:" (produced by:)
   - When "ممثلين" appears in credits, NOT application

3. **Celebrations/Events**:
   - "شكرا" (thank you)
   - "الحمد لله" (thank God)
   - "مبروك" (congratulations)
   - "عرض" + "سينما" (cinema screening)

## 📊 Recommended Keyword Updates

### KEEP These (Actually Found):
- **"كاستينغ"** (2 occurrences in legitimate posts)
- **"ممثلين"** (3 occurrences - but context matters!)
- **"اختيار"** (selection - but usually in credits, not calls)

### ADD These (For Real Casting Calls):
- **"مطلوب"** (needed/wanted) - this is THE key indicator
- **"نبحث عن"** (we are looking for)
- **"للتقديم"** (to apply)
- **"أرسل السيرة"** (send CV)

### STRENGTHEN Rejection Keywords:
- **"ورشة عمل"** (workshop) - phrase, not just "ورشة"
- **"لمدة [number] أسابيع/أيام"** (for X weeks/days)
- **"تدريب:"** when followed by studio name (credits format)
- **"إخراج:"** (directed by:)
- **"إنتاج:"** (produced by:)

## 🎯 Final Recommendation

**The filtering system is working, but it's NOT STRICT ENOUGH.**

Current dataset shows:
- **98% are NOT casting calls** (even the "legitimate" ones)
- Most are workshops, credits, or personal posts
- True casting calls must have: "مطلوب" + "للتقديم" + timeline

**Next Steps**:
1. Make pre-filter require EXPLICIT "مطلوب" or "نبحث عن"
2. Reject any post with "ورشة" + "لمدة"
3. Reject credit formats: "تدريب ممثلين: [name]"
4. Require application instructions to be present

