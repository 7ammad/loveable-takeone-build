# TakeOne Implementation Guide for Cursor AI
## Step-by-Step Development Instructions

**Version 2.0** | **Production Ready** | **Complete Package**

---

## 🎯 **Quick Start Instructions**

### **Step 1: Setup (30 minutes)**
1. **Copy components** from `cursor_ready_package/components/` to your `components/` directory
2. **Install Amiri fonts** from `cursor_ready_package/assets/fonts/`
3. **Configure Material-UI theme** with KAFD Noir colors
4. **Set up design tokens** in CSS custom properties

### **Step 2: Test Components (30 minutes)**
1. **Import and test each component** individually
2. **Verify responsive design** on mobile and desktop
3. **Test Arabic text rendering** with Amiri font
4. **Validate TypeScript compilation**

### **Step 3: Build Pages (2-3 weeks)**
1. **Start with authentication pages** (6 pages) - Week 1
2. **Build dashboard pages** (23 pages) - Week 2
3. **Implement search and admin** (12 pages) - Week 3
4. **Polish and optimize** - Week 3

---

## 📦 **Package Structure Overview**

```
cursor_ready_package/
├── README.md                           # Main implementation guide
├── documentation/                      # Complete documentation
│   ├── design-system-complete.md      # Full design system
│   ├── component-specifications.md    # Detailed component specs
│   ├── implementation-guide.md        # This file
│   └── sitemap-structure.md          # Complete sitemap
├── components/                         # 5 Critical React components
│   ├── TalentCard/                    # Headshot-first talent display
│   ├── CastingCallCard/               # Adaptive casting opportunities
│   ├── DashboardLayout/               # Main dashboard layout
│   ├── SearchInterface/               # Universal search with filters
│   └── AuthenticationForm/            # Multi-mode auth forms
├── examples/                          # HTML prototypes
│   ├── kafd-noir-prototype.html       # KAFD Noir design showcase
│   ├── component-showcase.html        # Component examples
│   └── mobile-examples.html          # Mobile-optimized examples
├── assets/                            # Design assets
│   └── fonts/                         # Amiri font files
└── guidelines/                        # Implementation guidelines
    ├── typescript-patterns.md         # TypeScript best practices
    ├── accessibility-guide.md         # WCAG 2.1 AA compliance
    └── performance-guide.md           # Performance optimization
```

---

## 🔧 **Technical Setup**

### **1. Install Dependencies**
```bash
# Core dependencies (should already be installed)
npm install @mui/material @emotion/react @emotion/styled
npm install framer-motion lucide-react
npm install @mui/x-date-pickers dayjs

# Additional utilities
npm install clsx classnames
npm install react-hook-form @hookform/resolvers yup
```

### **2. Configure Amiri Fonts**
```css
/* Add to your global CSS file */
@font-face {
  font-family: 'Amiri';
  src: url('./assets/fonts/Amiri-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Amiri';
  src: url('./assets/fonts/Amiri-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* Set as default font */
body {
  font-family: 'Amiri', 'Times New Roman', serif;
}
```

### **3. Material-UI Theme Setup**
```typescript
// theme/index.ts
import { createTheme } from '@mui/material/styles';

export const kafdNoirTheme = createTheme({
  palette: {
    primary: {
      main: '#FFD700', // Gold
      dark: '#E6C200',
      light: '#FFF176',
    },
    secondary: {
      main: '#007FFF', // Azure
      dark: '#0066CC',
      light: '#42A5F5',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#121212', // Noir
      secondary: '#6C757D',
    },
    success: {
      main: '#28A745',
    },
    warning: {
      main: '#FFC107',
    },
    error: {
      main: '#DC3545',
    },
  },
  typography: {
    fontFamily: 'Amiri, Times New Roman, serif',
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 700, fontSize: '2rem' },
    h3: { fontWeight: 600, fontSize: '1.75rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(18, 18, 18, 0.08)',
          borderRadius: '12px',
        },
      },
    },
  },
});

// app/layout.tsx or _app.tsx
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { kafdNoirTheme } from '@/theme';

export default function RootLayout({ children }) {
  return (
    <ThemeProvider theme={kafdNoirTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
```

