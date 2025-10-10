# 🎬 TakeOne - Enhanced Sitemap & UI Build Plan
## Saudi Casting Marketplace Platform

**Version 2.0** | **September 30, 2025** | **Enhanced with Design System**

---

## 🎯 **UI Strategy: Enhanced Existing + New Structure**

### **Recommendation: ENHANCE existing components + BUILD new user flows**

**Why enhance existing:**
- ✅ **High-quality foundation** - Well-designed Material-UI components with KAFD Noir theme
- ✅ **Cultural appropriateness** - Saudi-specific design elements already implemented
- ✅ **Animation system** - Framer Motion integration is solid
- ✅ **Responsive design** - Mobile-first approach already established

**What to enhance:**
- 🔄 **Unified theming** - Apply KAFD Noir consistently across all components
- 🔄 **User flow structure** - Organize components into proper user journeys
- 🔄 **Authentication system** - Build complete auth flow with Nafath integration
- 🔄 **Dashboard layouts** - Create talent and caster specific dashboards
- 🔄 **Search & discovery** - Build advanced search interfaces
- 🔄 **Application flows** - Create casting call application and management systems

---

## 📱 **Complete Enhanced Sitemap**

### **🌐 Public Pages (No Authentication Required)**

```
/ (Homepage)
├── Hero section with dual user paths
├── "I'm Talent" → /talent
├── "I'm a Caster" → /casters
├── Trust indicators and social proof
├── Featured success stories
└── Quick stats and platform highlights

/talent (Talent Landing)
├── Hero with video background
├── Value propositions (3 key benefits)
├── How it works (3-step process)
├── Success stories and testimonials
├── Trust bar with partner logos
├── Live platform feed
└── CTA to register

/casters (Caster Landing)
├── Hero with professional imagery
├── Value propositions for hirers
├── How it works for casting directors
├── Client testimonials
├── Trust indicators
├── Platform statistics
└── CTA to register

/about
├── Our story and mission
├── Vision 2030 alignment
├── Team and leadership
├── Company values
└── Contact information

/help
├── Help center with search
├── FAQ sections
├── Video tutorials
├── User guides
├── Contact support
└── Community guidelines

/privacy
├── Privacy policy (PDPL compliant)
├── Data protection measures
├── Cookie policy
└── User rights

/terms
├── Terms of service
├── User agreements
├── Community guidelines
└── Legal notices
```

### **🔐 Authentication System (Complete Flow)**

```
/auth/login
├── Email/password login
├── Social login (Google, Apple)
├── Nafath identity verification
├── "Forgot password" link
├── "Don't have account?" → /auth/register
└── Language toggle (AR/EN)

/auth/register
├── User type selection (Talent/Caster)
├── Registration form with validation
├── Terms acceptance
├── Email verification
├── Nafath identity verification
└── Welcome onboarding

/auth/forgot-password
├── Email input with validation
├── Reset instructions
├── Back to login
└── Support contact

/auth/reset-password/[token]
├── New password form
├── Password confirmation
├── Success message
└── Redirect to login

/auth/verify-email/[token]
├── Email verification status
├── Success/error states
├── Resend verification
└── Redirect to appropriate dashboard

/auth/nafath
├── Nafath verification flow
├── National ID input
├── Verification status
├── Annual renewal process
└── Integration with user profile
```

### **👤 Talent Dashboard & Features**

```
/dashboard (Talent Dashboard)
├── Overview stats (applications, views, etc.)
├── Recent activity feed
├── Upcoming auditions calendar
├── Profile completion progress
├── Verification status
├── Quick actions (search, apply, update profile)
└── Notifications center

/profile (Talent Profile Management)
├── Personal information
├── Physical attributes
├── Skills and experience
├── Portfolio management (photos, videos, audio)
├── Contact preferences
├── Privacy settings
├── Verification badges
└── Profile visibility controls

/portfolio
├── Photo gallery with categories
├── Video reels and showreels
├── Audio samples and voice demos
├── Upload interface with drag-drop
├── Media organization tools
├── Privacy controls per item
└── Portfolio analytics

/applications
├── Application history
├── Status tracking (submitted, reviewed, shortlisted, etc.)
├── Application details and requirements
├── Communication log with hirers
├── Feedback received
├── Interview scheduling
└── Contract management

/search
├── Casting call search with filters
├── Advanced search options
├── Saved searches
├── Search history
├── Recommendations based on profile
├── Map view for location-based search
└── Alerts and notifications

/casting-calls
├── Browse opportunities
├── Filter by location, type, compensation
├── Sort by date, relevance, compensation
├── Casting call details
├── Application form
└── Save for later

/casting-calls/[id]
├── Detailed casting call information
├── Role requirements and description
├── Company information
├── Application form with custom fields
├── Submit materials (portfolio items)
├── Contact casting director
└── Share opportunity

/messages
├── Inbox with conversation list
├── Message threads
├── File sharing capabilities
├── Notifications
├── Message templates
├── Archive and search
└── Block/report functionality

/calendar
├── Audition schedule
├── Availability settings
├── Appointment booking
├── Reminders and notifications
├── Sync with external calendars
└── Time zone management

/earnings
├── Payment history
├── Earnings analytics
├── Tax documents
├── Payment methods
├── Withdrawal requests
└── Financial reports

/settings
├── Account settings
├── Notification preferences
├── Privacy controls
├── Language settings
├── Security settings
└── Data export
```

