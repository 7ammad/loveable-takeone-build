# 🔍 TakeOne Backend - Code Review & Quality Assurance Guide

## Overview

This guide provides a comprehensive, systematic approach to reviewing the TakeOne backend for production readiness. It ensures zero bugs, errors, or missing components before deployment.

---

## 🚀 Quick Start

### Automated Review (Recommended First Step)

Run the comprehensive automated review script:

```powershell
# PowerShell (Windows)
powershell -ExecutionPolicy Bypass -File scripts/full-code-review.ps1

# This will check:
# ✅ TypeScript compilation
# ✅ ESLint code quality
# ✅ Test suite (with coverage)
# ✅ Prisma schema validation
# ✅ Security vulnerabilities
# ✅ OpenAPI contract validation
# ✅ Environment configuration
# ✅ Production build
# ✅ Code pattern analysis
```

### API Endpoint Testing

Test all API endpoints while the server is running:

```powershell
# Start the development server in one terminal
npm run dev

# In another terminal, run the API test suite
powershell -ExecutionPolicy Bypass -File scripts/test-all-apis.ps1

# Or test against a specific URL
powershell -ExecutionPolicy Bypass -File scripts/test-all-apis.ps1 -BaseUrl "https://staging.takeone.sa"
```

---

## 📋 Manual Review Checklist

For critical systems, complement automated testing with these manual reviews:

### 1. Digital Twin System ✅

**Verify all components are operational:**

- [ ] **Ingestion Sources CRUD API**
  - Test creating a new web source (MBC, Telfaz11)
  - Test creating a WhatsApp source
  - Test updating source (enable/disable)
  - Test deleting a source

- [ ] **Orchestrator Scripts**
  - Verify `scripts/orchestrator-web.ts` exists and is configured for 4-hour intervals
  - Verify `scripts/orchestrator-whatsapp.ts` exists and is configured for 15-minute intervals
  - Check FireCrawl service integration (`scripts/services/firecrawl-service.ts`)
  - Check Whapi.cloud service integration (`scripts/services/whapi-service.ts`)

- [ ] **Queue Workers**
  - Verify `packages/core-queue/src/workers/scraped-role-worker.ts` exists
  - Verify `packages/core-queue/src/workers/whatsapp-message-worker.ts` exists
  - Verify `packages/core-queue/src/workers/validation-queue-worker.ts` exists
  - Check all queues are registered in `packages/core-queue/src/queues.ts`

- [ ] **Admin Validation Queue**
  - Test GET `/api/v1/admin/digital-twin/validation-queue`
  - Test POST `/api/v1/admin/digital-twin/validation/[id]/approve`
  - Test POST `/api/v1/admin/digital-twin/validation/[id]/reject`
  - Test POST `/api/v1/admin/digital-twin/validation/[id]/edit`
  - Verify Algolia indexing triggers on approval

### 2. Nafath Verification System ✅

**Verify one-time KYC with annual renewal:**

- [ ] **Database Schema**
  - `nafathVerified: Boolean`
  - `nafathVerifiedAt: DateTime?`
  - `nafathNationalId: String? @unique`
  - `nafathTransactionId: String?`
  - `nafathData: Json?`
  - `nafathExpiresAt: DateTime?`

- [ ] **API Endpoints**
  - POST `/api/v1/auth/nafath/initiate` (validates Saudi National ID format)
  - POST `/api/v1/auth/nafath/webhook` (processes Authentica callbacks)
  - GET `/api/v1/auth/nafath/status` (checks verification status)
  - POST `/api/v1/auth/nafath/renew` (handles annual renewal)
  - GET `/api/v1/admin/nafath/status` (admin analytics)

- [ ] **JWT Claims**
  - `nafathVerified: boolean`
  - `nafathVerifiedAt: number`
  - `nafathExpiresAt: number`
  - `verificationLevel: 'nafath' | 'email' | 'phone' | 'none'`

- [ ] **Business Logic**
  - Verification is valid for 12 months
  - Renewal is required after expiration
  - Gating functions enforce verification for protected actions
  - Webhook signature verification works

### 3. Core Backend Services

**Authentication & Authorization:**
- [ ] JWT generation and verification works
- [ ] Refresh token rotation works
- [ ] Password hashing (bcrypt/argon2) is configured
- [ ] Rate limiting is active on auth endpoints
- [ ] CSRF protection is enabled

**Media Pipeline:**
- [ ] S3 upload works
- [ ] CloudFront signed URLs work
- [ ] HLS streaming is configured
- [ ] Perceptual hashing (phash) works
- [ ] Access control enforces permissions

