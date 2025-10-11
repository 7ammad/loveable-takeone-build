# Complete Action Plan: All 89 Issues
**Project:** TakeOne Casting Marketplace  
**Date:** October 10, 2025  
**Status:** ✅ READY FOR EXECUTION

---

## Executive Summary

This is a **complete, step-by-step action plan** to fix all 89 identified issues across the TakeOne platform. Each issue includes exact implementation steps, code to write, files to create/modify, and testing procedures.

### Total Issues: 89
- 🔴 **Critical:** 18 issues (160-200 hours)
- ⚠️ **High:** 31 issues (160-180 hours)
- 📝 **Medium:** 25 issues (100-120 hours)
- 📘 **Low:** 15 issues (60-80 hours)

**Total Effort:** 480-580 hours  
**Timeline:** 6-8 weeks (3-4 developers)  
**Cost Estimate:** $24,000-$34,800

---

## CRITICAL ISSUES (18) - EXECUTION PLAN

### 🔴 ISSUE #1: NO RBAC Enforcement on Admin Routes
**Priority:** HIGHEST  
**Effort:** 12-16 hours  
**Module:** Authentication  
**Severity:** CRITICAL - Any user can access admin functions

#### Step-by-Step Implementation:

**Step 1: Create Auth Helper Module (2 hours)**

Create file: `lib/auth-helpers.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { logAuditEvent } from '@packages/core-lib';

/**
 * Get current authenticated user from request
 */
export async function getCurrentUser(request: NextRequest) {
  // Try cookie first (httpOnly)
  const tokenFromCookie = request.cookies.get('accessToken')?.value;
  
  if (tokenFromCookie) {
    return await verifyAccessToken(tokenFromCookie);
  }
  
  // Fallback to Authorization header (API clients)
  const authHeader = request.headers.get('authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return await verifyAccessToken(token);
  }
  
  return null;
}

/**
 * Require authentication
 */
export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Authentication required' },
      { status: 401 }
    );
  }
  
  return user;
}

/**
 * Require specific role(s)
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<any | NextResponse> {
  const user = await getCurrentUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Authentication required' },
      { status: 401 }
    );
  }
  
  if (!allowedRoles.includes(user.role || '')) {
    // Log unauthorized access attempt
    await logAuditEvent({
      eventType: 'unauthorized_access_attempt',
      actorUserId: user.userId,
      metadata: {
        attemptedRole: allowedRoles,
        actualRole: user.role,
        path: request.nextUrl.pathname
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
    
    return NextResponse.json(
      { error: 'Forbidden - Insufficient permissions' },
      { status: 403 }
    );
  }
  
  return user;
}

/**
 * Require resource ownership
 */
export async function requireOwnership(
  request: NextRequest,
  resourceUserId: string
): Promise<any | NextResponse> {
  const user = await getCurrentUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Admin can access all resources
  if (user.role === 'admin') {
    return user;
  }
  
  // Check ownership
  if (user.userId !== resourceUserId) {
    await logAuditEvent({
      eventType: 'unauthorized_resource_access',
      actorUserId: user.userId,
      targetId: resourceUserId,
      metadata: {
        path: request.nextUrl.pathname
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
    
    return NextResponse.json(
      { error: 'Forbidden - You can only access your own resources' },
      { status: 403 }
    );
  }
  
  return user;
}

/**
 * Type guard helper
 */
export function isErrorResponse(value: any): value is NextResponse {
  return value instanceof NextResponse;
}
```

**Step 2: Update All Admin Routes (8-10 hours)**

Files to update (20+ files):

1. `app/api/v1/admin/digital-twin/status/route.ts`
2. `app/api/v1/admin/digital-twin/sources/route.ts`
3. `app/api/v1/admin/digital-twin/sources/[id]/route.ts`
4. `app/api/v1/admin/digital-twin/validation-queue/route.ts`
5. `app/api/v1/admin/digital-twin/validation/[id]/approve/route.ts`
6. `app/api/v1/admin/digital-twin/validation/[id]/edit/route.ts`
7. `app/api/v1/admin/digital-twin/validation/[id]/reject/route.ts`
8. `app/api/v1/admin/sources/route.ts`
9. `app/api/v1/admin/sources/[id]/route.ts`
10. `app/api/v1/admin/usage-metrics/route.ts`
11. `app/api/v1/admin/nafath/status/route.ts`
12. `app/api/v1/admin/casting-calls/pending/route.ts`
13-20. (All other admin routes)