### **🎬 Caster Dashboard & Features**

```
/dashboard (Caster Dashboard)
├── Overview stats (active calls, applications, etc.)
├── Recent activity
├── Performance metrics
├── Quick actions (create call, search talent)
├── Revenue tracking
└── Notifications

/casting-calls (Manage Casting Calls)
├── Create new casting call
├── Active calls management
├── Draft calls
├── Closed calls archive
├── Analytics per call
└── Bulk actions

/casting-calls/create
├── Project details form
├── Role requirements
├── Application settings
├── Compensation details
├── Timeline and deadlines
├── Location and travel requirements
└── Publish and promote

/casting-calls/[id]/edit
├── Edit casting call details
├── Update requirements
├── Manage applications
├── View analytics
├── Close or archive
└── Duplicate for new project

/casting-calls/[id]/applications
├── Application list with filters
├── Review applications
├── Shortlist candidates
├── Schedule interviews
├── Send messages
├── Make offers
└── Track hiring progress

/talent-search
├── Search talent profiles
├── Advanced filters (skills, location, experience)
├── Saved searches
├── Talent recommendations
├── Contact talent directly
├── Save talent profiles
└── Create talent pools

/messages
├── Inbox with conversation list
├── Bulk messaging tools
├── Message templates
├── File sharing
├── Notifications
└── Archive and search

/analytics
├── Casting performance metrics
├── Application analytics
├── Talent engagement data
├── ROI reports
├── Time-to-hire metrics
├── Cost per hire analysis
└── Export reports

/company-profile
├── Company information
├── Verification status
├── Team management
├── Brand assets
├── Company culture
├── Portfolio of work
└── Contact information

/billing
├── Subscription management
├── Payment history
├── Invoices and receipts
├── Payment methods
├── Billing settings
└── Upgrade/downgrade plans

/settings
├── Account settings
├── Team permissions
├── Notification preferences
├── Integration settings
├── Security settings
└── Data export
```

### **🔍 Search & Discovery System**

```
/search
├── Universal search interface
├── Search results with filters
├── Sort options
├── Pagination
├── Search suggestions
└── Recent searches

/search/talent
├── Talent search with advanced filters
├── Profile cards with key information
├── Map view for location-based search
├── Saved searches
├── Talent recommendations
└── Contact talent directly

/search/casting-calls
├── Casting call search
├── Opportunity cards
├── Filter by location, type, compensation
├── Calendar view
├── Alerts and notifications
└── Save searches

/saved-searches
├── Saved search list
├── Edit search criteria
├── Notification settings
├── Search history
├── Recommendations
└── Share searches
```

### **💳 Payment & Subscription System**

```
/pricing
├── Subscription plans comparison
├── Feature breakdown
├── Free trial information
├── Payment methods accepted
├── FAQ about pricing
└── Contact sales

/checkout
├── Plan selection
├── Payment form
├── Billing information
├── Terms acceptance
├── Payment processing
└── Confirmation

/billing
├── Subscription status
├── Payment history
├── Invoices and receipts
├── Update payment method
├── Cancel subscription
└── Billing support

/payment-success
├── Payment confirmation
├── Next steps
├── Access to features
├── Support contact
└── Account setup
```

### **🛠️ Admin Dashboard (Enhanced)**

```
/admin (Admin Dashboard)
├── Overview stats and KPIs
├── User management
├── Content moderation
├── System health
├── Revenue analytics
└── Quick actions

/admin/users
├── User list with filters
├── User details and activity
├── Verification status
├── Account actions
├── User analytics
└── Bulk operations

/admin/casting-calls
├── All casting calls
├── Pending approval queue
├── Content moderation
├── Analytics and metrics
├── Bulk actions
└── Quality control

/admin/digital-twin
├── Source management
├── Content validation queue
├── Scraping status
├── Quality metrics
├── Source analytics
└── Integration monitoring

/admin/validation-queue
├── Pending content review
├── Review interface
├── Approval workflow
├── Rejection reasons
├── Bulk operations
└── Quality metrics

/admin/compliance
├── PDPL compliance dashboard
├── Data export tools
├── Audit logs
├── Privacy requests
├── Compliance reports
└── Legal documentation

/admin/analytics
├── Platform metrics
├── User behavior analytics
├── Revenue analytics
├── Content performance
├── Custom reports
└── Data visualization

/admin/settings
├── System configuration
├── Feature flags
├── Email templates
├── Notification settings
├── Security settings
└── Integration management
```

---