**Search & Discovery:**
- [ ] Algolia client is configured
- [ ] Talent search works
- [ ] Casting call search works
- [ ] Faceted filtering works
- [ ] Saved searches work

**Payments:**
- [ ] Moyasar client is configured
- [ ] Subscription creation works
- [ ] Webhook processing works
- [ ] Payment history is tracked

**Compliance:**
- [ ] User data export works (PDPL)
- [ ] Consent tracking works
- [ ] Audit logging is comprehensive
- [ ] DPIA and ROPA are maintained

---

## 🧪 Testing Strategy

### Unit Tests (Target: 85%+ Coverage)

```powershell
# Run all unit tests with coverage report
npx vitest run --coverage

# Run specific package tests
npx vitest run packages/core-auth
npx vitest run packages/core-security
npx vitest run packages/core-queue
```

### Integration Tests

```powershell
# Run integration tests (requires test database)
npx vitest run --config vitest.integration.config.ts
```

### E2E Tests

```powershell
# Manual E2E test flow:
1. Register a new user
2. Login with credentials
3. Initiate Nafath verification
4. Search for casting calls
5. Upload media (profile photo)
6. Create a saved search
7. View search results
8. Export user data (PDPL compliance)
```

---

## 🔐 Security Checklist

### Environment Variables

**Critical secrets must be in `.env` and NEVER committed:**

```bash
# Authentication
JWT_SECRET=<strong-random-string>
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Nafath
AUTHENTICA_API_KEY=<from-authentica>
AUTHENTICA_BASE_URL=https://api.authentica.sa
NAFATH_WEBHOOK_SECRET=<from-authentica>

# Search
ALGOLIA_APP_ID=<from-algolia>
ALGOLIA_ADMIN_API_KEY=<from-algolia>
ALGOLIA_SEARCH_API_KEY=<from-algolia>

# Media
AWS_ACCESS_KEY_ID=<from-aws>
AWS_SECRET_ACCESS_KEY=<from-aws>
S3_BUCKET_NAME=<your-bucket>
CLOUDFRONT_DOMAIN=<your-cloudfront-domain>

# Payments
MOYASAR_SECRET_KEY=<from-moyasar>
MOYASAR_PUBLISHABLE_KEY=<from-moyasar>
MOYASAR_WEBHOOK_SECRET=<from-moyasar>

# Digital Twin
FIRECRAWL_API_KEY=<from-firecrawl>
WHAPI_API_KEY=<from-whapi>
OPENAI_API_KEY=<from-openai>

# Queue
REDIS_URL=redis://localhost:6379

# Observability
SENTRY_DSN=<from-sentry>
```

### Security Scanning

```powershell
# Check for high/critical vulnerabilities
npm audit --audit-level=high

# Fix automatically if possible
npm audit fix

# For vulnerabilities that can't be auto-fixed, review manually
npm audit
```

### Code Security Patterns

**Check for these anti-patterns:**

- [ ] No `eval()` usage
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] No SQL string concatenation (use Prisma parameterized queries)
- [ ] No hardcoded secrets or API keys
- [ ] All user inputs are validated and sanitized
- [ ] All file uploads are validated (type, size)
- [ ] All API routes have authentication checks
- [ ] All admin routes have authorization checks

---

## 📊 Performance Benchmarks

### API Response Time Targets

| Endpoint Type | Target | Acceptable |
|--------------|--------|-----------|
| Health check | < 50ms | < 100ms |
| Authentication | < 200ms | < 500ms |
| Search queries | < 300ms | < 800ms |
| Media upload (10MB) | < 2s | < 5s |
| Admin operations | < 300ms | < 1s |

### Database Query Optimization

```powershell
# Enable Prisma query logging in .env
DEBUG="prisma:query"

# Run the app and watch for:
# - N+1 query problems
# - Missing indexes
# - Slow queries (> 100ms)

npm run dev
```

**Common optimizations:**
- Use `select` instead of `include` when you don't need all fields
- Use `cursor`-based pagination for large datasets
- Add database indexes on frequently queried fields
- Use Redis caching for frequently accessed data

---

## 🗄️ Database Review

### Schema Validation

```powershell
cd packages/core-db

# Validate schema
npx prisma validate

# Check for uncommitted changes
npx prisma migrate dev --create-only --name check_drift

# If migration is created, you have schema drift!
# Either commit the migration or revert schema changes
```

### Migration History

**Review all migrations in `packages/core-db/prisma/migrations/`:**

