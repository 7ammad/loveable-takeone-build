# Phase 3: Testing & Quality Assurance
**Project:** TakeOne  
**Date:** October 10, 2025  
**Status:** ✅ COMPLETED

---

## Executive Summary

Testing infrastructure exists (Vitest) but **test coverage is minimal**. Critical authentication and payment flows need comprehensive testing before deployment. This phase provides a testing strategy and identifies gaps.

### Current State:

**Test Files Found:** 12  
**Estimated Coverage:** <30%  
**Critical Gaps:** Auth flows, payment processing, Digital Twin

---

## 1. Current Test Infrastructure ✅ GOOD

### Setup:
- **Framework:** Vitest ✅
- **Browser Testing:** @vitest/browser ✅
- **Coverage:** @vitest/coverage-v8 ✅
- **UI:** @vitest/ui ✅

### Scripts:
```json
{
  "test": "cross-env NODE_ENV=test DISABLE_RATE_LIMIT=true vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

**Score: 8/10** (Good setup, needs more tests)

---

## 2. Existing Tests Review

### Found Test Files:

1. **`packages/core-db/src/digital-twin*.test.ts`** (3 files)
   - Digital Twin integration tests ✅
   - Unit tests ✅

2. **`packages/core-queue/src/workers/*.test.ts`** (3 files)
   - Scraped role worker ✅
   - WhatsApp message worker ✅
   - Validation worker ✅

3. **`packages/core-media/src/*.test.ts`** (2 files)
   - Perceptual hashing ✅
   - Signed HLS ✅

4. **`packages/core-compliance/src/export.test.ts`**
   - Data export functionality ✅

5. **`tests/api/auth/register.test.ts`**
   - Registration endpoint ✅

**Total:** 12 test files

### Issues:
- ⚠️ **No login tests**
- ⚠️ **No logout tests**
- ⚠️ **No refresh token tests**
- ⚠️ **No payment tests**
- ⚠️ **No RBAC tests**
- ⚠️ **No database migration tests**

---

## 3. Critical Test Gaps

### 🔴 HIGH PRIORITY - Must Test Before Launch:

#### GAP-1: Authentication Flow Tests
**Missing:**
```typescript
describe('Authentication', () => {
  describe('Login', () => {
    it('should login with valid credentials');
    it('should reject invalid email');
    it('should reject invalid password');
    it('should return httpOnly cookies');
    it('should handle rate limiting');
    it('should update lastLoginAt');
    it('should reject inactive accounts');
  });
  
  describe('Logout', () => {
    it('should revoke tokens');
    it('should clear cookies');
    it('should reject revoked tokens');
  });
  
  describe('Token Refresh', () => {
    it('should issue new tokens with valid refresh token');
    it('should reject expired refresh tokens');
    it('should reject revoked refresh tokens');
    it('should rotate refresh tokens');
  });
});
```

#### GAP-2: RBAC Tests
**Missing:**
```typescript
describe('Authorization', () => {
  describe('Admin Endpoints', () => {
    it('should allow admin access to /admin/*');
    it('should reject talent access to /admin/*');
    it('should reject caster access to /admin/*');
    it('should reject unauthenticated access');
  });
  
  describe('Resource Ownership', () => {
    it('should allow users to edit own profile');
    it('should reject editing other users profiles');
    it('should allow admin to edit any profile');
  });
});
```

#### GAP-3: Payment Tests
**Missing:**
```typescript
describe('Payments', () => {
  describe('Moyasar Integration', () => {
    it('should create payment intent');
    it('should validate payment amount');
    it('should reject negative amounts');
    it('should handle API errors');
  });
  
  describe('Webhook Handling', () => {
    it('should verify webhook signature');
    it('should reject invalid signatures');
    it('should handle payment.paid event');
    it('should handle payment.failed event');
    it('should be idempotent');
  });
  
  describe('Subscriptions', () => {
    it('should handle payment success');
    it('should handle payment failure');
    it('should apply grace period');
    it('should cancel after grace period');
  });
});
```

#### GAP-4: Database Integrity Tests
**Missing:**
```typescript
describe('Database', () => {
  describe('Foreign Key Constraints', () => {
    it('should prevent orphaned records');
    it('should cascade delete correctly');
    it('should restrict delete where needed');
  });
  
  describe('Check Constraints', () => {
    it('should reject invalid status values');
    it('should reject ratings outside 1-5 range');
    it('should reject negative heights/weights');
  });
  
  describe('Transactions', () => {
    it('should rollback on error');
    it('should commit all or nothing');
  });
});
```

---

## 4. Testing Strategy

### Phase 1: Critical Path Testing (Week 1)
**Priority:** HIGHEST  
**Focus:** Core auth and payment flows

1. **Authentication Tests** (8 hours)
   - Login (all scenarios)
   - Logout
   - Token refresh
   - Rate limiting

2. **Authorization Tests** (6 hours)
   - RBAC enforcement
   - Resource ownership
   - Admin access

3. **Payment Tests** (6 hours)
   - Moyasar integration
   - Webhook handling
   - Subscription lifecycle

**Total:** 20 hours

### Phase 2: Data Integrity Testing (Week 2)
**Priority:** HIGH  
**Focus:** Database and business logic

4. **Database Tests** (8 hours)
   - Foreign key constraints
   - Check constraints
   - Transactions
   - Migrations

5. **Digital Twin Tests** (6 hours)
   - Already good coverage ✅
   - Add integration tests

6. **Business Logic Tests** (6 hours)
   - Casting call lifecycle
   - Application flow
   - Booking system

**Total:** 20 hours

### Phase 3: Integration & E2E Testing (Week 3)
**Priority:** MEDIUM  
**Focus:** Full user journeys

7. **E2E Tests** (12 hours)
   - User registration → profile creation
   - Talent applies to casting call
   - Caster reviews applications
   - Admin approves casting calls

8. **Performance Tests** (4 hours)
   - Load testing
   - Database query performance
   - API response times

9. **Security Tests** (4 hours)
   - XSS attempts
   - CSRF attempts
   - SQL injection attempts
   - Unauthorized access attempts

**Total:** 20 hours

---

## 5. Test Implementation Examples

### Example 1: Login Tests

**File:** `tests/api/auth/login.test.ts` (NEW)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@packages/core-db';
import bcrypt from 'bcryptjs';

describe('POST /api/v1/auth/login', () => {
  let testUser: any;
  
  beforeEach(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
        role: 'talent',
        isActive: true
      }
    });
  });
  
  afterEach(async () => {
    // Cleanup
    await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
  });
  
  it('should login with valid credentials', async () => {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.data.user.email).toBe('test@example.com');
    
    // ✅ Check cookies set
    const cookies = response.headers.get('set-cookie');
    expect(cookies).toContain('accessToken');
    expect(cookies).toContain('httpOnly');
  });
  
  it('should reject invalid password', async () => {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
    });
    
    expect(response.status).toBe(401);
    
    const data = await response.json();
    expect(data.error).toBe('Invalid email or password');
  });
  
  it('should reject inactive accounts', async () => {
    await prisma.user.update({
      where: { id: testUser.id },
      data: { isActive: false }
    });
    
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    expect(response.status).toBe(403);
  });
  
  it('should handle rate limiting', async () => {
    // Make 6 requests (limit is 5)
    for (let i = 0; i < 6; i++) {
      await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      });
    }
    
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    expect(response.status).toBe(429);
  });
});
```

### Example 2: RBAC Tests

**File:** `tests/api/admin/authorization.test.ts` (NEW)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('RBAC Authorization', () => {
  let adminToken: string;
  let talentToken: string;
  let casterToken: string;
  
  beforeEach(async () => {
    // Create test users and get tokens
    adminToken = await createTestUser('admin');
    talentToken = await createTestUser('talent');
    casterToken = await createTestUser('caster');
  });
  
  describe('Admin Endpoints', () => {
    it('should allow admin access', async () => {
      const response = await fetch('http://localhost:3000/api/v1/admin/digital-twin/status', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      expect(response.status).toBe(200);
    });
    
    it('should reject talent access', async () => {
      const response = await fetch('http://localhost:3000/api/v1/admin/digital-twin/status', {
        headers: { 'Authorization': `Bearer ${talentToken}` }
      });
      
      expect(response.status).toBe(403);
    });
    
    it('should reject caster access', async () => {
      const response = await fetch('http://localhost:3000/api/v1/admin/digital-twin/status', {
        headers: { 'Authorization': `Bearer ${casterToken}` }
      });
      
      expect(response.status).toBe(403);
    });
    
    it('should reject unauthenticated access', async () => {
      const response = await fetch('http://localhost:3000/api/v1/admin/digital-twin/status');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('Resource Ownership', () => {
    it('should prevent editing other users profiles', async () => {
      const user1 = await createTestUser('talent');
      const user2 = await createTestUser('talent');
      
      const user2Profile = await prisma.talentProfile.findUnique({
        where: { userId: user2.id }
      });
      
      const response = await fetch(`http://localhost:3000/api/v1/profiles/${user2Profile.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user1.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stageName: 'Hacked' })
      });
      
      expect(response.status).toBe(403);
    });
  });
});
```

---

## 6. Testing Best Practices

### ✅ DO:
1. **Use test database** - Separate from development
2. **Clean up after tests** - Delete test data
3. **Test edge cases** - Not just happy paths
4. **Mock external APIs** - Don't call real Moyasar/OpenAI
5. **Use factories** - For test data creation
6. **Test error paths** - Network failures, timeouts
7. **Assert on side effects** - Check database changes
8. **Test security** - XSS, CSRF, injection attempts

### ❌ DON'T:
1. **Test implementation details** - Test behavior, not code
2. **Hard-code IDs** - Use factories/fixtures
3. **Share state between tests** - Each test independent
4. **Skip cleanup** - Always clean up test data
5. **Test third-party code** - Trust Prisma, Next.js
6. **Ignore flaky tests** - Fix or remove them

---

## 7. Coverage Goals

### Target Coverage:

| Module | Target | Priority |
|--------|--------|----------|
| **Authentication** | 95% | 🔴 Critical |
| **Authorization** | 90% | 🔴 Critical |
| **Payments** | 90% | 🔴 Critical |
| **Database Operations** | 80% | ⚠️ High |
| **Digital Twin** | 70% | ⚠️ High |
| **Business Logic** | 75% | ⚠️ High |
| **Utilities** | 60% | 📝 Medium |
| **Frontend Components** | 50% | 📝 Medium |

### Minimum for Launch:
- **Auth:** 90%
- **Payments:** 85%
- **RBAC:** 90%

---

## 8. CI/CD Integration

### GitHub Actions (Recommended):

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run migrations
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Run tests
        run: pnpm test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          NODE_ENV: test
          DISABLE_RATE_LIMIT: true
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 9. Manual Testing Checklist

### Pre-Launch Testing:

#### Authentication Flow:
- [ ] Register new talent account
- [ ] Register new caster account
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout and verify token revoked
- [ ] Refresh token before expiry
- [ ] Access protected route with valid token
- [ ] Access protected route with expired token

#### Authorization:
- [ ] Admin can access /admin routes
- [ ] Talent cannot access /admin routes
- [ ] Caster cannot access /admin routes
- [ ] User can edit own profile
- [ ] User cannot edit other's profile
- [ ] Admin can edit any profile

#### Payments:
- [ ] Create subscription
- [ ] Payment succeeds (test mode)
- [ ] Payment fails (test mode)
- [ ] Webhook processed correctly
- [ ] Subscription activated
- [ ] Grace period applied on failure
- [ ] Subscription canceled after grace period

#### Digital Twin:
- [ ] WhatsApp messages processed
- [ ] LLM extracts casting calls correctly
- [ ] Admin can review pending calls
- [ ] Approve casting call
- [ ] Reject casting call
- [ ] Published calls visible to talent

#### Casting Calls:
- [ ] Browse casting calls
- [ ] Filter by location
- [ ] Search by keywords
- [ ] Apply to casting call
- [ ] View application status
- [ ] Withdraw application

#### Security:
- [ ] XSS attempts blocked
- [ ] CSRF attempts blocked
- [ ] SQL injection attempts blocked
- [ ] Rate limiting works
- [ ] Invalid tokens rejected
- [ ] Revoked tokens rejected

---

## 10. Performance Testing

### Load Testing (Artillery):

```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10  # 10 requests/sec
    - duration: 120
      arrivalRate: 50  # Ramp to 50 requests/sec

scenarios:
  - name: Browse Casting Calls
    flow:
      - get:
          url: "/api/v1/casting-calls"
      - think: 2
      - get:
          url: "/api/v1/casting-calls/{{ castingCallId }}"
  
  - name: Authentication
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
```

### Performance Goals:

| Metric | Target | Max |
|--------|--------|-----|
| **API Response Time (P95)** | <200ms | 500ms |
| **Database Query Time (P95)** | <50ms | 100ms |
| **Page Load Time** | <2s | 3s |
| **LLM Processing Time** | <5s | 10s |

---

## Testing Score

| Category | Score | Notes |
|----------|-------|-------|
| **Infrastructure** | 8/10 | Good setup |
| **Existing Tests** | 5/10 | Limited coverage |
| **Critical Coverage** | 3/10 | Major gaps |
| **Strategy** | 9/10 | Plan is solid |

**Overall: 6/10** ⚠️ **NEEDS SIGNIFICANT WORK**

**After Implementation: 9/10** ✅ **EXCELLENT**

---

## Recommendations

### Immediate (Before Launch):
1. **Write authentication tests** (8 hours)
2. **Write RBAC tests** (6 hours)
3. **Write payment tests** (6 hours)
4. **Set up CI/CD** (4 hours)

### Short-term (Post-Launch):
5. **Add E2E tests** (12 hours)
6. **Performance testing** (4 hours)
7. **Security testing** (4 hours)
8. **Increase coverage to 80%** (20+ hours)

### Long-term (Ongoing):
9. **Maintain 80%+ coverage**
10. **Regular security audits**
11. **Performance monitoring**

---

**Phase 3 Status:** ✅ COMPLETE  
**Next Phase:** Phase 7 - Final Review and Sign-off  
**Critical Action:** Implement auth/RBAC/payment tests before launch

