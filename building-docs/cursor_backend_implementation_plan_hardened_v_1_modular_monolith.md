# Cursor Backend Implementation Plan — Hardened v1 (Modular Monolith)

**Objective:** Implement a hardened, KSA‑ready backend for the casting platform using a **modular monolith** in **TypeScript/Next.js** with a clear path to background jobs, PDPL compliance, secure media delivery, Arabic‑capable search, and production SLOs. This plan is optimized for **Cursor** execution: stepwise tasks, file scaffolds, CLI blocks, and CI gates.

---

## 0) Scope & Principles
- Ship a secure, auditable **/v1** API with frozen OpenAPI contracts and CI contract tests.
- Use a **modular monolith** now. Clean boundaries enable future extraction.
- Choose **BullMQ + Redis** for jobs initially. Keep an **adapter port** for SQS later.
- Enforce **idempotency**, **outbox pattern**, and **pagination** on all lists.
- PDPL‑aware data model: purpose binding, soft delete, RoPA, DPIA.
- Prefer **Algolia** first for speed; keep search via a provider interface to swap to **OpenSearch** w/ Arabic analyzers.
- Prefer **Moyasar** for Mada support; Stripe optional if regionally viable.

---

## 1) Tech Stack
- Runtime: **Node 20 LTS**, **TypeScript strict**
- Framework: **Next.js 14** (App Router) for API route handlers + Admin UI
- ORM: **Prisma** against **PostgreSQL 15**
- Caching/Queue: **Redis 7** (BullMQ)
- Search: **Algolia** (port for OpenSearch)
- Media: **S3‑compatible** storage (R2/S3/MinIO), **signed HLS**, **pHash** logging
- Auth: **JWT access + rotating refresh** with **jti**; OAuth w/ **PKCE**; **Nafath** verifier
- Email/SMS: **Postmark** / **AWS SES** and **SMS aggregator** (TBD)
- Payments: **Moyasar** (Cards + Mada)
- Observability: **OpenTelemetry** → OTLP, **Sentry** for errors, **Prometheus/Grafana** optional
- CI/CD: **GitHub Actions**; IaC optional later
- Security: **CSP**, **HSTS**, **WAF** in front of API & media origins

---

## 2) Repo Layout (Modular Monolith)
```
/apps
  /web                 # Next.js app (routes, UI, /api/v1)
  /worker              # BullMQ consumers + cron
/packages
  /core-db             # Prisma schema, migrations, repositories
  /core-lib            # shared types, errors, result helpers, tracing
  /core-auth           # JWT, OAuth PKCE, CSRF, Nafath verifier
  /core-payments       # Moyasar client + webhooks, idempotency
  /core-search         # Search port + Algolia/OpenSearch adapters
  /core-media          # upload, transcode callbacks, signed HLS, pHash
  /core-compliance     # PDPL helpers, RoPA/DPIA, purpose registry
  /core-notify         # templates (AR/EN), email/SMS queue producers
  /core-queue          # BullMQ setup, outbox publisher, DLQ
  /core-contracts      # OpenAPI specs, zod schemas, Pact/Dredd tests
  /core-security       # rate limits, WAF helpers, mTLS/HMAC webhook verify
  /core-admin          # admin use‑cases, audit export, compliance pack

/scripts               # seed, backup/restore, smoke tests
/.github/workflows     # CI pipelines
```

---

## 3) Database & Migrations (Prisma)
### Core Entities
- Users, TalentProfile, Guardian link (DB‑enforced), CastingCall, Role
- Application (+ `application_status_events`)
- ComplianceItem (+ `compliance_item_events`)
- Subscription, Plan (+ `subscription_status_events`)
- SavedSearch, ShareLink, MessageThread/Message, Attachment
- MediaAsset (visibility, pHash, ttl_policy)
- AuditEvent (purpose, actor_role, ip, ua, before_after_hash)
- Outbox (type, payload, attempts, last_error)

### Constraints & Checks (PDPL and minors)
- `users.email UNIQUE`
- `saved_search (user_id, name) UNIQUE`
- `share_link.token UNIQUE`
- Guardians: `talent_profiles.guardian_user_id NOT NULL` when `is_minor = true`
- CHECK: `is_minor = (guardian_user_id IS NOT NULL)`
- Soft delete: `deleted_at TIMESTAMP NULL` for PDPL erasure flows