- [ ] All migrations are reversible
- [ ] No destructive migrations without data backup plan
- [ ] Migration naming is clear (`YYYYMMDDHHMMSS_descriptive_name`)
- [ ] Each migration has been tested

### Data Integrity

**Check schema for:**

- [ ] Foreign key constraints are in place
- [ ] Unique constraints prevent duplicates (email, nafathNationalId)
- [ ] Nullable fields are intentional
- [ ] Default values are sensible
- [ ] Indexes are on frequently queried fields
- [ ] Cascade delete rules are correct

---

## 📝 Documentation Review

### Code Documentation

- [ ] Complex functions have JSDoc comments
- [ ] Business logic is explained
- [ ] TODOs are tracked in issue tracker or resolved

### API Documentation

- [ ] OpenAPI spec is up to date (`packages/core-contracts/openapi.yaml`)
- [ ] All endpoints are documented
- [ ] Request/response examples are accurate
- [ ] Authentication requirements are specified

### README Files

- [ ] Root README explains project structure
- [ ] Each core package has a README
- [ ] Setup instructions are clear and tested
- [ ] Environment variables are documented

---

## ✅ Pre-Production Checklist

Before deploying to production, ensure:

### Infrastructure
- [ ] Database is provisioned (PostgreSQL)
- [ ] Redis is provisioned (for BullMQ)
- [ ] S3 bucket is created and configured
- [ ] CloudFront distribution is set up
- [ ] Domain and SSL certificates are ready

### External Services
- [ ] Authentica account is set up and API key obtained
- [ ] Algolia account is set up and indexes created
- [ ] Moyasar account is set up and API keys obtained
- [ ] FireCrawl account is set up and API key obtained
- [ ] Whapi.cloud account is set up and API key obtained
- [ ] OpenAI account is set up and API key obtained
- [ ] Sentry project is created

### Configuration
- [ ] All production environment variables are set
- [ ] Database migrations are run on production DB
- [ ] Algolia indexes are created and configured
- [ ] S3 bucket policies are set correctly
- [ ] CORS is configured for CloudFront/S3
- [ ] Webhooks are registered with external services

### Monitoring & Logging
- [ ] Sentry error tracking is active
- [ ] Application logs are configured
- [ ] Database query monitoring is set up
- [ ] API performance monitoring is active
- [ ] Uptime monitoring is configured

### Security
- [ ] All secrets are in secure vault (not committed to git)
- [ ] JWT secret is strong and random
- [ ] Webhook secrets are configured
- [ ] Rate limiting is active
- [ ] HTTPS is enforced
- [ ] Security headers are configured

### Testing
- [ ] All automated tests pass
- [ ] Manual smoke tests pass
- [ ] Load testing is complete
- [ ] Security penetration testing is complete

---

## 🚀 Running the Full Review

### Step-by-Step Process

1. **Start with automated checks:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/full-code-review.ps1
   ```

2. **Fix any errors found, then run again until it passes**

3. **Run API endpoint tests:**
   ```powershell
   npm run dev  # In terminal 1
   powershell -ExecutionPolicy Bypass -File scripts/test-all-apis.ps1  # In terminal 2
   ```

4. **Manual review of Digital Twin system** (see checklist above)

5. **Manual review of Nafath system** (see checklist above)

6. **Review documentation** (code comments, API docs, READMEs)

7. **Performance testing** (use the API with realistic data)

8. **Security review** (check environment variables, audit dependencies)

9. **Final end-to-end smoke test** (register, login, search, upload, etc.)

10. **Sign-off on code review checklist** (`scripts/code-review-checklist.md`)

---

## 📞 Support

If you encounter issues during the review process:

1. Check the console output for specific error messages
2. Review the relevant section in this guide
3. Check the `BACKEND_BUILD_REPORT.md` for implementation details
4. Review the specific package README for troubleshooting

---

## 🎯 Success Criteria

**The backend is ready for production when:**

✅ All automated tests pass (85%+ coverage)  
✅ TypeScript compiles with 0 errors  
✅ ESLint passes with minimal warnings  
✅ No high/critical security vulnerabilities  
✅ All API endpoints respond correctly  
✅ Digital Twin system is fully operational  
✅ Nafath verification system is fully operational  
✅ Database schema is validated and migrations are clean  
✅ Production build succeeds  
✅ Documentation is complete and accurate  
✅ Performance benchmarks are met  
✅ Security checklist is complete  

---

**Remember:** Quality assurance is an ongoing process. Run these checks regularly, especially before major releases!

