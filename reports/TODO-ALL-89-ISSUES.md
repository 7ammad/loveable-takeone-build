# TODO: Complete Fix List - All 89 Issues
**Project:** TakeOne Casting Marketplace  
**Date:** October 10, 2025  
**Total Issues:** 89  
**Total Effort:** 480-580 hours (6-8 weeks)

---

## 🔴 CRITICAL ISSUES (18) - Weeks 1-2 - 160-200 hours

### Week 1: Security & Configuration (80 hours)

- [ ] **CRIT-01: Implement RBAC Enforcement** (12-16h)
  - Create `lib/auth-helpers.ts` with `requireRole()` function
  - Update 20+ admin routes to check roles
  - Add audit logging for unauthorized attempts
  - Write RBAC tests

- [ ] **CRIT-02: Switch to httpOnly Cookies** (10-12h)
  - Update login route to set httpOnly cookies
  - Update register route to set httpOnly cookies
  - Update logout route to delete cookies
  - Update refresh token route to use cookies
  - Update frontend to remove localStorage usage
  - Write cookie authentication tests

- [ ] **CRIT-03: Add Resource-Level Authorization** (14-18h)
  - Add ownership checks to profile endpoints
  - Add ownership checks to casting call endpoints
  - Add ownership checks to application endpoints
  - Add ownership checks to booking endpoints
  - Add ownership checks to message endpoints
  - Write resource ownership tests

- [ ] **CRIT-04: Implement Content Security Policy** (3-4h)
  - Add CSP headers to `next.config.mjs`
  - Test for CSP violations
  - Fix any violations found
  - Write CSP tests

- [ ] **CRIT-11: Create .env.example File** (2-3h)
  - Document all 40+ environment variables
  - Add descriptions and examples
  - Include setup instructions
  - Organize by category

- [ ] **CRIT-12: Fix Security Headers** (1-2h)
  - Ensure consistent security headers across all routes
  - Verify HSTS, X-Frame-Options, etc.
  - Test headers are applied

### Week 2: Data Integrity & Payments (80 hours)

- [ ] **CRIT-05: Add Missing Foreign Key Constraints** (8-10h)
  - Add TalentProfile.guardianUserId → User relation
  - Add MediaAsset.userId → User relation
  - Add Receipt.userId → User relation
  - Add AuditEvent.actorUserId → User relation
  - Add Conversation participant relations
  - Add Message sender/receiver relations
  - Add Notification.userId → User relation
  - Add ProcessedMessage.sourceId → IngestionSource relation
  - Generate migration
  - Check for orphaned data
  - Clean up orphaned data
  - Apply migration to staging/production

- [ ] **CRIT-06: Add Database Check Constraints** (6-8h)
  - Convert status fields to PostgreSQL ENUMs
  - Add rating range checks (1-5)
  - Add height/weight bounds
  - Add date logic checks (endDate > startDate)
  - Add duration positivity checks
  - Generate migration
  - Test constraints

- [ ] **CRIT-07: Set Database Connection Pool Limits** (30min)
  - Add `?connection_limit=10&pool_timeout=20` to DATABASE_URL
  - Test connection pool behavior
  - Monitor connection usage

- [ ] **CRIT-08: Create Moyasar Webhook Handler** (5-7h)
  - Create `app/api/v1/webhooks/moyasar/route.ts`
  - Implement HMAC signature verification
  - Handle `payment.paid` event
  - Handle `payment.failed` event
  - Handle `payment.refunded` event
  - Call BillingService methods
  - Write webhook tests
  - Test with Moyasar sandbox

- [ ] **CRIT-13: Implement Graceful Shutdown** (2-3h)
  - Add SIGTERM handler to stop workers cleanly
  - Add SIGINT handler
  - Ensure jobs complete before shutdown
  - Close database connections
  - Close Redis connections

- [ ] **CRIT-14: Add Metrics & Monitoring** (10-12h)
  - Set up Prometheus metrics endpoints
  - Add job processing time metrics
  - Add queue depth metrics
  - Add LLM success rate metrics
  - Add API response time metrics
  - Create Grafana dashboards
  - Set up basic alerts

- [ ] **CRIT-15: Implement Circuit Breaker** (5-7h)
  - Create CircuitBreaker class
  - Add to LLM client
  - Add to Whapi client
  - Add to Moyasar client
  - Configure thresholds and timeouts
  - Test circuit breaker behavior

- [ ] **CRIT-16: Implement Comprehensive Audit Logging** (8-10h)
  - Add audit logging to all auth endpoints
  - Add audit logging to admin actions
  - Add audit logging to payment operations
  - Add retry mechanism for failed audit logs
  - Create audit log dashboard

