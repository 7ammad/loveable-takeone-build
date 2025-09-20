# Saudi Casting Marketplace — ERD + OpenAPI (v3.0, MVP)

> Scope: Aligns with PRD v3.0. Subscriptions for hirers, Nafath pre‑application gate, guardian‑primary model for minors, concierge compliance, self‑tape requests (one per application), saved searches, shortlist share links, and “Viewed by Hirer” tracking. No on‑platform contracts/payments.

---

## 1) Entity–Relationship Diagram (textual)

**Org** (id, name, type, vat_no)
- 1–N **OrgMembership** (id, org_id, user_id, role[OrgAdmin|CastingLead|Reviewer|Compliance]) → **User**

**User** (id, email, phone, role[Admin|Casting|Talent|Guardian], status[Active|Suspended|Pending])
- 1–1 **Identity** (user_id, nafath_status[Unverified|Pending|Verified], verified_at, doc_type, doc_hash, expiry_at)
- 1–1 **TalentProfile** (user_id, guardian_user_id?, is_minor, display_name, bio, languages[], skills[], attributes_json, city, availability_json, media_assets[])
- N–N via **OrgMembership** to **Org** (for Casting users only)

**CastingCall** (id, org_id?, project_name, city, start_at, end_at, status[Draft|Open|Closed], created_by)
- 1–N **Role** (id, casting_call_id, title, description, age_min, age_max, gender[Any|Male|Female], languages[], skills[], paid, audition_type[SelfTape|InPerson|Virtual], constraints_json, rate_guidance)

**Application** (id, role_id, talent_user_id, status[Applied|Shortlist|Contacted|Rejected|Withdrawn], viewed_by_hirer_at?, notes, scores_json, self_tape_asset_id?, self_tape_status[NotRequested|Requested|Submitted|Rejected|Viewed], self_tape_requested_at?, self_tape_submitted_at?)
- FK → **User** (talent_user_id)
- FK → **Role** (role_id)

**ComplianceItem** (id, subject_type[User|Org|Role|Application], subject_id, document_type, file_asset_id, status[Requested|Submitted|Approved|Rejected], reviewer_user_id?, comments, version, expiry_at)

**Subscription** (id, hirer_user_id, plan_id, status[Active|PastDue|Cancelled], started_at, renews_at)
**Plan** (id, code, name, price_month, price_year, limits_json)

**SavedSearch** (id, user_id, name, params_json, channels[email|sms][], active, created_at)

**ShareLink** (id, entity_type[Shortlist|Role], entity_id, token, expires_at, access_log_json[], created_by)

**MessageThread** (id, context_type[CastingCall|Role|Application], context_id)
- 1–N **Message** (id, thread_id, sender_user_id, body, attachments[])

**Attachment** (id, file_url, mime, size, watermark_flag)

**AuditEvent** (id, actor_user_id, action, entity_type, entity_id, diff_json, ip, ua, created_at)

Indexes: (role_id,status), (talent_user_id,status), trigram/Arabic FT on TalentProfile.bio and Role.description; partial index on Application.viewed_by_hirer_at IS NOT NULL.

---

## 2) OpenAPI 3.1 — High‑level spec (YAML)

