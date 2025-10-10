# 🎬 Caster Onboarding Flow - Implementation Plan

**Version:** 1.0  
**Date:** October 8, 2025  
**Status:** In Progress

---

## 📋 Overview

This document outlines the complete onboarding flow for casters, integrating with the two-tier profile system (Basic/Advanced) and the 23-type caster taxonomy.

---

## 🔄 User Flow

### 1️⃣ Registration
**Location:** `/register`

- User selects role: `talent` | `caster`
- If `caster` is selected → proceed to onboarding

---

### 2️⃣ Onboarding Entry
**Location:** `/onboarding/caster`

**Step Sequence:**
```
Welcome Screen → Type Selection → Dynamic Basic Form → Optional Details → Success
```

---

## 📝 Detailed Steps

### Step 1: Welcome Screen
**Purpose:** Orient new casters and set expectations

**Content:**
- Welcome message
- Benefits overview (Discover Talent, Post Jobs, Manage Applications)
- Time estimate (2-3 minutes)
- CTA: "Get Started"

**Design:**
- Clean, minimal
- Icon-based benefits display
- Progress indicator hidden

---

### Step 2: Company Type Selection
**Purpose:** Identify the caster's business category and type

**Content:**
- Question: "What type of company are you?"
- Display all 7 categories from taxonomy
- Show 23 company types grouped by category

**Interaction:**
- Click on any type card to select
- Each card shows:
  - Company type name (English/Arabic)
  - Brief description
  - Example companies (if available)
- No multi-select (single choice only)

**Data Captured:**
```typescript
{
  companyType: string;      // e.g., 'film_production'
  companyCategory: string;  // e.g., 'production_companies'
}
```

**Validation:**
- Must select one type before proceeding

---

### Step 3: Dynamic Basic Form
**Purpose:** Collect essential information based on company type

**Dynamic Behavior:**
The form fields adapt based on the selected company type.

#### Base Fields (All Types)
Required for all caster types:

| Field | Type | Required | Example |
|-------|------|----------|---------|
| Company Name (English) | Text | ✅ | "Riyadh Productions" |
| Company Name (Arabic) | Text | ❌ | "إنتاج الرياض" |
| City | Text | ✅ | "Riyadh" |
| Business Phone | Tel | ✅ | "+966 50 123 4567" |
| Business Email | Email | ✅ | "contact@company.com" |

#### Type-Specific Fields

##### Production Companies
*(`film_production`, `tv_production`, `commercial_production`, `documentary_production`)*

**Additional Fields:**
- **Production Focus** (Multi-select)
  - Feature Films
  - Short Films
  - TV Series
  - Documentaries
  - Commercials
- **Primary Shooting Location** (Text)
  - Where do you primarily shoot?

##### Broadcasting & Media
*(`tv_channels`, `streaming_platforms`, `radio_stations`)*

**Additional Fields:**
- **Content Type** (Multi-select)
  - Drama
  - Comedy
  - News
  - Entertainment
  - Sports
  - Documentary
- **Audience Reach** (Select)
  - Local
  - Regional
  - National
  - International

##### Advertising & Marketing
*(`advertising_agency`, `digital_marketing`, `influencer_management`)*

**Additional Fields:**
- **Services Offered** (Multi-select)
  - Video Production
  - Social Media Campaigns
  - Brand Activation
  - Influencer Campaigns
  - Photography
- **Industries Served** (Multi-select)
  - Entertainment
  - Fashion
  - Technology
  - Healthcare
  - F&B
  - Other

##### Events & Entertainment
*(`event_production`, `theater_company`, `festival_organizer`)*

**Additional Fields:**
- **Event Types** (Multi-select)
  - Concerts
  - Festivals
  - Corporate Events
  - Theatrical Productions
  - Weddings
  - Conferences
- **Average Events/Year** (Number)
  - How many events do you organize annually?

##### Government & Institutions
*(`government_ministry`, `cultural_institution`, `educational_institution`)*

**Additional Fields:**
- **Department/Division** (Text)
  - Which department handles media?
- **Project Frequency** (Select)
  - Weekly
  - Monthly
  - Quarterly
  - Annual
  - As Needed

##### Talent Agencies & Services
*(`casting_agency`, `talent_management`, `voice_dubbing`, `model_agency`)*

**Additional Fields:**
- **Talent Roster Size** (Select)
  - 1-10
  - 11-50
  - 51-200
  - 200+
- **Specializations** (Multi-select)
  - Actors
  - Models
  - Voice Artists
  - Extras
  - Child Actors
  - Influencers

##### Corporate & Freelance
*(`corporate_brand`, `independent_producer`)*

**Additional Fields:**
- **Industry** (Select) - For corporate
  - Technology
  - Finance
  - Healthcare
  - Retail
  - Other
- **Previous Projects** (Number) - For freelancers
  - How many projects have you completed?

**Validation:**
- All required fields must be filled
- Phone number format validation
- Email format validation
- URL format validation (if applicable)

---

### Step 4: Optional Details
**Purpose:** Gather additional information (can be skipped)

**Fields:**
- Company Size (Select)
  - Freelance
  - Small (1-10)
  - Medium (11-50)
  - Large (51-200)
  - Enterprise (200+)
- Established Year (Number)
- Website (URL)
- LinkedIn Profile (URL)
- Instagram Handle (Text)

**Interaction:**
- Two CTAs: "Skip for Now" | "Complete Setup"
- Skipping immediately saves and proceeds to success
- Completing includes optional data in profile

---

### Step 5: Success Screen
**Purpose:** Confirm completion and redirect

**Content:**
- Success icon
- Congratulations message
- "Redirecting to dashboard..." text
- Animated progress bar

