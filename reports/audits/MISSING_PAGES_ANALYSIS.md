# Missing Pages & Features Analysis
**Date:** October 6, 2025  
**Focus:** Gap analysis for caster profiles, pages, and Saudi market alignment

---

## 🔍 Current State Analysis

### Existing Pages
✅ **Implemented:**
- `/company-profile` - Basic caster profile management
- `/talent` - Talent search for casters
- `/shortlist` - Caster shortlist management
- `/casting-calls/manage` - Manage casting calls
- `/applications/caster` - View received applications
- `/casters` - Landing page for casters (basic)

### Current Caster Types (Too Limited)
```typescript
COMPANY_TYPES = [
  { value: 'production_company', label: 'Production Company' },
  { value: 'advertising_agency', label: 'Advertising Agency' },
  { value: 'independent', label: 'Independent' },
];
```

**❌ MAJOR GAP:** Only 3 generic types don't reflect the Saudi entertainment ecosystem

---

## 🚨 Critical Missing Pages

### 1. Caster Discovery & Profiles
**Missing:**
- ❌ `/casters/[id]` - Public caster profile view (for talent to research companies)
- ❌ `/casters/directory` - Browse all casters/production companies
- ❌ `/casters/verified` - Verified/licensed production companies
- ❌ `/casters/[id]/portfolio` - Caster's past projects/productions
- ❌ `/casters/[id]/reviews` - Talent reviews of working with this caster

**Impact:** Talent cannot research companies before applying, leading to trust issues

---

### 2. Caster Onboarding & Setup
**Missing:**
- ❌ `/onboarding/caster` - Dedicated caster onboarding flow
- ❌ `/company-profile/verification` - License/registration verification process
- ❌ `/company-profile/documents` - Upload business documents
- ❌ `/company-profile/team` - Team member management
- ❌ `/company-profile/portfolio` - Project portfolio builder

**Impact:** Poor first experience, incomplete profiles, unverified accounts

---

### 3. Caster Analytics & Insights
**Missing:**
- ❌ `/analytics/caster` - Deep analytics dashboard
- ❌ `/analytics/campaigns` - Casting campaign performance
- ❌ `/analytics/talent-pool` - Insights on talent applicants
- ❌ `/analytics/market-trends` - Saudi market trends
- ❌ `/reports/casting-calls` - Detailed reports on casting calls

**Impact:** Casters can't make data-driven decisions

---

### 4. Advanced Caster Features
**Missing:**
- ❌ `/casting-calls/templates` - Save and reuse casting call templates
- ❌ `/casting-calls/batch` - Create multiple casting calls
- ❌ `/talent/saved` - Saved talent searches
- ❌ `/talent/recommendations` - AI-recommended talent
- ❌ `/contracts` - Contract management system
- ❌ `/payments` - Payment tracking for talent
- ❌ `/calendar` - Production calendar/schedule

**Impact:** Limited platform value, casters may use external tools

---

### 5. Collaboration & Team Features
**Missing:**
- ❌ `/team` - Team member invitations and management
- ❌ `/team/permissions` - Role-based permissions for team
- ❌ `/casting-calls/[id]/collaborate` - Collaborative decision-making
- ❌ `/notes/[talentId]` - Shared notes on talent (private to company)
- ❌ `/feedback/internal` - Internal feedback on applicants

**Impact:** Multi-user production companies can't collaborate effectively

---

## 📊 Saudi Market Caster Types - Research Needed

### Current Gap
The current 3 types don't represent the diverse Saudi entertainment landscape:
- Large production houses (MBC, Rotana, etc.)
- Boutique production companies
- Government entities (Ministry of Culture, ITHRA)
- Streaming platforms (Shahid, Weyyak)
- Regional theaters
- Event management companies
- Content creators/influencers (acting as hirers)
- Educational institutions
- Religious content producers
- Sports broadcasters

---

## 🎯 Recommended Caster Type Categories

### Proposed Structure
Instead of flat types, implement a **hierarchical taxonomy**:

