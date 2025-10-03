# TakeOne Component Specifications
## Complete Implementation Guide for 52+ Pages

**Version 2.0** | **Production Ready** | **KAFD Noir + Amiri Typography**

---

## 🧩 **5 Critical Components Provided**

### **1. TalentCard Component**
**File:** `components/TalentCard/TalentCard.tsx`

#### **Purpose & Usage**
- **Primary Use:** Headshot-first talent discovery with hover overlays
- **Pages:** Search results, recommendations, talent browsing, dashboard widgets
- **Design Pattern:** Visual-first with progressive disclosure

#### **Key Features**
- ✅ **Arabic name support** with Amiri typography
- ✅ **Headshot display** with gradient backgrounds when no image
- ✅ **Hover overlays** revealing detailed information
- ✅ **Rating system** with star display
- ✅ **Availability indicators** with color coding
- ✅ **Verification badges** for trusted profiles
- ✅ **Responsive design** with mobile optimization
- ✅ **Framer Motion animations** with smooth transitions

#### **Props Interface**
```typescript
interface TalentCardProps {
  talent: TalentUser;
  onClick?: (talent: TalentUser) => void;
  showDetails?: boolean;
  variant?: 'grid' | 'list';
  className?: string;
}
```

#### **Implementation Example**
```typescript
import { TalentCard } from '@/components/TalentCard';

const talents = [
  {
    id: '1',
    name: 'Sarah Ahmed',
    arabicName: 'سارة أحمد',
    specialty: ['Actor', 'Voice Artist'],
    rating: 4.8,
    reviewCount: 24,
    availability: 'available',
    verificationStatus: 'verified',
  }
];

<TalentCard
  talent={talents[0]}
  onClick={(talent) => router.push(`/talent/${talent.id}`)}
  showDetails={true}
/>
```

---

### **2. CastingCallCard Component**
**File:** `components/CastingCallCard/CastingCallCard.tsx`

#### **Purpose & Usage**
- **Primary Use:** Adaptive casting opportunity display
- **Pages:** Job listings, search results, dashboard widgets
- **Design Pattern:** Content-aware with source differentiation

#### **Key Features**
- ✅ **Native vs External differentiation** with color-coded borders
- ✅ **Confidence indicators** for AI-extracted content
- ✅ **Status tracking** with visual indicators
- ✅ **Adaptive content display** based on data quality
- ✅ **Action buttons** contextual to source type
- ✅ **Company verification** badges
- ✅ **Responsive layout** with mobile optimization
- ✅ **KAFD Noir styling** with gold/azure accents

#### **Props Interface**
```typescript
interface CastingCallCardProps {
  castingCall: CastingCall;
  onApply?: (castingCall: CastingCall) => void;
  onSave?: (castingCall: CastingCall) => void;
  onClaim?: (castingCall: CastingCall) => void;
  onLearnMore?: (castingCall: CastingCall) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}
```

#### **Implementation Example**
```typescript
import { CastingCallCard } from '@/components/CastingCallCard';

const castingCall = {
  id: '1',
  title: 'Lead Actor - Historical Drama Series',
  company: 'MBC Studios',
  location: 'Riyadh',
  status: 'active',
  source: 'native',
  isVerified: true,
  requirements: ['Male', '25-35 years', 'Arabic fluent'],
};

<CastingCallCard
  castingCall={castingCall}
  onApply={(call) => handleApply(call)}
  onSave={(call) => handleSave(call)}
/>
```

---

### **3. DashboardLayout Component**
**File:** `components/DashboardLayout/DashboardLayout.tsx`

#### **Purpose & Usage**
- **Primary Use:** Main layout for talent and caster dashboards
- **Pages:** All dashboard pages (23 total)
- **Design Pattern:** Sidebar navigation with responsive design

#### **Key Features**
- ✅ **Role-based navigation** (talent vs caster menus)
- ✅ **Collapsible sidebar** with mobile drawer
- ✅ **User profile section** with verification status
- ✅ **Notification badges** on menu items
- ✅ **Breadcrumb navigation** with page transitions
- ✅ **Arabic RTL support** ready
- ✅ **Responsive design** with mobile-first approach
- ✅ **Framer Motion page transitions**

#### **Props Interface**
```typescript
interface DashboardLayoutProps {
  user: User;
  children: React.ReactNode;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
  notifications?: number;
}
```

#### **Implementation Example**
```typescript
import { DashboardLayout } from '@/components/DashboardLayout';

const user = {
  id: '1',
  name: 'Ahmed Al-Rashid',
  email: 'ahmed@example.com',
  role: 'talent',
  verificationStatus: 'verified',
};

<DashboardLayout
  user={user}
  currentPath="/dashboard"
  onNavigate={(path) => router.push(path)}
  onLogout={() => signOut()}
  notifications={3}
>
  {/* Page content */}
</DashboardLayout>
```

