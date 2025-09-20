# Saudi Casting Marketplace — Amplified MVP PRD (v3.0, Consolidated)

> **Purpose:** Authoritative MVP spec. High‑trust talent discovery for professional hirers. Bookings and contracting occur **off‑platform** in MVP.

## Strategic Pillars
- **Core Loop:** Trusted discovery → verified application → hirer shortlisting; booking offline.
- **Verification:** Mandatory Nafath identity check for adult talent and all guardians **prior** to any application.
- **Minor Safety:** **Guardian‑as‑Primary‑User**; minors’ profiles are guardian‑managed sub‑profiles.
- **Monetization:** **Professional Access** subscription for hirers (required to post, search, contact).

---

## 1) Product Summary
A regulated, Arabic‑first casting marketplace for Saudi entertainment. Connects **professional hirers** with **verified talent**. Replaces fragmented WhatsApp/social with a single, compliant discovery workflow and concierge compliance.

---

## 2) Goals & Success Metrics
- **−40%** time to shortlist in pilots.
- **≥5** verified applications per role in **≤72h**.
- **100%** of applying adults/guardians Nafath‑verified.
- **≥20** paying hirer subscribers during 8‑week pilot.
- **NPS ≥60** for talent and hirers.

---

## 3) Primary Users
- **Casting Directors / Producers** (initial: in‑house at MBC/Telfaz11 + top freelance connectors).
- **Talent** (actors, models, performers; adults and minors).
- **Guardians** (primary controllers for minors).
- **Platform Admins** (concierge compliance, moderation).

---

## 4) MVP Scope — Core Features
1. **Talent Profiles**: verification badge; headshots; reels (video/audio); skills; languages; physical attributes; availability calendar.
2. **Mandatory Verification (Nafath)**: one‑time identity check for adult talent and all guardians before any application.
3. **Guardian‑as‑Primary‑User**: guardian creates account → verifies via Nafath → creates/manages minor sub‑profile; controls applications and messaging; minors not publicly contactable.
4. **Professional Access Subscription** (hirers): subscription required to post roles, search full database, initiate contact.
5. **Casting Calls & Roles**: structured specs (project, dates, city, rate guidance, audition format/self‑tape, required attributes and skills).
6. **Search & Match**: hard filters (age, language, location) → soft ranking (profile completeness, responsiveness, verification freshness). Explainability panel shows why a result ranked.
7. **Application Workflow**: Kanban for hirers: **Applied → Shortlist → Contacted**; plus view marker **Viewed by Hirer**.
8. **Self‑Tape Requests & Secure Upload**: request one tape per application; watermark; in‑app streaming for hirers.
9. **Saved Searches & Alerts** (talent): save filters; email/SMS alerts for matching roles.
10. **Concierge Compliance**: hirers request docs; talent/guardians upload; **admin reviews/approves**; exportable checklist pack (PDF/JSON).
11. **Arabic‑first UX**: RTL layouts; Hijri/Gregorian toggle; localized numerals and addresses; Arabic guidance copy.
12. **Admin Dashboard**: user management; subscription monitoring; compliance approvals; moderation queue; audit views.

### Deferred (Phase B+)
- Contracts & e‑sign; transactional/escrow payments; agency workspaces; ratings/feedback; availability graph; mobile apps; SSO/SLA.

---

## 5) Non‑Functional Requirements
- **Security/Privacy**: PDPL alignment; consent/purpose records; immutable audit; AES‑256 at rest; TLS 1.2+; secrets vault; WAF; DDoS; rate limiting; PII‑safe logging.
- **Performance**: p95 search < **200 ms**; media p95 load < **2 s**; upload failure rate p95 < **1%**.
- **Reliability**: **99.9%** uptime; backups daily (**RPO ≤24h**, **RTO ≤4h**); quarterly restore test.
- **Scale**: ≥ **100k** profiles; ≥ **10k** concurrent searches post‑MVP.
- **Accessibility**: WCAG 2.1 AA; RTL tested.

---