## 🎨 **Enhanced Component Architecture**

### **Layout Components (New)**
```
layouts/
├── PublicLayout (marketing pages)
├── AuthLayout (authentication pages)
├── TalentDashboardLayout (talent features)
├── CasterDashboardLayout (caster features)
├── AdminLayout (admin features)
└── MobileLayout (mobile-specific)
```

### **Enhanced Existing Components**
```
components/
├── ui/ (enhanced basic components)
│   ├── Button (KAFD Noir theme)
│   ├── Input (with validation states)
│   ├── Card (casting call, talent profile)
│   ├── Modal (confirmation, forms)
│   └── Loading (spinners, skeletons)
├── forms/ (enhanced form components)
│   ├── SearchForm (advanced filters)
│   ├── ApplicationForm (casting applications)
│   ├── ProfileForm (user profiles)
│   └── ContactForm (messaging)
├── navigation/ (enhanced nav components)
│   ├── Header (responsive, user-specific)
│   ├── Sidebar (dashboard navigation)
│   ├── Breadcrumbs (hierarchical nav)
│   └── MobileMenu (hamburger menu)
├── data-display/ (enhanced display components)
│   ├── CastingCallCard (enhanced)
│   ├── TalentProfileCard (enhanced)
│   ├── ApplicationCard (new)
│   ├── MessageCard (new)
│   └── StatsCard (new)
├── feedback/ (enhanced feedback components)
│   ├── Alert (success, error, warning)
│   ├── Toast (notifications)
│   ├── Modal (confirmations)
│   └── Progress (loading states)
└── layout/ (enhanced layout components)
    ├── Container (responsive)
    ├── Grid (flexible grid system)
    ├── Section (page sections)
    └── Hero (landing page heroes)
```

### **New Feature Components**
```
features/
├── authentication/
│   ├── LoginForm
│   ├── RegisterForm
│   ├── ForgotPasswordForm
│   └── NafathVerification
├── profile/
│   ├── ProfileEditor
│   ├── PortfolioManager
│   ├── SkillsSelector
│   └── VerificationStatus
├── search/
│   ├── SearchInterface
│   ├── FilterPanel
│   ├── SearchResults
│   └── SavedSearches
├── messaging/
│   ├── MessageList
│   ├── MessageThread
│   ├── MessageComposer
│   └── FileUpload
├── applications/
│   ├── ApplicationList
│   ├── ApplicationForm
│   ├── ApplicationStatus
│   └── InterviewScheduler
├── payments/
│   ├── PaymentForm
│   ├── SubscriptionManager
│   ├── BillingHistory
│   └── InvoiceViewer
└── admin/
    ├── UserManagement
    ├── ContentModeration
    ├── AnalyticsDashboard
    └── SystemSettings
```

---

## 🚀 **Implementation Plan**

### **Phase 1: Foundation & Theming (Week 1)**
1. **Apply KAFD Noir theme** to all existing components
2. **Create layout components** for different user types
3. **Build authentication pages** with Nafath integration
4. **Enhance existing components** with unified styling

### **Phase 2: User Dashboards (Week 2)**
1. **Talent dashboard** with overview and quick actions
2. **Caster dashboard** with metrics and management tools
3. **Profile management** for both user types
4. **Navigation system** with user-specific menus

### **Phase 3: Core Features (Week 3)**
1. **Search interface** with advanced filters
2. **Casting call management** (create, edit, browse)
3. **Application system** (apply, track, manage)
4. **Portfolio management** for talent

### **Phase 4: Communication & Payments (Week 4)**
1. **Messaging system** with file sharing
2. **Payment integration** with Moyasar
3. **Subscription management**
4. **Admin dashboard** enhancements

### **Phase 5: Polish & Launch (Week 5)**
1. **Arabic RTL support** and localization
2. **Mobile optimization** and PWA features
3. **Performance optimization**
4. **Testing and QA**

---

## 🎯 **Key Enhancements Based on Design System**

### **KAFD Noir Theme Implementation**
- **Color Palette**: Noir (#121212), Gold (#FFD700), Azure (#007FFF)
- **Typography**: Inter (English) + IBM Plex Sans Arabic (Arabic)
- **Spacing**: 8px unit system with consistent scale
- **Components**: Material Design 3 with custom theming

### **Cultural Considerations**
- **RTL Support**: Complete Arabic language support
- **Cultural Sensitivity**: Saudi-appropriate imagery and content
- **Trust Building**: Verification badges and security indicators
- **Professional Standards**: Enterprise-grade UI/UX

### **Performance & Accessibility**
- **WCAG 2.1 AA Compliance**: Full accessibility support
- **Mobile-First**: Responsive design across all devices
- **Performance**: <3s page load, <200ms API response
- **PWA Ready**: Offline capabilities and app-like experience

This enhanced sitemap provides a comprehensive roadmap for building a production-ready casting marketplace that serves both talent and casting professionals in Saudi Arabia, with a unified look and feel based on the KAFD Noir design system.

