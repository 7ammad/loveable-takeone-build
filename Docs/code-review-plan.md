# Code Review Request: TakeOne Casting Marketplace

## Project Context

You are reviewing the codebase for **TakeOne Casting Marketplace**, a platform for the Saudi performing arts industry. The platform connects casting directors with talent, utilizing automated WhatsApp monitoring (via Whapi.cloud), intelligent LLM filtering (Anthropic/OpenAI), and a comprehensive application management system.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, PostgreSQL (Supabase), Prisma, BullMQ (Redis), Moyasar.
**Architecture:** Monorepo structure managed with `pnpm`.
**Key Risk Areas:** Custom JWT authentication, "Digital Twin" background processing system, LLM accuracy and security, payment integration (Moyasar), and Saudi data privacy compliance (PDPL).

## Your Mission

Conduct an exhaustive code review to ensure the codebase is production-ready, bug-free, secure, scalable, and follows industry best practices.

## Execution Strategy for Large Codebases (Crucial Instruction)

Due to context limitations, this review must be conducted iteratively:

1.  Begin with **Phase 1** (Initial Codebase Analysis) to understand the overall structure and configuration.
2.  Execute **Phases 2, 3, and 4** module-by-module. Suggested prioritization based on risk and complexity:
      * **P1 (Security):** `packages/core-auth/` (Custom JWT implementation).
      * **P2 (Core IP/Complexity):** `lib/digital-twin/` and `worker/` (WhatsApp, LLM, BullMQ).
      * **P3 (Data Integrity):** `prisma/` and `packages/core-db/`.
      * **P4 (Business Logic & Payments):** `lib/services/` and relevant `app/api/` routes (Moyasar integration).
      * **P5 (Shared Utilities):** `packages/core-contracts/` and `packages/core-lib/`.
      * **P6 (Frontend):** `app/(auth)/` and `app/(dashboard)/`.
      * **P7 (Configuration):** Root configuration files and `scripts/`.
3.  Once all modules are reviewed individually, execute **Phases 5, 6, and 7** to synthesize the findings, prioritize the global issues, and provide the final report.

-----

## Phase 1: Initial Codebase Analysis

### Step 1.1: Project Structure Assessment

  * Map the monorepo structure. Assess the encapsulation and dependency management between `packages/` using `pnpm`.
  * Analyze the Next.js App Router implementation (`app/`). Identify the use of layouts, route groups, API routes, and the balance between Server/Client components.
  * Verify alignment with the documented tech stack.

### Step 1.2: Dependency Audit

  * Review `package.json` files (root and packages).
  * Check for vulnerabilities, outdated packages, and unused dependencies.
  * Verify **License compliance** for all dependencies (ensure compatibility with commercial use).

### Step 1.3: Configuration Review

  * Examine `.env`, `next.config.js`, and `tsconfig.json`.
  * Verify secure handling of all secrets: Supabase keys, Whapi.cloud tokens, Anthropic/OpenAI API keys, Moyasar payment keys, Redis connection strings, and **JWT secrets**.
  * Ensure `tsconfig.json` has `strict: true` enabled.
  * Ensure configurations differ correctly between development and production (Vercel deployment).

### Step 1.4: Infrastructure and Deployment Analysis

  * Review Vercel deployment configuration (`vercel.json` if present).
  * Analyze how the BullMQ workers (`worker/`) are deployed and scaled separately from the Next.js app.
  * Verify Supabase configuration: Are **Row Level Security (RLS) policies** enabled and correctly configured? If not, application-level authorization must be flawless.
  * Check database connection pooling settings (Prisma/Supabase) and Redis connection security.

-----

## Phase 2: Deep Code Review

*(Execute this phase iteratively for each module as defined in the Execution Strategy)*