- [ ] **CRIT-17: Add CSRF Protection** (4-6h)
  - Create `middleware.ts` with CSRF checks
  - Generate CSRF tokens
  - Validate tokens on mutations
  - Add CSRF token to forms
  - Write CSRF tests

- [ ] **CRIT-18: Integrate Compliance Package** (6-8h)
  - Add consent tracking to user registration
  - Implement data retention policies
  - Add PDPL compliance fields to User model
  - Create data export functionality
  - Document compliance procedures

### Post-Launch Critical (Can be done after Weeks 1-2)

- [ ] **CRIT-09: Build Booking Payment System** (25-35h)
  - Create BookingPayment database model
  - Create payment creation API
  - Create payment status API
  - Implement 5% platform commission
  - Create payment release flow
  - Write payment tests

- [ ] **CRIT-10: Implement Escrow System** (20-25h)
  - Create Payout database model
  - Create escrow hold functionality
  - Create payment release after completion
  - Create payout request API
  - Create payout processing
  - Write escrow tests

---

## ⚠️ HIGH PRIORITY ISSUES (31) - Weeks 3-4 - 160-180 hours

### Security Improvements (8 issues - 16-22 hours)

- [ ] **HIGH-01: Enable Access Token Revocation** (2-3h)
  - Add access token JTI to revocation checks
  - Add Redis caching for revocation list
  - Test immediate token revocation

- [ ] **HIGH-02: Implement Account Lockout** (2-3h)
  - Track failed login attempts by IP and user
  - Lock account after 10 failed attempts
  - Create admin unlock endpoint
  - Send lockout notification email

- [ ] **HIGH-03: Strengthen Password Policy** (1-2h)
  - Add complexity requirements (uppercase, lowercase, number, special char)
  - Add password strength validation
  - Add password strength meter to UI
  - Update validation error messages

- [ ] **HIGH-04: Encrypt Payment Receipt Data** (3-4h)
  - Encrypt Receipt.raw JSON field
  - Sanitize sensitive data before storing
  - Update receipt queries to decrypt

- [ ] **HIGH-05: Implement VAT Calculation** (3-4h)
  - Add VAT fields to Receipt model (amountBeforeVAT, vatAmount, vatRate)
  - Calculate 15% VAT on all payments
  - Update payment intent creation
  - Update receipts to show VAT breakdown

- [ ] **HIGH-06: Add Payment Idempotency** (2-3h)
  - Add idempotency key generation
  - Send idempotency keys to Moyasar
  - Store idempotency keys in database
  - Prevent duplicate payments on retry

- [ ] **HIGH-07: Add Webhook Replay Protection** (2-3h)
  - Add timestamp validation to webhooks
  - Store processed webhook IDs
  - Reject old or duplicate webhooks

- [ ] **HIGH-08: Fix Audit Logging Silent Failures** (2h)
  - Add retry mechanism to audit logging
  - Alert on audit log failures
  - Use outbox pattern for audit events

### Data Integrity Improvements (9 issues - 26-33 hours)

- [ ] **HIGH-09: Add Missing Composite Indexes** (2-3h)
  - Add index on CastingCall (status, location)
  - Add index on CastingCall (status, createdAt)
  - Add index on Application (talentUserId, status)
  - Add index on Application (castingCallId, status)
  - Add index on AuditionBooking (status, scheduledAt)
  - Add index on AuditionBooking (talentUserId, status)
  - Add index on AuditionBooking (casterUserId, status)
  - Add index on ProcessedMessage (sourceId, processedAt)
  - Add index on User (phone)
  - Add index on User (role, isActive)

- [ ] **HIGH-10: Implement Soft Delete Pattern** (6-8h)
  - Add deletedAt field to User model
  - Add deletedAt field to CastingCall model
  - Add deletedAt field to Application model
  - Add deletedAt field to Message model
  - Add deletedAt field to CasterProfile model
  - Add deletedAt field to TalentProfile model
  - Update all queries to filter deletedAt IS NULL
  - Create restore functionality

- [ ] **HIGH-11: Add Transaction to User Registration** (1-2h)
  - Wrap user creation and profile creation in transaction
  - Ensure atomic operation
  - Test rollback on error

- [ ] **HIGH-12: Complete Cascade Delete Strategy** (3-4h)
  - Add onDelete to Application.castingCall relation
  - Review all relations for correct cascade behavior
  - Document cascade strategy
  - Test cascade behavior

- [ ] **HIGH-13: Fix Duplicate Migration Names** (1h)
  - Review migration files
  - Rename duplicate migrations
  - Ensure migration history is correct