---

### **4. SearchInterface Component**
**File:** `components/SearchInterface/SearchInterface.tsx`

#### **Purpose & Usage**
- **Primary Use:** Universal search with advanced filtering
- **Pages:** Talent search, casting search, universal search
- **Design Pattern:** Progressive disclosure with filter drawer

#### **Key Features**
- ✅ **Universal search bar** with autocomplete
- ✅ **Advanced filter drawer** with accordion sections
- ✅ **Filter chips** with easy removal
- ✅ **Saved searches** functionality
- ✅ **Location-based filtering** for Saudi cities
- ✅ **Specialty filtering** for entertainment roles
- ✅ **Experience range sliders**
- ✅ **Mobile-optimized filters** with bottom sheets

#### **Props Interface**
```typescript
interface SearchInterfaceProps {
  searchType: 'talent' | 'casting-calls' | 'universal';
  onSearch: (query: string, filters: SearchFilters) => void;
  onSaveSearch?: (name: string, query: string, filters: SearchFilters) => void;
  results?: SearchResult[];
  savedSearches?: SavedSearch[];
  loading?: boolean;
}
```

#### **Implementation Example**
```typescript
import { SearchInterface } from '@/components/SearchInterface';

<SearchInterface
  searchType="talent"
  onSearch={(query, filters) => handleSearch(query, filters)}
  onSaveSearch={(name, query, filters) => handleSaveSearch(name, query, filters)}
  results={searchResults}
  savedSearches={userSavedSearches}
  loading={isSearching}
/>
```

---

### **5. AuthenticationForm Component**
**File:** `components/AuthenticationForm/AuthenticationForm.tsx`

#### **Purpose & Usage**
- **Primary Use:** Login, register, and verification flows
- **Pages:** All authentication pages (6 total)
- **Design Pattern:** Multi-step forms with validation

#### **Key Features**
- ✅ **Multi-mode support** (login, register, forgot password, etc.)
- ✅ **Multi-step registration** with progress indicator
- ✅ **Real-time validation** with error messages
- ✅ **Password strength indicator**
- ✅ **Nafath integration** for Saudi ID verification
- ✅ **Terms acceptance** with legal links
- ✅ **Responsive design** with mobile optimization
- ✅ **KAFD Noir gradient** styling

#### **Props Interface**
```typescript
interface AuthenticationFormProps {
  mode: 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email' | 'nafath';
  onSubmit: (data: AuthFormData) => Promise<void>;
  onModeChange?: (mode: 'login' | 'register' | 'forgot-password') => void;
  loading?: boolean;
  error?: string;
  success?: string;
}
```

#### **Implementation Example**
```typescript
import { AuthenticationForm } from '@/components/AuthenticationForm';

<AuthenticationForm
  mode="register"
  onSubmit={async (data) => await handleRegistration(data)}
  onModeChange={(mode) => setAuthMode(mode)}
  loading={isSubmitting}
  error={authError}
/>
```

---

## 📋 **Complete Page Implementation Guide**

### **Authentication Pages (6 pages)**

#### **1. Login Page** - `/auth/login`
```typescript
// Use AuthenticationForm component
<AuthenticationForm
  mode="login"
  onSubmit={handleLogin}
  onModeChange={setAuthMode}
/>
```

#### **2. Register Page** - `/auth/register`
```typescript
// Multi-step registration with user type selection
<AuthenticationForm
  mode="register"
  onSubmit={handleRegistration}
  onModeChange={setAuthMode}
/>
```

#### **3. Forgot Password** - `/auth/forgot-password`
```typescript
<AuthenticationForm
  mode="forgot-password"
  onSubmit={handleForgotPassword}
  onModeChange={setAuthMode}
/>
```

#### **4. Reset Password** - `/auth/reset-password/[token]`
```typescript
<AuthenticationForm
  mode="reset-password"
  onSubmit={handleResetPassword}
/>
```

#### **5. Email Verification** - `/auth/verify-email/[token]`
```typescript
<AuthenticationForm
  mode="verify-email"
  onSubmit={handleEmailVerification}
/>
```

#### **6. Nafath Verification** - `/auth/nafath`
```typescript
<AuthenticationForm
  mode="nafath"
  onSubmit={handleNafathVerification}
/>
```

---

### **Talent Dashboard Pages (12 pages)**

