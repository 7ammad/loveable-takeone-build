# Search & Ranking Specification (v3.0, MVP) — Saudi Casting

> Scope: Talent discovery and job discovery for MVP. Enforce **hard filters first**, then apply **soft ranking** with explainability. Arabic‑first analyzers, PDPL‑conscious logging, and bias controls. Aligns to PRD v3.0, ERD/OpenAPI v3.0.

---

## 1) Objectives
- Return **eligible** results fast (p95 < 200 ms for query-only; < 350 ms with facets).
- Enforce **policy**: guardian controls for minors, Nafath badge visibility, subscription gates.
- Provide **transparent** scoring: expose why a result ranked.
- Support **two surfaces**: Hirer → Talent Search; Talent → Job Board.

---

## 2) Indexing Model
### 2.1 Talent Index (for Hirers)
- **Keys**: `talent_user_id`, `profile_version`.
- **Fields (filterable)**: age_min, age_max, age_bracket, genders, languages[], city, radius_index(lat,lng), skills[], is_minor (bool), verification_status, profile_health_score, last_active_at.
- **Fields (searchable)**: display_name, bio, credits_titles[], credits_projects[].
- **Fields (rank-only)**: responsiveness_score, invite_accept_rate, application_quality_score (pilot), verification_freshness_days, media_quality_score.
- **Visibility flags**: `guardian_required=true` for minors; `contactable=false` for minors.

### 2.2 Role Index (for Talent)
- **Keys**: `role_id`, `casting_call_id`.
- **Fields (filterable)**: city, audition_type, paid_flag, languages[], skills[], age_min, age_max, created_at.
- **Fields (searchable)**: role_title, project_name, description.
- **Fields (rank-only)**: freshness, response_velocity(org), fill_probability (post-MVP), verified_hirer_flag.

### 2.3 Text Analysis (Arabic/English)
- Multi-field strategy: `field.ar_standard`, `field.en_standard`.
- Arabic rules: diacritics removal, light stemming, stopwords; support dialect tokens (e.g., خليجي, نجد).
- English rules: standard tokenizer, lowercase, stopwords.
- N‑gram edge for names (2–15) to support partial matches.

---

## 3) Query Model
### 3.1 Hirer → Talent Search
- **Inputs**: age range, languages, city (+radius), skills, availability window, text query, verification required (checkbox), minor visibility (default exclude), sort.
- **Policy enforcement**: exclude minors unless `guardian_visible=true` AND requester is subscribed hirer. Contact endpoints remain disabled for minors.
- **Query shape**:
  1) **Hard filter** clause: age intersects, languages ⊇ required, city within radius, skills ⊇ required, verification if checked.
  2) **Soft score**: weighted sum:
     - `w1` profile_health_score
     - `w2` responsiveness_score
     - `w3` verification_freshness_days (inverse)
     - `w4` activity_recency (inverse of last_active_at)
     - `w5` media_quality_score
  3) **Tie-breakers**: recency of profile update, random jitter for exploration.

### 3.2 Talent → Job Board
- **Inputs**: city, language(s), skills, audition type, text query, sort (freshness default).
- **Hard filter**: city match or radius, language subset, age fit, audition type.
- **Soft score**: freshness + verified_hirer_flag + org_response_velocity.

### 3.3 Saved Searches & Alerts
- Persist `params_json` on `SavedSearch`. Worker evaluates delta window and pushes digest (daily) or instant alerts.

---

## 4) Ranking Signals (weights v1.0)
> Calibrate via pilot. Start conservative to avoid bias.

### 4.1 Talent result signals
- **Profile completeness** (`w1=0.35`): 0–100 based on required fields and media.
- **Responsiveness** (`w2=0.20`): replies within 48h; decays after 21d inactivity.
- **Verification freshness** (`w3=0.15`): 0 at 0–30d, −10% after 90d, −25% after 180d.
- **Recent activity** (`w4=0.20`): profile update or login in last 30d.
- **Media quality** (`w5=0.10`): resolution, aspect adherence, moderation clean.

### 4.2 Role result signals
- **Freshness** (`0.5`): newer roles first.
- **Verified hirer** (`0.3`): org has active subscription and verified domain.
- **Org response velocity** (`0.2`): median time to first view in last 30d.

---

## 5) Explainability Payload
Return with each result:
- **Hard filter pass list**: `["age_range", "language:ar", "city:riyadh"]`.
- **Soft signals**: `{profile_completeness: 82, responsiveness: 0.74, verification_freshness_days: 28, activity_recency_days: 5}`.
- **Why string (AR/EN)**: AR example → "تطابق العمر واللغة، وملف مكتمل بنسبة ٨٢٪"; EN → "Matched age and language with 82% profile completeness."

---

## 6) Bias & Safety Controls
- **Objective filters first**; block soft scoring from overriding constraints.
- **Protected proxies**: do not include name, accent, or non-relevant physical proxies in scoring.
- **Rotation**: inject **exploration slots** for verified low‑exposure profiles (5–10% of page).
- **Audits**: weekly distribution checks across gender/age/language; report to Admin.
- **Minors**: never expose contact endpoints; ensure guardian gating.

---

## 7) Performance & Caching
- In‑memory cache for hot queries (60s TTL).
- Per‑org filter presets cached with ETag.
- Warm indices hourly; compress postings.
- p95 SLA: 200 ms query‑only; 350 ms with facets; 600 ms with geo.

---

## 8) API Contracts (aligned to OpenAPI v3.0)
- `GET /talent-profiles`: query params map to filters; returns `explain` block.
- `GET /casting-calls`: public listing; `apply` gated server‑side.
- `POST /saved-searches`: store saved search.
- Webhook `saved_search.digest.ready` for email/SMS worker.

---

## 9) Logging & Privacy (PDPL)
- Log only query params and anonymized user id (`u_hash`).
- Retain logs 90 days; redact text queries after 30 days.
- Access via Admin with purpose justification; immutable audit events.

---

## 10) Metrics & Dashboards
- Query latency p50/p95; cache hit rate.
- CTR: search → open dossier → invite/apply.
- Quality: hard‑filter pass rate; shortlist rate; response velocity.
- Fairness: exposure share by cohort vs pool share.

---

## 11) Failure Modes & Guardrails
- If index unavailable → degrade to minimal SQL fallback with hard filters only.
- Empty results → suggest filter relaxation and show exploration tile.
- Abuse: rate limit 60 q/min per seat; anomaly alerts.

---

## 12) Roadmap hooks (Phase B)
- Similarity search with `pgvector` for look‑alikes.
- Learning‑to‑rank from shortlist outcomes.
- Org‑specific custom boosts and pinned lists.