- [ ] **HIGH-14: Add Data Retention Fields** (3-4h)
  - Add consentGivenAt to User model
  - Add consentWithdrawnAt to User model
  - Add dataRetentionUntil to User model
  - Create data retention policy enforcement

- [ ] **HIGH-15: Add Transactions to Billing Service** (2-3h)
  - Wrap subscription status updates in transactions
  - Wrap payment processing in transactions
  - Ensure atomic operations

- [ ] **HIGH-16: Apply Learned Patterns in Pre-filter** (3-4h)
  - Query high-confidence patterns from database
  - Add to pre-filter keyword list
  - Cache patterns in memory
  - Update cache periodically

- [ ] **HIGH-17: Add Rate Limit Handling (429 errors)** (2-3h)
  - Handle 429 responses from Whapi
  - Handle 429 responses from LLM providers
  - Implement exponential backoff
  - Respect Retry-After headers

### System Reliability Improvements (14 issues - 58-70 hours)

- [ ] **HIGH-18: Add Health Check Endpoints** (2-3h)
  - Create `/api/health` endpoint
  - Create `/api/health/digital-twin` endpoint
  - Create `/api/health/database` endpoint
  - Create `/api/health/redis` endpoint
  - Create `/api/health/workers` endpoint

- [ ] **HIGH-19: Add LLM Retry Logic** (2-3h)
  - Implement exponential backoff for LLM calls
  - Retry on transient errors (3 attempts)
  - Log retry attempts
  - Fall back to secondary provider if available

- [ ] **HIGH-20: Implement LLM Response Caching** (2-3h)
  - Cache LLM responses by content hash
  - Set 24-hour TTL
  - Check cache before calling LLM
  - Monitor cache hit rate

- [ ] **HIGH-21: Add DLQ Replay Mechanism** (2-3h)
  - Create admin endpoint to list DLQ jobs
  - Create admin endpoint to replay DLQ job
  - Create bulk replay functionality
  - Log replay attempts

- [ ] **HIGH-22: Add Exponential Backoff to BullMQ** (2-3h)
  - Configure exponential backoff strategy
  - Set maximum retry attempts
  - Set maximum backoff time
  - Test retry behavior

- [ ] **HIGH-23: Add Job Timeout Configuration** (2-3h)
  - Set 30-second timeout for LLM jobs
  - Set appropriate timeouts for other job types
  - Handle timeout errors gracefully
  - Monitor timeout occurrences

- [ ] **HIGH-24: Add Error Recovery Tools** (4-6h)
  - Create admin dashboard for failed jobs
  - Create job retry UI
  - Create job inspection UI
  - Create bulk operations

- [ ] **HIGH-25: Add Redis Connection Monitoring** (3-4h)
  - Monitor Redis connection status
  - Monitor Redis memory usage
  - Monitor Redis command latency
  - Set up alerts for Redis issues

- [ ] **HIGH-26: Document Redis Client Patterns** (1-2h)
  - Document why 3 different Redis implementations exist
  - Document when to use each pattern
  - Update architecture documentation

- [ ] **HIGH-27: Create Queue Metrics Dashboard** (8-10h)
  - Track job success/failure rates
  - Track job processing times (P50, P95, P99)
  - Track queue depths
  - Track worker utilization
  - Create Grafana dashboards
  - Set up alerts

- [ ] **HIGH-28: Handle 429 Rate Limits from WhatsApp** (2-3h)
  - Parse Retry-After header
  - Implement exponential backoff
  - Log rate limit events
  - Alert on frequent rate limiting

- [ ] **HIGH-29: Enable Initial Digital Twin Crawl** (30min)
  - Change initial crawl delay from 4 hours to 1 minute
  - Test immediate first run
  - Monitor first run performance

- [ ] **HIGH-30: Add Performance Metrics** (6-8h)
  - Track API response times
  - Track database query times
  - Track LLM call times
  - Track queue processing times
  - Create performance dashboard

- [ ] **HIGH-31: Set Up Alert Rules** (4-6h)
  - Alert on DLQ depth > 100
  - Alert on LLM failure rate > 20%
  - Alert on API error rate > 5%
  - Alert on queue processing stopped
  - Alert on database connection issues
  - Alert on Redis connection issues
  - Configure Sentry alerts

---

## 📝 MEDIUM PRIORITY ISSUES (25) - Weeks 5-6 - 100-120 hours

### User Experience Enhancements (9 issues)

- [ ] **MED-01: Build Session Management UI** (6-8h)
  - List active sessions
  - Show device/location info
  - Allow revoking individual sessions
  - Allow revoking all sessions