### Step 2.1: Code Quality & Standards

  * **TypeScript:** Verify adherence to `strict` mode. Minimize explicit `any` usage and excessive type assertions.
  * **Next.js 14:**
      * Proper utilization of React Server Components (RSCs) vs. Client Components.
      * Correct implementation of data fetching, caching, and revalidation strategies (Server Actions or Route Handlers).
  * **Prisma:** Efficient schema design, correct use of relations, and avoidance of common pitfalls.
  * **Style & Structure:** Adherence to DRY/SOLID principles, ESLint/Prettier rules, and consistent naming conventions.

### Step 2.2: Bug Detection

  * **Digital Twin & Background Jobs (`worker/`, `lib/digital-twin/`):**
      * Review BullMQ implementation: **Job idempotency** (crucial for preventing duplicates), concurrency control, error handling (Dead Letter Queues), and graceful shutdowns.
      * Check Whapi.cloud integration: Rate limit handling, connection stability, and handling of diverse WhatsApp message formats.
      * LLM Processing: Handling of API failures, timeouts, and inconsistent output formats from Claude/GPT.
  * **State Management:** Issues with React Context usage, stale data, or race conditions.
  * **Edge Cases:** Handling of null/undefined inputs, especially data coming from external APIs.
  * **Prisma Specifics:** Transaction handling and error management (e.g., unique constraint violations).

### Step 2.3: Security Vulnerabilities (Critical Area)

  * **Custom Authentication (`packages/core-auth`):**
      * Rigorously audit the JWT implementation: Secure signing algorithm, verification process, expiration, refresh token strategy, and **revocation mechanism** (e.g., upon logout/password change).
      * Verify bcrypt implementation strength.
      * Check session management: Secure cookie settings (`httpOnly`, `secure`, `sameSite=Strict/Lax`).
  * **Authorization:** Verify Role-Based Access Control (RBAC) implementation (Talent, Caster, Admin) at API and resource levels.
  * **Payments (Moyasar):**
      * Ensure payment details are not logged.
      * Verify webhook implementation and **signature validation** for confirming payments and handling failures (PCI DSS considerations).
  * **Data Protection & Compliance:**
      * Compliance with Saudi Data Privacy Laws (**PDPL**) overseen by SDAIA (consent, data minimization).
      * Data residency considerations (Supabase region).
      * Ensure sensitive data (PII, secrets) is not accidentally leaked from Server Components into Client Component props.
  * **Input Validation:** XSS, CSRF protection, and input sanitization (e.g., using Zod).
  * **Supabase Storage:** Ensure secure upload policies and access controls for talent portfolios/headshots.
  * **LLM Security:** Check for **Prompt Injection** vulnerabilities in the `LlmCastingCallExtractionService`.

### Step 2.4: Performance and Scalability Analysis

  * **Frontend (Next.js):** Bundle size analysis, efficient use of `next/image`, lazy loading, minimizing Client Component usage, and memoization opportunities.
  * **Backend & Database:**
      * Prisma Query Optimization: Identify N+1 problems, missing indexes, and inefficient queries (using `include`/`select` correctly).
  * **Background Jobs:** BullMQ throughput, Redis performance, and potential bottlenecks.
  * **Scalability:** Evaluate the scalability of the `WhatsAppOrchestrator` and `DigitalTwinService`.
  * **LLM Cost & Efficiency:** Analyze latency and token usage of LLM calls; implement caching or streaming where appropriate.

### Step 2.5: Localization & Cultural Considerations (Saudi Market)

  * **RTL Support:** Verify Tailwind CSS implementation supports Right-to-Left layouts correctly for Arabic.
  * **LLM Accuracy:** Assess the prompts and logic in `LlmCastingCallExtractionService` for accuracy in interpreting Saudi Arabic dialects and casting terminology.
  * **Date/Time & Currency:** Correct formatting for local timezones and Saudi Riyal (SAR).

### Step 2.6: Accessibility (A11y) Compliance

  * Evaluate adherence to WCAG guidelines in the custom component library.
  * Check for semantic HTML, keyboard navigation, focus management, and proper ARIA attributes.

### Step 2.7: Database & Data Modeling Review (`prisma/`)

  * Analyze the `schema.prisma` for normalization, efficiency, and integrity constraints.
  * Review Prisma migrations for idempotency and potential data loss scenarios.
  * Assess the design of the `LlmLearningPattern` and `LlmFeedback` tables for scalability.