### **4. Design Tokens CSS**
```css
/* globals.css */
:root {
  /* KAFD Noir Colors */
  --takeone-color-noir: #121212;
  --takeone-color-gold: #FFD700;
  --takeone-color-azure: #007FFF;
  --takeone-color-white: #FFFFFF;
  --takeone-color-silver: #C0C0C0;
  
  /* Semantic Colors */
  --takeone-color-success: #28A745;
  --takeone-color-warning: #FFC107;
  --takeone-color-error: #DC3545;
  --takeone-color-info: #17A2B8;
  
  /* Spacing System (8px base) */
  --takeone-spacing-xs: 4px;
  --takeone-spacing-sm: 8px;
  --takeone-spacing-md: 16px;
  --takeone-spacing-lg: 24px;
  --takeone-spacing-xl: 32px;
  --takeone-spacing-2xl: 48px;
  --takeone-spacing-3xl: 64px;
  
  /* Layout Constants */
  --takeone-sidebar-width: 280px;
  --takeone-header-height: 64px;
  --takeone-mobile-nav-height: 56px;
  
  /* Shadows */
  --takeone-shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --takeone-shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --takeone-shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  
  /* Border Radius */
  --takeone-radius-sm: 4px;
  --takeone-radius-md: 8px;
  --takeone-radius-lg: 12px;
  --takeone-radius-xl: 16px;
}

/* Responsive Breakpoints */
@media (max-width: 768px) {
  :root {
    --takeone-sidebar-width: 100%;
    --takeone-spacing-lg: 16px;
    --takeone-spacing-xl: 24px;
  }
}
```

---

## 🧩 **Component Integration Guide**

### **1. Copy Components to Your Project**
```bash
# Copy all 5 critical components
cp -r cursor_ready_package/components/* your-project/components/

# Your structure should look like:
components/
├── TalentCard/
│   ├── TalentCard.tsx
│   └── index.ts
├── CastingCallCard/
│   ├── CastingCallCard.tsx
│   └── index.ts
├── DashboardLayout/
│   ├── DashboardLayout.tsx
│   └── index.ts
├── SearchInterface/
│   ├── SearchInterface.tsx
│   └── index.ts
└── AuthenticationForm/
    ├── AuthenticationForm.tsx
    └── index.ts
```

### **2. Test Each Component**
```typescript
// Test TalentCard
import { TalentCard } from '@/components/TalentCard';

const testTalent = {
  id: '1',
  name: 'Sarah Ahmed',
  arabicName: 'سارة أحمد',
  specialty: ['Actor', 'Voice Artist'],
  rating: 4.8,
  reviewCount: 24,
  availability: 'available' as const,
  verificationStatus: 'verified' as const,
};

export default function TestPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '300px' }}>
      <TalentCard
        talent={testTalent}
        onClick={(talent) => console.log('Clicked:', talent)}
      />
    </div>
  );
}
```

### **3. Create Layout Components**
```typescript
// components/layouts/PublicLayout.tsx
import { Box, AppBar, Toolbar, Typography } from '@mui/material';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: '#FFFFFF', color: '#121212' }}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Amiri, Times New Roman, serif',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FFD700, #007FFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            TakeOne
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="main">
        {children}
      </Box>
    </Box>
  );
};

// components/layouts/AuthLayout.tsx
import { Box } from '@mui/material';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #121212 0%, #2C2C2C 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </Box>
  );
};
```

---

## 📄 **Page Implementation Examples**

### **1. Authentication Pages**

#### **Login Page** - `app/auth/login/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthenticationForm } from '@/components/AuthenticationForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (data: any) => {
    setLoading(true);
    setError('');
    
    try {
      // Call your login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode: string) => {
    if (mode === 'register') {
      router.push('/auth/register');
    } else if (mode === 'forgot-password') {
      router.push('/auth/forgot-password');
    }
  };

  return (
    <AuthLayout>
      <AuthenticationForm
        mode="login"
        onSubmit={handleLogin}
        onModeChange={handleModeChange}
        loading={loading}
        error={error}
      />
    </AuthLayout>
  );
}
```

#### **Register Page** - `app/auth/register/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthenticationForm } from '@/components/AuthenticationForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (data: any) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        router.push('/auth/verify-email');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthenticationForm
        mode="register"
        onSubmit={handleRegister}
        onModeChange={(mode) => router.push(`/auth/${mode}`)}
        loading={loading}
        error={error}
      />
    </AuthLayout>
  );
}
```

### **2. Dashboard Pages**

#### **Talent Dashboard** - `app/dashboard/page.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Grid, Typography, Card, CardContent, Box } from '@mui/material';
import { DashboardLayout } from '@/components/DashboardLayout';
import { TalentCard } from '@/components/TalentCard';
import { CastingCallCard } from '@/components/CastingCallCard';