### Example Prisma Snippets
```prisma
model TalentProfile {
  id           String  @id @default(cuid())
  userId       String  @unique
  isMinor      Boolean @default(false)
  guardianUserId String?  // enforced by CHECK at DB level via migration
  // ...
}

model ApplicationStatusEvent {
  id             String   @id @default(cuid())
  applicationId  String
  fromStatus     String?
  toStatus       String
  at             DateTime @default(now())
  actorUserId    String?
}

model Outbox {
  id         BigInt   @id @default(autoincrement())
  eventType  String
  payload    Json
  createdAt  DateTime @default(now())
  attempts   Int      @default(0)
  lastError  String?
  nextRunAt  DateTime @default(now())
  status     String   @default("pending") // pending|processing|dead
}
```

---

## 4) API Versioning & Contracts
- Prefix all endpoints with **/api/v1**. Freeze spec at tag `v1.0.0`.
- Author canonical OpenAPI in **/packages/core-contracts/openapi.yaml**.
- Generate types with **openapi-typescript** and validators with **zod**.
- Run **contract tests** in CI with **Dredd** or **Prism** against route handlers.

---

## 5) Auth, Sessions, Verification
- **Access JWT** (short TTL) + **rotating refresh** with `jti` + revocation store.
- OAuth placeholders include **CSRF state** and **PKCE**.
- **Nafath**:
  - Strict redirect allowlist, signed state param, nonce.
  - Store **evidence hash** only. No raw ID retention.
  - Webhook signature verification + **replay protection** (nonce cache).

---

## 6) Policy Enforcement Middleware
- **Subscription gate**: hirer search/post/contact.
- **Nafath gate**: `POST /applications`.
- **Guardian gate**: all minor actions; block direct messages to minors.
- **Rate limits**: per seat search, per org writes, per IP uploads.
- **Idempotency**: on all resource‑creating POSTs (`Idempotency-Key`).

---

## 7) Background Jobs, Outbox, DLQ
- **BullMQ** with named queues: `email`, `sms`, `indexer`, `media`, `billing`, `alerts`.
- **Outbox pattern**: write within DB txn → worker publishes → mark delivered.
- **Dead‑letter**: `queue:dlq` with exponential backoff and alerting.

```ts
// packages/core-queue/src/queues.ts
export const queues = {
  indexer: new Queue("indexer", { connection }),
  // ...
}
```

---

## 8) Media Pipeline
- Uploads to S3‑compatible bucket; MIME sniffing at upload; virus scan hook.
- **Tamper‑evident watermark** on self‑tapes: `role_id|application_id|ts`.
- Compute and store **pHash** for leak tracing.
- Serve via **signed HLS** with short‑lived tokens; no direct object URLs.
- **TTL policy per asset type**; default archive self‑tapes at **180 days** unless linked to active role.
- **Re‑submission flow** for rejected tapes with capped retries.

---

## 9) Search Service
- **Provider interface** with two adapters:
  - **Algolia** to ship fast (verify Arabic tokenization)
  - **OpenSearch** (self‑hosted) with Arabic analyzers (future)
- Indexer consumes **outbox**; keep **replay** and **DLQ**.
- Return **explainability payload**; log cohort exposure for fairness audits.

---

## 10) Applications Workflow Endpoints
- `POST /applications` (idempotent)
- `POST /applications/{id}/events/viewed`
- `POST /applications/{id}/self-tape/request`
- `POST /applications/{id}/self-tape/submit`
- Notifications: inbox + email + optional SMS via job queue; **one template system**, AR/EN.

---

## 11) Subscriptions & Billing
- **Moyasar** for Mada. Stripe optional if confirmed regionally.
- Webhooks: secret rotation; idempotent invoice handling.
- **Grace period** on `PAST_DUE`; auto downgrade rules.
- Store **tax invoice refs**; expose receipt downloads.

---

## 12) Admin & Compliance
- **DPIA checklist** in repo; **RoPA.json** structure stored per purpose.
- **Compliance pack export** redacts minors’ PII unless guardian consent scope allows sharing.
- **AuditEvent** captures `purpose`, `actor_role`, `ip`, `ua`, `before_after_hash`.