```yaml
openapi: 3.1.0
info:
  title: Saudi Casting API
  version: 0.3.0
  description: MVP API aligned to PRD v3.0. JWT auth. Field-level permissions for PII.
servers:
  - url: https://api.saudi-casting.local/v1
security:
  - bearerAuth: []
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  parameters:
    Page:
      name: page
      in: query
      schema: { type: integer, minimum: 1, default: 1 }
    PageSize:
      name: page_size
      in: query
      schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
  responses:
    Error:
      description: Error response
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
  schemas:
    User:
      type: object
      properties:
        id: { type: string }
        email: { type: string, format: email }
        phone: { type: string }
        role: { type: string, enum: [Admin, Casting, Talent, Guardian] }
        status: { type: string, enum: [Active, Suspended, Pending] }
    Identity:
      type: object
      properties:
        nafath_status: { type: string, enum: [Unverified, Pending, Verified] }
        verified_at: { type: string, format: date-time, nullable: true }
    TalentProfile:
      type: object
      properties:
        user_id: { type: string }
        guardian_user_id: { type: string, nullable: true }
        is_minor: { type: boolean }
        display_name: { type: string }
        bio: { type: string }
        languages: { type: array, items: { type: string } }
        skills: { type: array, items: { type: string } }
        attributes: { type: object, additionalProperties: true }
        city: { type: string }
        availability: { type: object, additionalProperties: true }
        media_assets: { type: array, items: { $ref: '#/components/schemas/Attachment' } }
    CastingCall:
      type: object
      properties:
        id: { type: string }
        org_id: { type: string, nullable: true }
        project_name: { type: string }
        city: { type: string }
        start_at: { type: string, format: date-time }
        end_at: { type: string, format: date-time }
        status: { type: string, enum: [Draft, Open, Closed] }
    Role:
      type: object
      properties:
        id: { type: string }
        casting_call_id: { type: string }
        title: { type: string }
        description: { type: string }
        age_min: { type: integer }
        age_max: { type: integer }
        gender: { type: string, enum: [Any, Male, Female] }
        languages: { type: array, items: { type: string } }
        skills: { type: array, items: { type: string } }
        paid: { type: boolean }
        audition_type: { type: string, enum: [SelfTape, InPerson, Virtual] }
        constraints_json: { type: object, additionalProperties: true }
        rate_guidance: { type: string, nullable: true }
    Application:
      type: object
      properties:
        id: { type: string }
        role_id: { type: string }
        talent_user_id: { type: string }
        status: { type: string, enum: [Applied, Shortlist, Contacted, Rejected, Withdrawn] }
        viewed_by_hirer_at: { type: string, format: date-time, nullable: true }
        self_tape_asset_id: { type: string, nullable: true }
        self_tape_status: { type: string, enum: [NotRequested, Requested, Submitted, Rejected, Viewed] }
        self_tape_requested_at: { type: string, format: date-time, nullable: true }
        self_tape_submitted_at: { type: string, format: date-time, nullable: true }
        scores_json: { type: object, additionalProperties: true }
    ComplianceItem:
      type: object
      properties:
        id: { type: string }
        subject_type: { type: string, enum: [User, Org, Role, Application] }
        subject_id: { type: string }
        document_type: { type: string }
        status: { type: string, enum: [Requested, Submitted, Approved, Rejected] }
        expiry_at: { type: string, format: date-time, nullable: true }
    Subscription:
      type: object
      properties:
        id: { type: string }
        plan_id: { type: string }
        status: { type: string, enum: [Active, PastDue, Cancelled] }
        started_at: { type: string, format: date-time }
        renews_at: { type: string, format: date-time }
    Plan:
      type: object
      properties:
        id: { type: string }
        code: { type: string }
        name: { type: string }
        price_month: { type: number }
        price_year: { type: number }
        limits_json: { type: object, additionalProperties: true }
    SavedSearch:
      type: object
      properties:
        id: { type: string }
        user_id: { type: string }
        name: { type: string }
        params_json: { type: object, additionalProperties: true }
        channels: { type: array, items: { type: string, enum: [email, sms] } }
        active: { type: boolean }
    ShareLink:
      type: object
      properties:
        id: { type: string }
        entity_type: { type: string, enum: [Shortlist, Role] }
        entity_id: { type: string }
        token: { type: string }
        expires_at: { type: string, format: date-time }
    Attachment:
      type: object
      properties:
        file_url: { type: string }
        mime: { type: string }
        size: { type: integer }
        watermark_flag: { type: boolean }
    Error:
      type: object
      properties:
        code: { type: string }
        message: { type: string }
        details: { type: object, additionalProperties: true }
paths:
  /auth/login:
    post:
      summary: Login with email/OTP or SSO
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email: { type: string }
                otp: { type: string }
              required: [email]
      responses:
        '200':
          description: Tokens
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token: { type: string }
                  refresh_token: { type: string }
        default: { $ref: '#/components/responses/Error' }

  /auth/nafath/start:
    post:
      summary: Initiate Nafath verification flow
      security: [{ bearerAuth: [] }]
      responses:
        '200': { description: Challenge issued }

  /auth/nafath/callback:
    post:
      summary: Finalize Nafath verification
      security: [{ bearerAuth: [] }]
      responses:
        '200': { description: Identity updated, user marked Verified }

  /users/me:
    get:
      summary: Get current user
      security: [{ bearerAuth: [] }]
      responses:
        '200': { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/User' } } } }

  /talent-profiles:
    get:
      summary: Search talent profiles
      parameters:
        - $ref: '#/components/parameters/Page'
        - $ref: '#/components/parameters/PageSize'
        - name: q
          in: query
          schema: { type: string }
        - name: language
          in: query
          schema: { type: string }
        - name: city
          in: query
          schema: { type: string }
        - name: age_min
          in: query
          schema: { type: integer }
        - name: age_max
          in: query
          schema: { type: integer }
      responses:
        '200':
          description: List
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/TalentProfile' }
                  page: { type: integer }
                  page_size: { type: integer }
                  total: { type: integer }
    post:
      summary: Create/update own talent profile
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/TalentProfile' }
      responses:
        '200': { description: Saved }

  /casting-calls:
    get:
      summary: List casting calls
      parameters:
        - $ref: '#/components/parameters/Page'
        - $ref: '#/components/parameters/PageSize'
        - name: status
          in: query
          schema: { type: string, enum: [Draft, Open, Closed] }
      responses:
        '200':
          description: List
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/CastingCall' }
                  page: { type: integer }
                  page_size: { type: integer }
                  total: { type: integer }
    post:
      summary: Create casting call (requires subscription)
      security: [{ bearerAuth: [] }]
      responses:
        '201': { description: Created }

  /casting-calls/{id}:
    get:
      summary: Get casting call by id
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        '200': { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/CastingCall' } } } }

  /casting-calls/{id}/roles:
    post:
      summary: Add role (requires subscription)
      security: [{ bearerAuth: [] }]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/Role' }
      responses:
        '201': { description: Created }

  /roles/{id}/applications:
    get:
      summary: List applications for a role
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
        - $ref: '#/components/parameters/Page'
        - $ref: '#/components/parameters/PageSize'
      responses:
        '200':
          description: List
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/Application' }
                  page: { type: integer }
                  page_size: { type: integer }
                  total: { type: integer }

  /applications:
    post:
      summary: Apply to role (requires Nafath verification or guardian verification)
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                role_id: { type: string }
                note: { type: string }
                self_tape_asset_id: { type: string, nullable: true }
              required: [role_id]
      responses:
        '201': { description: Created, content: { application/json: { schema: { $ref: '#/components/schemas/Application' } } } }

  /applications/{id}/status:
    patch:
      summary: Update application status (hirer)
      security: [{ bearerAuth: [] }]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  enum: [Shortlist, Contacted, Rejected, Withdrawn]
      responses:
        '200': { description: Updated }

  /applications/{id}/events/viewed:
    post:
      summary: Mark application as viewed by hirer (auto or explicit)
      security: [{ bearerAuth: [] }]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        '200': { description: Timestamp recorded }

  /applications/{id}/self-tape/request:
    post:
      summary: Request a self‑tape (one per application)
      security: [{ bearerAuth: [] }]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        '201': { description: Request created }

  /applications/{id}/self-tape/submit:
    post:
      summary: Submit self‑tape
      security: [{ bearerAuth: [] }]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                asset_id: { type: string }
              required: [asset_id]
      responses:
        '201': { description: Submitted }

  /compliance/items:
    post:
      summary: Create compliance document request (hirer/admin)
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                subject_type: { type: string, enum: [User, Org, Role, Application] }
                subject_id: { type: string }
                document_type: { type: string }
              required: [subject_type, subject_id, document_type]
      responses:
        '201': { description: Created, content: { application/json: { schema: { $ref: '#/components/schemas/ComplianceItem' } } } }

  /compliance/items/{id}:
    patch:
      summary: Update compliance item status (admin)
      security: [{ bearerAuth: [] }]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                status: { type: string, enum: [Submitted, Approved, Rejected] }
                comments: { type: string }
      responses:
        '200': { description: Updated }

  /subscriptions/plans:
    get:
      summary: List public plans
      responses:
        '200': { description: OK, content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Plan' } } } } }

  /subscriptions:
    post:
      summary: Start or change subscription (hirer)
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                plan_id: { type: string }
              required: [plan_id]
      responses:
        '201': { description: Created, content: { application/json: { schema: { $ref: '#/components/schemas/Subscription' } } } }
    get:
      summary: Get my subscription (hirer)
      security: [{ bearerAuth: [] }]
      responses:
        '200': { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/Subscription' } } } }

  /saved-searches:
    get:
      summary: List my saved searches
      security: [{ bearerAuth: [] }]
      responses:
        '200': { description: OK, content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/SavedSearch' } } } } }
    post:
      summary: Create a saved search
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/SavedSearch' }
      responses:
        '201': { description: Created }
  /saved-searches/{id}:
    delete:
      summary: Delete saved search
      security: [{ bearerAuth: [] }]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        '204': { description: Deleted }

  /roles/{id}/shortlist/share:
    post:
      summary: Create a time‑bound shortlist share link
      security: [{ bearerAuth: [] }]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        '201': { description: Created, content: { application/json: { schema: { $ref: '#/components/schemas/ShareLink' } } } }

  /share/{token}:
    get:
      summary: View shared shortlist (public read‑only)
      responses:
        '200': { description: OK }

  /media/uploads:
    post:
      summary: Get pre‑signed upload URL
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                mime: { type: string }
                size: { type: integer }
              required: [mime, size]
      responses:
        '200':
          description: Upload target
          content:
            application/json:
              schema:
                type: object
                properties:
                  upload_url: { type: string }
                  file_url: { type: string }

  /admin/moderation/queue:
    get:
      summary: List items pending moderation
      security: [{ bearerAuth: [] }]
      responses:
        '200': { description: OK }

  /audit-events:
    get:
      summary: Query audit log (admin)
      security: [{ bearerAuth: [] }]
      parameters:
        - $ref: '#/components/parameters/Page'
        - $ref: '#/components/parameters/PageSize'
      responses:
        '200': { description: OK }
```

---

## 3) Notes & Conformance to PRD v3.0
- **Guardians & Minors**: All minor actions are initiated via guardian accounts; minor profiles hidden from public contact endpoints.
- **Nafath Gate**: `/auth/nafath/*` provides the pre‑application verification flow; server must guard `/applications` accordingly.
- **Viewed by Hirer**: explicit endpoint provided; can also be set implicitly on dossier view in backend.
- **Self‑Tape**: one request per application enforced at business layer; watermark flag carried on Attachment.
- **Subscriptions**: posting/searching gated by active subscription.
- **Saved Searches & Alerts**: model supports email/SMS; alerting worker not shown in API.
- **Shortlist Share**: time‑bound tokenized links with access logging.
- **No Payments/Contracts**: deferred to Phase B.