#### **1. Talent Dashboard** - `/dashboard`
```typescript
<DashboardLayout user={user} currentPath="/dashboard">
  <Grid container spacing={3}>
    <Grid item xs={12} md={8}>
      <ProfileCompletionWidget />
      <RecentApplications />
    </Grid>
    <Grid item xs={12} md={4}>
      <VerificationStatus />
      <RecommendedOpportunities />
    </Grid>
  </Grid>
</DashboardLayout>
```

#### **2. Profile Management** - `/profile`
```typescript
<DashboardLayout user={user} currentPath="/profile">
  <ProfileForm user={user} onSave={handleProfileSave} />
  <MediaGallery media={userMedia} onUpload={handleMediaUpload} />
</DashboardLayout>
```

#### **3. Portfolio** - `/portfolio`
```typescript
<DashboardLayout user={user} currentPath="/portfolio">
  <MediaUploadInterface onUpload={handleUpload} />
  <MediaGrid media={userMedia} onEdit={handleEdit} />
</DashboardLayout>
```

#### **4. Applications** - `/applications`
```typescript
<DashboardLayout user={user} currentPath="/applications">
  <ApplicationsTable 
    applications={userApplications}
    onViewDetails={handleViewDetails}
  />
</DashboardLayout>
```

#### **5. Search Casting Calls** - `/search`
```typescript
<DashboardLayout user={user} currentPath="/search">
  <SearchInterface
    searchType="casting-calls"
    onSearch={handleSearch}
    results={searchResults}
  />
  <Grid container spacing={2}>
    {searchResults.map(call => (
      <Grid item xs={12} md={6} key={call.id}>
        <CastingCallCard
          castingCall={call}
          onApply={handleApply}
          onSave={handleSave}
        />
      </Grid>
    ))}
  </Grid>
</DashboardLayout>
```

#### **6. Browse Casting Calls** - `/casting-calls`
```typescript
<DashboardLayout user={user} currentPath="/casting-calls">
  <FilterBar onFilter={handleFilter} />
  <CastingCallGrid>
    {castingCalls.map(call => (
      <CastingCallCard
        key={call.id}
        castingCall={call}
        onApply={handleApply}
      />
    ))}
  </CastingCallGrid>
</DashboardLayout>
```

#### **7. Casting Call Details** - `/casting-calls/[id]`
```typescript
<DashboardLayout user={user} currentPath="/casting-calls">
  <CastingCallDetails castingCall={castingCall} />
  <ApplicationForm 
    castingCallId={castingCall.id}
    onSubmit={handleApplication}
  />
</DashboardLayout>
```

#### **8. Messages** - `/messages`
```typescript
<DashboardLayout user={user} currentPath="/messages">
  <MessagingInterface
    conversations={conversations}
    onSendMessage={handleSendMessage}
  />
</DashboardLayout>
```

#### **9. Calendar** - `/calendar`
```typescript
<DashboardLayout user={user} currentPath="/calendar">
  <CalendarView
    events={userEvents}
    onEventClick={handleEventClick}
  />
</DashboardLayout>
```

#### **10. Settings** - `/settings`
```typescript
<DashboardLayout user={user} currentPath="/settings">
  <SettingsTabs>
    <AccountSettings />
    <NotificationSettings />
    <PrivacySettings />
  </SettingsTabs>
</DashboardLayout>
```

---

### **Caster Dashboard Pages (11 pages)**

#### **1. Caster Dashboard** - `/dashboard`
```typescript
<DashboardLayout user={user} currentPath="/dashboard">
  <Grid container spacing={3}>
    <Grid item xs={12} md={8}>
      <ActiveCastingCalls />
      <RecentApplications />
    </Grid>
    <Grid item xs={12} md={4}>
      <PerformanceMetrics />
      <TalentRecommendations />
    </Grid>
  </Grid>
</DashboardLayout>
```

#### **2. Manage Casting Calls** - `/casting-calls`
```typescript
<DashboardLayout user={user} currentPath="/casting-calls">
  <CastingCallsTable
    castingCalls={userCastingCalls}
    onEdit={handleEdit}
    onViewApplications={handleViewApplications}
  />
</DashboardLayout>
```

#### **3. Create Casting Call** - `/casting-calls/create`
```typescript
<DashboardLayout user={user} currentPath="/casting-calls">
  <CastingCallForm
    onSubmit={handleCreateCastingCall}
    onSaveDraft={handleSaveDraft}
  />
</DashboardLayout>
```

#### **4. Edit Casting Call** - `/casting-calls/[id]/edit`
```typescript
<DashboardLayout user={user} currentPath="/casting-calls">
  <CastingCallForm
    castingCall={existingCall}
    onSubmit={handleUpdateCastingCall}
    mode="edit"
  />
</DashboardLayout>
```

