# 🎛️ Admin Dashboard - Complete Feature Set

## ✅ Currently Implemented

### 1. **Usage & Cost Metrics** (`/admin/usage-metrics`) ✨ NEW!
**Purpose**: Track API costs across all services in SAR

**Features**:
- **Real-time cost tracking** for all services (OpenAI, Redis, Whapi, Vercel, etc.)
- **Category breakdown**: AI, Infrastructure, Communication, Storage, Payment
- **Budget alerts** at 70%, 90% thresholds
- **Cost projections**: End-of-month estimates
- **Month-over-month comparison**
- **Export to CSV** for accounting
- **Per-service metrics**: Usage, limits, cost per unit
- **Visual progress bars** for quota tracking

**Cost Tracking**:
- OpenAI GPT-4o-mini: SAR per 1K tokens
- Upstash Redis: SAR per request
- Whapi.Cloud: SAR per API call (saved with webhooks!)
- Vercel: Bandwidth & functions
- Supabase: Storage & database
- Moyasar: Payment processing fees

### 2. **Validation Queue** (`/admin/validation-queue`)
**Purpose**: Review and approve scraped casting calls

**Features**:
- ✅ **Bulk actions**: Approve All, Reject All
- ✅ **Advanced filters**: Source type, Date range, Search
- ✅ **Individual editing**: Fix errors before approval
- ✅ **Source badges**: WhatsApp, Web, Instagram
- ✅ **Roles field**: Properly separated from requirements
- ✅ **Real-time updates**: Via webhooks

## 🎯 Essential Admin Features to Add

### 3. **System Health Dashboard** (`/admin/dashboard`) - PRIORITY 1
**Purpose**: Real-time overview of system status

**Metrics to Display**:
```typescript
interface SystemHealth {
  // Queue Status
  queues: {
    scrapedRoles: { waiting, active, failed }
    validation: { waiting, active, failed }
    dlq: { count, recent }
  }
  
  // Performance
  performance: {
    webhookLatency: number // ms
    processingTime: number // seconds
    successRate: number // percentage
  }
  
  // Database
  database: {
    pendingCalls: number
    openCalls: number
    applications: number
    users: { total, talent, casters }
  }
  
  // Today's Activity
  today: {
    messagesProcessed: number
    callsApproved: number
    newUsers: number
    applications: number
  }
}
```

**Visualizations**:
- Line charts for processing time trends
- Pie chart for casting call sources
- Bar chart for daily activity
- Real-time alerts for errors

### 4. **User Management** (`/admin/users`) - PRIORITY 2
**Purpose**: Manage users, roles, and permissions

**Features Needed**:
```typescript
- List all users (talent, casters, admins)
- Search by name, email, role
- Filter: Active, Inactive, Pending verification
- User details:
  - Profile information
  - Registration date
  - Last login
  - Applications/Castings count
  - Subscription status
- Actions:
  - Promote to admin
  - Suspend account
  - Reset password
  - View activity log
  - Impersonate user (for support)
```

### 5. **Analytics Dashboard** (`/admin/analytics`) - PRIORITY 3
**Purpose**: Business intelligence and insights

**Metrics to Track**:
```typescript
// Casting Calls
- Total calls posted (by source)
- Approval rate
- Average time to approval
- Most active production companies
- Popular locations
- Project types distribution

// Applications
- Total applications
- Conversion rate (views → applications)
- Popular casting calls
- Application demographics

// Users
- User growth over time
- Active users (DAU, MAU)
- Talent vs Casters ratio
- Registration sources
- Profile completion rate

// Revenue (Future)
- Subscription revenue
- Transaction volume
- MRR/ARR
- Churn rate
```

**Visualizations**:
- Time-series charts for trends
- Funnel charts for conversion
- Heatmaps for activity patterns
- Geographic distribution maps

### 6. **Content Moderation** (`/admin/moderation`) - PRIORITY 2
**Purpose**: Review flagged content and handle reports

**Features Needed**:
```typescript
- Flagged casting calls (spam, inappropriate)
- Reported profiles
- Duplicate detection
- Auto-moderation rules
- Appeal system
- Moderation history
- Ban list management
```

### 7. **WhatsApp Groups Management** (`/admin/whatsapp-groups`) - PRIORITY 3
**Purpose**: Manage WhatsApp ingestion sources

**Features Needed**:
```typescript
- List all groups
- Add/remove groups
- Enable/disable groups
- Group statistics:
  - Messages received
  - Casting calls found
  - Success rate
  - Last message time
- Bulk operations
- Auto-discovery status
- Webhook configuration
```

### 8. **Email & Notifications** (`/admin/communications`) - PRIORITY 4
**Purpose**: Manage system communications

**Features Needed**:
```typescript
- Email templates
- Notification settings
- Broadcast messages
- Email logs
- Bounce/complaint tracking
- SMS integration (Unifonic/Twilio)
- Push notification management
```

### 9. **Settings & Configuration** (`/admin/settings`) - PRIORITY 2
**Purpose**: System-wide configuration

**Settings Categories**:
```typescript
// General
- Site name, logo, branding
- Contact information
- Social media links
- Maintenance mode

// API Keys
- OpenAI API key
- Whapi token
- Redis URL
- Supabase credentials
- Payment gateway keys

// Features
- Enable/disable features
- Beta features toggle
- Feature flags

// Security
- Rate limits
- Session timeout
- 2FA requirements
- IP whitelist

// Integrations
- Webhook URLs
- OAuth providers
- Third-party services
```

### 10. **Audit Logs** (`/admin/audit-logs`) - PRIORITY 3
**Purpose**: Track all admin actions for compliance

