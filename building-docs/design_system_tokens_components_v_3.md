# Design System — Tokens & Components (v3.0, RTL‑first)

> Scope: Core tokens and components for MVP. Arabic‑first, WCAG 2.1 AA, RTL semantics, and PDPL‑aware privacy patterns.

---

## 1) Foundations
### 1.1 Color Tokens
**Palette (Base)**
- `--color-bg`: #0B0D0F (canvas dark) / #FFFFFF (light)
- `--color-surface`: #111418 / #F8FAFC
- `--color-elev-1`: #151922 / #FFFFFF
- `--color-brand`: #006C67 (primary teal)
- `--color-brand-600`: #00524E
- `--color-accent`: #A67C00 (gold accent for highlights)
- `--color-success`: #1B9E77
- `--color-warning`: #D97706
- `--color-danger`: #B91C1C
- `--color-info`: #2563EB
- `--color-text`: #0F172A (light theme) / #E2E8F0 (dark theme)
- `--color-text-muted`: #475569 / #9BA3AF
- `--color-border`: #E2E8F0 / #222833
- `--color-overlay`: rgba(15,23,42,0.6)

**Usage**
- Primary actions: `--color-brand` background, white text, 4.5:1 contrast.
- Destructive: `--color-danger` background.
- Status chips: success/warning/danger/info backgrounds with 10% tint and 90% text.

**States**
- Hover = +6% lightness; Active = −8% lightness; Disabled = 40% opacity.

### 1.2 Typography Tokens
- `--font-arabic`: "IBM Plex Sans Arabic", fallback "Tajawal", system.
- `--font-latin`: "Inter", system.
- Scales (rem):
  - Display: 2.25
  - H1: 2.0
  - H2: 1.5
  - H3: 1.25
  - Body: 1.0
  - Small: 0.875
  - Micro: 0.75
- Line heights: 1.2 (headings), 1.6 (body AR), 1.5 (body EN).
- Weights: 600 headings, 400 body, 500 buttons.

### 1.3 Spacing & Layout
- Spacing scale: 4, 8, 12, 16, 24, 32, 40, 64 px.
- Container widths: 640, 768, 1024, 1280, 1440 px.
- Grid: 12‑col fluid; RTL-aware gutters.
- Radii: 8, 12, 16 px; buttons/cards = 12 px; modals = 16 px.
- Elevation: shadow‑sm, shadow, shadow‑lg; use elevation sparingly on dark mode.

### 1.4 Motion
- Durations: 120ms (hover), 200ms (tap), 300ms (modal).
- Easing: `cubic-bezier(0.2, 0.7, 0.2, 1)`.
- Reduce‑motion: disable parallax and large transitions.

### 1.5 Iconography
- Source: Lucide icons mirrored for RTL where directional.
- Sizes: 16, 20, 24 px.

---

## 2) Accessibility (AA)
- Minimum text contrast 4.5:1, large text 3:1.
- Focus ring: 2px outline `--color-info` at 2px offset; visible on keyboard nav.
- Hit target ≥ 44×44 px.
- Error messages paired with `aria-describedby` and programmatic focus.
- Form validation announced via `role=alert`.

---

## 3) Components
### 3.1 App Header
- Slots: Logo, Nav links (Find Talent, Find a Job), Auth actions.
- States: scrolled, mobile drawer.
- Behavior: sticky; language toggle AR/EN; LTR/RTL switch persists.

### 3.2 Split Auth Panels (Signup/Login)
- Two columns: form card + conversion panel.
- Social providers: Apple, Google; LinkedIn for Hirers.
- Legal microcopy area with PDPL notice.
- Error states for auth failures and blocked accounts.

### 3.3 Role Cards (Signup Step 1)
- Content: icon, title, one‑line description.
- Selected state elevates with brand border.
- Keyboard: arrow keys select; Enter confirms.

### 3.4 Form Controls
- Inputs, select, chips, toggles, radio.
- Validation: inline; show example formats for phone and video specs.
- Disabled vs read‑only distinction.

### 3.5 Profile Health Meter
- Scale 0–100 with thresholds: <50 red, 50–79 amber, ≥80 green.
- Tooltips suggest next best action.

### 3.6 Media Uploader
- Drag‑drop; progress bar; retry; 1 GB cap; server‑side virus scan.
- Watermark option toggle (on by default for tapes).
- Thumbnails; transcription hook reserved.

### 3.7 Job Cards & Filters
- Card: title, project, city, audition type, posted age, apply CTA.
- Filter panel: chips for language/skills, sliders for age.
- Empty state with saved search prompt.

### 3.8 Applications Table
- Columns: Role, Project, City, Status, Viewed by Hirer, Actions.
- Row actions: open dossier, submit tape, withdraw.
- Sticky header; responsive collapse to cards on mobile.

### 3.9 Self‑Tape Request & Submit
- Request modal: instructions, due date/time, file specs.
- Submit panel: uploader, preview, watermark notice.
- System sends inbox + email + optional SMS.

### 3.10 Hirer Subscription Cards
- Pricing with SAR; feature checklist; founders’ ribbon.
- Auto‑renew microcopy; terms link.
- Disabled checkout until consent checked.

### 3.11 Kanban Board (Hirer)
- Columns: New, Shortlisted, Contacted.
- Cards: headshot, key tags, verification badge, last activity.
- Drag‑drop with snap; bulk select per column.

### 3.12 Shortlist Share Viewer
- Read‑only grid; watermark overlay on media.
- Banner: expiry countdown; report abuse link.
- Access log indicator for owners.

### 3.13 Talent Search Grid (Hirer)
- Grid with verified badge; quick invite.
- Explainability side panel: hard matches on top.

### 3.14 Admin Queues
- Moderation list with reason presets; approve/reject.
- Compliance checklist with versioning.
- Audit log with filters and CSV export.

---

## 4) Patterns & States
- **Verification Gate:** Apply CTA disabled with tooltip and link to start Nafath.
- **Guardian Control:** Minor profiles hidden; actions proxied via guardian.
- **Subscription Enforcement:** Post/Search/Contact behind active plan.
- **Empty States:** Always pair with primary action. Example: "لا توجد طلبات بعد — ابدأ بالتقديم".
- **Error States:** Provide recovery path and support link.
- **Loading:** Skeletons for lists, shimmer for cards.

---

## 5) Layout & Breakpoints
- Mobile ≤ 640, Tablet 641–1024, Desktop ≥ 1025.
- Drawer navigation on mobile; persistent sidebar on desktop dashboards.

---

## 6) Resources & Handoffs
- Token JSON export for web and mobile (Figma variables map included).
- Icon library list and usage guidelines.
- Accessibility checklist per component.
- Sample pages: Homepage, Signup, Talent Dashboard, Hirer Funnel, Shortlist Viewer.

