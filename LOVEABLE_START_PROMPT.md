# 🎭 TakeOne UI Development - Loveable Start Prompt

## 🚀 **IMMEDIATE ACTION REQUIRED**

You are tasked with building the complete UI for **TakeOne**, Saudi Arabia's premier casting marketplace platform. This is an enterprise-grade application that connects talent with casting opportunities while ensuring trust, security, and compliance with Saudi regulations.

## 📋 **WHAT YOU NEED TO DO**

### **STEP 1: Clone and Setup** ⚡
```bash
git clone https://github.com/7ammad/loveable-takeone-build.git
cd loveable-takeone-build
git checkout frontend-blueprint
```

### **STEP 2: Read the Complete Blueprint** 📖
**CRITICAL:** Open and read `takeone-ui-development-package.md` - this contains EVERYTHING you need:
- Complete technical specifications
- Design system with exact color codes
- Component implementation examples
- API integration patterns
- Structured prompts for each feature

## 🎯 **PROJECT OVERVIEW**

**TakeOne** is a premium casting marketplace for Saudi Arabia's entertainment industry featuring:

### **Core Features:**
- 🎬 **Talent Discovery** - Browse and discover Saudi talent
- 🎭 **Casting Calls** - Post and manage casting opportunities  
- 🔐 **Nafath Integration** - Saudi ID verification system
- 💬 **Messaging System** - Secure communication between talent and hirers
- 📱 **Mobile-First Design** - Responsive across all devices
- 🌐 **Bilingual Support** - Arabic (RTL) and English (LTR)

### **User Types:**
1. **Talent** - Actors, models, performers seeking opportunities
2. **Hirers** - Production companies, agencies, independent filmmakers

## 🎨 **DESIGN SYSTEM (CRITICAL)**

### **KAFD Noir Color Palette:**
```css
/* PRIMARY COLORS */
--noir: #121212;        /* Background */
--gold: #FFD700;        /* Primary CTA */
--white: #FFFFFF;       /* Text */

/* SECONDARY COLORS */
--azure: #007FFF;       /* Secondary actions */
--silver: #C0C0C0;      /* Borders */

/* SEMANTIC COLORS */
--success: #28A745;     /* Success states */
--warning: #FFC107;     /* Warnings */
--error: #DC3545;       /* Errors */
```

### **Typography:**
- **English:** Inter font family
- **Arabic:** IBM Plex Sans Arabic
- **Scale:** 1.250 Major Third ratio

### **Spacing:** 8px grid system
### **Animations:** 100ms (fast), 200ms (base), 400ms (slow)

## 🛠 **TECHNICAL STACK**

- **Framework:** Next.js 15 with TypeScript
- **Styling:** Tailwind CSS 4.x
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** TanStack Query
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Animations:** Framer Motion

## 📱 **KEY PAGES TO BUILD**

### **1. Landing Page (Priority #1)**
- Hero section with "Where Saudi Talent Meets Opportunity"
- Trust bar with partner logos (MBC, Telfaz11, etc.)
- Value propositions (Verified Opportunities, Secure Payments, Real-time Matching)
- How it works section
- Bilingual support toggle

### **2. Authentication System**
- Login/Register forms
- Nafath integration (Saudi ID verification)
- Multi-step registration for talent vs hirers
- Email verification flow

### **3. Dashboard (Role-Specific)**
- **Talent Dashboard:** Applications, profile completion, recommendations
- **Hirer Dashboard:** Casting calls, applications received, talent search

### **4. Casting Call Management**
- Browse casting calls with filters
- Detailed casting call pages
- Application submission flow
- Post new casting calls (for hirers)

### **5. Talent Profiles**
- Comprehensive talent profiles
- Portfolio galleries
- Skills and experience display
- Contact and availability

## 🔗 **BACKEND INTEGRATION**

**API Base URL:** `http://localhost:3000` (configured in the project)