```typescript
CASTER_CATEGORIES = {
  production: {
    label: 'Production Companies',
    types: [
      'film_production',
      'tv_production',
      'streaming_content',
      'documentary',
      'animation_studio',
      'post_production',
    ]
  },
  broadcasting: {
    label: 'Broadcasting & Media',
    types: [
      'tv_channel',
      'radio_station',
      'podcast_network',
      'streaming_platform',
      'news_media',
    ]
  },
  advertising: {
    label: 'Advertising & Marketing',
    types: [
      'advertising_agency',
      'brand_marketing',
      'digital_marketing',
      'influencer_management',
    ]
  },
  performance: {
    label: 'Performance & Events',
    types: [
      'theater_company',
      'event_production',
      'concert_organizer',
      'festival_organizer',
    ]
  },
  government: {
    label: 'Government & Institutions',
    types: [
      'ministry',
      'cultural_institution',
      'educational_institution',
      'tourism_authority',
    ]
  },
  independent: {
    label: 'Independent & Freelance',
    types: [
      'independent_producer',
      'content_creator',
      'freelance_director',
    ]
  }
}
```

---

## 📋 Data Points to Collect Per Caster Type

### All Casters (Base)
- ✅ Company name
- ✅ Company type (enhanced)
- ✅ Commercial registration
- ✅ Contact info
- ✅ Location/city
- ✅ Years in business
- ✅ Team size
- ✅ Specializations

### Additional for Production Companies
- ❌ Production scale (indie, medium, large, enterprise)
- ❌ Previous productions (portfolio)
- ❌ Available facilities/studios
- ❌ Equipment owned
- ❌ Union affiliations
- ❌ Awards & recognition
- ❌ Typical budget range
- ❌ Distribution partnerships

### Additional for Broadcasters
- ❌ Broadcasting license number
- ❌ Coverage area (national/regional)
- ❌ Channel/platform details
- ❌ Viewership/reach statistics
- ❌ Content rating (e.g., family-friendly)

### Additional for Ad Agencies
- ❌ Client portfolio
- ❌ Agency size (boutique/mid/large)
- ❌ Creative awards
- ❌ Brand partnerships
- ❌ Campaign types (TV, digital, social)

### Additional for Government/Institutions
- ❌ Ministry/department name
- ❌ Official registration
- ❌ Project budget authorization
- ❌ Public procurement compliance

---

## 🔬 Research Required

### Phase 1: Market Landscape
Research the Saudi entertainment and media production ecosystem to identify:
1. All types of entities that hire talent
2. Market size and distribution
3. Hiring patterns and frequencies
4. Typical project types per entity
5. Regulatory requirements per type

### Phase 2: Competitive Analysis
Analyze existing platforms:
1. What caster types do competitors recognize?
2. How do international casting platforms categorize hirers?
3. What's working in GCC markets?
4. Best practices from global platforms (Backstage, Casting Networks)

### Phase 3: User Research
Interview actual casters:
1. How do they self-identify?
2. What information do they want to share?
3. What information do talent want to see?
4. Pain points in current hiring process

---

## ✅ Immediate Actions

### Priority 1: Enhance Caster Types
1. Research and define comprehensive caster taxonomy
2. Update database schema with new types
3. Add industry-specific fields
4. Create migration for existing casters

### Priority 2: Build Missing Pages
1. Public caster profiles `/casters/[id]`
2. Caster directory `/casters/directory`
3. Enhanced company profile with portfolio
4. Team management features

### Priority 3: Data Collection
1. Add caster verification flow
2. Collect industry-specific metadata
3. Build portfolio/past work showcase
4. Implement review system

---

## 📅 Implementation Roadmap

### Sprint 1 (Research & Planning)
- [ ] Complete Saudi market research
- [ ] Define comprehensive caster taxonomy
- [ ] Design new profile fields
- [ ] Create wireframes for missing pages

### Sprint 2 (Database & Backend)
- [ ] Update Prisma schema
- [ ] Create migration scripts
- [ ] Build new API endpoints
- [ ] Update existing APIs

### Sprint 3 (Frontend - Core)
- [ ] Build public caster profiles
- [ ] Create caster directory
- [ ] Enhanced company profile page
- [ ] Portfolio builder

### Sprint 4 (Frontend - Advanced)
- [ ] Team management
- [ ] Analytics dashboard
- [ ] Verification system
- [ ] Review system

### Sprint 5 (Polish & Launch)
- [ ] Testing
- [ ] Documentation
- [ ] Onboarding flows
- [ ] Marketing materials

---

**Status:** Ready for Market Research Phase  
**Next Step:** Execute comprehensive Saudi market research

