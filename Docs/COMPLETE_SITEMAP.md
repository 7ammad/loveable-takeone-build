# 🗺️ TakeOne - Complete Sitemap
## Saudi Casting Marketplace Platform

**Generated:** September 30, 2025  
**Status:** Ready for Frontend Development

---

## 🎯 **UI Strategy Recommendation**

### **Answer: KEEP existing UI components, but RESTRUCTURE the app structure**

**Why keep existing components:**
- ✅ **High-quality components** - Well-designed Material-UI components
- ✅ **Consistent theming** - KAFD Noir theme already implemented
- ✅ **Animation system** - Framer Motion integration
- ✅ **Responsive design** - Mobile-first approach
- ✅ **Saudi-specific design** - Cultural considerations already built-in

**What to restructure:**
- 🔄 **App routing** - Current structure is basic, needs proper user flows
- 🔄 **Authentication flow** - Missing login/register pages
- 🔄 **User dashboards** - Need talent and caster dashboards
- 🔄 **Application flows** - Missing core business functionality

---

## 📱 **Complete Sitemap Structure**

### **🌐 Public Pages (No Authentication Required)**

```
/ (Homepage)
├── Landing page with dual user paths
├── "I'm Talent" → /talent
├── "I'm a Caster" → /casters
└── "About Us" → /about

/talent (Talent Landing)
├── Hero section
├── Value propositions
├── How it works
├── Testimonials
├── Trust indicators
└── CTA to register

/casters (Caster Landing)
├── Hero section
├── Value propositions
├── How it works
├── Testimonials
├── Trust indicators
└── CTA to register

/about
├── Company story
├── Mission & vision
├── Team
└── Contact info

/contact
├── Contact form
├── Office locations
└── Support information

/help
├── FAQ
├── User guides
├── Video tutorials
└── Support tickets

/privacy
├── Privacy policy
├── Data protection
└── Cookie policy

/terms
├── Terms of service
├── User agreements
└── Legal notices
```

### **🔐 Authentication Pages**

```
/auth/login
├── Email/password login
├── Social login (Google, Apple)
├── "Forgot password" link
└── "Don't have account?" → /auth/register

/auth/register
├── User type selection (Talent/Caster)
├── Registration form
├── Terms acceptance
└── Email verification

/auth/forgot-password
├── Email input
├── Reset instructions
└── Back to login

/auth/reset-password/[token]
├── New password form
├── Password confirmation
└── Success message

/auth/verify-email/[token]
├── Email verification
├── Success/error states
└── Redirect to appropriate dashboard

/auth/nafath
├── Nafath verification flow
├── National ID input
├── Verification status
└── Annual renewal
```

### **👤 Talent Dashboard & Features**

```
/dashboard (Talent Dashboard)
├── Overview stats
├── Recent applications
├── Profile completion
├── Verification status
└── Quick actions

/profile (Talent Profile)
├── Personal information
├── Physical attributes
├── Skills & experience
├── Portfolio management
├── Contact preferences
└── Privacy settings

/portfolio
├── Photo gallery
├── Video reels
├── Audio samples
├── Upload interface
└── Media organization

/applications
├── Application history
├── Status tracking
├── Application details
├── Communication log
└── Feedback received

/search
├── Casting call search
├── Advanced filters
├── Saved searches
├── Search history
└── Recommendations

/casting-calls
├── Browse opportunities
├── Filter by location/type
├── Sort by date/relevance
├── Casting call details
└── Apply functionality

/casting-calls/[id]
├── Detailed casting call
├── Requirements
├── Application form
├── Submit materials
└── Contact casting director

/messages
├── Inbox
├── Conversations
├── Message threads
├── Notifications
└── Archive

/calendar
├── Audition schedule
├── Availability settings
├── Appointment booking
└── Reminders

/settings
├── Account settings
├── Notification preferences
├── Privacy controls
├── Payment methods
└── Subscription management
```

### **🎬 Caster Dashboard & Features**

```
/dashboard (Caster Dashboard)
├── Overview stats
├── Active casting calls
├── Recent applications
├── Revenue metrics
└── Quick actions

/casting-calls (Manage Casting Calls)
├── Create new casting call
├── Active calls
├── Draft calls
├── Closed calls
└── Analytics

/casting-calls/create
├── Project details
├── Role requirements
├── Application settings
├── Compensation
└── Publish

/casting-calls/[id]/edit
├── Edit casting call
├── Update requirements
├── Manage applications
└── Close/archive

/casting-calls/[id]/applications
├── Application list
├── Filter by status
├── Review applications
├── Shortlist candidates
└── Communication

/talent-search
├── Search talent profiles
├── Advanced filters
├── Saved searches
├── Talent recommendations
└── Contact talent

/messages
├── Inbox
├── Conversations
├── Message threads
├── Notifications
└── Archive

/analytics
├── Performance metrics
├── Application stats
├── Revenue tracking
├── User engagement
└── Reports

/settings
├── Company profile
├── Account settings
├── Notification preferences
├── Payment methods
└── Subscription management
```

### **🔍 Search & Discovery Pages**

