# 🎬 Caster Profile Enhancement Plan

## Based on Industry Research: Profile Anatomy for Casting Marketplace

**Status:** In Progress  
**Priority:** High  
**Estimated Timeline:** 2-3 weeks

---

## ✅ **Phase 1: Foundation (COMPLETED)**

### What We Built:
1. ✅ **Active Casting Calls Widget** - The most critical component
   - Shows all published casting calls by the caster
   - Real-time data from API
   - Quick "Create New Call" button for own profile
   - Displays location, project type, deadline urgency
   - Location: `components/profile/caster/ActiveCastingCallsWidget.tsx`

2. ✅ **Integrated into Current Profile**
   - Added to `HirerProfile.tsx` as the first section
   - Visible on caster's own profile page

---

## 🎯 **Phase 2: Caster Type System** (NEXT)

### Database Schema Update Required:

```prisma
model CasterProfile {
  id String @id @default(cuid())
  userId String @unique
  user User @relation(fields: [userId], references: [id])
  
  // Type Selection (NEW)
  casterType String @default("production") // 'agency' | 'production' | 'advertising' | 'independent'
  
  // Universal Elements
  companyName String?
  tagline String? // e.g., "Feature Film Casting Experts"
  logo String? // URL
  verified Boolean @default(false)
  
  // Locations (ENHANCED)
  headquarters Json? // {city, country, address}
  additionalLocations Json? // Array of location objects
  
  // Professional Links (NEW)
  website String?
  imdbProLink String?
  linkedInLink String?
  instagramHandle String?
  
  // Business Information (EXISTING)
  commercialRegistration String?
  city String?
  yearsInBusiness Int?
  teamSize Int?
  
  // Content Sections
  about String? // Rich company description
  missionStatement String? // NEW
  specializations Json? // Array of genres/types
  servicesOffered Json? // NEW - Array of service descriptions
  submissionGuidelines String? // NEW - How talent should apply
  
  // Media & Portfolio
  showreelUrl String? // PRIMARY video showcasing work
  portfolioImages Json? // Array of project stills/posters
  
  // For AGENCIES (team-based)
  teamMembers Json? // [{name, title, bio, photo, imdb}]
  
  // For AD AGENCIES (client-focused)
  clientLogos Json? // [{name, logoUrl, industry}]
  clientRoster String? // Text list if no logos
  
  // For PRODUCTION HOUSES (project catalog)
  filmography Json? // [{title, year, type, role, awards}]
  upcomingProjects Json? // [{title, genre, phase}]
  
  // For INDEPENDENTS (personal brand)
  personalBio String? // Individual's story
  detailedCredits Json? // Comprehensive project list
  
  // Trust Signals
  awards Json? // [{name, year, project, category}]
  testimonials Json? // [{quote, author, role, project, photo}]
  affiliations Json? // [{organization, role, logo}] e.g., CSA, CDA
  
  // Marketplace Metrics (AUTO-CALCULATED)
  totalCastingCalls Int @default(0)
  activeCastingCalls Int @default(0)
  totalHires Int @default(0)
  yearsOnPlatform Int?
  responseRate Int? // Percentage
  
  // Contact Preferences
  preferredContactMethod String? // 'platform' | 'email' | 'phone'
  acceptsUnsolicitedSubmissions Boolean @default(true)
  agentSubmissionsOnly Boolean @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Migration Steps:
1. Run `npx prisma migrate dev --name add_enhanced_caster_profile_fields`
2. Update `CasterProfileForm` to include type selection
3. Create conditional form sections based on type

---

## 📋 **Phase 3: Universal Components** (Required for All Types)

### 3.1 Header Section ✅ (Partially Done)
**Current:** Basic logo/name display  
**Needs:**
- ✅ Verification badge (exists)
- ❌ Tagline display
- ❌ Location(s) display with icons
- ❌ Social/professional links bar

### 3.2 About Section ⚠️ (Exists but Basic)
**Current:** Simple textarea  
**Needs:**
- Rich text editor
- Mission statement field
- Founding year / history timeline

### 3.3 Services Offered (NEW)
**Component:** `ServicesSection.tsx`
- Grid of service cards
- Icon + title + description
- Examples: "Full Casting Services," "Background Coordination," "Street Casting"

### 3.4 Submission Guidelines (NEW) ⭐ IMPORTANT
**Component:** `SubmissionGuidelinesSection.tsx`
- Clear instructions for talent
- Preferred submission format
- Response time expectations
- Examples: "Agent submissions preferred," "Open to unsolicited headshots"

### 3.5 Trust Signals Section (NEW)
**Component:** `TrustSignalsSection.tsx`
- Professional affiliations with logos
- Industry certifications
- Platform verification status
- Years of experience badge

---

## 🏢 **Phase 4: Type-Specific Components**

### 4.1 FOR CASTING AGENCIES
**Key Differentiator:** The TEAM

**Component:** `TeamDirectorySection.tsx`
```tsx
interface TeamMember {
  id: string;
  name: string;
  title: string; // e.g., "Senior Casting Director"
  bio: string;
  photo: string;
  imdbLink?: string;
  specializations: string[]; // e.g., ["Feature Films", "Drama"]
  yearsExperience: number;
}
```
- Photo grid of all casting directors
- Click to expand full bio
- Filter by specialization
- Individual IMDb links

### 4.2 FOR PRODUCTION HOUSES
**Key Differentiator:** The CATALOG

**Component:** `FilmographySection.tsx`
```tsx
interface Project {
  id: string;
  title: string;
  year: number;
  type: 'feature' | 'series' | 'documentary' | 'short';
  genre: string;
  posterUrl: string;
  trailerUrl?: string;
  awards: Award[];
  role: string; // e.g., "Producer," "Executive Producer"
}
```
- Visual grid of movie posters/show cards
- Hover to play trailer
- Filter by genre/year
- Awards laurels overlay

**Component:** `SizzleReelSection.tsx`
- **Embedded at top** of profile (most important!)
- High-quality video player
- Production quality showcase

**Component:** `UpcomingSlateSection.tsx`
- Projects in development
- Generates excitement for future opportunities
- "In Development" | "Pre-Production" | "Casting Now"

### 4.3 FOR ADVERTISING AGENCIES
**Key Differentiator:** BRAND RELATIONSHIPS

**Component:** `ClientRosterSection.tsx`
```tsx
interface Client {
  id: string;
  name: string;
  logoUrl: string;
  industry: string; // e.g., "Automotive," "Beauty"
  campaignCount: number;
}
```
- **Prominent logo wall** at top
- Recognizable brand logos (Nike, Google, Coca-Cola)
- Filterable by industry

**Component:** `CampaignPortfolioSection.tsx`
```tsx
interface Campaign {
  id: string;
  title: string;
  client: string;
  year: number;
  thumbnailUrl: string;
  videoUrl: string;
  awards: Award[];
  industry: string;
  castingNote?: string; // What type of talent was used
}
```
- Video grid of commercials
- Play on hover
- "Real people" vs "Actors" tags
- Industry category tags

### 4.4 FOR INDEPENDENT CASTERS
**Key Differentiator:** PERSONAL REPUTATION

**Component:** `PersonalBioSection.tsx`
- Compelling narrative
- Professional photo (not logo)
- Career journey
- "Why I cast differently" philosophy

**Component:** `DetailedCreditsSection.tsx`
```tsx
interface Credit {
  id: string;
  projectTitle: string;
  year: number;
  role: string; // "Casting Director"
  director: string;
  productionCompany: string;
  type: 'film' | 'tv' | 'commercial' | 'theater';
  genre: string;
  notableActorsCast?: string[]; // Actors they discovered
  imdbLink?: string;
}
```
- Comprehensive, filterable list
- Export to PDF resume
- Highlight "discovered talent"
- Sort by date, type, or genre

---

## 🏆 **Phase 5: Awards & Recognition**

**Component:** `AwardsSection.tsx`
```tsx
interface Award {
  id: string;
  name: string; // "Emmy," "Oscar," "Cannes Lion"
  category: string;
  year: number;
  project: string;
  won: boolean; // vs. nominated
  badgeUrl?: string; // Laurel image
}
```
- Visual badge grid
- Gold/silver for wins vs nominations
- Link to project
- Filter by year/award type

---

## 💬 **Phase 6: Testimonials System**

**Component:** `TestimonialsSection.tsx`
```tsx
interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string; // "Director," "Producer," "Production Company"
  project?: string;
  photo?: string;
  date: string;
  verified: boolean; // Platform verified this testimonial
}
```
- Carousel or grid
- Quote + headshot
- Project context
- Verification badge
- Allow talent to submit testimonials after working together

---

## 📊 **Phase 7: Marketplace Metrics Dashboard**

**Component:** `MarketplaceStatsSection.tsx`

Display (if caster opts in):
- ✅ Total casting calls posted
- ✅ Active calls
- ✅ Total hires made on platform
- ❌ Average response time
- ❌ Talent satisfaction rating
- ❌ Years on platform

**Privacy:** Caster can toggle these on/off

---

## 🎨 **Phase 8: Visual Enhancements**

### Portfolio Grid
- Lazy-loaded images
- Lightbox viewer
- Category filters
- Download press kit option

### Video Integration
- YouTube/Vimeo embed
- Platform-hosted option
- Auto-play on scroll (muted)
- Full-screen viewer

### Responsive Design
- Mobile-first approach
- Touch-friendly carousels
- Optimized image loading

---

## 🔄 **Implementation Priority Order**

1. ✅ **Active Casting Calls Widget** (DONE)
2. **Caster Type Selection** (database + form)
3. **Submission Guidelines** (high value, low effort)
4. **Team Directory** (for agencies)
5. **Client Roster** (for ad agencies)
6. **Filmography/Showreel** (for production houses)
7. **Awards Section**
8. **Testimonials**
9. **Portfolio Grid**
10. **Metrics Dashboard**

---

## 🧪 **Testing Checklist**

- [ ] Create test profiles for each caster type
- [ ] Verify all sections render correctly
- [ ] Test mobile responsiveness
- [ ] Verify API performance with real data
- [ ] Test image/video uploads and display
- [ ] Verify privacy controls work
- [ ] Test profile editing flow
- [ ] Ensure public vs. private profile views
- [ ] Test SEO/metadata for profile pages

---

## 📝 **Success Metrics**

- **Completion Rate:** % of casters who fill out all recommended sections
- **Profile Views:** Track views per profile type
- **Engagement:** Clicks on casting calls from profile
- **Applications:** Talent applications from profile CTAs
- **Conversion:** Message/inquiry rate from profile visits

---

## 🚀 **Next Steps**

1. ✅ Implement Active Casting Calls Widget
2. ⏳ Run database migration for enhanced fields
3. ⏳ Build caster type selector in profile form
4. ⏳ Create conditional rendering based on type
5. ⏳ Implement priority components (Team Directory, Client Roster)

---

**Last Updated:** 2025-10-07  
**Status:** Phase 1 Complete, Phase 2 Ready to Start

