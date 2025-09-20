# Core Product — Wireframes & User Flows (v3.0) — Rev B

> Expanded from Rev A with detailed flows, UI states, validation, edge cases, and success metrics for sections 4–19. PRD v3.0 compliant.

---

## 1) Homepage `/`
[Unchanged from Rev A]

---

## 2) Signup `/signup`
[Unchanged from Rev A]

---

## 3) Login `/login`
[Unchanged from Rev A]

---

## 4) Talent/Guardian Onboarding `/onboarding/*`
**Purpose:** Capture structured data that powers search, ensure policy compliance, and set up minors under guardian control.

**Flow (Adults)**
1) **Core Skills**: multi‑select (Acting, Modeling, Voice, Extra). Drives default fields and facets.
2) **Essential Details**: stage name, age range, city, languages, height/measurements, union/agency (optional).
3) **Profile Builder**: headshots (min 2, ratio guidance), reels (≤90s, 1080p cap), resume/credits (role, production, year, link).
4) **Verification Prep**: explain **Nafath required at apply‑time**; status badge placeholder; CTA to start verification later.

**Flow (Guardians for Minors)**
1) **Guardian Account**: role=Guardian; legal name and relationship; email/phone.
2) **Guardian Verification Prep**: Nafath required before any minor application.
3) **Create Minor Sub‑Profile**: legal name (masked publicly), stage name, age bracket, city, languages.
4) **Media & Privacy**: upload headshots with stricter moderation; visibility default = “Visible to verified hirers only”.

**UX Details**
- Progress bar and **Profile Health Score** with actionable tips.
- Inline Arabic guidance for self‑tape etiquette and credits.
- Autosave; media processing states; resume drafts.

**Validation & Edge Cases**
- Required: stage name, city, age range, ≥1 headshot. Media: MP4/H.264 or MOV; ≤150MB per reel.
- Incomplete onboarding → dashboard banner lists missing steps.
- Guardian converting to adult talent later creates a **new** talent profile; no merge of minor data.

**Metrics**: onboarding completion rate, avg time, media error rate, % profiles ≥80% health.

---

## 5) Talent Dashboard `/dashboard/talent`
**Goal:** Mission control for actions and feedback loop.

**Layout**
- **Action Required Banner**: verification pending, self‑tape requested, missing compliance doc, expiring media.
- **My Stats**: views, active applications, invitations; 7d/28d toggles.
- **My Applications Feed**: latest changes with **Viewed by Hirer** timestamp.
- **New Jobs Feed**: roles matched to **Saved Searches**; one‑click apply opens pre‑filled form.

**States**
- Empty: upsell to complete profile or save first search.
- Overload: collapsed feeds; filter by project.

**Interactions**
- Dismissible alerts; each dismissal logs an audit event.

**Metrics**: DAU, banner CTR, submit rate from feed, time‑to‑first qualified application.

---

## 6) Talent Profile Editor `/dashboard/talent/profile/edit`
**Tabs**: **Profile**, **Attributes**, **Media**, **Credits**.

**Profile**: display name, bio, city; verification badge read‑only.
**Attributes**: age range, height, measurements, languages, skills.
**Media**: headshots/reels; 1 GB per asset cap; progress, retry; watermark flag surfaced on reels.
**Credits**: add/edit entries, reorder, attach links.

**Validation**
- Required fields: display name, age range, city, ≥1 headshot.
- Media rules: MP4/H.264 or MOV; ≤90s; ≤150MB per reel.

**Privacy**
- Minor profiles hidden from public. Guardian controls visibility.

**Metrics**: health score lift, rejection rate, save errors.

---

## 7) Job Board (Talent) `/dashboard/talent/jobs`
**Header**: search box; filters: city, age, language, skills, audition type; **Save Search** button.

**List**: role cards with title, project, city, audition type, posted time, verification badge requirement.

**Role Details**
- Specs, audition instructions, compliance notes, deadline.
- **Apply CTA** disabled until Nafath verified (adult) or guardian verified (minor); tooltip explains.

**Apply Flow**
- Select reel(s) or add note; PDPL consent checkbox; submit.

**Metrics**: search→apply rate, saved‑search adoption, tooltip views on gate.

---

## 8) Applications Tracker `/dashboard/talent/applications`
**Top**: status chips: Applied · Shortlist · Contacted · Rejected · Withdrawn.

**Table**
- Columns: Role | Project | City | Status | **Viewed by Hirer** | Actions.
- Row actions: open dossier; **Submit self‑tape** if requested; withdraw.

**Sorting/Filtering**: by updated date, status, viewed flag.

**Metrics**: % viewed, time submit→viewed, shortlist rate.

---

## 9) Audition Submission `/dashboard/talent/applications/[id]/submit-tape`
**Left**: brief, scene sides, deadline, file specs.
**Right**: secure uploader with progress and retry; success preview with watermark notice.