### RoPA JSON Sketch
```json
{
  "processingActivities": [
    {"name": "Applications", "purposes": ["recruitment"], "legalBasis": "consent", "retentionDays": 365}
  ]
}
```

---

## 13) Observability, SLOs, Alerts
- Metrics: auth success/fail, search p50/p95, upload success, transcode queue lag, moderation SLA, time‑to‑first‑qualified‑application, invite→apply rate.
- Tracing: add **trace‑id** to logs and response headers; **OpenTelemetry** spans in routes and workers.
- Alerts: Nafath failure spikes, payment webhook failures, indexer backlog, share‑link abuse spikes.
- **SLOs**: API p95 ≤ 300 ms (cached) / 800 ms (uncached); Job success ≥ 99%; Error budget burn alerts.

---

## 14) Security Controls
- **CSP**, **HSTS**, **JWT audience/issuer** checks, **JWE** for sensitive claims if needed.
- Secrets in **KMS/Parameter Store**; never in committed env files.
- **WAF** before API and media origins. **mTLS or HMAC** for webhooks.
- Upload validation and **MIME sniffing**.

---

## 15) Testing & Quality Gates
- **Unit**: Vitest/Jest. **E2E**: Playwright for routes.
- **Contract tests**: Dredd/Prism against OpenAPI.
- **Property tests**: fast‑check for filters/ranking invariants.
- **Security tests**: authZ matrix, IDOR attempts, upload bypasses.
- **Load tests**: k6 for search and uploads; go/no‑go thresholds defined.
- **Pre‑commit**: eslint, prettier, type‑check, test subset via Husky + lint‑staged.

---

## 16) CI/CD (GitHub Actions)
- Jobs: `lint`, `typecheck`, `test`, `contracts`, `migrate:dev`, `build`.
- Block merge unless all pass. Require **OpenAPI diff = 0** unless version bumped.

```yaml
name: ci
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint && pnpm typecheck && pnpm test -- --ci
      - run: pnpm contracts:test   # Dredd/Prism
      - run: pnpm build
```

---

## 17) Environment Variables (inventory)
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_AUD`, `JWT_ISS`
- `OAUTH_*` (per provider) with `PKCE=true`
- `NAFATH_WEBHOOK_SECRET`, `NAFATH_ALLOWED_REDIRECTS`
- `ALGOLIA_APP_ID`, `ALGOLIA_API_KEY`
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`
- `HLS_SIGNING_KEY`
- `MOYASAR_API_KEY`, `MOYASAR_WEBHOOK_SECRET`
- `EMAIL_PROVIDER_KEY`, `SMS_PROVIDER_KEY`
- `OTEL_EXPORTER_OTLP_ENDPOINT`, `SENTRY_DSN`

---

## 18) Delivery & Sequencing (Weeks 0–8)
**W0–1 Foundations**
- Migrations, seed, modular structure, auth, refresh tokens, audit log, rate limits, idempotency.
- CI with lint/tests/OpenAPI contract checks.

**W2–3 Media + Compliance**
- `/media/uploads`, ingest worker, moderation queue, watermarking, compliance export.
- PDPL purposes + consent capture.

**W3–4 Search**
- Indexer jobs, search APIs with explainability payload, saved searches CRUD.
- Bias audit logs + cohort exposure rotation.

**W4–5 Applications**
- Apply, status transitions, viewed marker, self‑tape request/submit, notifications.

**W5–6 Billing**
- Plans, subscription gate middleware, provider webhooks, grace/lock flows.

**W6–7 Alerts & Ops**
- Saved‑search digests, dashboards, admin queues.

**W7–8 Hardening**
- DPIA final, chaos drills, backup/restore test, incident runbook.

**Exit Criteria**
- RPO ≤ 24h, RTO ≤ 4h validated; API p95 thresholds met; DPA/ToS drafted.

---

## 19) Local Dev Setup (Dockerless + Docker Optional)
**Dockerless (Windows OK)**
```powershell
# Postgres & Redis via installers or WSL services
choco install postgresql redis
# env
copy .env.example .env.local
# prisma
pnpm prisma migrate dev
pnpm dev
```

