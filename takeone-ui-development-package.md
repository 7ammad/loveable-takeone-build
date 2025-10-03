# TakeOne UI Development Package for Loveable
## Complete Technical Blueprint & Integration Guide

**Version:** 2.0  
**Date:** October 3, 2025  
**Purpose:** Complete technical documentation for building enterprise-grade UI for TakeOne Saudi Casting Marketplace using Loveable platform

## 🎉 **LANDING PAGE STATUS: COMPLETE**

**✅ Landing Page Built by Loveable Agent:**
- **Location:** `src/pages/Index.tsx`
- **Status:** Fully functional with all sections
- **Components:** 10 major sections implemented
- **Design:** KAFD Noir theme with responsive design
- **Features:** Interactive carousels, animations, video backgrounds

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Architecture](#2-project-architecture)
3. [Design System Specifications](#3-design-system-specifications)
4. [Backend API Integration](#4-backend-api-integration)
5. [Data Models & TypeScript Types](#5-data-models--typescript-types)
6. [Component Implementation Guide](#6-component-implementation-guide)
7. [Authentication & Security](#7-authentication--security)
8. [Structured Prompts for Loveable Agent](#8-structured-prompts-for-loveable-agent)
9. [Environment Configuration](#9-environment-configuration)
10. [Quality Assurance Checklist](#10-quality-assurance-checklist)

---

## 1. Executive Summary

### 1.1. Project Overview

**TakeOne** is an enterprise-grade casting marketplace platform for Saudi Arabia's entertainment industry. It connects talent (actors, models, performers) with casting opportunities while ensuring trust, security, and compliance with Saudi regulations.

### 1.2. Technical Stack

| Category | Technology | Version |
|:---------|:-----------|:--------|
| **Framework** | Next.js | 15.5.3 |
| **Language** | TypeScript | 5.9.2 |
| **UI Library** | React | 19.1.0 |
| **Styling** | Tailwind CSS | 4.x |
| **State Management** | TanStack Query | 5.90.2 |
| **Forms** | React Hook Form | 7.63.0 |
| **UI Components** | Radix UI | Latest |
| **Icons** | Lucide React | 0.544.0 |
| **Animations** | Framer Motion | 12.23.22 |

### 1.3. Build Environment

- **Package Manager:** PNPM
- **Build Tool:** Turbopack (via Next.js flag)
- **Node Version:** 20+
- **TypeScript:** Strict mode enabled

### 1.4. Key Requirements

1. **Enterprise-Grade UI:** Professional, scalable, performant
2. **Bilingual Support:** Arabic (RTL) and English (LTR)
3. **Mobile-First:** Responsive design across all devices
4. **Accessibility:** WCAG 2.1 AA compliance
5. **Trust & Verification:** Prominent trust signals throughout
6. **Real-Time Updates:** Live marketplace feel with instant feedback

---

## 2. Project Architecture

### 2.1. Directory Structure

```
takeone-ui/
├── src/
│   ├── pages/
│   │   ├── Index.tsx             # ✅ Landing page (COMPLETE)
│   │   ├── NotFound.tsx          # ✅ 404 page
│   │   ├── Login.tsx             # ❌ Build next
│   │   ├── Register.tsx          # ❌ Build next
│   │   ├── Dashboard.tsx         # ❌ Build next
│   │   ├── Profile.tsx           # ❌ Build next
│   │   ├── CastingCalls.tsx      # ❌ Build next
│   │   └── TalentSearch.tsx      # ❌ Build next
│   ├── components/
│   │   ├── ui/                   # ✅ shadcn/ui library (COMPLETE)
│   │   ├── Header.tsx            # ✅ Navigation header
│   │   ├── Hero.tsx              # ✅ Hero section
│   │   ├── TrustBar.tsx          # ✅ Partner logos
│   │   ├── HowItWorks.tsx        # ✅ Process explanation
│   │   ├── TalentShowcase.tsx    # ✅ Interactive carousel
│   │   ├── CastingOpportunities.tsx # ✅ Job grid
│   │   ├── Advantages.tsx        # ✅ Tabbed benefits
│   │   ├── Testimonials.tsx      # ✅ User reviews
│   │   ├── CTA.tsx               # ✅ Final call-to-action
│   │   ├── Footer.tsx            # ✅ Site footer
│   │   └── features/             # ❌ Build feature components
│   │       ├── casting-call/
│   │       ├── talent-profile/
│   │       ├── application/
│   │       └── messaging/
│   ├── App.tsx                   # ✅ Main app with routing
│   └── main.tsx                  # ✅ App entry point
├── public/
│   ├── images/                   # ✅ Landing page assets
│   ├── videos/                   # ✅ talent-bg.mp4
│   └── fonts/                    # ✅ Typography assets
├── lib/
│   ├── api/                      # ❌ Build API client
│   ├── hooks/                    # ❌ Build custom hooks
│   ├── utils/                    # ❌ Build utilities
│   └── types/                    # ❌ Build TypeScript types
└── config/
    ├── site.ts                   # ❌ Build site config
    └── api.ts                    # ❌ Build API endpoints

```

### 2.2. Routing Strategy

**React Router** (Current Implementation):
- **✅ Landing Page:** `/` (Index.tsx)
- **✅ 404 Page:** `*` (NotFound.tsx)
- **❌ Authentication:** `/login`, `/register`, `/forgot-password`
- **❌ Dashboard:** `/dashboard` (role-specific)
- **❌ Profile Management:** `/profile`, `/profile/edit`
- **❌ Casting System:** `/casting-calls`, `/casting-calls/:id`
- **❌ Talent Discovery:** `/talent`, `/talent/:id`
- **❌ Applications:** `/applications`, `/applications/:id`
- **❌ Messages:** `/messages`, `/messages/:id`
- **❌ Settings:** `/settings`

**Routing Setup in App.tsx:**
```tsx
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### 2.3. State Management Strategy

```typescript
// Use TanStack Query for server state
import { useQuery, useMutation } from '@tanstack/react-query';

// Use React Context for global UI state (theme, locale)
// Use React Hook Form for form state
// Avoid global state management libraries (Redux, Zustand) unless absolutely necessary
```

---

## 3. Completed Landing Page Components

### 3.1. Landing Page Architecture (COMPLETE ✅)

**Main Component:** `src/pages/Index.tsx`
- Orchestrates all landing page sections
- Handles responsive layout and scroll behavior
- Manages component interactions and state

### 3.2. Component Breakdown (All Implemented ✅)

#### **Header Component** (`src/components/Header.tsx`)
- **Features:** Fixed navigation with logo, navigation links, login button
- **Design:** Sticky header with blur backdrop effect
- **Responsive:** Mobile hamburger menu
- **Links:** "Discover Talent", "Find Jobs", Login button

#### **Hero Section** (`src/components/Hero.tsx`)
- **Features:** Full-screen hero with gradient background
- **Content:** "Streamline The Art of Casting" headline
- **CTAs:** "Land Your Dream Role", "Cast Your Next Star"
- **Design:** Dark gradient with spotlight effects

#### **Trust Bar** (`src/components/TrustBar.tsx`)
- **Features:** Scrolling partner logos carousel
- **Partners:** Netflix, MBC, Rotana, and other major brands
- **Animation:** Smooth horizontal scrolling effect
- **Responsive:** Adapts to different screen sizes

#### **How It Works** (`src/components/HowItWorks.tsx`)
- **Features:** 3-step process explanation
- **Layout:** Large numbered steps with descriptions
- **Design:** Clean, easy-to-follow workflow
- **Content:** Step-by-step guide for both talent and hirers

#### **Talent Showcase** (`src/components/TalentShowcase.tsx`)
- **Features:** Interactive carousel with 7 talent profiles
- **Background:** Video background (`public/talent-bg.mp4`)
- **Interaction:** Expandable panels on hover
- **Navigation:** Arrow controls with responsive design
- **Responsive:** 1 panel (mobile), 3 panels (tablet), 5 panels (desktop)

#### **Casting Opportunities** (`src/components/CastingOpportunities.tsx`)
- **Features:** Grid of casting job cards
- **Content:** Title, company, location, deadline
- **Actions:** "Apply Now" buttons with urgency indicators
- **Design:** Card-based layout with hover effects

#### **Advantages** (`src/components/Advantages.tsx`)
- **Features:** Tabbed interface for different user types
- **Tabs:** "For Talent" vs "For Hirers"
- **Content:** Benefits lists with icons for each user type
- **Design:** Clean tabbed layout with smooth transitions

#### **Testimonials** (`src/components/Testimonials.tsx`)
- **Features:** User testimonials with images
- **Layout:** Alternating left/right layout
- **Design:** Quote styling with animations
- **Content:** Real user feedback and success stories

#### **CTA Section** (`src/components/CTA.tsx`)
- **Features:** Final call-to-action with background image
- **CTAs:** "Create My Profile", "Find Top Talent"
- **Design:** Compelling background with prominent buttons
- **Purpose:** Convert visitors to users

#### **Footer** (`src/components/Footer.tsx`)
- **Features:** 4-column layout with comprehensive links
- **Columns:** Brand, For Talent, For Casting, Company
- **Links:** Various page links and social media
- **Design:** Dark theme with organized information

### 3.3. Design System Implementation (COMPLETE ✅)

**Styling Files:**
- `src/index.css` - Global styles and CSS variables
- `tailwind.config.ts` - Tailwind configuration with semantic tokens
- `src/App.css` - Additional app-level styles

**Color System:**
- Uses HSL semantic tokens (background, foreground, primary, card, muted, etc.)
- Dark theme with gray backgrounds
- Primary accent color for CTAs and highlights

**UI Components:**
- Full shadcn/ui library installed in `src/components/ui/`
- Button, Card, Tabs, and other primitives available

### 3.4. Key Features Implemented ✅

- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Animations with Framer Motion
- ✅ Video backgrounds
- ✅ Interactive carousels
- ✅ Semantic HTML structure
- ✅ Design system with tokens
- ✅ Accessibility features
- ✅ Performance optimizations

---

## 4. What Needs to Be Built Next

### 4.1. Priority Order for Development

#### **Phase 1: Authentication System (Days 1-2)** 🔐
**Files to Create:**
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/pages/ForgotPassword.tsx`
- `src/components/auth/AuthForm.tsx`
- `src/components/auth/RoleSelector.tsx`
- `src/components/auth/NafathIntegration.tsx`

**Features:**
- Login/Register forms with role selection
- Nafath integration (Saudi ID verification)
- Multi-step registration process
- Email verification flow
- Password reset functionality

#### **Phase 2: User Dashboards (Days 3-4)** 📊
**Files to Create:**
- `src/pages/Dashboard.tsx`
- `src/components/dashboard/TalentDashboard.tsx`
- `src/components/dashboard/HirerDashboard.tsx`
- `src/components/dashboard/KPICards.tsx`
- `src/components/dashboard/ActivityFeed.tsx`
- `src/components/dashboard/QuickActions.tsx`

**Features:**
- Role-specific dashboard layouts
- KPI cards with statistics
- Recent activity feeds
- Quick action buttons
- Responsive sidebar navigation

#### **Phase 3: Profile Management (Days 5-6)** 👤
**Files to Create:**
- `src/pages/Profile.tsx`
- `src/pages/ProfileEdit.tsx`
- `src/components/profile/TalentProfileForm.tsx`
- `src/components/profile/HirerProfileForm.tsx`
- `src/components/profile/PortfolioGallery.tsx`
- `src/components/profile/ImageUpload.tsx`

**Features:**
- Profile creation and editing
- Image/portfolio uploads
- Skills and experience management
- Company information setup
- Profile completion tracking

#### **Phase 4: Casting System (Days 7-8)** 🎬
**Files to Create:**
- `src/pages/CastingCalls.tsx`
- `src/pages/CastingCallDetail.tsx`
- `src/pages/CreateCastingCall.tsx`
- `src/components/casting/CastingCallCard.tsx`
- `src/components/casting/ApplicationForm.tsx`
- `src/components/casting/FilterSidebar.tsx`

**Features:**
- Browse casting calls with filters
- Detailed casting call pages
- Application submission flow
- Post new casting calls
- Application management

#### **Phase 5: Talent Discovery (Days 9-10)** 🔍
**Files to Create:**
- `src/pages/TalentSearch.tsx`
- `src/pages/TalentProfile.tsx`
- `src/components/talent/TalentCard.tsx`
- `src/components/talent/TalentFilters.tsx`
- `src/components/talent/TalentGrid.tsx`
- `src/components/talent/ContactModal.tsx`

**Features:**
- Talent search with advanced filters
- Talent profile pages
- Contact and messaging system
- Talent recommendations
- Portfolio viewing

### 4.2. Integration Points with Landing Page

#### **Navigation Updates:**
- Update `src/components/Header.tsx` to include authentication state
- Add user menu dropdown when logged in
- Update navigation links to new pages

#### **CTA Integration:**
- Connect "Land Your Dream Role" button to registration flow
- Connect "Cast Your Next Star" button to hirer registration
- Update footer links to point to new pages

#### **Design Consistency:**
- Use same color tokens from landing page
- Maintain responsive patterns
- Keep animation timing consistent
- Follow established component patterns

---

## 5. Design System Specifications

### 5.1. KAFD Noir Color Palette

#### Primary Colors
```css
/* Noir - Primary Background */
--color-noir: #121212;

/* Gold - Primary Accent */
--color-gold: #FFD700;
--color-gold-hover: #E6C200;

/* White - Primary Text */
--color-white: #FFFFFF;
```

#### Secondary Colors
```css
/* Azure - Secondary Accent */
--color-azure: #007FFF;
--color-azure-hover: #0066CC;

/* Silver - Borders & Dividers */
--color-silver: #C0C0C0;
```

#### Semantic Colors
```css
/* Success */
--color-success: #28A745;

/* Warning */
--color-warning: #FFC107;

/* Error */
--color-error: #DC3545;

/* Info */
--color-info: #17A2B8;
```

#### Grayscale Palette
```css
--gray-100: #F8F9FA;
--gray-200: #E9ECEF;
--gray-300: #DEE2E6;
--gray-400: #CED4DA;
--gray-500: #ADB5BD;
--gray-600: #6C757D;
--gray-700: #495057;
--gray-800: #343A40;
--gray-900: #212529;
```

### 5.2. Typography

#### Font Families
```css
/* English (LTR) */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Arabic (RTL) */
--font-arabic: 'IBM Plex Sans Arabic', sans-serif;
```

#### Type Scale (1.250 Major Third Ratio)
```css
--text-display-1: 3.052rem;    /* 48.83px */
--text-display-2: 2.441rem;    /* 39.06px */
--text-heading-1: 1.953rem;    /* 31.25px */
--text-heading-2: 1.563rem;    /* 25px */
--text-heading-3: 1.25rem;     /* 20px */
--text-body: 1rem;             /* 16px */
--text-small: 0.8rem;          /* 12.8px */
--text-caption: 0.64rem;       /* 10.24px */
```

#### Font Weights
```css
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 5.3. Spacing System (8px Grid)

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
```

### 5.4. Border Radius

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

### 5.5. Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### 5.6. Responsive Breakpoints

```css
--breakpoint-mobile: 320px;
--breakpoint-tablet: 768px;
--breakpoint-desktop: 1024px;
--breakpoint-large: 1440px;
```

### 5.7. Animation Tokens

```css
/* Durations */
--duration-fast: 100ms;
--duration-base: 200ms;
--duration-slow: 400ms;

/* Easing */
--ease-in-out: cubic-bezier(0.42, 0, 0.58, 1);
--ease-out: cubic-bezier(0, 0, 0.58, 1);
--ease-in: cubic-bezier(0.42, 0, 1, 1);
```

---

## 6. Building on Existing React App

### 6.1. Current Tech Stack (COMPLETE ✅)

**Framework:** React with Vite
**Routing:** React Router
**Styling:** Tailwind CSS with custom tokens
**UI Library:** shadcn/ui components
**Animations:** Framer Motion
**Icons:** Lucide React

### 6.2. How to Extend the Current App

#### **Step 1: Update App.tsx for New Routes**
```tsx
// Current App.tsx structure
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

// Add these imports
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
```

#### **Step 2: Create Authentication Context**
```tsx
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'talent' | 'hirer';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth logic here...

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

#### **Step 3: Update Header Component**
```tsx
// Update src/components/Header.tsx
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold">
            TakeOne
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/casting-calls">Browse Jobs</Link>
            <Link to="/talent">Find Talent</Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span>Welcome, {user.name}</span>
                <button onClick={logout}>Logout</button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">Login</Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
```

#### **Step 4: Create Protected Route Component**
```tsx
// src/components/ProtectedRoute.tsx
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'talent' | 'hirer';
}

export default function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
```

### 6.3. Component Patterns to Follow

#### **Use Existing Design Tokens**
```tsx
// Follow the same styling patterns as landing page components
<div className="bg-background text-foreground">
  <h1 className="text-4xl font-bold text-primary">
    Page Title
  </h1>
  <Button className="bg-primary hover:bg-primary/90">
    Action Button
  </Button>
</div>
```

#### **Responsive Design Patterns**
```tsx
// Use the same responsive patterns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Content */}
</div>
```

#### **Animation Patterns**
```tsx
// Use Framer Motion like the landing page
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

---

## 7. Backend API Integration

### 7.1. Base URL Configuration

```typescript
// config/api.ts
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  version: 'v1',
  timeout: 10000,
};

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    register: '/api/v1/auth/register',
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    refresh: '/api/v1/auth/refresh',
    verifyEmail: '/api/v1/auth/verify-email',
    forgotPassword: '/api/v1/auth/forgot-password',
    resetPassword: '/api/v1/auth/reset-password',
  },
  
  // Nafath Integration
  nafath: {
    initiate: '/api/v1/auth/nafath/initiate',
    status: '/api/v1/auth/nafath/status',
    renew: '/api/v1/auth/nafath/renew',
  },
  
  // Profiles
  profile: {
    talent: '/api/v1/profile/talent',
    caster: '/api/v1/profile/caster',
  },
  
  // Casting Calls
  castingCalls: {
    list: '/api/v1/casting-calls',
    create: '/api/v1/casting-calls',
    detail: (id: string) => `/api/v1/casting-calls/${id}`,
    update: (id: string) => `/api/v1/casting-calls/${id}`,
    delete: (id: string) => `/api/v1/casting-calls/${id}`,
    applications: (id: string) => `/api/v1/casting-calls/${id}/applications`,
  },
  
  // Applications
  applications: {
    list: '/api/v1/applications',
    create: '/api/v1/applications',
    detail: (id: string) => `/api/v1/applications/${id}`,
    withdraw: (id: string) => `/api/v1/applications/${id}/withdraw`,
    updateStatus: (id: string) => `/api/v1/applications/${id}/status`,
  },
  
  // Messages
  messages: {
    list: '/api/v1/messages',
    send: '/api/v1/messages',
    detail: (id: string) => `/api/v1/messages/${id}`,
    markRead: (id: string) => `/api/v1/messages/${id}/read`,
    conversations: '/api/v1/messages/conversations',
  },
  
  // Notifications
  notifications: {
    list: '/api/v1/notifications',
    markRead: (id: string) => `/api/v1/notifications/${id}/read`,
    markAllRead: '/api/v1/notifications/read-all',
  },
};
```

### 7.2. API Client Setup

```typescript
// lib/api/client.ts
import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '@/config/api';

class APIClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            const { data } = await axios.post(
              `${API_CONFIG.baseURL}/api/v1/auth/refresh`,
              { refreshToken }
            );
            
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  get<T>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }
  
  post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }
  
  patch<T>(url: string, data?: any, config?: any) {
    return this.client.patch<T>(url, data, config);
  }
  
  delete<T>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new APIClient();
```

### 7.3. TanStack Query Setup

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 7.4. Example API Hook

```typescript
// lib/hooks/use-casting-calls.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/config/api';
import type { CastingCall, PaginatedResponse } from '@/lib/types';

export function useCastingCalls(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['casting-calls', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<CastingCall>>(
        API_ENDPOINTS.castingCalls.list,
        { params }
      );
      return data.data;
    },
  });
}

export function useCastingCall(id: string) {
  return useQuery({
    queryKey: ['casting-call', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: CastingCall }>(
        API_ENDPOINTS.castingCalls.detail(id)
      );
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateCastingCall() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (castingCallData: Partial<CastingCall>) => {
      const { data } = await apiClient.post(
        API_ENDPOINTS.castingCalls.create,
        castingCallData
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['casting-calls'] });
    },
  });
}
```

---

## 8. Data Models & TypeScript Types

### 8.1. Core Data Models

```typescript
// lib/types/index.ts

// User & Authentication
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'talent' | 'caster';
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  nafathVerified: boolean;
  nafathVerifiedAt?: string;
  nafathNationalId?: string;
  nafathExpiresAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Talent Profile
export interface TalentProfile {
  id: string;
  userId: string;
  stageName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  eyeColor?: string;
  hairColor?: string;
  skills: string[];
  languages: string[];
  experience: number;
  city: string;
  willingToTravel: boolean;
  portfolioUrl?: string;
  demoReelUrl?: string;
  instagramUrl?: string;
  rating?: number;
  completionPercentage: number;
  verified: boolean;
}

// Caster Profile
export interface CasterProfile {
  id: string;
  userId: string;
  companyName: string;
  companyType: 'production_company' | 'advertising_agency' | 'independent';
  commercialRegistration: string;
  businessPhone: string;
  businessEmail: string;
  website?: string;
  city: string;
  yearsInBusiness: number;
  teamSize: number;
  specializations: string[];
  verified: boolean;
}

// Casting Call
export interface CastingCall {
  id: string;
  title: string;
  description?: string;
  company?: string;
  location?: string;
  compensation?: string;
  requirements?: string;
  deadline?: string;
  contactInfo?: string;
  status: 'published' | 'draft' | 'closed' | 'pending_review';
  sourceUrl?: string;
  sourceName?: string;
  isAggregated: boolean;
  views: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Application
export interface Application {
  id: string;
  castingCallId: string;
  talentUserId: string;
  status: 'pending' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  coverLetter?: string;
  availability?: string;
  additionalInfo?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  castingCall?: CastingCall;
  talent?: {
    name: string;
    email: string;
    talentProfile?: TalentProfile;
  };
}

// Message
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  body: string;
  read: boolean;
  castingCallId?: string;
  attachments?: string[];
  createdAt: string;
}

// Notification
export interface Notification {
  id: string;
  type: 'application_update' | 'message' | 'casting_call' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Response
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: Array<{ path: string; message: string }>;
}
```

---

## 9. Component Implementation Guide

### 9.1. Button Component

```typescript
// components/ui/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-gold text-noir hover:bg-gold-hover active:scale-95',
        secondary: 'bg-azure text-white hover:bg-azure-hover',
        tertiary: 'border border-azure text-azure bg-transparent hover:bg-azure/10',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-azure underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-14 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

### 9.2. Casting Call Card Component

```typescript
// components/features/casting-call/casting-call-card.tsx
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import type { CastingCall } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface CastingCallCardProps {
  castingCall: CastingCall;
  onApply?: () => void;
  onViewDetails?: () => void;
}

export function CastingCallCard({ castingCall, onApply, onViewDetails }: CastingCallCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Status indicator */}
      {castingCall.isAggregated ? (
        <div className="h-1 bg-gradient-to-r from-gold to-azure" />
      ) : (
        <div className="h-1 bg-green-500" />
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-noir line-clamp-2">
              {castingCall.title}
            </h3>
            {castingCall.company && (
              <p className="text-sm text-gray-600 mt-1">{castingCall.company}</p>
            )}
          </div>
          
          {!castingCall.isAggregated && (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Key details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {castingCall.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-azure" />
              <span>{castingCall.location}</span>
            </div>
          )}
          
          {castingCall.deadline && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-azure" />
              <span>{formatDistanceToNow(new Date(castingCall.deadline))} left</span>
            </div>
          )}
          
          {castingCall.compensation && (
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4 text-gold" />
              <span>{castingCall.compensation}</span>
            </div>
          )}
        </div>
        
        {/* Description */}
        {castingCall.description && (
          <p className="text-sm text-gray-700 line-clamp-3">
            {castingCall.description}
          </p>
        )}
        
        {/* Requirements */}
        {castingCall.requirements && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-gray-500 mb-1">Requirements</p>
            <p className="text-sm text-gray-700 line-clamp-2">
              {castingCall.requirements}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex gap-2">
        <Button variant="tertiary" onClick={onViewDetails} className="flex-1">
          View Details
        </Button>
        <Button variant="primary" onClick={onApply} className="flex-1">
          Apply Now
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## 10. Authentication & Security

### 10.1. Auth Context

```typescript
// lib/contexts/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Fetch user data
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await apiClient.get('/api/v1/auth/me');
      setUser(data.data);
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post('/api/v1/auth/login', { email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    setUser(data.data.user);
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await apiClient.post('/api/v1/auth/logout', { refreshToken });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      router.push('/login');
    }
  };

  const register = async (data: any) => {
    const response = await apiClient.post('/api/v1/auth/register', data);
    // Auto-login after registration
    await login(data.email, data.password);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 10.2. Protected Route Component

```typescript
// components/auth/protected-route.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>; // Replace with proper loading component
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

---

## 11. Structured Prompts for Loveable Agent

### 11.1. Authentication System Prompt

```
**Component:** Project Initialization

**Context:**
- Framework: Next.js 15 with TypeScript
- Package Manager: PNPM
- Styling: Tailwind CSS 4.x
- UI Libraries: Radix UI, Framer Motion, Lucide Icons

**Task:**
Initialize a new Next.js 15 project with TypeScript and the following:

1. Install dependencies:
   - @tanstack/react-query for state management
   - @radix-ui/* components for UI primitives
   - framer-motion for animations
   - lucide-react for icons
   - react-hook-form for forms
   - zod for validation
   - axios for API calls
   - date-fns for date formatting

2. Set up Tailwind CSS configuration with KAFD Noir theme:
   - Primary: Gold (#FFD700)
   - Background: Noir (#121212)
   - Text: White (#FFFFFF)
   - Accent: Azure (#007FFF)

3. Create base directory structure as specified in the architecture section

4. Configure TypeScript with strict mode

5. Set up environment variables template

**Expected Output:**
- Fully initialized Next.js project with all dependencies
- Tailwind config with custom theme
- Base directory structure
- TypeScript configuration
```

### 8.2. Landing Page Prompt

```
**Component:** Landing Page (Homepage)

**Description:**
Create a modern, engaging landing page for TakeOne, a premium casting marketplace platform in Saudi Arabia.

**Requirements:**

**Hero Section:**
- Full-width hero with dark gradient background (Noir to dark gray)
- Headline: "Where Saudi Talent Meets Opportunity"
- Subheadline: "Connect with verified casting opportunities across Saudi Arabia's entertainment industry"
- Two prominent CTAs: "Find Talent" (Primary Gold button) and "Browse Opportunities" (Secondary Azure button)
- Hero image/illustration: Abstract architectural shapes with spotlight effect (use Gold accent)

**Trust Bar:**
- Logos of partner production companies (MBC, Telfaz11, etc.)
- Use grayscale logos with subtle Gold hover effect
- Responsive grid: 6 columns on desktop, 3 on tablet, 2 on mobile

**Value Propositions Section:**
- Three cards in horizontal layout:
  1. "Verified Opportunities" - Icon: CheckCircle, Color: Success green
  2. "Secure Payments" - Icon: Shield, Color: Azure
  3. "Real-time Matching" - Icon: Zap, Color: Gold
- Each card: Icon, title, short description
- Hover effect: Subtle lift with shadow

**How It Works:**
- Step-by-step process for both talent and hirers
- Visual timeline with connecting lines
- Alternating layout (text-image, image-text)

**Footer:**
- Dark background (Noir)
- Four columns: About, For Talent, For Hirers, Legal
- Social media icons
- Language toggle (Arabic/English)
- Copyright notice

**Styling:**
- Use KAFD Noir color palette throughout
- Inter font for English
- Spacing: Use 8px grid system
- Animations: Fade-in on scroll (200ms duration, ease-out)
- Mobile-responsive with mobile-first approach

**Accessibility:**
- All buttons minimum 44px height
- ARIA labels on all interactive elements
- Proper heading hierarchy (H1 -> H6)
- Color contrast ratio minimum 4.5:1
```

### 8.3. Authentication Forms Prompt

```
**Component:** Login & Registration Forms

**Description:**
Create secure, user-friendly authentication forms with Saudi-specific features including Nafath integration.

**Login Form:**

**Layout:**
- Centered card on dark gradient background
- Max width: 400px
- Border radius: 12px
- Subtle shadow

**Fields:**
1. Email input
   - Label: "Email Address"
   - Type: email
   - Validation: Valid email format
   - Icon: Mail (Lucide)
   
2. Password input
   - Label: "Password"
   - Type: password
   - Toggle visibility button
   - Icon: Lock (Lucide)
   - Forgot password link below

**Actions:**
- Primary button: "Sign In" (Gold, full width)
- Secondary button: "Sign in with Nafath" (Green, full width, Shield icon)
- Divider: "OR" between buttons
- Link at bottom: "Don't have an account? Sign up"

**Registration Form:**

**Multi-step process:**

**Step 1: Account Type**
- Question: "I want to..." 
- Two large option cards:
  1. "Find Work" (for Talent) - Icon: User, Color: Azure
  2. "Hire Talent" (for Hirers) - Icon: Briefcase, Color: Gold
- Selected state: Border glow, background tint

**Step 2: Basic Information**
- Email (with real-time validation)
- Password (with strength indicator)
- Confirm Password
- Full Name

**Step 3: Profile Details**
For Talent:
- Stage Name
- City (dropdown)
- Primary Skills (multi-select)
- Experience Level (slider: 0-20+ years)

For Hirers:
- Company Name
- Company Type (dropdown)
- Business Email
- Commercial Registration Number

**Step 4: Verification**
- Nafath verification prompt
- Checkbox: "I agree to Terms & Conditions"
- Link to: Terms, Privacy Policy

**Progress Indicator:**
- Stepper component at top
- Current step highlighted in Gold
- Completed steps: checkmark icon

**Form Validation:**
- Inline validation on blur
- Error messages below fields in red
- Success checkmark when valid
- Submit button disabled until form is valid

**Styling:**
- Dark mode form on light background card
- Labels: Gray 600, bold
- Inputs: White background, Gray 300 border
- Focus state: Azure border glow
- Error state: Red border
- Success state: Green border

**Accessibility:**
- Proper form labels
- Error announcements via ARIA live regions
- Keyboard navigation support
- Focus indicators

**Implementation Notes:**
- Use React Hook Form for form state
- Use Zod for validation schemas
- Show loading spinner on submit
- Display API errors in alert component
```

### 8.4. Dashboard Layout Prompt

```
**Component:** User Dashboard Layout

**Description:**
Create a comprehensive dashboard layout that serves as the home base for both talent and hirers, with role-specific customization.

**Layout Structure:**

**Header (Fixed):**
- Height: 64px
- Background: Noir with subtle transparency
- Blur backdrop effect
- Contents:
  - Logo (left): TakeOne logo with Gold accent
  - Search bar (center, desktop only): Full-width with Lucide Search icon
  - Actions (right): 
    - Notifications bell (with unread count badge)
    - Messages icon (with unread count badge)
    - User avatar dropdown

**Sidebar (Collapsible):**
- Width: 240px (expanded), 64px (collapsed)
- Background: Noir
- Navigation items:
  
  For Talent:
  - Dashboard (Home icon)
  - Browse Casting Calls (Search icon)
  - My Applications (FileText icon)
  - My Profile (User icon)
  - Messages (MessageSquare icon)
  - Settings (Settings icon)
  
  For Hirers:
  - Dashboard (Home icon)
  - My Casting Calls (Clapperboard icon)
  - Applications (Users icon)
  - Search Talent (Search icon)
  - Messages (MessageSquare icon)
  - Settings (Settings icon)

- Active item: Gold left border, light background tint
- Hover effect: Subtle background lightening
- Collapse button at bottom

**Main Content Area:**
- Padding: 32px on desktop, 16px on mobile
- Max width: 1440px
- Centered with auto margins

**Dashboard Content (Talent View):**

**Stats Row:**
- 4 KPI cards in grid:
  1. Active Applications (number, trend indicator)
  2. Profile Views (number, trend indicator)
  3. Response Rate (percentage, visual gauge)
  4. Profile Completion (percentage, progress bar)

**Quick Actions Section:**
- Title: "Quick Actions"
- 3 prominent buttons:
  - "Complete Profile" (if incomplete)
  - "Browse New Opportunities"
  - "Update Availability"

**Recent Activity Feed:**
- Title: "Recent Activity"
- Timeline-style list:
  - Application status updates
  - New message notifications
  - Profile view notifications
- Each item: Icon, title, timestamp, action button

**Recommended Casting Calls:**
- Title: "Recommended for You"
- Horizontal scrollable carousel
- 3 casting call cards visible
- "View All" link

**Dashboard Content (Hirer View):**

**Stats Row:**
- 4 KPI cards:
  1. Active Casting Calls
  2. Total Applications Received
  3. Shortlisted Candidates
  4. Average Response Time

**Quick Actions:**
- "Post New Casting Call" (Primary Gold button, large)
- "View Applications"
- "Search Talent Database"

**Recent Applications:**
- Table view with sorting
- Columns: Talent Name, Role, Applied Date, Status, Actions
- Status badges (color-coded)
- Quick action buttons (View, Shortlist, Reject)

**Active Casting Calls:**
- List of currently open casting calls
- Each item shows: Title, deadline, application count, status
- Quick edit/close buttons

**Responsive Behavior:**
- Desktop (1024px+): Full three-column layout
- Tablet (768-1023px): Sidebar collapses, main content full width
- Mobile (<768px): Hamburger menu, stacked layout

**Animations:**
- Page transition: Fade in (200ms)
- Sidebar toggle: Slide animation (300ms, ease-in-out)
- Cards: Subtle hover lift (100ms)
- Stats counter: Count-up animation on mount

**Empty States:**
- For new users without data
- Illustration: Abstract shapes with spotlight
- Encouraging message
- Clear CTA to take first action

**Styling:**
- Background: Light gray (#F8F9FA)
- Cards: White background, subtle shadow
- Text hierarchy: H1 (1.953rem, bold), H2 (1.563rem, semibold), Body (1rem, regular)
- Spacing: Consistent 16px/24px/32px grid
```

### 8.5. Casting Call Detail Page Prompt

```
**Component:** Casting Call Detail Page

**Description:**
Create a comprehensive detail view for casting opportunities with all information needed for talent to make an informed decision.

**Page Layout:**

**Breadcrumb Navigation:**
- Path: Home > Casting Calls > [Title]
- Clickable links in Azure
- Current page in bold, non-clickable

**Hero Section:**
- Background: Gradient (Noir to Gray 900)
- Content:
  - Role Title (Display 2, White, bold)
  - Company name with verification badge
  - Key metadata row: Location, Posted date, Deadline
  - Primary CTA: "Apply Now" (Gold button, large, fixed on mobile)

**Content Grid (Desktop: 8-4 split):**

**Main Content (8 columns):**

1. **Overview Section:**
   - Heading: "About This Role"
   - Full description
   - Rich text formatting support

2. **Requirements Section:**
   - Heading: "What We're Looking For"
   - Bullet list of requirements
   - Icons for key requirements (age, gender, skills)

3. **Project Details:**
   - Production type
   - Shoot dates (if available)
   - Duration/commitment
   - Location details
   - Travel requirements

4. **Compensation & Benefits:**
   - Payment structure
   - Additional benefits
   - Payment terms

5. **Application Process:**
   - Steps to apply
   - Required materials
   - Expected timeline
   - Contact information

**Sidebar (4 columns):**

1. **Quick Info Card:**
   - Status badge (Open, Closing Soon, Closed)
   - Application deadline (with countdown if <7 days)
   - Number of applicants (if visible)
   - Application status (if user applied)

2. **Company Info Card:**
   - Company logo
   - Company name
   - Verification badge
   - Brief description
   - "View Company Profile" link

3. **Similar Opportunities:**
   - 2-3 related casting calls
   - Compact card format
   - Quick apply button

4. **Share & Save:**
   - Save button (bookmark icon)
   - Share buttons (WhatsApp, Twitter, Copy link)

**Application Modal (Triggered by "Apply Now"):**

**Multi-step modal:**

**Step 1: Confirm Profile**
- Display current profile summary
- "Your profile looks good!" or "Complete your profile to apply"
- Link to edit profile

**Step 2: Cover Letter**
- Text area: "Why are you a great fit?"
- Character count (0/500)
- Optional: Attach additional materials

**Step 3: Availability**
- Date range picker
- Checkbox: "Available for entire project"
- Special notes field

**Step 4: Review & Submit**
- Summary of application
- Terms checkbox: "I agree to the application terms"
- Submit button: "Submit Application"

**Trust Elements Throughout:**
- Verification badges (Nafath verified, Profile complete)
- "Report this posting" link (discreet)
- Safety tips sidebar
- Scam warning (if external source)

**Responsive Design:**
- Mobile: Sidebar moves below main content
- Sticky "Apply Now" button at bottom on mobile
- Collapsible sections for easier scanning

**Styling:**
- Card-based layout
- White background for readability
- Gold accents for CTAs
- Azure for links
- Icons from Lucide library
- Generous whitespace (32px sections, 16px between elements)

**Animations:**
- Fade-in content sections on scroll
- Modal: Scale + fade entrance
- Sticky button: Slide up from bottom

**Accessibility:**
- Skip links for keyboard navigation
- ARIA landmarks
- Focus management in modal
- Screen reader announcements for dynamic content
```

---

## 9. Environment Configuration

### 9.1. Required Environment Variables

Create a `.env.local` file with the following:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Nafath Integration (Saudi ID Verification)
NEXT_PUBLIC_NAFATH_ENABLED=true
AUTHENTICA_API_KEY=your-authentica-key
AUTHENTICA_BASE_URL=https://api.authentica.sa

# Feature Flags
NEXT_PUBLIC_ENABLE_REGISTRATION=true
NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_ENABLE_MESSAGING=true

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_SENTRY_DSN=

# Locale
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,ar
```

---

## 10. Quality Assurance Checklist

### 10.1. Functional Requirements

- [ ] User registration and login working
- [ ] Nafath integration functional
- [ ] Profile creation and editing
- [ ] Casting call browsing and filtering
- [ ] Application submission
- [ ] Messaging system
- [ ] Notifications
- [ ] Search functionality
- [ ] File uploads (portfolios, resumes)

### 10.2. Design System Compliance

- [ ] KAFD Noir color palette implemented
- [ ] Typography system (Inter/IBM Plex Sans Arabic)
- [ ] 8px spacing grid followed
- [ ] Proper use of Gold (#FFD700) for primary CTAs
- [ ] Azure (#007FFF) for secondary actions
- [ ] Consistent border radius (8px standard)
- [ ] Shadow system implemented
- [ ] Animation timing (fast: 100ms, base: 200ms, slow: 400ms)

### 10.3. Responsive Design

- [ ] Mobile breakpoint (320-767px) working
- [ ] Tablet breakpoint (768-1023px) working
- [ ] Desktop breakpoint (1024-1439px) working
- [ ] Large desktop (1440px+) working
- [ ] Touch targets minimum 44px
- [ ] Mobile navigation (hamburger menu)
- [ ] Responsive typography scaling

### 10.4. Accessibility (WCAG 2.1 AA)

- [ ] Color contrast ratios meet 4.5:1 minimum
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA labels on all interactive elements
- [ ] Proper heading hierarchy
- [ ] Alt text on all images
- [ ] Form labels properly associated
- [ ] Error messages announced to screen readers
- [ ] Skip links implemented

### 10.5. Internationalization (i18n)

- [ ] Arabic (RTL) layout working
- [ ] English (LTR) layout working
- [ ] Language toggle functional
- [ ] Text direction properly mirrored
- [ ] Date/number formatting localized
- [ ] Font switching (Inter ↔ IBM Plex Sans Arabic)

### 10.6. Performance

- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] Images optimized (Next.js Image component)
- [ ] Code splitting implemented
- [ ] Lazy loading for below-fold content
- [ ] API calls debounced/throttled where appropriate
- [ ] Proper caching strategy

### 10.7. Security

- [ ] JWT tokens stored securely
- [ ] HTTPS enforced in production
- [ ] XSS protection
- [ ] CSRF tokens implemented
- [ ] Input validation on all forms
- [ ] API rate limiting respected
- [ ] Sensitive data not exposed in URLs
- [ ] Proper error handling (no sensitive info leaks)

---

## Appendix A: Quick Reference

### Color Palette Quick Copy

```css
/* Primary */
--noir: #121212;
--gold: #FFD700;
--white: #FFFFFF;

/* Secondary */
--azure: #007FFF;
--silver: #C0C0C0;

/* Semantic */
--success: #28A745;
--warning: #FFC107;
--error: #DC3545;
--info: #17A2B8;
```

### Common Icon Names (Lucide)

```typescript
import {
  User,           // Profile
  Clapperboard,   // Casting
  Search,         // Search
  Bell,           // Notifications
  MessageSquare,  // Messages
  CheckCircle2,   // Verification
  Settings,       // Settings
  MapPin,         // Location
  Calendar,       // Date
  DollarSign,     // Compensation
  Shield,         // Security/Nafath
} from 'lucide-react';
```

### API Response Pattern

```typescript
// Success
{
  "success": true,
  "data": { /* ... */ }
}

// Error
{
  "error": "Error message",
  "details": [
    { "path": "field", "message": "Validation error" }
  ]
}
```

---

## Appendix B: Loveable-Specific Notes

### Agent Mode Best Practices

1. **Start with Layout First**: Build the page structure before adding interactivity
2. **Component Isolation**: Build and test components individually
3. **Incremental Integration**: Add API integration after UI is stable
4. **Responsive Testing**: Test each breakpoint as you build
5. **Accessibility from Start**: Don't add ARIA labels as an afterthought

### Common Pitfalls to Avoid

1. **Don't hardcode colors**: Always use Tailwind classes based on the design system
2. **Don't skip loading states**: Every API call needs a loading indicator
3. **Don't ignore error states**: Handle and display errors gracefully
4. **Don't forget empty states**: Design for when there's no data
5. **Don't break RTL**: Test Arabic layout for every component

### Debug Checklist

If something isn't working:
1. Check browser console for errors
2. Verify API endpoint is correct
3. Confirm authentication token is being sent
4. Check network tab for API responses
5. Verify TypeScript types match API response

---

**End of Technical Package**

This document should be sufficient for Loveable's Agent Mode to build a complete, production-ready UI for TakeOne. For questions or clarifications, refer to the source documentation or consult with the development team.