export default function TalentDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [recentApplications, setRecentApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Fetch user data and dashboard stats
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [userRes, statsRes, appsRes, recsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/dashboard/stats'),
        fetch('/api/applications/recent'),
        fetch('/api/recommendations'),
      ]);

      const userData = await userRes.json();
      const statsData = await statsRes.json();
      const appsData = await appsRes.json();
      const recsData = await recsRes.json();

      setUser(userData);
      setStats(statsData);
      setRecentApplications(appsData);
      setRecommendations(recsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <DashboardLayout
      user={user}
      currentPath="/dashboard"
      onNavigate={(path) => router.push(path)}
      onLogout={() => signOut()}
    >
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Welcome back, {user.name}!
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    {stats.profileCompletion}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Profile Complete
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="secondary">
                    {stats.activeApplications}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Applications
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Applications */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Applications
            </Typography>
            <Grid container spacing={2}>
              {recentApplications.map((application) => (
                <Grid item xs={12} md={6} key={application.id}>
                  <CastingCallCard
                    castingCall={application.castingCall}
                    showActions={false}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recommended for You
          </Typography>
          <Grid container spacing={2}>
            {recommendations.map((casting) => (
              <Grid item xs={12} key={casting.id}>
                <CastingCallCard
                  castingCall={casting}
                  variant="compact"
                  onApply={(call) => handleApply(call)}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
```

#### **Search Page** - `app/search/page.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SearchInterface } from '@/components/SearchInterface';
import { CastingCallCard } from '@/components/CastingCallCard';

export default function SearchPage() {
  const [user, setUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string, filters: any) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/search/casting-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filters }),
      });
      
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSearch = async (name: string, query: string, filters: any) => {
    try {
      const response = await fetch('/api/search/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, query, filters }),
      });
      
      if (response.ok) {
        // Refresh saved searches
        fetchSavedSearches();
      }
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  return (
    <DashboardLayout
      user={user}
      currentPath="/search"
      onNavigate={(path) => router.push(path)}
    >
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Find Casting Opportunities
      </Typography>

      <SearchInterface
        searchType="casting-calls"
        onSearch={handleSearch}
        onSaveSearch={handleSaveSearch}
        results={searchResults}
        savedSearches={savedSearches}
        loading={loading}
      />

      {searchResults.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Search Results ({searchResults.length})
          </Typography>
          <Grid container spacing={2}>
            {searchResults.map((castingCall) => (
              <Grid item xs={12} md={6} key={castingCall.id}>
                <CastingCallCard
                  castingCall={castingCall}
                  onApply={(call) => handleApply(call)}
                  onSave={(call) => handleSave(call)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </DashboardLayout>
  );
}
```

---

## 🎨 **Styling Guidelines**

### **1. Component Styling Patterns**
```typescript
// Use styled components for complex styling
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(18, 18, 18, 0.08)',
  transition: 'all 0.2s ease-out',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(18, 18, 18, 0.12)',
  },
  
  [theme.breakpoints.down('md')]: {
    borderRadius: theme.spacing(1),
  },
}));

// Use sx prop for simple styling
<Box
  sx={{
    p: 3,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 1,
  }}
>
  Content
</Box>
```

### **2. Responsive Design Patterns**
```typescript
// Use Material-UI breakpoints
import { useTheme, useMediaQuery } from '@mui/material';

const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('md'));
const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

// Conditional rendering
{isMobile ? <MobileComponent /> : <DesktopComponent />}

// Responsive props
<Grid
  container
  spacing={{ xs: 2, md: 3 }}
  columns={{ xs: 4, sm: 8, md: 12 }}
>
  <Grid item xs={12} sm={6} md={4}>
    <Card />
  </Grid>
</Grid>
```

### **3. Animation Patterns**
```typescript
// Use Framer Motion for animations
import { motion } from 'framer-motion';

const cardVariants = {
  hover: {
    y: -8,
    transition: { duration: 0.2, ease: [0, 0, 0.58, 1] }
  }
};

<motion.div
  variants={cardVariants}
  whileHover="hover"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  <Card />
</motion.div>
```

---

## 🌍 **Arabic RTL Support**

### **1. RTL Configuration**
```typescript
// theme/rtl.ts
import { createTheme } from '@mui/material/styles';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// Create RTL cache
const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// RTL Theme
export const rtlTheme = createTheme({
  direction: 'rtl',
  // ... rest of theme
});

// Usage in app
<CacheProvider value={rtlCache}>
  <ThemeProvider theme={rtlTheme}>
    <App />
  </ThemeProvider>
</CacheProvider>
```

### **2. RTL Component Patterns**
```typescript
// Conditional RTL styling
const StyledComponent = styled(Box)(({ theme }) => ({
  marginLeft: theme.direction === 'rtl' ? 0 : theme.spacing(2),
  marginRight: theme.direction === 'rtl' ? theme.spacing(2) : 0,
  
  // Or use logical properties
  marginInlineStart: theme.spacing(2),
  textAlign: 'start',
}));

// RTL-aware icons
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ChevronIcon = ({ direction }: { direction: 'rtl' | 'ltr' }) => {
  return direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />;
};
```

---

## 📱 **Mobile Optimization**

### **1. Mobile Navigation**
```typescript
// components/MobileNavigation.tsx
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home, Search, User, MessageSquare } from 'lucide-react';

export const MobileNavigation = ({ value, onChange }) => {
  return (
    <BottomNavigation
      value={value}
      onChange={onChange}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTop: '1px solid #E9ECEF',
      }}
    >
      <BottomNavigationAction
        label="Home"
        value="home"
        icon={<Home size={20} />}
      />
      <BottomNavigationAction
        label="Search"
        value="search"
        icon={<Search size={20} />}
      />
      <BottomNavigationAction
        label="Messages"
        value="messages"
        icon={<MessageSquare size={20} />}
      />
      <BottomNavigationAction
        label="Profile"
        value="profile"
        icon={<User size={20} />}
      />
    </BottomNavigation>
  );
};
```

### **2. Touch Optimization**
```css
/* Touch-friendly sizing */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 8px;
}