```
/search
├── Universal search
├── Search results
├── Filters sidebar
├── Sort options
└── Pagination

/search/talent
├── Talent search
├── Profile cards
├── Advanced filters
├── Map view
└── Saved searches

/search/casting-calls
├── Casting call search
├── Opportunity cards
├── Filter by location/type
├── Calendar view
└── Alerts

/saved-searches
├── Saved search list
├── Edit searches
├── Notification settings
├── Search history
└── Recommendations
```

### **💳 Payment & Subscription Pages**

```
/pricing
├── Subscription plans
├── Feature comparison
├── Free trial info
├── Payment methods
└── FAQ

/checkout
├── Plan selection
├── Payment form
├── Billing information
├── Terms acceptance
└── Confirmation

/billing
├── Subscription status
├── Payment history
├── Invoices
├── Update payment method
└── Cancel subscription

/payment-success
├── Payment confirmation
├── Next steps
├── Access to features
└── Support contact
```

### **🛠️ Admin Dashboard**

```
/admin (Admin Dashboard)
├── Overview stats
├── User management
├── Content moderation
├── System health
└── Quick actions

/admin/users
├── User list
├── User details
├── Verification status
├── Account actions
└── User analytics

/admin/casting-calls
├── All casting calls
├── Pending approval
├── Content moderation
├── Analytics
└── Bulk actions

/admin/digital-twin
├── Source management
├── Content validation
├── Scraping status
├── Quality metrics
└── Source analytics

/admin/validation-queue
├── Pending content
├── Review interface
├── Approval workflow
├── Rejection reasons
└── Bulk operations

/admin/compliance
├── PDPL compliance
├── Data export
├── Audit logs
├── Privacy requests
└── Compliance reports

/admin/analytics
├── Platform metrics
├── User behavior
├── Revenue analytics
├── Content performance
└── Custom reports

/admin/settings
├── System configuration
├── Feature flags
├── Email templates
├── Notification settings
└── Security settings
```

### **📱 Mobile-Specific Pages**

```
/mobile
├── Mobile-optimized interface
├── Touch-friendly navigation
├── Swipe gestures
├── Mobile-specific features
└── App-like experience

/mobile/scan
├── QR code scanner
├── NFC integration
├── Business card scanning
└── Quick actions
```

---

## 🎨 **Component Architecture**

### **Layout Components**
```
layouts/
├── PublicLayout (for marketing pages)
├── AuthLayout (for auth pages)
├── DashboardLayout (for user dashboards)
├── AdminLayout (for admin pages)
└── MobileLayout (for mobile-specific)
```

### **Page Components**
```
pages/
├── public/ (marketing pages)
├── auth/ (authentication)
├── talent/ (talent features)
├── caster/ (caster features)
├── admin/ (admin features)
└── shared/ (common pages)
```

### **Feature Components**
```
features/
├── authentication/
├── profile/
├── search/
├── messaging/
├── payments/
├── media/
└── admin/
```

### **UI Components**
```
components/
├── ui/ (basic UI components)
├── forms/ (form components)
├── navigation/ (nav components)
├── data-display/ (tables, cards)
├── feedback/ (alerts, modals)
└── layout/ (containers, grids)
```

---

## 🚀 **Implementation Priority**

### **Phase 1: Foundation (Weeks 1-2)**
1. **Authentication Flow** - Login, register, password reset
2. **User Dashboards** - Basic talent and caster dashboards
3. **Profile Management** - User profile creation and editing
4. **Navigation System** - Main navigation and routing

### **Phase 2: Core Features (Weeks 3-4)**
1. **Search Interface** - Search pages and filters
2. **Casting Call Management** - Create, edit, browse casting calls
3. **Application Flow** - Apply to casting calls, track status
4. **Media Management** - Portfolio upload and management

### **Phase 3: Advanced Features (Weeks 5-6)**
1. **Messaging System** - In-app messaging
2. **Payment Integration** - Subscription and payment flows
3. **Admin Dashboard** - Content moderation and management
4. **Mobile Optimization** - Responsive design and mobile features

### **Phase 4: Polish & Launch (Weeks 7-8)**
1. **Arabic Localization** - RTL design and Arabic content
2. **Performance Optimization** - Speed and user experience
3. **Testing & QA** - Comprehensive testing
4. **Production Deployment** - Launch preparation

---

## 📋 **File Structure Recommendation**

```
app/
├── (auth)/
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   └── verify-email/
├── (dashboard)/
│   ├── talent/
│   ├── caster/
│   └── admin/
├── (public)/
│   ├── about/
│   ├── contact/
│   └── help/
├── api/ (existing API routes)
├── globals.css
├── layout.tsx
└── page.tsx

components/
├── ui/ (basic components)
├── forms/ (form components)
├── features/ (feature-specific)
├── layouts/ (layout components)
└── existing components (keep and refactor)
```

---

## 🎯 **Key Recommendations**

1. **Keep existing components** - They're well-designed and culturally appropriate
2. **Restructure app routing** - Use Next.js 13+ app router properly
3. **Implement proper layouts** - Different layouts for different user types
4. **Focus on user flows** - Authentication → Dashboard → Core features
5. **Mobile-first approach** - Ensure all features work on mobile
6. **Arabic RTL support** - Plan for Arabic localization from the start

This sitemap provides a complete roadmap for building a production-ready casting marketplace platform that serves both talent and casting professionals in Saudi Arabia.

