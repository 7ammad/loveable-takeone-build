# 🎭 TakeOne UI Development - Loveable Next Steps Prompt

## 🚀 **IMMEDIATE ACTION REQUIRED**

You are tasked with building the **remaining UI components** for **TakeOne**, Saudi Arabia's premier casting marketplace platform. The landing page is already complete and functional. Now we need to build the core application features.

## 📋 **WHAT YOU NEED TO DO**

### **STEP 1: Clone and Setup** ⚡
```bash
git clone https://github.com/7ammad/loveable-takeone-build.git
cd loveable-takeone-build
git checkout frontend-blueprint
```

### **STEP 2: Review Existing Landing Page** ✅
**LANDING PAGE IS COMPLETE** - Located in `src/pages/Index.tsx` with all sections:
- Header with navigation
- Hero section with CTAs
- Trust bar with partner logos
- How it works section
- Talent showcase carousel
- Casting opportunities grid
- Advantages tabbed interface
- Testimonials section
- Final CTA and footer

### **STEP 3: Understand Existing Project Structure** 🏗️
**PROJECT STRUCTURE:**
```
src/
├── pages/
│   ├── Index.tsx          # ✅ Landing page (COMPLETE)
│   └── NotFound.tsx       # ✅ 404 page
├── components/
│   ├── ui/                # ✅ shadcn/ui library (COMPLETE)
│   ├── Header.tsx         # ✅ Navigation header
│   ├── Hero.tsx           # ✅ Hero section
│   ├── Footer.tsx         # ✅ Footer component
│   └── [other landing components]
├── App.tsx                # ✅ Main app with routing
└── main.tsx               # ✅ App entry point
```

### **STEP 4: Read the Complete Blueprint** 📖
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

## 📱 **KEY PAGES TO BUILD (NEXT STEPS)**

### **1. Authentication System (Priority #1)** 🔐
- **Login/Register forms** with role selection (Talent vs Hirer)
- **Nafath integration** (Saudi ID verification)
- **Multi-step registration** with profile setup
- **Email verification flow**
- **Password reset functionality**

### **2. Dashboard (Role-Specific)** 📊
- **Talent Dashboard:** Applications, profile completion, recommendations
- **Hirer Dashboard:** Casting calls, applications received, talent search
- **KPI cards** with statistics
- **Recent activity feeds**
- **Quick action buttons**

### **3. Profile Management** 👤
- **Talent Profile Creation:** Skills, experience, portfolio uploads
- **Hirer Profile Setup:** Company info, commercial registration
- **Profile editing** with form validation
- **Image/portfolio galleries**
- **Availability management**

### **4. Casting Call System** 🎬
- **Browse casting calls** with advanced filters
- **Detailed casting call pages** with application flow
- **Post new casting calls** (for hirers)
- **Application management** (status tracking)
- **Search and discovery** features

### **5. Talent Discovery** 🔍
- **Talent search** with filters (skills, location, experience)
- **Talent profile pages** with portfolios
- **Contact and messaging** system
- **Talent recommendations** based on casting needs

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
- ✅ **Landing page** (COMPLETE - Responsive with KAFD Noir design)
- ❌ **User registration/login** with role selection
- ❌ **Casting call browsing and filtering**
- ❌ **Talent profile creation and viewing**
- ❌ **Application submission flow**
- ✅ **Mobile-responsive design** (Landing page complete)
- ❌ **Arabic (RTL) language support** (for new components)

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

## 🎬 **GETTING STARTED (NEXT STEPS)**

### **Phase 1: Authentication & Routing (Day 1)**
1. **Set up React Router** for multi-page navigation
2. **Create authentication pages** (Login, Register, Forgot Password)
3. **Implement role selection** (Talent vs Hirer)
4. **Add protected routes** and authentication guards

### **Phase 2: User Dashboards (Days 2-3)**
1. **Build Talent Dashboard** with applications and profile completion
2. **Create Hirer Dashboard** with casting calls and applications
3. **Implement KPI cards** and statistics
4. **Add quick action buttons** and navigation

### **Phase 3: Core Features (Days 4-5)**
1. **Build profile creation/editing** pages
2. **Implement casting call browsing** with filters
3. **Create talent search** and discovery
4. **Add application submission** flow

### **Phase 4: Advanced Features (Days 6-7)**
1. **Integrate messaging system**
2. **Add file upload** capabilities (portfolios, resumes)
3. **Implement notifications**
4. **Add Arabic (RTL) support** for new components

## 💡 **PRO TIPS**

1. **Landing page is complete** - Use it as reference for design consistency
2. **Follow the existing component structure** - Build new pages in `src/pages/`
3. **Use the shadcn/ui library** - Already installed in `src/components/ui/`
4. **Follow the structured prompts** - They're designed for your Agent Mode
5. **Reference the backend APIs** - Integration is already documented
6. **Test Arabic RTL early** - Don't leave it until the end

## 🛠️ **HOW TO BUILD ON EXISTING CODEBASE**

### **1. Add New Routes to App.tsx**
```tsx
// Add these routes to your existing App.tsx
<Routes>
  <Route path="/" element={<Index />} />           {/* ✅ Already exists */}
  <Route path="/login" element={<Login />} />      {/* ❌ Build this */}
  <Route path="/register" element={<Register />} /> {/* ❌ Build this */}
  <Route path="/dashboard" element={<Dashboard />} /> {/* ❌ Build this */}
  <Route path="*" element={<NotFound />} />        {/* ✅ Already exists */}
</Routes>
```

### **2. Create New Page Components**
```bash
# Create these new files:
src/pages/Login.tsx
src/pages/Register.tsx
src/pages/Dashboard.tsx
src/pages/Profile.tsx
src/pages/CastingCalls.tsx
src/pages/TalentSearch.tsx
```

### **3. Use Existing Design System**
- **Colors:** Use the same HSL tokens from `src/index.css`
- **Components:** Leverage `src/components/ui/` (Button, Card, Input, etc.)
- **Layout:** Follow the same responsive patterns as landing page
- **Typography:** Use the same font system and sizing

### **4. Extend Existing Components**
- **Header.tsx:** Add authentication state and user menu
- **Footer.tsx:** Add links to new pages
- **Navigation:** Update header links to include new sections

## 🆘 **SUPPORT**

- **Complete Documentation:** Everything is in `takeone-ui-development-package.md`
- **Component Library:** Pre-built components in `/components/ui/`
- **Backend APIs:** All endpoints documented and ready
- **Design System:** Complete KAFD Noir specifications included
- **Landing Page Reference:** Use `src/pages/Index.tsx` for design consistency

## 🎯 **YOUR MISSION**

Build the remaining features for Saudi Arabia's premier casting marketplace that:
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