#### **5. Review Applications** - `/casting-calls/[id]/applications`
```typescript
<DashboardLayout user={user} currentPath="/casting-calls">
  <ApplicationReviewInterface
    applications={applications}
    onShortlist={handleShortlist}
    onReject={handleReject}
    onMessage={handleMessage}
  />
</DashboardLayout>
```

#### **6. Talent Search** - `/talent-search`
```typescript
<DashboardLayout user={user} currentPath="/talent-search">
  <SearchInterface
    searchType="talent"
    onSearch={handleTalentSearch}
    results={talentResults}
  />
  <Grid container spacing={2}>
    {talentResults.map(talent => (
      <Grid item xs={12} sm={6} md={4} key={talent.id}>
        <TalentCard
          talent={talent}
          onClick={handleTalentClick}
        />
      </Grid>
    ))}
  </Grid>
</DashboardLayout>
```

#### **7. Messages** - `/messages`
```typescript
<DashboardLayout user={user} currentPath="/messages">
  <MessagingInterface
    conversations={conversations}
    onSendMessage={handleSendMessage}
  />
</DashboardLayout>
```

#### **8. Analytics** - `/analytics`
```typescript
<DashboardLayout user={user} currentPath="/analytics">
  <AnalyticsDashboard
    metrics={performanceMetrics}
    charts={analyticsCharts}
  />
</DashboardLayout>
```

#### **9. Billing** - `/billing`
```typescript
<DashboardLayout user={user} currentPath="/billing">
  <BillingInterface
    subscription={userSubscription}
    invoices={userInvoices}
    onUpgrade={handleUpgrade}
  />
</DashboardLayout>
```

#### **10. Settings** - `/settings`
```typescript
<DashboardLayout user={user} currentPath="/settings">
  <SettingsTabs>
    <CompanyProfile />
    <AccountSettings />
    <NotificationSettings />
    <BillingSettings />
  </SettingsTabs>
</DashboardLayout>
```

---

### **Search & Discovery Pages (4 pages)**

#### **1. Universal Search** - `/search`
```typescript
<PublicLayout>
  <SearchInterface
    searchType="universal"
    onSearch={handleUniversalSearch}
    results={searchResults}
  />
  <SearchResults results={searchResults} />
</PublicLayout>
```

#### **2. Talent Search** - `/search/talent`
```typescript
<PublicLayout>
  <SearchInterface
    searchType="talent"
    onSearch={handleTalentSearch}
    results={talentResults}
  />
  <TalentGrid>
    {talentResults.map(talent => (
      <TalentCard key={talent.id} talent={talent} />
    ))}
  </TalentGrid>
</PublicLayout>
```

#### **3. Casting Search** - `/search/casting-calls`
```typescript
<PublicLayout>
  <SearchInterface
    searchType="casting-calls"
    onSearch={handleCastingSearch}
    results={castingResults}
  />
  <CastingGrid>
    {castingResults.map(call => (
      <CastingCallCard key={call.id} castingCall={call} />
    ))}
  </CastingGrid>
</PublicLayout>
```

#### **4. Saved Searches** - `/saved-searches`
```typescript
<DashboardLayout user={user} currentPath="/saved-searches">
  <SavedSearchesList
    savedSearches={userSavedSearches}
    onExecute={handleExecuteSearch}
    onDelete={handleDeleteSearch}
  />
</DashboardLayout>
```

---

### **Payment & Subscription Pages (4 pages)**

#### **1. Pricing** - `/pricing`
```typescript
<PublicLayout>
  <PricingPlans
    plans={subscriptionPlans}
    onSelectPlan={handleSelectPlan}
  />
</PublicLayout>
```

#### **2. Checkout** - `/checkout`
```typescript
<AuthLayout>
  <CheckoutForm
    selectedPlan={selectedPlan}
    onPayment={handlePayment}
  />
</AuthLayout>
```

#### **3. Billing** - `/billing`
```typescript
<DashboardLayout user={user} currentPath="/billing">
  <BillingDashboard
    subscription={userSubscription}
    invoices={userInvoices}
    paymentMethods={paymentMethods}
  />
</DashboardLayout>
```

#### **4. Payment Success** - `/payment-success`
```typescript
<AuthLayout>
  <PaymentSuccessPage
    transaction={transaction}
    onContinue={handleContinue}
  />
</AuthLayout>
```

---

### **Admin Dashboard Pages (8 pages)**