/* Prevent zoom on input focus */
input, select, textarea {
  font-size: 16px;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}
```

---

## 🚀 **Performance Optimization**

### **1. Code Splitting**
```typescript
// Lazy load components
import { lazy, Suspense } from 'react';

const TalentProfile = lazy(() => import('@/components/TalentProfile'));
const CastingDetails = lazy(() => import('@/components/CastingDetails'));

// Usage with loading fallback
<Suspense fallback={<CircularProgress />}>
  <TalentProfile />
</Suspense>
```

### **2. Image Optimization**
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={talent.profileImage}
  alt={talent.name}
  width={300}
  height={400}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  priority={isAboveTheFold}
/>
```

### **3. API Optimization**
```typescript
// Use SWR for data fetching
import useSWR from 'swr';

const { data, error, mutate } = useSWR(
  '/api/dashboard/stats',
  fetcher,
  {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: false,
  }
);
```

---

## ✅ **Testing Guidelines**

### **1. Component Testing**
```typescript
// __tests__/TalentCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TalentCard } from '@/components/TalentCard';

const mockTalent = {
  id: '1',
  name: 'Test User',
  specialty: ['Actor'],
  rating: 4.5,
  reviewCount: 10,
  availability: 'available',
  verificationStatus: 'verified',
};

test('renders talent card with correct information', () => {
  render(<TalentCard talent={mockTalent} />);
  
  expect(screen.getByText('Test User')).toBeInTheDocument();
  expect(screen.getByText('Actor')).toBeInTheDocument();
  expect(screen.getByText('4.5')).toBeInTheDocument();
});

test('calls onClick when card is clicked', () => {
  const handleClick = jest.fn();
  render(<TalentCard talent={mockTalent} onClick={handleClick} />);
  
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledWith(mockTalent);
});
```

### **2. Accessibility Testing**
```typescript
// Use @testing-library/jest-dom for accessibility assertions
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<TalentCard talent={mockTalent} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 🎯 **Implementation Checklist**

### **Week 1: Foundation & Authentication**
- [ ] Set up Amiri fonts and Material-UI theme
- [ ] Copy and test all 5 critical components
- [ ] Create layout components (Public, Auth, Dashboard, Admin)
- [ ] Implement authentication pages (6 pages)
- [ ] Test responsive design on mobile and desktop
- [ ] Verify Arabic text rendering

### **Week 2: Dashboard Pages**
- [ ] Implement talent dashboard pages (12 pages)
- [ ] Implement caster dashboard pages (11 pages)
- [ ] Add navigation and breadcrumbs
- [ ] Test user flows and interactions
- [ ] Optimize for mobile devices

### **Week 3: Search, Admin & Polish**
- [ ] Implement search and discovery pages (4 pages)
- [ ] Build admin dashboard pages (8 pages)
- [ ] Add payment and billing pages (4 pages)
- [ ] Implement Arabic RTL support
- [ ] Performance optimization and testing
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Cross-browser testing
- [ ] Production deployment

### **Quality Assurance**
- [ ] All components render correctly
- [ ] Responsive design works on all devices
- [ ] Arabic text displays properly with Amiri font
- [ ] Navigation flows work as expected
- [ ] Forms validate correctly
- [ ] Loading states and error handling work
- [ ] Accessibility requirements met
- [ ] Performance benchmarks achieved

---

**This implementation guide provides step-by-step instructions for building all 52+ pages using the 5 critical components. Follow this guide systematically to create a production-ready TakeOne platform with KAFD Noir design and Amiri typography.**