- [ ] **MED-02: Implement Password History** (3-4h)
  - Store last 5 password hashes
  - Prevent password reuse
  - Add migration for password history

- [ ] **MED-03: Add Password Breach Detection** (4-5h)
  - Integrate haveibeenpwned API
  - Check passwords on registration
  - Check passwords on password change
  - Warn users of compromised passwords

- [ ] **MED-04: Implement Multi-Factor Authentication** (8-10h)
  - Add TOTP support
  - Add SMS code support
  - Add backup codes
  - Create MFA setup UI
  - Create MFA verification flow

- [ ] **MED-05: Add Phone/URL Format Validation** (2-3h)
  - Add phone number format validation (E.164)
  - Add URL format validation
  - Add database check constraints
  - Update API validation

- [ ] **MED-06: Implement Cursor Pagination** (4-5h)
  - Replace offset pagination with cursor pagination
  - Update application list endpoints
  - Update casting call list endpoints
  - Update search endpoints
  - Add pagination helpers

- [ ] **MED-07: Add Payment Amount Validation** (2-3h)
  - Validate minimum amount (1 SAR = 100 halalas)
  - Validate maximum amount (1M SAR)
  - Validate positive amounts
  - Validate currency is SAR

- [ ] **MED-08: Build Refund System** (6-8h)
  - Create refund database model
  - Create refund request API
  - Create refund processing API
  - Integrate with Moyasar refunds API
  - Handle partial refunds
  - Create refund UI

- [ ] **MED-09: Build Payout System** (6-8h)
  - Create payout request API
  - Create payout approval workflow
  - Create payout processing
  - Integrate with Saudi payment gateway
  - Track payout status
  - Create payout history UI

### Technical Improvements (8 issues)

- [ ] **MED-10: Optimize Frontend Bundle** (6-8h)
  - Audit client component usage
  - Convert to server components where possible
  - Implement code splitting
  - Lazy load heavy components
  - Analyze bundle size
  - Optimize imports

- [ ] **MED-11: Add RTL Testing** (4-6h)
  - Test all pages in Arabic
  - Fix RTL layout issues
  - Test form inputs in RTL
  - Test date/time formatting
  - Test number formatting

- [ ] **MED-12: Clean Up Scripts Directory** (2-3h)
  - Move scripts to tools/ directory
  - Remove obsolete scripts
  - Document remaining scripts
  - Create README for tools

- [ ] **MED-13: Increase Notification Service Usage** (4-5h)
  - Send email on account creation
  - Send email on password reset
  - Send email on application status change
  - Send SMS for important notifications
  - Create notification preferences

- [ ] **MED-14: Complete Self-Learning System** (3-4h)
  - Integrate learned patterns into pre-filter
  - Add confidence threshold configuration
  - Create pattern review UI
  - Monitor pattern effectiveness

- [ ] **MED-15: Add Missing Moyasar Client Methods** (3-4h)
  - Add `fetchPayment()` method
  - Add `cancelPayment()` method
  - Add `refundPayment()` method
  - Add `listPayments()` method
  - Add method documentation

- [ ] **MED-16: Add Payment Retry Logic** (2-3h)
  - Retry failed payments automatically
  - Exponential backoff for retries
  - Maximum 3 retry attempts
  - Log retry attempts

- [ ] **MED-17: Add Timeout Handling** (2-3h)
  - Set 30-second timeout for Moyasar calls
  - Set 30-second timeout for LLM calls
  - Set 15-second timeout for Whapi calls
  - Handle timeout errors gracefully

### Code Quality Improvements (8 issues)

- [ ] **MED-18: Improve Error Handling** (4-5h)
  - Create custom error classes
  - Standardize error responses
  - Add error codes
  - Improve error messages

- [ ] **MED-19: Improve Input Validation** (3-4h)
  - Use Zod schemas consistently
  - Add validation to all API endpoints
  - Return detailed validation errors
  - Add validation helpers

- [ ] **MED-20: Add Missing Moyasar Methods** (2-3h)
  - Duplicate of MED-15 - consolidate

- [ ] **MED-21: Add Plan Duration Field** (2-3h)
  - Add duration field to Plan model
  - Remove hardcoded duration logic
  - Update subscription extension logic
  - Generate migration

- [ ] **MED-22: Add Environment Variable Validation** (3-4h)
  - Create env validation schema (Zod)
  - Validate all required env vars on startup
  - Fail fast with clear errors
  - Document all env vars

- [ ] **MED-23: Integrate Secrets Manager** (4-5h)
  - Set up AWS Secrets Manager / Azure Key Vault
  - Move sensitive env vars to secrets manager
  - Update deployment process
  - Document secrets management

