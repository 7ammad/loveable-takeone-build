# TakeOne Platform Sitemap & Information Architecture

**Version 1.0** | **September 2025** | **Manus AI**

---

## Information Architecture Overview

The TakeOne platform is structured around two primary user types (Talent and Hirers) with distinct but interconnected user journeys. The information architecture prioritizes discoverability, trust-building, and efficient task completion while supporting both Arabic and English languages.

## Primary Navigation Structure

### Public Pages (Unauthenticated)
```
TakeOne.sa/
├── Home (Landing Page)
├── About
│   ├── Our Story
│   ├── Vision 2030 Alignment
│   └── Team
├── How It Works
│   ├── For Talent
│   └── For Hirers
├── Pricing
├── Safety & Trust
│   ├── Verification Process
│   ├── Safety Guidelines
│   └── Community Standards
├── Support
│   ├── Help Center
│   ├── Contact Us
│   └── FAQ
├── Legal
│   ├── Terms of Service
│   ├── Privacy Policy (PDPL Compliant)
│   └── Community Guidelines
├── Login
└── Sign Up
    ├── Join as Talent
    └── Join as Hirer
```

### Talent Dashboard (Authenticated - B2C)
```
Dashboard/
├── Overview
│   ├── Quick Stats
│   ├── Recent Activity
│   ├── Upcoming Auditions
│   └── Notifications
├── Opportunities
│   ├── Browse Casting Calls
│   ├── Saved Opportunities
│   ├── Applied Opportunities
│   └── Advanced Search & Filters
├── My Profile
│   ├── Basic Information
│   ├── Portfolio Management
│   ├── Skills & Experience
│   ├── Verification Status
│   └── Privacy Settings
├── Applications
│   ├── Active Applications
│   ├── Application History
│   ├── Interview Schedules
│   └── Offers & Contracts
├── Messages
│   ├── Conversations
│   ├── Notifications
│   └── Archived Messages
├── Career Hub
│   ├── Industry News
│   ├── Training Resources
│   ├── Career Tips
│   └── Success Stories
├── Earnings
│   ├── Payment History
│   ├── Tax Documents
│   └── Payment Methods
└── Settings
    ├── Account Settings
    ├── Notification Preferences
    ├── Privacy Controls
    └── Language Settings
```

### Hirer Dashboard (Authenticated - B2B)
```
Dashboard/
├── Overview
│   ├── Active Casting Calls
│   ├── Application Summary
│   ├── Recent Activity
│   └── Performance Metrics
├── Casting Management
│   ├── Create New Casting Call
│   ├── Active Casting Calls
│   ├── Draft Casting Calls
│   └── Archived Casting Calls
├── Talent Discovery
│   ├── Browse Talent
│   ├── Advanced Search & Filters
│   ├── Saved Talent Profiles
│   └── Talent Recommendations
├── Applications
│   ├── Pending Review
│   ├── Shortlisted Candidates
│   ├── Interview Scheduling
│   └── Application Archive
├── Messages
│   ├── Conversations
│   ├── Bulk Messaging
│   └── Message Templates
├── Company Profile
│   ├── Company Information
│   ├── Verification Status
│   ├── Team Management
│   └── Brand Assets
├── Analytics
│   ├── Casting Performance
│   ├── Application Metrics
│   ├── Talent Engagement
│   └── ROI Reports
├── Billing
│   ├── Subscription Management
│   ├── Payment History
│   ├── Invoices
│   └── Payment Methods
└── Settings
    ├── Account Settings
    ├── Team Permissions
    ├── Notification Preferences
    └── Integration Settings
```

## Key User Flows

### Talent User Journey
1. **Discovery & Registration**
   - Landing Page → Sign Up → Email Verification → Profile Setup
2. **Profile Building**
   - Basic Info → Portfolio Upload → Skills Selection → Verification Process
3. **Opportunity Discovery**
   - Browse Casting Calls → Filter & Search → Save Opportunities
4. **Application Process**
   - View Casting Details → Submit Application → Track Status
5. **Communication & Hiring**
   - Receive Messages → Schedule Interviews → Accept Offers

### Hirer User Journey
1. **Business Onboarding**
   - Landing Page → Business Sign Up → Company Verification → Team Setup
2. **Casting Call Creation**
   - Create Casting → Add Requirements → Set Budget → Publish
3. **Talent Discovery**
   - Browse Talent → Advanced Filters → Save Profiles → Send Invitations
4. **Application Management**
   - Review Applications → Shortlist Candidates → Schedule Interviews
5. **Hiring & Payment**
   - Make Offers → Finalize Contracts → Process Payments

## Mobile Navigation Patterns

### Talent Mobile App
```
Bottom Navigation:
├── Home (Dashboard Overview)
├── Search (Opportunities)
├── Applications (Status Tracking)
├── Messages (Communication)
└── Profile (Settings & Portfolio)

Top Navigation:
├── Notifications
├── Search
└── Menu (Hamburger)
```

### Hirer Mobile App
```
Bottom Navigation:
├── Dashboard (Overview)
├── Casting (Management)
├── Talent (Discovery)
├── Applications (Review)
└── Messages (Communication)

Top Navigation:
├── Notifications
├── Quick Actions
└── Menu (Hamburger)
```

## Search & Discovery Architecture

### Talent Search Filters
- **Location**: City, Region, Willing to Travel
- **Skills**: Acting, Modeling, Voice Over, Dance, etc.
- **Experience Level**: Beginner, Intermediate, Professional
- **Age Range**: Configurable ranges
- **Gender**: Male, Female, Non-binary
- **Languages**: Arabic, English, Other
- **Availability**: Immediate, Within 1 week, Within 1 month
- **Rate Range**: Hourly/Daily/Project rates

### Casting Call Filters
- **Industry**: Film, TV, Commercial, Theater, Digital Content
- **Role Type**: Lead, Supporting, Background, Voice Over
- **Location**: Production location and travel requirements
- **Compensation**: Paid, Unpaid, Deferred, Copy/Credit
- **Timeline**: Application deadline, shoot dates
- **Experience Required**: Entry level to Professional
- **Special Requirements**: Languages, skills, physical attributes

## Content Management Structure

### Dynamic Content Areas
- **Industry News & Updates**
- **Featured Casting Calls**
- **Success Stories**
- **Training Resources**
- **Community Spotlights**
- **Platform Announcements**

### Static Content Pages
- **Safety Guidelines**
- **Best Practices**
- **Platform Tutorials**
- **Legal Documentation**
- **Support Resources**

## Admin & Moderation Interface

### Content Moderation
- **Profile Review Queue**
- **Casting Call Approval**
- **Reported Content Management**
- **User Verification Process**
- **Community Guidelines Enforcement**

### Platform Analytics
- **User Engagement Metrics**
- **Content Performance**
- **Safety & Trust Indicators**
- **Business Intelligence Dashboard**
- **Revenue & Growth Tracking**

This sitemap provides a comprehensive structure for the TakeOne platform, ensuring intuitive navigation while supporting the complex workflows of both talent and hirers in the Saudi entertainment industry.