**Rules**
- One self‑tape per application; re‑submit only if hirer rejects and re‑opens.
- Max 1 GB; virus scan + moderation before hirer view.

**Metrics**: upload success, p95 upload time, moderation turnaround.

---

## 10) Hirer Subscription Gate `/dashboard/hirer/subscription`
**Plan Cards**: Monthly SAR 199; Yearly SAR 1,999 (Founders’ Rate). Feature checklist and limits.

**Checkout**
- Billing info, tax ID, auto‑renew disclosure, Terms/Privacy acceptance.
- Success → Active; failure → clear error with retry.

**Metrics**: plan view→checkout CTR, checkout→paid conversion, refunds.

---

## 11) Hirer Dashboard `/dashboard/hirer`
**Widgets**
- **My Casting Calls**: cards with New/Shortlisted/Contacted counts.
- **Applicant Activity Feed**: real‑time events (new applications, self‑tapes).
- **Quick Actions**: Post role, Invite talent, Open search.

**Metrics**: time‑to‑shortlist, actions/session, seat utilization.

---

## 12) Create Casting Call + Roles `/dashboard/hirer/jobs/new`
**Form**: project name, city, dates, audition type, rate guidance, description.

**Add Role Modal**: title, description, age min/max, gender, languages, skills, constraints.

**Validation**: ≥1 role; age_min ≤ age_max; city required.

**Publish**: status Open; application inbox created.

**Metrics**: form completion, time to publish, role completeness.

---

## 13) Casting Funnel `/dashboard/hirer/jobs/[jobId]`
**Header**: job snapshot (city, dates, status), SLA widget (median time‑to‑first qualified application).

**Kanban**: New → Shortlisted → Contacted.
- Card: headshot, key attributes, verification badge, soft signals (health, responsiveness), last activity.
- Actions: drag to move; rate 1–5; tags; private notes; **Request Self‑Tape**; bulk message; open dossier.

**Shortlist Share**
- Modal: expiry (24h/7d/custom), watermark reminder, copy link; access log indicator.

**Metrics**: shortlist time, stage‑progress %, collaborator views via share link.

---

## 14) Talent Search (Hirer) `/dashboard/hirer/search`
**Filters**: age range slider, languages multi‑select, city radius, skills chips, availability window.

**Results**: grid with verified badge; quick invite; open dossier.

**Explainability**: “Why this result” panel lists hard matches and top soft signals.

**Metrics**: searches per seat, invites/search, invite→apply.

---

## 15) Admin Console `/admin`
**Queues**
- **Moderation**: incoming media; approve/reject with reasons.
- **Compliance Approvals**: concierge items by subject; approve/reject; version notes.
- **Audit Log**: filter by actor/entity; export CSV.

**Permissions**: RBAC; PII field masking; break‑glass requires reason.

**Metrics**: moderation SLA, false positives, compliance turnaround.

---

## 16) Components
- **Role Toggle Hero**: two‑state copy swap; metric counters.
- **Status Chip (Viewed by Hirer)**: timestamp; tooltip explains source.
- **Saved Search Control**: name, channels (email/SMS), frequency (instant/daily/weekly).
- **ShareLink Modal**: expiry pickers; copy; access count.
- **Self‑Tape Request Modal**: instructions, due date/time, file specs; inbox + email notification.

**States**: loading, success, error, disabled; emit analytics events.

---

## 17) Cross‑Flow Rules
- **Verification Gate**: backend enforces Nafath for adult applicants or guardian for minors; UI tooltips explain.
- **Guardian Control**: minor actions only via guardian session; messaging restricted; minor profiles hidden from public contact.
- **Subscription Enforcement**: posting/search/contact behind active subscription; read‑only teasers allowed.
- **Explainability**: ranked lists expose a "Why" panel.
- **Auditability**: critical actions emit immutable audit events.

---

## 18) UX Acceptance Checks
- Apply button toggles immediately upon verification success.
- **Viewed by Hirer** surfaces ≤5 minutes after dossier open; latency tracked.
- Self‑tape upload ≤2 steps after file select; p95 failure <1%; clear retry.
- Shortlist share opens read‑only gallery; downloads show watermark reminder.
- Saved Search creation ≤2 clicks; alerts delivered on schedule.
- Arabic RTL verified end‑to‑end; Hijri/Gregorian toggle persists.

---

## 19) Handoffs
- Engineering: **ERD + OpenAPI v3.0**, search spec, media pipeline spec.
- Design: **UX copy deck (AR/EN)**, tokens/components, empty/error state library.
- Ops/Legal: PDPL notice, Terms, guardian policy, moderation SOP.

**Next in Core**: deliver **UX Copy Deck (AR/EN)** and **Design System Tokens + Components**.