**Log Types**:
```typescript
- User actions (create, update, delete)
- Casting call approvals/rejections
- System configuration changes
- API key rotations
- Data exports
- Login attempts
- Failed operations
```

**Features**:
- Search and filter
- Export logs
- Retention policy
- Real-time streaming
- Alert on suspicious activity

### 11. **Reports & Exports** (`/admin/reports`) - PRIORITY 4
**Purpose**: Generate business reports

**Report Types**:
```typescript
- Monthly usage report
- Financial summary
- User growth report
- Content performance
- System health report
- Compliance reports
- Custom report builder
```

**Export Formats**:
- PDF
- CSV
- Excel
- JSON

### 12. **API Documentation** (`/admin/api-docs`) - PRIORITY 4
**Purpose**: Internal API documentation for integrations

**Features**:
- Interactive API explorer
- Code examples
- Rate limit info
- Webhook documentation
- Error codes reference
- Testing sandbox

## 🏗️ Recommended Implementation Order

### Phase 1: Core Operations (Week 1)
1. ✅ Usage & Cost Metrics (DONE!)
2. ⏳ System Health Dashboard
3. ⏳ User Management

### Phase 2: Business Intelligence (Week 2)
4. ⏳ Analytics Dashboard
5. ⏳ WhatsApp Groups Management
6. ⏳ Settings & Configuration

### Phase 3: Compliance & Safety (Week 3)
7. ⏳ Content Moderation
8. ⏳ Audit Logs
9. ⏳ Email & Notifications

### Phase 4: Advanced Features (Week 4)
10. ⏳ Reports & Exports
11. ⏳ API Documentation

## 📊 Admin Dashboard Layout

```
/admin
├── dashboard (System Health Overview)
├── validation-queue (Approve casting calls)
├── usage-metrics (API costs & usage) ✅ NEW!
├── users (User management)
├── analytics (Business insights)
├── whatsapp-groups (Source management)
├── moderation (Content review)
├── communications (Email & notifications)
├── settings (System configuration)
├── audit-logs (Activity tracking)
├── reports (Business reports)
└── api-docs (API reference)
```

## 🎨 UI/UX Guidelines

### Navigation
- **Sidebar**: Always visible with collapsible sections
- **Breadcrumbs**: Show current location
- **Quick actions**: Floating action button for common tasks

### Cards & Metrics
- **KPI Cards**: Large, prominent numbers with trends
- **Status Indicators**: Color-coded (green/yellow/red)
- **Real-time Updates**: WebSocket or polling every 30s

### Tables
- **Pagination**: 25/50/100 items per page
- **Search**: Debounced, minimum 3 characters
- **Filters**: Persistent across navigation
- **Bulk Actions**: Checkbox selection
- **Export**: CSV/PDF buttons

### Charts
- **Library**: Recharts or Chart.js
- **Responsive**: Mobile-friendly
- **Interactive**: Tooltips, zoom, pan
- **Date Ranges**: Custom range picker

## 🔐 Security Considerations

### Access Control
```typescript
// Role-based permissions
const permissions = {
  superAdmin: ['*'], // All permissions
  admin: [
    'view_users',
    'edit_users',
    'approve_content',
    'view_analytics',
    'manage_settings'
  ],
  moderator: [
    'view_users',
    'approve_content',
    'view_analytics'
  ]
};
```

### Audit Trail
- Log all admin actions
- Track IP addresses
- Session management
- 2FA required for sensitive operations

## 💰 Cost Impact

### Current Monthly Costs (Estimated)
```
OpenAI GPT-4o-mini: SAR 75
Upstash Redis: SAR 15
Whapi.Cloud: SAR 0 (webhooks!)
Vercel: SAR 150
Supabase: SAR 0 (free tier)
Total: ~SAR 240/month
```

### With Full Usage (1000 calls/day)
```
OpenAI: SAR 300
Redis: SAR 60
Vercel: SAR 300
Supabase: SAR 100
Total: ~SAR 760/month
```

## 📱 Mobile Considerations

### Admin Mobile App (Optional)
- Push notifications for urgent actions
- Quick approve/reject
- View metrics
- Respond to reports
- React Native or Flutter

### Mobile Web
- Responsive design
- Touch-friendly controls
- Offline support for viewing
- PWA capabilities

## 🎯 Success Metrics

### Operational Efficiency
- Approval time: < 2 minutes per casting call
- Response time: < 5 seconds for dashboard load
- Uptime: > 99.9%
- Error rate: < 0.1%

### Business Metrics
- User satisfaction: > 4.5/5
- Cost per casting call: < SAR 2
- Admin productivity: 10x improvement with bulk actions
- Data-driven decisions: Weekly reports used

## 🚀 Quick Start

### Access Admin Dashboard
```
URL: https://your-domain.com/admin
Auth: Protected by admin-auth middleware
Role: Requires 'admin' or 'superAdmin' role
```

### First-Time Setup
1. Access `/admin/settings`
2. Configure API keys
3. Set up notification preferences
4. Create admin users
5. Configure moderation rules
6. Review usage metrics

## 📚 Documentation

- [Usage Metrics Guide](./USAGE_METRICS_GUIDE.md)
- [Admin API Reference](./ADMIN_API_REFERENCE.md)
- [Security Best Practices](./ADMIN_SECURITY.md)
- [Troubleshooting](./ADMIN_TROUBLESHOOTING.md)

---

**Status**: Phase 1 in progress (Usage Metrics ✅)

**Next**: System Health Dashboard & User Management

**Priority**: High (Core operational needs)