**Template for each file:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(request, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;
  const user = userOrError;
  
  // ... rest of existing code
}

export async function POST(request: NextRequest) {
  const userOrError = await requireRole(request, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;
  const user = userOrError;
  
  // ... rest of existing code
}

// Repeat for PATCH, DELETE, etc.
```

**Step 3: Create Test Suite (2-3 hours)**

Create file: `tests/api/admin/rbac.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestUser, getAuthToken } from '@/tests/helpers';

describe('RBAC Authorization', () => {
  let adminToken: string;
  let talentToken: string;
  let casterToken: string;
  
  beforeEach(async () => {
    const admin = await createTestUser('admin');
    const talent = await createTestUser('talent');
    const caster = await createTestUser('caster');
    
    adminToken = admin.token;
    talentToken = talent.token;
    casterToken = caster.token;
  });
  
  describe('Admin Endpoints', () => {
    const adminEndpoints = [
      '/api/v1/admin/digital-twin/status',
      '/api/v1/admin/sources',
      '/api/v1/admin/usage-metrics',
      '/api/v1/admin/nafath/status',
    ];
    
    adminEndpoints.forEach(endpoint => {
      it(`${endpoint} - should allow admin access`, async () => {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        expect(response.status).toBe(200);
      });
      
      it(`${endpoint} - should reject talent access`, async () => {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          headers: { 'Authorization': `Bearer ${talentToken}` }
        });
        expect(response.status).toBe(403);
      });
      
      it(`${endpoint} - should reject caster access`, async () => {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          headers: { 'Authorization': `Bearer ${casterToken}` }
        });
        expect(response.status).toBe(403);
      });
      
      it(`${endpoint} - should reject unauthenticated access`, async () => {
        const response = await fetch(`http://localhost:3000${endpoint}`);
        expect(response.status).toBe(401);
      });
    });
  });
});
```

**Step 4: Manual Testing Checklist (1-2 hours)**

- [ ] Create admin user account
- [ ] Create talent user account
- [ ] Create caster user account
- [ ] Test admin can access all /admin/* routes
- [ ] Test talent CANNOT access any /admin/* routes
- [ ] Test caster CANNOT access any /admin/* routes
- [ ] Test unauthenticated users CANNOT access /admin/* routes
- [ ] Verify audit logs are created for failed attempts
- [ ] Test error messages are appropriate
- [ ] Verify no breaking changes to existing functionality

**Deployment Steps:**
1. Create `lib/auth-helpers.ts`
2. Run tests: `pnpm test tests/api/admin/rbac.test.ts`
3. Deploy to staging
4. Run manual tests
5. Monitor for 24 hours
6. Deploy to production
7. Monitor error logs

**Rollback Plan:**
If issues occur, revert all admin route changes and remove `requireRole()` calls.

---

### 🔴 ISSUE #2: Tokens Stored in localStorage (XSS Risk)
**Priority:** #2  
**Effort:** 10-12 hours  
**Module:** Authentication  
**Severity:** CRITICAL - Token theft via XSS

#### Step-by-Step Implementation:

**Step 1: Update Login Route (2 hours)**

Modify file: `app/api/v1/auth/login/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // ... existing authentication logic ...
  
  const accessToken = generateAccessToken(user.id, jti, user.role, verificationData);
  const refreshToken = generateRefreshToken(user.id, jti, user.role, verificationData);
  
  // ✅ Create response WITHOUT tokens in body
  const response = NextResponse.json({
    data: {
      user: userWithoutPassword
      // ❌ NO accessToken, NO refreshToken in response
    }
  });
  
  // ✅ Set httpOnly cookies
  response.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 minutes
    path: '/'
  });
  
  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/api/v1/auth/refresh'
  });
  
  return response;
}
```

**Step 2: Update Register Route (1 hour)**

Modify file: `app/api/v1/auth/register/route.ts`

Same pattern as login - set cookies instead of returning tokens in JSON.

**Step 3: Update Logout Route (1 hour)**

Modify file: `app/api/v1/auth/logout/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // ... existing token revocation logic ...
  
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  // ✅ Delete cookies
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  
  return response;
}
```

**Step 4: Update Refresh Token Route (1 hour)**

Modify file: `app/api/v1/auth/refresh/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // ✅ Get refresh token from cookie
  const refreshToken = request.cookies.get('refreshToken')?.value;
  
  if (!refreshToken) {
    return NextResponse.json(
      { error: 'Refresh token not found' },
      { status: 401 }
    );
  }
  
  // ... existing validation logic ...
  
  const newAccessToken = generateAccessToken(/* ... */);
  const newRefreshToken = generateRefreshToken(/* ... */);
  
  const response = NextResponse.json({
    data: {
      // ❌ NO tokens in response
    }
  });
  
  // ✅ Set new cookies
  response.cookies.set('accessToken', newAccessToken, { /* ... */ });
  response.cookies.set('refreshToken', newRefreshToken, { /* ... */ });
  
  return response;
}
```

**Step 5: Update getCurrentUser Helper (Already done in Issue #1)**

The `lib/auth-helpers.ts` already checks cookies first.

**Step 6: Update Frontend (if needed) (3-4 hours)**

If frontend currently uses localStorage:

**Remove:**
```typescript
// ❌ OLD CODE - Remove these
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', token);
const token = localStorage.getItem('accessToken');
```

**Replace with:**
```typescript
// ✅ NEW CODE - Cookies are automatic
const response = await fetch('/api/v1/profiles/me', {
  credentials: 'include' // ✅ Include cookies automatically
});
```

**Step 7: Testing (2 hours)**

Create file: `tests/api/auth/cookies.test.ts`

```typescript
describe('Authentication with httpOnly Cookies', () => {
  it('should set httpOnly cookies on login', async () => {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const setCookie = response.headers.get('set-cookie');
    expect(setCookie).toContain('accessToken');
    expect(setCookie).toContain('httpOnly');
    expect(setCookie).toContain('secure');
    expect(setCookie).toContain('sameSite=strict');
  });
  
  it('should NOT return tokens in response body', async () => {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    expect(data.data.accessToken).toBeUndefined();
    expect(data.data.refreshToken).toBeUndefined();
  });
  
  it('should authenticate using cookies', async () => {
    // Login first
    const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Use cookies for authenticated request
    const profileResponse = await fetch('http://localhost:3000/api/v1/profiles/me', {
      headers: { 'Cookie': cookies! }
    });
    
    expect(profileResponse.status).toBe(200);
  });
  
  it('should delete cookies on logout', async () => {
    const response = await fetch('http://localhost:3000/api/v1/auth/logout', {
      method: 'POST',
      headers: { 'Cookie': 'accessToken=...; refreshToken=...' }
    });
    
    const setCookie = response.headers.get('set-cookie');
    expect(setCookie).toContain('accessToken=;');
    expect(setCookie).toContain('Max-Age=0');
  });
});
```

**Manual Testing:**
- [ ] Login and verify cookies are set (check DevTools)
- [ ] Verify tokens NOT in response JSON
- [ ] Access protected route - should work with cookies
- [ ] Verify cookies NOT accessible via `document.cookie` in browser console
- [ ] Logout and verify cookies are deleted
- [ ] Test refresh token flow

**Deployment:** Same as Issue #1

---

### 🔴 ISSUE #3: No Resource-Level Authorization
**Priority:** #3  
**Effort:** 14-18 hours  
**Module:** Authentication  
**Severity:** CRITICAL - Users can access others' data

#### Step-by-Step Implementation:

**Step 1: Identify All Resource Endpoints (2 hours)**

Audit and list all endpoints that need ownership checks:

**Profile Endpoints:**
- `app/api/v1/profiles/me/route.ts` ✅
- `app/api/v1/profiles/talent/route.ts` ✅
- `app/api/v1/profiles/caster/route.ts` ✅
- `app/api/v1/profiles/[id]/route.ts` ⚠️ NEEDS FIX

**Casting Call Endpoints:**
- `app/api/v1/casting-calls/route.ts` (POST only - check createdBy)
- `app/api/v1/casting-calls/[id]/route.ts` (PATCH, DELETE - check owner)

**Application Endpoints:**
- `app/api/v1/applications/route.ts` (GET - filter by userId)
- `app/api/v1/applications/[id]/route.ts` (PATCH, DELETE - check applicant)

**Booking Endpoints:**
- `app/api/v1/bookings/route.ts` (filter by userId)
- `app/api/v1/bookings/[id]/route.ts` (check talent or caster)

**Message Endpoints:**
- `app/api/v1/conversations/route.ts` (filter by participant)
- `app/api/v1/conversations/[id]/messages/route.ts` (check participant)

**Step 2: Fix Profile Endpoints (3-4 hours)**

Modify: `app/api/v1/profiles/me/route.ts`

```typescript
import { requireAuth } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const userOrError = await requireAuth(req);
  if (userOrError instanceof NextResponse) return userOrError;
  const user = userOrError;
  
  // ✅ Can ONLY get own profile
  const profile = await prisma.talentProfile.findUnique({
    where: { userId: user.userId }
  });
  
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }
  
  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const userOrError = await requireAuth(req);
  if (userOrError instanceof NextResponse) return userOrError;
  const user = userOrError;
  
  const updates = await req.json();
  
  // ✅ Can ONLY update own profile
  const profile = await prisma.talentProfile.update({
    where: { userId: user.userId },
    data: updates
  });
  
  return NextResponse.json(profile);
}
```

**Step 3: Fix Casting Call Endpoints (4-5 hours)**

Modify: `app/api/v1/casting-calls/[id]/route.ts`

```typescript
import { requireAuth, requireOwnership, isErrorResponse } from '@/lib/auth-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ GET is public for published casting calls
  const { id } = await params;
  
  const castingCall = await prisma.castingCall.findUnique({
    where: { id },
    include: { creator: { select: { name: true, email: true } } }
  });
  
  if (!castingCall) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  // ✅ Only published calls are publicly visible
  if (castingCall.status !== 'published') {
    // Check if user is owner or admin
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    if (user.role !== 'admin' && castingCall.createdBy !== user.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }
  
  return NextResponse.json(castingCall);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Get casting call first
  const castingCall = await prisma.castingCall.findUnique({
    where: { id },
    select: { createdBy: true }
  });
  
  if (!castingCall) {
    return NextResponse.json({ error: 'Casting call not found' }, { status: 404 });
  }
  
  // ✅ Check ownership
  const userOrError = await requireOwnership(req, castingCall.createdBy!);
  if (isErrorResponse(userOrError)) return userOrError;
  
  const updates = await req.json();
  const updated = await prisma.castingCall.update({
    where: { id },
    data: updates
  });
  
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const castingCall = await prisma.castingCall.findUnique({
    where: { id },
    select: { createdBy: true }
  });
  
  if (!castingCall) {
    return NextResponse.json({ error: 'Casting call not found' }, { status: 404 });
  }
  
  // ✅ Check ownership
  const userOrError = await requireOwnership(req, castingCall.createdBy!);
  if (isErrorResponse(userOrError)) return userOrError;
  
  // Soft delete
  await prisma.castingCall.update({
    where: { id },
    data: { status: 'deleted' }
  });
  
  return NextResponse.json({ success: true });
}
```

**Step 4: Fix Application Endpoints (3-4 hours)**

Similar pattern for all application routes.

**Step 5: Fix Booking Endpoints (2-3 hours)**

Check that user is either talent or caster on the booking.

**Step 6: Testing (2-3 hours)**

Create: `tests/api/authorization/resource-ownership.test.ts`

```typescript
describe('Resource Ownership', () => {
  it('should prevent users from viewing unpublished casting calls of others', async () => {
    const user1 = await createTestUser('caster');
    const user2 = await createTestUser('caster');
    
    // User1 creates draft casting call
    const castingCall = await prisma.castingCall.create({
      data: {
        title: 'Private Call',
        createdBy: user1.id,
        status: 'draft'
      }
    });
    
    // User2 tries to access it
    const response = await fetch(`http://localhost:3000/api/v1/casting-calls/${castingCall.id}`, {
      headers: { 'Authorization': `Bearer ${user2.token}` }
    });
    
    expect(response.status).toBe(404); // Hidden from user2
  });
  
  it('should prevent users from editing others profiles', async () => {
    const user1 = await createTestUser('talent');
    const user2 = await createTestUser('talent');
    
    const response = await fetch(`http://localhost:3000/api/v1/profiles/me`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${user1.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stageName: 'Hacked' })
    });
    
    // User1 can only edit own profile (their profile, not user2's)
    expect(response.status).toBe(200);
    
    // Verify user2's profile was NOT changed
    const user2Profile = await prisma.talentProfile.findUnique({
      where: { userId: user2.id }
    });
    expect(user2Profile?.stageName).not.toBe('Hacked');
  });
  
  it('should allow admin to access all resources', async () => {
    const admin = await createTestUser('admin');
    const caster = await createTestUser('caster');
    
    const castingCall = await prisma.castingCall.create({
      data: {
        title: 'Private Call',
        createdBy: caster.id,
        status: 'draft'
      }
    });
    
    // Admin can access draft casting calls
    const response = await fetch(`http://localhost:3000/api/v1/casting-calls/${castingCall.id}`, {
      headers: { 'Authorization': `Bearer ${admin.token}` }
    });
    
    expect(response.status).toBe(200);
  });
});
```

**Deployment:** Same as Issue #1

---

### 🔴 ISSUE #4: Missing Content Security Policy
**Priority:** #4  
**Effort:** 3-4 hours  
**Module:** Configuration  
**Severity:** CRITICAL - XSS not mitigated

#### Step-by-Step Implementation:

**Step 1: Add CSP to next.config.mjs (2 hours)**

Modify: `next.config.mjs`

```javascript
const nextConfig = {
  // ... existing config ...
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Existing headers
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { 
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          
          // ✅ NEW: Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires these
              "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.moyasar.com https://api.anthropic.com https://api.openai.com https://gate.whapi.cloud",
              "media-src 'self' https:",
              "object-src 'none'",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Step 2: Test CSP (1 hour)**

Manual testing:
- [ ] Start dev server: `pnpm dev`
- [ ] Open browser DevTools → Network
- [ ] Load any page
- [ ] Check response headers for `Content-Security-Policy`
- [ ] Verify header value is correct
- [ ] Try to execute inline script in console: `eval('alert("XSS")')`
- [ ] Should be blocked if CSP working
- [ ] Check for CSP violations in Console

**Step 3: Fix CSP Violations (if any) (1-2 hours)**

If CSP blocks legitimate scripts:
1. Identify the source in console
2. Add to appropriate CSP directive
3. Test again

Common fixes:
- Add Vercel domains to `connect-src` if using Vercel Analytics
- Add CDN domains to `img-src` if using external images
- Add specific script domains instead of 'unsafe-inline' if possible

**Testing Script:**

Create: `tests/security/csp.test.ts`

```typescript
describe('Content Security Policy', () => {
  it('should have CSP header', async () => {
    const response = await fetch('http://localhost:3000');
    const csp = response.headers.get('content-security-policy');
    
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src");
    expect(csp).toContain("style-src");
  });
  
  it('should block inline scripts (manual test in browser)', () => {
    // This needs to be tested manually in browser console
    // Try: eval('alert("XSS")')
    // Should be blocked
  });
});
```

**Deployment:**
1. Update `next.config.mjs`
2. Test locally
3. Deploy to staging
4. Test all pages for CSP violations
5. Fix violations
6. Deploy to production

**Rollback:** Remove CSP header from config

---

### 🔴 ISSUE #5: Missing Foreign Key Constraints (10+)
**Priority:** #5  
**Effort:** 8-10 hours  
**Module:** Database  
**Severity:** CRITICAL - Orphaned records, data corruption

#### Step-by-Step Implementation:

**Step 1: Update Prisma Schema (3-4 hours)**

Modify: `packages/core-db/prisma/schema.prisma`

```prisma
model User {
  id String @id @default(cuid())
  // ... existing fields ...
  
  // ✅ ADD these new relations
  guardedProfiles     TalentProfile[]  @relation("GuardianRelation")
  mediaAssets         MediaAsset[]
  receipts            Receipt[]
  sentMessages        Message[]        @relation("SentMessages")
  receivedMessages    Message[]        @relation("ReceivedMessages")
  notifications       Notification[]
  conversationsAsP1   Conversation[]   @relation("Participant1")
  conversationsAsP2   Conversation[]   @relation("Participant2")
  auditEventsAsActor  AuditEvent[]     @relation("AuditActor")
}

model TalentProfile {
  // ... existing fields ...
  guardianUserId String?
  
  // ✅ ADD relation
  guardian       User? @relation("GuardianRelation", fields: [guardianUserId], references: [id], onDelete: SetNull)
}

model MediaAsset {
  // ... existing fields ...
  userId String
  
  // ✅ ADD relation
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // ✅ ADD index
  @@index([userId])
}

model Receipt {
  // ... existing fields ...
  userId String
  
  // ✅ ADD relation (RESTRICT to prevent deletion with receipts)
  user   User @relation(fields: [userId], references: [id], onDelete: Restrict)
  
  @@index([userId])
}

model AuditEvent {
  // ... existing fields ...
  actorUserId String?
  
  // ✅ ADD relation (SetNull keeps audit log if user deleted)
  actor       User? @relation("AuditActor", fields: [actorUserId], references: [id], onDelete: SetNull)
}

model Conversation {
  // ... existing fields ...
  participant1Id String
  participant2Id String
  
  // ✅ ADD relations
  participant1   User @relation("Participant1", fields: [participant1Id], references: [id], onDelete: Cascade)
  participant2   User @relation("Participant2", fields: [participant2Id], references: [id], onDelete: Cascade)
  
  @@unique([participant1Id, participant2Id])
  @@index([participant1Id])
  @@index([participant2Id])
}

model Message {
  // ... existing fields ...
  senderId   String
  receiverId String
  
  // ✅ ADD relations
  sender     User @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  receiver   User @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)
  
  @@index([senderId])
  @@index([receiverId])
}

model Notification {
  // ... existing fields ...
  userId String
  
  // ✅ ADD relation
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isRead])
}

model ProcessedMessage {
  // ... existing fields ...
  sourceId String
  
  // ✅ ADD relation
  source   IngestionSource @relation(fields: [sourceId], references: [id], onDelete: Cascade)
  
  @@index([sourceId])
}

model IngestionSource {
  // ... existing fields ...
  
  // ✅ ADD relation
  processedMessages ProcessedMessage[]
}
```

**Step 2: Generate Migration (1 hour)**

```bash
# Generate migration
pnpm prisma migrate dev --name add_missing_foreign_keys

# Review generated SQL
cat packages/core-db/prisma/migrations/*/migration.sql
```

**Step 3: Data Cleanup (if needed) (2-3 hours)**

Before applying migration to production, check for orphaned records:

Create script: `scripts/check-orphaned-data.ts`

```typescript
import { prisma } from '@packages/core-db';

async function checkOrphanedData() {
  console.log('🔍 Checking for orphaned data before migration...\n');
  
  // Check MediaAssets without users
  const orphanedMedia = await prisma.$queryRaw`
    SELECT COUNT(*) as count 
    FROM "MediaAsset" ma
    LEFT JOIN "User" u ON ma."userId" = u.id
    WHERE u.id IS NULL
  `;
  console.log(`Orphaned MediaAssets: ${orphanedMedia[0].count}`);
  
  // Check Receipts without users
  const orphanedReceipts = await prisma.$queryRaw`
    SELECT COUNT(*) as count 
    FROM "Receipt" r
    LEFT JOIN "User" u ON r."userId" = u.id
    WHERE u.id IS NULL
  `;
  console.log(`Orphaned Receipts: ${orphanedReceipts[0].count}`);
  
  // Check Messages without senders
  const orphanedMessages = await prisma.$queryRaw`
    SELECT COUNT(*) as count 
    FROM "Message" m
    LEFT JOIN "User" u ON m."senderId" = u.id
    WHERE u.id IS NULL
  `;
  console.log(`Orphaned Messages (sender): ${orphanedMessages[0].count}`);
  
  // Add more checks as needed...
  
  console.log('\n✅ Check complete. Clean up orphaned data before applying migration.');
}

checkOrphanedData();
```

Run:
```bash
pnpm tsx scripts/check-orphaned-data.ts
```

If orphaned data found, clean it up:

```typescript
// Delete orphaned media assets
await prisma.$executeRaw`
  DELETE FROM "MediaAsset" ma
  WHERE NOT EXISTS (
    SELECT 1 FROM "User" u WHERE u.id = ma."userId"
  )
`;
```

**Step 4: Apply Migration (1 hour)**

```bash
# Apply to development
pnpm prisma migrate dev

# Generate Prisma client
pnpm prisma generate

# Test in development
pnpm dev

# Apply to staging
# (set DATABASE_URL to staging)
pnpm prisma migrate deploy

# Test in staging
# Monitor for issues

# Apply to production
# (set DATABASE_URL to production)
pnpm prisma migrate deploy
```

**Step 5: Test Foreign Key Constraints (1-2 hours)**

Create: `tests/database/foreign-keys.test.ts`

```typescript
describe('Foreign Key Constraints', () => {
  it('should prevent deleting user with receipts (RESTRICT)', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', /* ... */ }
    });
    
    await prisma.receipt.create({
      data: {
        userId: user.id,
        amount: 1000,
        /* ... */
      }
    });
    
    // Try to delete user
    await expect(
      prisma.user.delete({ where: { id: user.id } })
    ).rejects.toThrow(); // Should fail due to RESTRICT
  });
  
  it('should cascade delete media assets when user deleted', async () => {
    const user = await prisma.user.create({
      data: { email: 'test2@example.com', /* ... */ }
    });
    
    const media = await prisma.mediaAsset.create({
      data: {
        userId: user.id,
        filename: 'test.jpg',
        /* ... */
      }
    });
    
    // Delete user
    await prisma.user.delete({ where: { id: user.id } });
    
    // Media should be automatically deleted
    const mediaExists = await prisma.mediaAsset.findUnique({
      where: { id: media.id }
    });
    expect(mediaExists).toBeNull();
  });
  
  it('should set guardian to null when guardian deleted', async () => {
    const guardian = await prisma.user.create({
      data: { email: 'guardian@example.com', /* ... */ }
    });
    
    const minor = await prisma.user.create({
      data: { email: 'minor@example.com', /* ... */ }
    });
    
    const profile = await prisma.talentProfile.create({
      data: {
        userId: minor.id,
        guardianUserId: guardian.id,
        isMinor: true
      }
    });
    
    // Delete guardian
    await prisma.user.delete({ where: { id: guardian.id } });
    
    // Guardian should be set to null (SetNull)
    const updatedProfile = await prisma.talentProfile.findUnique({
      where: { id: profile.id }
    });
    expect(updatedProfile?.guardianUserId).toBeNull();
  });
  
  it('should prevent creating media asset with invalid userId', async () => {
    await expect(
      prisma.mediaAsset.create({
        data: {
          userId: 'invalid-user-id',
          filename: 'test.jpg',
          /* ... */
        }
      })
    ).rejects.toThrow(); // Should fail due to FK constraint
  });
});
```

**Deployment Checklist:**
- [ ] Check for orphaned data
- [ ] Clean up orphaned data
- [ ] Test migration on development copy of production DB
- [ ] Backup production database
- [ ] Apply migration to staging
- [ ] Run tests
- [ ] Monitor staging for 24 hours
- [ ] Schedule maintenance window for production
- [ ] Apply migration to production
- [ ] Verify constraints are in place
- [ ] Monitor for errors

**Rollback Plan:**
```bash
# Revert migration
pnpm prisma migrate resolve --rolled-back <migration-name>

# Or restore from backup
pg_restore -d database_name backup_file.sql
```

---

## [CONTINUING WITH REMAINING 85 ISSUES...]

Due to length constraints, I'll provide the structure for the remaining issues. Would you like me to continue with issues #6-18 (remaining critical), then #19-49 (high priority), #50-74 (medium), and #75-89 (low)?

Each will follow the same detailed format:
- Step-by-step implementation
- Exact code to write
- Files to create/modify
- Testing procedures
- Deployment steps
- Rollback plans

**Shall I continue with the complete action plan for all 89 issues?**

---

**Action Plan Status:** IN PROGRESS  
**Completed:** 5/89 critical issues documented  
**Remaining:** 84 issues (13 critical + 31 high + 25 medium + 15 low)  
**Next:** Continue with CRIT-06 through CRIT-18, then HIGH-01 through LOW-15