## 6) Data Model (MVP)
- **User** (roles: Talent, Guardian, Casting, Admin; status)
- **Identity** (user_id, nafath_verification_status, doc_hashes, verified_at)
- **TalentProfile** (user_id or guardian‑linked subprofile_id, display_name, bio, attributes, skills, languages, city, availability, media[])
- **CastingCall** (org_ref?, project_name, city, start_at, end_at, status)
- **Role** (casting_call_id, title, description, age_min/max, gender, languages[], skills[], paid_flag, audition_type)
- **Application** (role_id, talent_user_id, status[Applied|Shortlist|Contacted|Rejected|Withdrawn], viewed_by_hirer_at?, notes, media_refs, scores_json)
- **ComplianceItem** (subject_type, subject_id, document_type, file_ref, status, expiry_at)
- **Subscription** (hirer_user_id, plan_id, status, period_start/end)
- **Plan** (code, price_month, price_year, limits_json)
- **SavedSearch** (user_id, params_json, channels[email|sms], active_flag)
- **ShareLink** (entity_type, entity_id, token, expires_at, access_log[])
- **MessageThread** (context: CastingCall|Role|Application) + **Message**
- **AuditEvent** (actor, entity, action, diff, ip, ua, ts)

---

## 7) Go‑to‑Market (MVP)
- **Target**: 50–100 active in‑house producers + freelance fixers in Riyadh/Jeddah.
- **Onboarding**: white‑glove demos; portfolio review; assisted account setup.
- **Positioning**: professional **“WhatsApp Killer”** for casting. Founders’ Pilot with discounted **Founders’ Rate**.

---

## 8) Monetization (MVP)
- **Talent & Guardians**: **Free** profiles, verification, applications.
- **Hirers**: **Professional Access** subscription (e.g., SAR **199**/mo or **1,999**/yr). Tier limits may cap posts, searches, messages.

---

## 9) Pilot Plan & Go/No‑Go
### 8‑Week Pilot
- **W1–2**: onboard **20** hirer seats; **500** talent; push Nafath completion.
- **W3–4**: run ≥ **2** real campaigns; test application + concierge flows.
- **W5–6**: convert to paid; goal **≥10** paying hirers.
- **W7–8**: evaluate; lock Phase B roadmap.

### Go/No‑Go
- **Adoption**: ≥ **15** paying hirers; ≥ **700** active verified talent.
- **Liquidity**: median time to **first qualified application ≤24h**.
- **Quality**: ≥ **80%** applications meet hard constraints.
- **Compliance**: **100%** pilot bookings complete concierge pack.
- Proceed if **≥3/4** thresholds met.

---

## 10) Tech Stack & Architecture
- **Frontend**: Next.js; AR/EN i18n; RTL; Arabic typography.
- **Backend**: Node.js/TS or Python API; stateless services; JWT; RBAC.
- **DB**: PostgreSQL; **pgvector** reserved for later similarity; Redis cache.
- **Media**: pre‑signed upload → serverless transcode → private object store → CDN; watermarking pipeline.
- **Search**: structured index with Arabic analyzers; explainability signals.
- **Observability**: logs/metrics/traces; error budgets; PII‑safe logging.

---

## 11) Security & Compliance Controls
- **PDPL**: consent and purpose binding; subject access/erasure flows from day one.
- **Residency**: primary storage in KSA region; cross‑border off by default.
- **RBAC**: least privilege; field‑level masking for PII; admin break‑glass with justification.
- **Minors**: guardian‑only control; stricter moderation; hidden contact endpoints; dual‑consent for data sharing.
- **Auditability**: immutable audit events across verification, profile edits, roles, applications, compliance.

---

## 12) Acceptance Criteria (MVP)
- **Verification Gate**: Application blocked unless Nafath passed (adult) or guardian verified (minor). Attempt triggers blocking UI and audit event.
- **Guardian Control**: Minor actions only via guardian; minor profiles not publicly discoverable; direct contact endpoints disabled.
- **Search Hard‑Constraints First**: Results satisfy all hard filters before ranking by soft signals; explainability panel shows matched constraints and top soft signals.
- **Time‑to‑First Qualified Application**: Median ≤ **24h** for general roles in pilot cities.
- **Viewed by Hirer**: Status updates within 5 minutes of dossier open; talent sees status and receives non‑intrusive notification.
- **Self‑Tape Request & Upload**: One self‑tape request per application; up to 1 GB upload; watermark; in‑app streaming; p95 upload failure < **1%**.
- **Compliance Pack Export**: Admin can export consolidated pack (PDF + JSON) per role/campaign with versioned checklist.
- **Subscription Enforcement**: Non‑subscribed hirers cannot post, search full DB, or contact; public browse shows teasers only.