**Docker Compose (Optional)**
```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres
    ports: ["5432:5432"]
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

---

## 20) NPM Scripts (pnpm)
```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc -p . --noEmit",
    "lint": "eslint .",
    "test": "vitest",
    "contracts:test": "dredd ./packages/core-contracts/openapi.yaml http://localhost:3000/api/v1",
    "migrate:dev": "prisma migrate dev",
    "seed": "tsx scripts/seed.ts",
    "worker": "tsx apps/worker/src/index.ts"
  }
}
```

---

## 21) Security & Privacy Checklists
**Security**
- [ ] CSP/HSTS headers present
- [ ] JWT aud/iss validated; refresh rotation enforced
- [ ] Webhook HMAC/mTLS checks
- [ ] Rate limits per IP/org/seat
- [ ] Upload MIME sniffing + size caps

**Privacy/PDPL**
- [ ] Purpose binding required for all processing
- [ ] RoPA updated per feature
- [ ] Minors data handling paths verified; guardian consent flows
- [ ] Soft delete ↔ erasure process tested

---

## 22) Cursor Work Packages (Copy/Paste to Composer)
**WP‑01 | Scaffold Monolith**
> Create folders and base tsconfig/eslint/prettier across /apps and /packages per the plan. Add pnpm workspaces and base scripts.

**WP‑02 | Prisma Schema v1**
> Implement core models, status event tables, outbox, audit. Generate migrations.

**WP‑03 | Auth Module**
> Implement JWT access/refresh with jti blacklist, OAuth PKCE stub, CSRF state helper.

**WP‑04 | Middleware Gates**
> Subscription, Nafath, Guardian, Idempotency, Rate limits.

**WP‑05 | Media Module**
> Upload API, HLS signer, watermark utility, pHash compute + store.

**WP‑06 | Search Port + Algolia Adapter**
> Define search interface and Algolia implementation with explain payload.

**WP‑07 | Billing (Moyasar)**
> Payment intents, webhooks, grace period logic, receipts store.

**WP‑08 | Notifications**
> Templated emails/SMS in AR/EN; queue producers/consumers.

**WP‑09 | Contracts & Tests**
> OpenAPI authoring, zod validators, Dredd setup in CI.

**WP‑10 | Observability**
> OTEL traces in routes/workers; Sentry; metrics and basic alert rules.

---

## 23) Example Route: Idempotent Create Application
```ts
// apps/web/app/api/v1/applications/route.ts
export async function POST(req: NextRequest) {
  const key = req.headers.get('Idempotency-Key');
  if (!key) return json(400, { error: 'Missing Idempotency-Key' });
  const existing = await findIdempotent('applications:create', key);
  if (existing) return json(200, existing.response);

  const body = await req.json();
  const parsed = CreateApplicationSchema.safeParse(body);
  if (!parsed.success) return json(422, { error: parsed.error });

  const result = await prisma.$transaction(async (tx) => {
    const app = await tx.application.create({ data: parsed.data });
    await tx.applicationStatusEvent.create({ data: { applicationId: app.id, toStatus: 'SUBMITTED' }});
    await tx.outbox.create({ data: { eventType: 'ApplicationCreated', payload: { id: app.id }}});
    return app;
  });

  await storeIdempotent('applications:create', key, result);
  return json(201, result);
}
```

---

## 24) Backup & DR
- Nightly logical backups (pg_dump), 7/30/90 retention tiers.
- Quarterly **restore drills**; validate **RPO ≤ 24h**, **RTO ≤ 4h**.

---

## 25) Hardening Runbook
- Chaos drill: kill Redis → ensure DLQ + recovery.
- Payment webhook outage simulation; ensure no double charges.
- Indexer backlog surge; auto scale workers or shed non‑critical jobs.

---

## 26) Open Items to Decide Explicitly
- Final SMS aggregator (OTP + notifications)
- Target cloud region and data residency stance (KSA vs UAE)
- Media origin: CloudFront/Cloudflare vs direct S3
- Move to OpenSearch once Arabic analyzer tuning is ready

---

## 27) Definition of Done (MVP)
- All /v1 endpoints behind gates pass contract tests
- Apps/worker stable under soak (24h) ≤ 1% error
- Compliance export works and redacts minors by default
- HLS playback uses short‑lived signed URLs; no public object access
- Billing webhooks idempotent; receipts downloadable
- RoPA/DPIA artifacts committed and reviewed

---

**This is the hardened blueprint. Execute via the Cursor work packages. Escalate any blocked decisions from §26 before W2.**