### **Key Endpoints:**
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/casting-calls` - Browse casting calls
- `POST /api/v1/casting-calls` - Create casting call
- `GET /api/v1/profile/talent` - Talent profile
- `POST /api/v1/applications` - Submit application

**Complete API documentation is in the repository.**

## 🎯 **SUCCESS CRITERIA**

### **Must Have (MVP):**
- ✅ Responsive landing page with KAFD Noir design
- ✅ User registration/login with role selection
- ✅ Casting call browsing and filtering
- ✅ Talent profile creation and viewing
- ✅ Application submission flow
- ✅ Mobile-responsive design
- ✅ Arabic (RTL) language support

### **Should Have:**
- ✅ Nafath integration
- ✅ Messaging system
- ✅ Advanced search and filtering
- ✅ File uploads (portfolios, resumes)
- ✅ Notifications system

## 🚨 **CRITICAL REQUIREMENTS**

### **Saudi Compliance:**
- **Nafath Integration** - Saudi national ID verification
- **Arabic RTL Support** - Proper right-to-left layout
- **Cultural Sensitivity** - Appropriate content and imagery
- **Data Privacy** - GDPR-compliant data handling

### **Performance:**
- **Page Load Time:** < 3 seconds
- **Mobile Performance:** Optimized for Saudi mobile networks
- **Accessibility:** WCAG 2.1 AA compliance

## 📚 **RESOURCES PROVIDED**

1. **`takeone-ui-development-package.md`** - Complete technical blueprint
2. **Component Examples** - Ready-to-use React components
3. **API Integration** - Complete backend integration patterns
4. **Design System** - Exact specifications and tokens
5. **Structured Prompts** - Step-by-step prompts for each feature

## 🎬 **GETTING STARTED**

### **Phase 1: Foundation (Day 1)**
1. Set up Next.js project with TypeScript
2. Configure Tailwind with KAFD Noir theme
3. Implement basic layout and routing
4. Add bilingual support (Arabic/English)

### **Phase 2: Core Features (Days 2-3)**
1. Build landing page with hero and value propositions
2. Implement authentication system
3. Create role-specific dashboards
4. Build casting call browsing interface

### **Phase 3: Advanced Features (Days 4-5)**
1. Implement talent profiles
2. Add application submission flow
3. Integrate messaging system
4. Add file upload capabilities

## 💡 **PRO TIPS**

1. **Start with the landing page** - It sets the tone for the entire platform
2. **Use the provided component examples** - They follow the exact design system
3. **Test Arabic RTL early** - Don't leave it until the end
4. **Follow the structured prompts** - They're designed for your Agent Mode
5. **Reference the backend APIs** - Integration is already documented

## 🆘 **SUPPORT**

- **Complete Documentation:** Everything is in `takeone-ui-development-package.md`
- **Component Library:** Pre-built components in `/components/ui/`
- **API Reference:** Complete endpoint documentation provided
- **Design System:** Exact specifications and tokens included

## 🎯 **YOUR MISSION**

Build a world-class, enterprise-grade casting marketplace that:
- ✨ Looks and feels premium (KAFD Noir design)
- 🚀 Performs flawlessly on all devices
- 🌍 Serves both Arabic and English users
- 🔒 Maintains the highest security standards
- 🇸🇦 Respects Saudi cultural and regulatory requirements

**Remember:** This is Saudi Arabia's premier entertainment platform. Quality, performance, and cultural sensitivity are paramount.

---

## 🚀 **START NOW**

```bash
git clone https://github.com/7ammad/loveable-takeone-build.git
cd loveable-takeone-build
git checkout frontend-blueprint
# Open takeone-ui-development-package.md
# Begin with the Initial Setup Prompt
```

**The complete blueprint is ready. The backend APIs are documented. The design system is specified. Now build something amazing! 🎭✨**

---

*This prompt contains everything needed to build TakeOne's UI. Follow the structured prompts in `takeone-ui-development-package.md` for step-by-step guidance.*
