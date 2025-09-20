# Media Pipeline & Content Safety Spec (v3.0, MVP) — Saudi Casting

> Scope: Upload → Process → Store → Deliver for headshots, reels, and self‑tapes. Includes watermarking, moderation, PDPL controls, quotas, failure handling, and observability. Aligns to PRD v3.0 and ERD/OpenAPI v3.0.

---

## 1) Objectives & Constraints
- **Security**: Zero public buckets, pre‑signed uploads, least‑privilege access.
- **Safety**: Automated + human moderation; protect minors; ban sensitive content.
- **Performance**: p95 time‑to‑first‑play ≤ 6s for 1080p self‑tapes on broadband.
- **Cost**: Transcode on demand; cold storage after 90d for large assets.
- **Policy**: PDPL residency in KSA region where available; consent tracking; auditability.

---

## 2) Supported Media Types (MVP)
- **Images**: JPG/PNG/WebP; max 10 MB per headshot; recommended 3:4 portrait.
- **Video**: MP4 (H.264/AAC), MOV; max **1 GB** per self‑tape; duration ≤ 3 min (system hint; not enforced hard except for tapes where job brief may cap at 90s).
- **Audio**: MP3/M4A (optional, voice demos) up to 20 MB.

---

## 3) Upload Flow
1) Client requests pre‑signed URL via `POST /media/uploads` with `mime` and `size`.
2) Server validates MIME/size limits, issues URL with short TTL (5 min), plus target `file_url`.
3) Client uploads directly to object storage.
4) Client notifies server with `file_url` → creates `Attachment` record with `ingest_status=Pending`.
5) **Ingest worker** triggers: virus scan → basic metadata → enqueue transcode if video.

**Resumable uploads**: Use multipart for files > 50 MB; client can resume.

**Guardian path**: uploads on minor profiles inherit stricter defaults (`visibility=verified_hirers_only`).

---

## 4) Processing
### 4.1 Virus Scan
- ClamAV or equivalent in isolated worker; quarantine on detection; notify user and admin.

### 4.2 Transcoding (Video)
- Renditions: 1080p, 720p, 480p HLS.
- Audio: AAC‑LC 128 kbps.
- Thumbnails: JPEG/WebP at 720p width; face‑aware crop when possible.
- Aspect fidelity: preserve source, pad to letterbox only if needed.

### 4.3 Watermarking
- Default **on** for self‑tapes and audition materials.
- Text: brand + role_id + asset_id + timecode; diagonal, 24–32 px, 40% opacity.
- Anti‑crop: 4 corner tags + center faint stamp.
- Applied during transcode; flag stored on `Attachment.watermark_flag=true`.

### 4.4 Metadata
- Extract codec, duration, resolution, bitrate; store in `Attachment`.
- Store perceptual hash (pHash) for dedupe and leak tracing.

---

## 5) Moderation & Review
### 5.1 Automated
- NSFW, violence, hate, self‑harm classifiers; Arabic/English OCR for on‑screen text.
- Policy ruleset: block explicit nudity; escalate borderline to human.
- Minor profiles: any adult themes → auto reject; log incident.

### 5.2 Human Queue
- **/admin/moderation/queue** lists `Pending` items with preview, metadata, auto flags.
- Reviewer actions: Approve, Reject (reason preset + free text), Request Re‑upload.
- All actions write to `AuditEvent`.

### 5.3 Exposure Rules
- Unapproved media **not** visible in public search; visible to owner only.
- Self‑tapes can be viewed by assigned hirers pre‑approval if risk score low; watermark mandatory.

---

## 6) Storage & Delivery
- **Buckets**: `uploads` (private), `processed` (private), `thumbs` (private), `share` (signed for shortlist viewer only).
- **Access**: Pre‑signed GET for direct owner; streaming via tokenized HLS for hirers.
- **CDN**: Edge caching with signed cookies; TTL 7d; purge on moderation change.
- **Residency**: primary region in KSA; cross‑region replica optional for DR with server‑side encryption.
- **Lifecycle**:
  - Raw uploads → delete after 7d post‑transcode.
  - Self‑tapes → move to infrequent access after 30d; archive after 180d unless linked to active role.

---

## 7) Privacy & Compliance (PDPL)
- **Purpose binding**: tag each asset with purpose (profile_media | audition | compliance_doc).
- **Consent**: record user consent at upload; guardian consent for minors.
- **Subject rights**: delete or export on verified request; audit trail preserved.
- **Minors**: default visibility restricted; no public links; only guardian can delete or share.

---

## 8) Quotas & Limits
- Talent: up to 10 headshots, 3 reels; per‑asset 1 GB cap for video.
- Self‑tape per application: exactly 1 active submission; re‑submit only if reopened by hirer.
- Hirer shortlist share: link expires (default 7d, max 30d); access logged.

---

## 9) Failure Handling
- Upload fails: client retry with backoff; server provides new pre‑signed URL.
- Transcode fails: mark `processing_error`, notify user with guidance; keep source for 7d.
- Moderation timeouts: default to **Pending** → not publicly visible.
- CDN errors: fallback to origin with signed URL; alarm if sustained > 2 min.

---

## 10) Observability & SLOs
- Metrics: upload success rate, p95 time‑to‑first‑play, moderation turnaround, rejection rate, CDN hit ratio, storage growth.
- Alerts: virus detections, transcode queue delay, moderation backlog, unusual access bursts on `share` bucket.
- SLOs: upload p95 failure < 1%; moderation median < 4h; transcode start < 2 min.

---

## 11) API Surfaces
- `POST /media/uploads` → pre‑signed URL.
- `POST /applications/{id}/self-tape/submit` → link asset.
- `GET /admin/moderation/queue` → review list.
- `PATCH /admin/moderation/items/{id}` → approve/reject.
- Webhooks: `media.ingested`, `media.transcoded`, `media.flagged`, `media.approved`.

---

## 12) Security Measures
- WAF on upload endpoints; MIME sniffing; size enforcement server‑side.
- Signed HLS manifests; token rotation every 24h.
- IP/device fingerprinting; rate limiting on downloads.
- Prevent hotlinking: signed CDN URLs only.

---

## 13) Roadmap hooks (Phase B)
- Optional **e‑signature** overlays on final deliverables.
- Automated speech‑to‑text for reels; Arabic captions.
- Talent consent receipts for third‑party sharing.