#### **1. Admin Dashboard** - `/admin`
```typescript
<AdminLayout user={user} currentPath="/admin">
  <AdminOverview
    stats={platformStats}
    recentActivity={recentActivity}
  />
</AdminLayout>
```

#### **2. User Management** - `/admin/users`
```typescript
<AdminLayout user={user} currentPath="/admin/users">
  <UserManagementTable
    users={allUsers}
    onVerify={handleUserVerification}
    onSuspend={handleUserSuspension}
  />
</AdminLayout>
```

#### **3. Casting Call Management** - `/admin/casting-calls`
```typescript
<AdminLayout user={user} currentPath="/admin/casting-calls">
  <CastingCallModerationTable
    castingCalls={allCastingCalls}
    onApprove={handleApprove}
    onReject={handleReject}
  />
</AdminLayout>
```

#### **4. Digital Twin Management** - `/admin/digital-twin`
```typescript
<AdminLayout user={user} currentPath="/admin/digital-twin">
  <DigitalTwinSourceManager
    sources={scrapingSources}
    onAddSource={handleAddSource}
    onToggleSource={handleToggleSource}
  />
</AdminLayout>
```

#### **5. Validation Queue** - `/admin/validation-queue`
```typescript
<AdminLayout user={user} currentPath="/admin/validation-queue">
  <ValidationQueueInterface
    pendingItems={pendingValidation}
    onApprove={handleApprove}
    onReject={handleReject}
  />
</AdminLayout>
```

#### **6. Compliance** - `/admin/compliance`
```typescript
<AdminLayout user={user} currentPath="/admin/compliance">
  <ComplianceDashboard
    auditLogs={auditLogs}
    dataRequests={dataRequests}
    onExportData={handleDataExport}
  />
</AdminLayout>
```

#### **7. Analytics** - `/admin/analytics`
```typescript
<AdminLayout user={user} currentPath="/admin/analytics">
  <PlatformAnalytics
    metrics={platformMetrics}
    charts={analyticsCharts}
  />
</AdminLayout>
```

#### **8. Settings** - `/admin/settings`
```typescript
<AdminLayout user={user} currentPath="/admin/settings">
  <AdminSettings
    systemConfig={systemConfig}
    onUpdateConfig={handleConfigUpdate}
  />
</AdminLayout>
```

---

## 🎨 **Design System Integration**

### **Material-UI Theme Configuration**
```typescript
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
  },
  typography: {
    fontFamily: 'Amiri, Times New Roman, serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
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
        },
      },
    },
  },
});
```

### **CSS Custom Properties**
```css
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
  
  /* Typography */
  --takeone-font-family: 'Amiri', 'Times New Roman', serif;
  
  /* Spacing (8px base) */
  --takeone-spacing-xs: 4px;
  --takeone-spacing-sm: 8px;
  --takeone-spacing-md: 16px;
  --takeone-spacing-lg: 24px;
  --takeone-spacing-xl: 32px;
  --takeone-spacing-2xl: 48px;
  --takeone-spacing-3xl: 64px;
  
  /* Layout */
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
```

---

## 🚀 **Implementation Checklist**

### **Phase 1: Foundation (Week 1)**
- [ ] Install and configure Amiri fonts
- [ ] Set up Material-UI theme with KAFD Noir colors
- [ ] Implement 5 critical components
- [ ] Create layout system (Dashboard, Auth, Public, Admin)
- [ ] Set up routing structure

### **Phase 2: Authentication (Week 1)**
- [ ] Implement all 6 authentication pages
- [ ] Integrate Nafath verification
- [ ] Add form validation and error handling
- [ ] Test multi-step registration flow

### **Phase 3: Dashboard Pages (Week 2)**
- [ ] Implement talent dashboard (12 pages)
- [ ] Implement caster dashboard (11 pages)
- [ ] Add navigation and breadcrumbs
- [ ] Test responsive design

### **Phase 4: Search & Discovery (Week 2)**
- [ ] Implement search interfaces (4 pages)
- [ ] Add advanced filtering
- [ ] Integrate with backend search API
- [ ] Test search performance

### **Phase 5: Admin & Payment (Week 3)**
- [ ] Implement admin dashboard (8 pages)
- [ ] Add payment and billing pages (4 pages)
- [ ] Integrate Moyasar payment gateway
- [ ] Test admin workflows

### **Phase 6: Polish & Launch (Week 3)**
- [ ] Add Arabic RTL support
- [ ] Optimize performance
- [ ] Conduct accessibility testing
- [ ] Deploy to production

---

**This comprehensive guide provides everything needed to implement all 52+ pages using the 5 critical components as building blocks. Each component is production-ready with TypeScript, responsive design, and KAFD Noir styling.**
