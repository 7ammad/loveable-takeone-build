# TakeOne Platform - Deployment Guide

**Last Updated:** October 10, 2025  
**Version:** 1.0

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Migration](#database-migration)
4. [Deployment Steps](#deployment-steps)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Rollback Procedures](#rollback-procedures)
7. [Monitoring & Alerts](#monitoring--alerts)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript errors resolved (`pnpm build` passes)
- [ ] ESLint warnings reviewed
- [ ] Tests passing (`pnpm test`)
- [ ] Code review completed
- [ ] Security audit reviewed

### Environment Variables
- [ ] All required environment variables documented
- [ ] Production secrets generated and stored securely
- [ ] Environment-specific configurations prepared
- [ ] `.env.production` file created (never commit!)

### Database
- [ ] Migration scripts tested in staging
- [ ] Backup procedures verified
- [ ] Rollback plan documented
- [ ] Database indexes optimized

### Third-Party Services
- [ ] API keys valid and not expired
- [ ] Rate limits configured
- [ ] Webhooks configured
- [ ] Payment gateway in production mode

---

## Environment Setup

### 1. Generate Production Secrets

```bash
# JWT Access Secret (32 bytes = 64 hex chars)
openssl rand -hex 32

# JWT Refresh Secret (32 bytes = 64 hex chars)
openssl rand -hex 32

# Payment Encryption Key (32 bytes = 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# CSRF Secret (32 bytes = 64 hex chars)
openssl rand -hex 32
```

### 2. Configure Environment Variables

Create `.env.production` (example):

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://takeone.sa

# Database (with connection pooling)
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20&sslmode=require

# JWT
JWT_ACCESS_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<generated-secret>
JWT_AUDIENCE=takeone-api
JWT_ISSUER=takeone-platform

# Redis (Upstash)
REDIS_URL=rediss://default:password@host:6379
UPSTASH_REDIS_REST_URL=https://instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>

# Payment Encryption
RECEIPT_ENCRYPTION_KEY=<generated-key>

# S3 Storage
S3_BUCKET=takeone-production-media
S3_REGION=me-south-1
S3_ACCESS_KEY=<key>
S3_SECRET_KEY=<secret>
S3_ENDPOINT=https://s3.me-south-1.amazonaws.com

# Algolia Search
ALGOLIA_APP_ID=<app-id>
ALGOLIA_API_KEY=<search-key>
ALGOLIA_WRITE_API_KEY=<write-key>

# AI/LLM
OPENAI_API_KEY=<key>
ANTHROPIC_API_KEY=<key>

# Payment (Moyasar)
MOYASAR_API_KEY=<production-key>
MOYASAR_SECRET_KEY=<production-secret>
MOYASAR_PUBLISHABLE_KEY=<production-publishable>
MOYASAR_WEBHOOK_SECRET=<webhook-secret>

# Monitoring (Sentry)
SENTRY_DSN=<production-dsn>
SENTRY_ORG=takeone
SENTRY_AUTH_TOKEN=<auth-token>
SENTRY_ENVIRONMENT=production

# Feature Flags
DIGITAL_TWIN_ENABLED=true
FEATURE_PAYMENT=true
FEATURE_2FA=true
```

### 3. Store Secrets Securely

**Recommended:** Use a secrets manager

#### AWS Secrets Manager
```bash
aws secretsmanager create-secret \
  --name takeone/production/jwt-access-secret \
  --secret-string "<your-secret>"
```

#### Azure Key Vault
```bash
az keyvault secret set \
  --vault-name takeone-vault \
  --name jwt-access-secret \
  --value "<your-secret>"
```

---

## Database Migration

### 1. Backup Current Database

```bash
# PostgreSQL backup
pg_dump -h hostname -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Or use Supabase backup
# Dashboard > Database > Backups > Create Backup
```

### 2. Test Migrations in Staging

```bash
# Set staging environment
export DATABASE_URL="postgresql://staging-connection-string"

# Run migrations in dry-run mode (check only)
npx prisma migrate deploy --preview-feature

# Apply migrations
npx prisma migrate deploy
```

### 3. Apply Migrations to Production

```bash
# Set production environment
export DATABASE_URL="postgresql://production-connection-string"

# ⚠️ CRITICAL: Backup first!
# pg_dump -h... > backup.sql

# Apply migrations
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status
```

### 4. Verify Data Integrity

```bash
# Run verification queries
psql $DATABASE_URL << EOF
-- Check foreign keys
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE contype = 'f';

-- Check constraints
SELECT conname, conrelid::regclass
FROM pg_constraint
WHERE contype = 'c';
EOF
```

---

## Deployment Steps

### Option 1: Vercel Deployment (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Configure Project
```bash
# Link project
vercel link

# Set environment variables
vercel env add PRODUCTION
# Enter each environment variable
```

#### 4. Deploy
```bash
# Deploy to production
vercel --prod

# Or use GitHub integration (automatic)
git push origin main
```

### Option 2: Docker Deployment

#### 1. Build Docker Image
```bash
# Build
docker build -t takeone-platform:latest .

# Tag for registry
docker tag takeone-platform:latest registry.takeone.sa/takeone-platform:latest

# Push to registry
docker push registry.takeone.sa/takeone-platform:latest
```

#### 2. Deploy with Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    image: registry.takeone.sa/takeone-platform:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

```bash
# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Option 3: Traditional Server Deployment

#### 1. Prepare Server
```bash
# SSH into server
ssh user@server.takeone.sa

# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2
```

#### 2. Deploy Code
```bash
# Clone repository
git clone https://github.com/takeone/platform.git
cd platform

# Install dependencies
pnpm install

# Build
pnpm build

# Start with PM2
pm2 start npm --name "takeone" -- start
pm2 save
pm2 startup
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# Overall health
curl https://takeone.sa/api/health

# Liveness
curl https://takeone.sa/api/health/live

# Readiness
curl https://takeone.sa/api/health/ready
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-10T12:00:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

### 2. Authentication Flow

```bash
# Test registration
curl -X POST https://takeone.sa/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456","name":"Test User","role":"talent"}'

# Test login
curl -X POST https://takeone.sa/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

### 3. RBAC Verification

```bash
# Try accessing admin route without auth (should fail)
curl https://takeone.sa/api/v1/admin/users

# Expected: 401 Unauthorized
```

### 4. Database Connectivity

```bash
# Check if app can connect to database
curl https://takeone.sa/api/v1/casting-calls?limit=1
```

### 5. Security Headers

```bash
# Check security headers
curl -I https://takeone.sa

# Verify headers:
# - Strict-Transport-Security
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - Content-Security-Policy
```

### 6. Performance Checks

```bash
# Check response times
time curl https://takeone.sa/api/health

# Should be < 500ms
```

---

## Rollback Procedures

### Immediate Rollback (Vercel)

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

### Database Rollback

```bash
# Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# Or use Supabase restore
# Dashboard > Database > Backups > Restore
```

### Docker Rollback

```bash
# Pull previous image
docker pull registry.takeone.sa/takeone-platform:previous-tag

# Update docker-compose.yml with previous tag
# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

---

## Monitoring & Alerts

### 1. Set Up Sentry

```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
  tracesSampleRate: 1.0,
});
```

### 2. Configure Health Check Monitoring

Use services like:
- **UptimeRobot:** Monitor `/api/health` endpoint
- **Pingdom:** Monitor response times
- **Better Uptime:** Comprehensive monitoring

### 3. Set Up Alerts

**Critical Alerts:**
- API health check fails
- Database connection errors
- Redis connection errors
- Error rate > 5%
- Response time > 2 seconds

**Warning Alerts:**
- High memory usage (> 80%)
- High CPU usage (> 80%)
- Queue depth > 1000
- Failed login attempts spike

### 4. Log Aggregation

Use centralized logging:
- **Sentry:** Error tracking
- **DataDog:** Application monitoring
- **CloudWatch:** AWS infrastructure logs
- **LogRocket:** Session replay

---

## Security Checklist

Post-deployment security verification:

- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Security headers configured
- [ ] CSRF protection active
- [ ] RBAC working on admin routes
- [ ] Rate limiting functional
- [ ] Session timeout working (15 minutes)
- [ ] 2FA available and functional
- [ ] Account lockout working (10 attempts)
- [ ] Audit logging operational
- [ ] Payment encryption enabled
- [ ] No sensitive data in error messages
- [ ] API versioning enforced
- [ ] File upload restrictions working

---

## Performance Optimization

### 1. Enable Caching

```typescript
// next.config.mjs
export default {
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=60, s-maxage=300',
        },
      ],
    },
  ],
};
```

### 2. Database Connection Pooling

Already configured in `DATABASE_URL`:
```
?connection_limit=10&pool_timeout=20
```

### 3. CDN Configuration

Use Vercel Edge Network or configure your CDN:
- Cache static assets (images, CSS, JS)
- Enable compression (gzip/brotli)
- Set appropriate cache headers

---

## Troubleshooting

### Issue: Build Fails

```bash
# Clear cache
rm -rf .next node_modules
pnpm install
pnpm build
```

### Issue: Database Connection Fails

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check connection pool
# Increase connection_limit if needed
```