---

## 13) Out‑of‑Scope (MVP)
On‑platform booking, contracts, payouts, ratings, agency workspaces, availability holds, mobile apps.

---

## 14) Migration Notes (from prior drafts)
- Escrow and contracts moved to **Phase B**.
- Added Subscription & Plan; Guardian‑primary model; added **Viewed by Hirer** marker.
- Strengthened PDPL subject rights, data residency, and search explainability.

---

## 15) Feature Addenda Adopted from v2.x
- **Saved Searches & Alerts (Talent)**
- **Shortlist Share (Hirer)** with access‑logged, time‑bound links.
- **Moderation & Watermarking** for self‑tapes and sensitive media.
- **Concierge Compliance** with approvals log and versioned checklist.
- **Admin Auditability** across critical actions.

---

## 16) Analytics & Reporting (MVP)
- Real‑time dashboards: roles posted, submissions/role, shortlist rate, time‑to‑first qualified application.
- Funnels: search → view → invite/apply → shortlist → contacted.
- Quality: response time, no‑show, upload failure, moderation reject rate.
- Marketplace health: supply/demand heatmaps by city and role type.
- Exports: CSV + scoped API tokens for enterprise.

---

## 17) Matching Fairness & Bias Controls
- Enforce objective filters first; expose explainability signals to hirers.
- Audit distributions for gender/age/language; suppress proxy features that introduce unlawful bias.
- Rotate exposure for new verified profiles; decay stale activity.

---

## 18) Enterprise Readiness (Phase B)
- **SSO/SAML**, SCIM; org roles (Org Admin, Casting Lead, Reviewer, Compliance, Finance).
- **SLA tiers**; DPA; audit rights.
- SOC 2 / ISO 27001 roadmap; DPIA for major data uses.

---

## 19) SLA & Support
- P1 response ≤15 min; P2 ≤2 h; P3 next business day.
- Channels: in‑app chat, email; enterprise hotline.
- Abuse handling: triage <24 h; evidence capture; temporary suspensions; legal escalation.

---

## 20) UX Localization Notes
- RTL layouts; Arabic typography; Hijri/Gregorian toggle; localized numerals.
- Arabic search analyzers; dialect guidance in posting.
- Arabic tips for self‑tape etiquette and credits editing.

---

## 21) Risks Register
- **Cold‑start**: seed via agencies/academies; guaranteed‑fill pilots; referral rewards. Owner: GTM.
- **Regulatory drift**: weekly GEA/Film Commission review; versioned checklists. Owner: Compliance.
- **Payment friction (Phase B)**: PSP redundancy; manual payout fallback. Owner: FinOps.
- **Content abuse/scams**: re‑verification triggers; velocity limits; IP/device fingerprinting. Owner: T&S.

---

## 22) Admin & Ops Playbooks (Snapshot)
- Moderation SOP; Incident Response (PDPL‑aligned); Access Control JML; quarterly access recertification; break‑glass logging.

---

## 23) API Surface (MVP)
- Auth; Users; TalentProfiles; CastingCalls & Roles; Applications (incl. **Viewed by Hirer**); ComplianceItems; Subscriptions/Plans; SavedSearch; ShareLink; AuditEvents; Media uploads with watermarking.

---

## 24) Next Actions
1. Update ERD/OpenAPI with **SavedSearch**, **ShareLink**, **Viewed by Hirer**, explainability fields.
2. Implement Talent saved‑search + alerts; Hirer shortlist share.
3. Stand up analytics dashboard and pilot KPI monitors.
4. Finalize moderation queue + watermark pipeline; run PDPL DPIA.