- [ ] **MED-24: Create Per-Environment Configs** (3-4h)
  - Create development config
  - Create staging config
  - Create production config
  - Externalize configuration

- [ ] **MED-25: Add Config Validation Tests** (2-3h)
  - Test all config values are valid
  - Test required configs are present
  - Test config types are correct
  - Run tests in CI/CD

---

## 📘 LOW PRIORITY ISSUES (15) - Backlog - 60-80 hours

- [ ] **LOW-01: Comprehensive Accessibility Audit** (8-10h)
  - Test with screen readers
  - Test keyboard navigation
  - Fix ARIA attributes
  - Fix color contrast issues
  - Add alt text to images
  - Test with accessibility tools

- [ ] **LOW-02: Performance Testing** (6-8h)
  - Set up Artillery or k6
  - Create load test scenarios
  - Test API endpoints under load
  - Test database performance
  - Identify bottlenecks
  - Document performance baselines

- [ ] **LOW-03: Component Library Documentation** (6-8h)
  - Set up Storybook (already configured)
  - Document all UI components
  - Add component examples
  - Add usage guidelines
  - Generate component docs

- [ ] **LOW-04: API Documentation** (4-6h)
  - Complete OpenAPI specs
  - Generate API docs
  - Add API examples
  - Create Postman collection
  - Publish API docs

- [ ] **LOW-05: E2E Test Suite** (10-12h)
  - Set up Playwright tests
  - Test complete user journeys
  - Test payment flows
  - Test application flows
  - Run E2E in CI/CD

- [ ] **LOW-06: Mobile Responsiveness Audit** (4-5h)
  - Test all pages on mobile
  - Fix mobile layout issues
  - Test forms on mobile
  - Test navigation on mobile
  - Test touch interactions

- [ ] **LOW-07: SEO Optimization** (4-5h)
  - Add meta tags
  - Add Open Graph tags
  - Add structured data
  - Create sitemap.xml
  - Create robots.txt
  - Optimize page titles

- [ ] **LOW-08: Analytics Integration** (3-4h)
  - Set up Google Analytics / Plausible
  - Add event tracking
  - Track conversions
  - Set up funnels
  - Create analytics dashboard

- [ ] **LOW-09: Email Template Improvements** (4-5h)
  - Design better email templates
  - Add branding to emails
  - Make emails responsive
  - Test emails in different clients
  - Add Arabic email support

- [ ] **LOW-10: Notification Preferences** (4-5h)
  - Create preferences UI
  - Allow users to opt out of notifications
  - Add notification frequency settings
  - Add notification channel preferences

- [ ] **LOW-11: Search Improvements** (6-8h)
  - Improve search relevance
  - Add search filters
  - Add search suggestions
  - Add search analytics
  - Optimize search performance

- [ ] **LOW-12: Admin Dashboard Improvements** (5-6h)
  - Add more metrics
  - Add charts and graphs
  - Add quick actions
  - Improve UX
  - Add export functionality

- [ ] **LOW-13: Backup & Recovery Procedures** (3-4h)
  - Document backup procedures
  - Set up automated backups
  - Test restore procedures
  - Create disaster recovery plan
  - Document RTO/RPO

- [ ] **LOW-14: Code Coverage Improvements** (6-8h)
  - Increase test coverage to 80%
  - Add missing test cases
  - Add edge case tests
  - Add integration tests
  - Add load tests

- [ ] **LOW-15: Developer Documentation** (4-6h)
  - Write setup guide
  - Write contribution guide
  - Document architecture
  - Document data models
  - Create diagrams

---

## Summary

### By Priority:
- 🔴 **Critical:** 18 issues → 160-200 hours
- ⚠️ **High:** 31 issues → 160-180 hours
- 📝 **Medium:** 25 issues → 100-120 hours
- 📘 **Low:** 15 issues → 60-80 hours

### By Week:
- **Week 1:** 9 critical issues (security & config)
- **Week 2:** 9 critical issues (data & payments) → **LAUNCH READY** ✅
- **Week 3-4:** 31 high priority issues
- **Week 5-6:** 25 medium priority issues
- **Backlog:** 15 low priority issues

### Total Effort:
- **Minimum (Weeks 1-2):** 160-200 hours → Production launch
- **Recommended (Weeks 1-4):** 320-380 hours → Solid platform
- **Complete (All issues):** 480-580 hours → Excellent platform

---

**Status:** ✅ READY FOR EXECUTION  
**Next Step:** Assign issues to team members and begin Week 1  
**Tracking:** Use this as checklist, check off items as completed