-----

## Phase 3: Testing & Quality Assurance

*(Execute this phase iteratively for each module)*

### Step 3.1: Test Coverage Analysis (Vitest)

  * Evaluate unit and integration test coverage, prioritizing:
      * Custom authentication logic (all flows and edge cases).
      * Payment processing and webhook scenarios (Moyasar).
      * LLM extraction pattern matching (diverse examples, false positives).
      * BullMQ job processing pipeline (success, failure, retry).
  * Assess test quality (testing edge cases, not just happy paths).

### Step 3.2: Error Handling Review

  * Ensure robust error handling for background jobs, preventing crashes and ensuring retries.
  * Proper error messages in the API (user-friendly, not exposing internals).
  * Logging implementation and monitoring setup (e.g., Sentry).

-----

## Phase 4: Generate Comprehensive Report (Per Module)

Create a detailed report for the module reviewed.

### Detailed Findings

For each issue found, provide:

#### Issue \#[MODULE]-[NUMBER]: [BRIEF DESCRIPTION]

**Severity:** Critical | High | Medium | Low
**Category:** Bug | Security | Performance | Code Quality | Best Practice | Localization | Compliance | DevOps | A11y
**File:** `path/to/file.ts`
**Line(s):** Line 45-52

**Description:**
[Detailed explanation of the issue]

**Current Code:**

```typescript
[Show the problematic code snippet]
```

**Impact:**
[Explain what could go wrong]

**Recommended Fix:**
[Explain how to fix it. Utilize `@Codebase` context if the fix impacts other files.]

**Fixed Code:**

```typescript
[Show the corrected code]
```

**Estimated Effort:** High | Medium | Low

-----

## Phase 5: Global Implementation Plan

*(Execute after all modules have been reviewed)*

Synthesize findings from all module reports and create a prioritized action plan.

### Critical Fixes (Do Immediately)

*(e.g., Custom Auth vulnerabilities, Payment security issues, PDPL violations, critical Digital Twin failures)*

1.  [Issue] (Effort: [Estimate])
    ...

### High Priority (This Week)

*(e.g., Major bugs, performance bottlenecks, LLM inaccuracies)*

1.  [Issue] (Effort: [Estimate])
    ...

### Medium Priority (This Sprint)

### Low Priority (Backlog)

### Recommended Implementation Order

  * Explain the reasoning behind the prioritization and highlight dependencies between fixes.

-----

## Phase 6: Execute Fixes (Top 10 Global Critical Issues)

*(Execute after Phase 5)*

For the **top 10 most critical issues** identified globally:

1.  Provide the complete fixed code for each file.
2.  Explain what was changed and why.
3.  Show before/after comparisons.
4.  Suggest testing steps (e.g., specific Vitest commands) to verify the fix.

-----

## Phase 7: Final Review and Sign-off

*(Execute after Phase 6)*

1.  Re-review the corrected code.
2.  Verify no new issues were introduced.
3.  Provide a final quality score (1-10).
4.  Give recommendations for ongoing code maintenance (e.g., monitoring LLM accuracy drift, automated dependency updates, regular security audits).

-----

## Special Instructions

  * Be **thorough** and follow the iterative execution strategy.
  * Be **specific** - always provide file names and line numbers.
  * **Utilize Codebase Context:** When analyzing architecture, data flow, or the impact of changes across files, leverage the `@Codebase` feature in Cursor.
  * Be **security-focused** - prioritize the custom auth, payments, and data privacy (PDPL).
  * Be **robustness-aware** - pay close attention to the Digital Twin system (BullMQ/Redis) ensuring idempotency and error recovery.
  * Be **Saudi-aware** - consider RTL, language processing, and regulatory context.

-----

## Ready to Begin?

Please begin your comprehensive review of the TakeOne Casting Marketplace codebase. Start with Phase 1, and then await instruction before proceeding iteratively through the modules as prioritized in the Execution Strategy.