### Issue: Redis Connection Fails

```bash
# Test Redis
redis-cli -u $REDIS_URL ping

# Check Upstash dashboard for issues
```

### Issue: High Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart if needed
pm2 restart takeone
```

---

## Maintenance Schedule

### Daily
- Check error logs in Sentry
- Review failed login attempts
- Monitor response times

### Weekly
- Review audit logs
- Check queue depths
- Verify backups
- Review security alerts

### Monthly
- Update dependencies
- Review and rotate secrets
- Performance audit
- Security audit

### Quarterly
- Major dependency updates
- Infrastructure review
- Disaster recovery drill
- Comprehensive security audit

---

## Support & Escalation

### Issue Severity Levels

**P0 - Critical (Immediate Response)**
- Site down
- Data breach
- Payment system failure

**P1 - High (< 1 hour)**
- Performance degradation
- Feature completely broken
- Security vulnerability

**P2 - Medium (< 4 hours)**
- Feature partially broken
- Non-critical bug
- Integration issue

**P3 - Low (< 24 hours)**
- Minor bug
- Enhancement request
- Documentation issue

### Contact

- **On-Call Engineer:** +966-XXX-XXXX
- **DevOps Team:** devops@takeone.sa
- **Security Team:** security@takeone.sa
- **Slack:** #takeone-production

---

## Conclusion

This deployment guide ensures a smooth, secure, and reliable deployment of the TakeOne platform. Always follow the checklist, test in staging first, and have rollback procedures ready.

**Remember:**
1. Backup before deploying
2. Test migrations in staging
3. Monitor after deployment
4. Have rollback plan ready
5. Document any issues

---

**Last Updated:** October 10, 2025  
**Next Review:** January 10, 2026

