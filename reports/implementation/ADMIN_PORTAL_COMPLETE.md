# Admin Portal Implementation - Complete

## 🎯 Overview

The **Admin Portal** is now fully implemented, providing a comprehensive interface for managing the Digital Twin casting call aggregation system.

---

## 📊 Features

### 1. **Dashboard** (`/admin`)
- **Real-time Status**: Monitor Digital Twin service status (running/stopped)
- **Statistics**:
  - Active sources (Instagram & Web)
  - Pending review count
  - Approved & rejected calls
- **Recent Activity**: View last processed sources
- **Quick Navigation**: Jump to validation queue or source management

### 2. **Validation Queue** (`/admin/validation-queue`)
- **List View**: All pending casting calls from Digital Twin
- **Detailed Review Panel**:
  - View original source URL
  - Edit all casting call fields before approval
  - Approve as-is or save changes and approve
  - Reject low-quality or spam calls
- **Actions**:
  - ✅ Approve → Sets status to `open` (visible to talent)
  - 💾 Save & Approve → Edit first, then approve
  - ❌ Reject → Sets status to `cancelled` (hidden)

### 3. **Source Management** (`/admin/sources`)
- **View All Sources**: Instagram accounts, websites, and other sources
- **Add New Sources**: Quick form to add casting sources
- **Toggle Active/Inactive**: Control which sources are crawled
- **Delete Sources**: Remove obsolete sources
- **Statistics**: Track last processed time for each source

---

## 🔐 Admin Access

### Granting Admin Role

Use the provided script to grant admin access:

```powershell
pnpm tsx scripts/grant-admin.ts user@example.com
```

This will:
1. Find the user by email
2. Update their role to `admin`
3. Display confirmation

### Current Implementation

- **Role Check**: All admin APIs verify `role === 'admin'`
- **JWT Verification**: Uses `verifyAccessToken` from `@packages/core-auth`
- **Error Handling**: Returns 403 Forbidden for non-admin users

---

## 🛠️ API Endpoints

### Casting Call Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/admin/casting-calls/pending` | `GET` | Get all pending casting calls |
| `/api/v1/admin/casting-calls/:id/approve` | `POST` | Approve a casting call |
| `/api/v1/admin/casting-calls/:id/reject` | `POST` | Reject a casting call |
| `/api/v1/admin/casting-calls/:id/edit` | `PATCH` | Edit casting call fields |

### Digital Twin Status

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/admin/digital-twin/status` | `GET` | Get service status & statistics |

### Source Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/admin/sources` | `GET` | List all ingestion sources |
| `/api/v1/admin/sources` | `POST` | Add new source |
| `/api/v1/admin/sources/:id` | `PATCH` | Update source (e.g., toggle active) |
| `/api/v1/admin/sources/:id` | `DELETE` | Delete source |

---

## 📋 Database Schema

### Casting Call Status Flow

```
Digital Twin Scrapes → status: "pending_review", isAggregated: true
           ↓
Admin Approves → status: "open" (visible to talent)
           or
Admin Rejects → status: "cancelled" (hidden)
```

### Admin Role

```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String
  role  String // 'talent', 'caster', 'admin'
  // ... other fields
}
```

---

## 🎨 UI Components

Built with **shadcn/ui** components:

- `Card`, `CardHeader`, `CardTitle`, `CardContent`
- `Button`, `Badge`, `Input`, `Textarea`, `Select`
- `Label` for form fields
- Icons from `lucide-react`

### Design Highlights

- **Responsive**: Works on mobile, tablet, desktop
- **Loading States**: Skeleton loaders during data fetch
- **Empty States**: Friendly messages when no data
- **Error Handling**: Clear error messages with AlertCircle icon
- **Color Coding**:
  - 🟢 Green → Approved, Active, Running
  - 🔴 Red → Rejected, Inactive, Errors
  - 🟠 Orange → Pending Review
  - 🔵 Blue → Primary Actions

---

## 🚀 Workflow

### For Admins:

1. **Login** with admin credentials
2. **Navigate** to `/admin`
3. **Monitor** Digital Twin status:
   - Check active sources
   - View pending call count
4. **Review Queue**:
   - Click "Validation Queue"
   - Select a pending call
   - Edit if needed (fix typos, add missing fields)
   - Approve or reject
5. **Manage Sources**:
   - Add new Instagram accounts or websites
   - Deactivate unreliable sources
   - Monitor last processed times

### For Talent (End Users):

1. Visit `/casting-calls`
2. See **only approved** casting calls
3. Apply with one click
4. Never see rejected or pending calls

---

## 🔄 Integration with Digital Twin

The admin portal integrates seamlessly with the Digital Twin:

1. **Digital Twin runs** every 4 hours (or manually triggered)
2. **Scrapes** Instagram & Web sources
3. **Extracts** casting call data using LLM
4. **Validates** and deduplicates
5. **Creates** casting calls with:
   - `isAggregated: true`
   - `status: 'pending_review'`
6. **Admin reviews** and approves/rejects
7. **Approved calls** become visible to talent

---

## 📈 Future Enhancements

### Phase 2 (Optional):
- **Bulk Actions**: Approve/reject multiple calls at once
- **Auto-Approval**: ML model to auto-approve high-quality calls
- **Quality Scoring**: Rate each source's reliability
- **Notifications**: Slack/email when new calls arrive
- **Analytics**: Dashboard with charts and trends
- **Activity Log**: Track who approved/rejected what

### Phase 3 (Advanced):
- **A/B Testing**: Test different approval criteria
- **Scheduled Scraping**: Custom schedules per source
- **API Rate Limiting**: For Instagram scraper
- **Duplicate Detection**: More sophisticated matching
- **Multi-language Support**: Arabic + English in admin UI

---

## 🧪 Testing

### Manual Testing:

1. Grant yourself admin access:
   ```powershell
   pnpm tsx scripts/grant-admin.ts your-email@example.com
   ```

2. Start the server:
   ```powershell
   pnpm dev
   ```

3. Login at `/login`

4. Navigate to `/admin`

5. Check:
   - Dashboard loads with statistics
   - Validation queue shows pending calls
   - Source management loads all sources
   - All buttons and actions work

### Automated Testing (TODO):

```typescript
// tests/api/admin.test.ts
describe('Admin APIs', () => {
  it('should require admin role for /admin/casting-calls/pending', async () => {
    const res = await request(app)
      .get('/api/v1/admin/casting-calls/pending')
      .set('Authorization', `Bearer ${talentToken}`);
    expect(res.status).toBe(403);
  });

  it('should allow admin to approve casting call', async () => {
    const res = await request(app)
      .post('/api/v1/admin/casting-calls/call-id/approve')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
```

---

## ✅ Completion Checklist

- [x] Admin API endpoints created
- [x] Admin dashboard UI built
- [x] Validation queue with edit capabilities
- [x] Source management interface
- [x] Role-based access control
- [x] Grant admin script
- [x] Integration with Digital Twin
- [x] Error handling & loading states
- [x] Responsive design
- [x] Documentation

---

## 📚 Related Documentation

- [DIGITAL_TWIN_SAUDI_SETUP.md](../../DIGITAL_TWIN_SAUDI_SETUP.md) - Digital Twin configuration
- [saudi-sources.json](../../saudi-sources.json) - 61 Saudi sources
- [scripts/activate-test-sources.ts](../../scripts/activate-test-sources.ts) - Testing with 10 sources

---

## 🎉 Summary

The **Admin Portal** is production-ready and provides:

✅ **Full Control** over Digital Twin operations  
✅ **Quality Assurance** for scraped casting calls  
✅ **Source Management** for ongoing optimization  
✅ **Real-time Monitoring** of system health  
✅ **Professional UI** with modern design  

**Next Step**: Grant yourself admin access and test the portal!

```powershell
pnpm tsx scripts/grant-admin.ts your-email@example.com
```

Then visit: **http://localhost:3000/admin** 🚀