**Behavior:**
- Auto-redirect to `/dashboard` after 2 seconds
- Dashboard shows profile completion percentage
- Quick action to "Post Your First Casting Call"

---

## 🗄️ Data Structure

### API Request Format
```typescript
POST /api/v1/caster-profiles/{id}

{
  // Always Required
  companyType: string;          // From taxonomy
  companyCategory: string;      // From taxonomy
  companyNameEn: string;
  businessPhone: string;
  businessEmail: string;
  city: string;
  
  // Optional Base
  companyNameAr?: string;
  companySize?: string;
  establishedYear?: number;
  website?: string;
  
  // Dynamic Type-Specific Fields
  customFields?: {
    productionFocus?: string[];
    contentType?: string[];
    servicesOffered?: string[];
    eventTypes?: string[];
    talentRosterSize?: string;
    // ... etc
  }
}
```

---

## 🎨 UI/UX Guidelines

### Progress Indicator
- Show on steps 2, 3, 4
- Hide on welcome and success screens
- Format: Numbered circles with connecting lines
- Labels: "Company Type" | "Basic Info" | "Optional"

### Form Layout
- Two-column grid for desktop
- Single column for mobile
- Icon prefixes for inputs
- Clear field labels with asterisks for required
- Inline validation on blur

### Error Handling
- Display errors above form
- Red border on invalid fields
- Clear error messages
- Don't allow progression until fixed

### Mobile Responsiveness
- Stack all grids vertically
- Full-width buttons
- Touch-friendly targets (min 44px)
- Fixed header with progress

---

## 🔐 Technical Requirements

### Auth Guard
```typescript
useEffect(() => {
  if (user && user.role !== 'caster') {
    router.push('/dashboard');
  }
}, [user, router]);
```

### State Management
```typescript
type OnboardingStep = 'welcome' | 'type' | 'basic' | 'optional' | 'success';
const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
const [formData, setFormData] = useState<FormData>({...});
```

### Form Validation
- Client-side: React Hook Form or manual validation
- Server-side: Zod schemas in API routes
- Required field checks before step progression

### API Integration
- Fetch existing profile if exists
- PATCH request to update profile
- Handle errors gracefully
- Show loading states

---

## 🚀 Post-Onboarding Actions

### Immediate Dashboard Display
1. **Profile Completion Widget**
   - Show percentage complete (e.g., 60%)
   - Suggest next actions:
     - Upload company logo
     - Add company description
     - Verify license (if applicable)
     - Post first casting call

2. **Quick Actions**
   - "Post Your First Casting Call" (primary CTA)
   - "Browse Talent"
   - "Complete Your Profile"

3. **Empty States**
   - Active casting calls: "You haven't posted any casting calls yet"
   - Applications: "No applications yet"
   - Bookings: "No scheduled auditions"

---

## 📊 Profile Completion Score

### Calculation
```typescript
const calculateCompletion = (profile: CasterProfile): number => {
  let score = 0;
  const weights = {
    basic: 40,        // Name, email, phone, city
    type: 10,         // Company type selected
    description: 10,  // Company description added
    logo: 10,         // Company logo uploaded
    social: 10,       // Social links added
    license: 20,      // License info (if applicable)
  };
  
  // Calculate based on filled fields
  // Return percentage (0-100)
};
```

### Display
- Circular progress indicator
- Percentage text
- List of missing items
- CTA to complete

---

## 🔄 Integration Points

### With Profile System
- Onboarding creates `CasterProfile` record
- Sets `profileType = 'basic'` by default
- User can upgrade to 'advanced' later from settings

### With Casting Calls
- After onboarding, user can immediately post
- Form pre-fills company info from profile

### With Compliance System
- License verification step comes later (optional)
- Not required to start using the platform
- Verified badge unlocks after compliance

### With Payment System
- No payment required during onboarding
- Profile type switch (basic → advanced) is free
- Payments only for job postings (if paid tier)

---

## ✅ Success Metrics

### Completion Rate
- Target: >80% complete full onboarding
- Track drop-off at each step
- A/B test different flows

### Time to First Action
- Target: <5 minutes from registration to first casting call posted
- Measure engagement within 24 hours

### Profile Quality
- Track completion percentage distribution
- Encourage completion through nudges

---

## 🐛 Edge Cases & Error Handling

### Interrupted Flow
- Save progress in localStorage
- Resume from last completed step
- Show "Continue Setup" banner on dashboard

### Existing Profile
- If profile already exists, skip onboarding
- Or show "Update Profile" flow instead

### Network Errors
- Retry logic (3 attempts)
- Clear error messages
- Allow manual retry

### Invalid Data
- Validate before API call
- Show specific field errors
- Don't clear form on error

---

## 📅 Next Steps

1. ✅ Create onboarding flow document
2. ⏳ Update `CasterProfile` schema with `customFields` JSONB
3. ⏳ Create dynamic form component with type-specific fields
4. ⏳ Implement form state management
5. ⏳ Add API validation for type-specific fields
6. ⏳ Test complete flow end-to-end
7. ⏳ Add analytics tracking
8. ⏳ Create onboarding walkthrough video

---

## 🔗 Related Documents

- `TWO_TIER_PROFILE_SYSTEM.md` - Profile type strategy
- `CASTER_PROFILE_ENHANCEMENT_PLAN.md` - Full profile features
- `reports/Research/Saudi Arabia Caster_Hirer Market Research Report.md` - Market insights
- `lib/constants/caster-taxonomy.ts` - Company type definitions
- `packages/core-db/prisma/schema.prisma` - Database schema

---

**Last Updated:** October 8, 2025  
**Status:** Ready for implementation

