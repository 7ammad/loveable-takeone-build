
## ## The Digital Twin: Final Implementation Guide (Cursor-Ready)

### ### 1. Core Objective & Strategic Mandate

**Objective:** To solve the "cold start" marketplace problem by programmatically aggregating all public casting calls in Saudi Arabia, thereby providing overwhelming value to **Talent** from Day 1. This initial user base of Talent will, in turn, attract **Hirers**, creating a virtuous cycle of growth.

**Strategic Mandate (from `TAKEONE_PRD_v1.0.md`):**
* **Primary Value Prop:** "All Saudi casting opportunities in one place" [cite: TAKEONE_PRD_v1.0.md].
* **Launch Requirement:** Pre-populate the platform with 500+ casting opportunities to demonstrate immediate, comprehensive market coverage [cite: TAKEONE_PRD_v1.0.md].
* **Competitive Edge:** Use the aggregated data as a unique B2B asset, providing market intelligence to Hirers that no competitor can offer [cite: TAKEONE_PRD_v1.0.md].

### ### 2. Technical Architecture & Data Flow

This is the technical heart of the Digital Twin, built entirely on the production-ready infrastructure detailed in the `BACKEND_BUILD_REPORT.md` [cite: BACKEND_BUILD_REPORT.md].



**Component Breakdown:**

* **A. Ingestion Source Control (`IngestionSource` Model):**
    * **Purpose:** The master control table for all data sources.
    * **Schema Reference:** The exact `IngestionSource` schema defined in your `BACKEND_BUILD_REPORT.md` [cite: BACKEND_BUILD_REPORT.md].
    * **Management:** Via the Admin Dashboard.

* **B. The Orchestrator Services (Scheduled Cron Jobs):**
    * **Web Orchestrator:**
        * **Trigger:** Runs every 4 hours.
        * **Action:** Fetches active `WEB` sources, calls the **FireCrawl API**, and pushes raw Markdown to the `scraped-roles` queue.
    * **WhatsApp Orchestrator:**
        * **Trigger:** Runs every 15 minutes.
        * **Action:** Fetches active `WHATSAPP` sources, calls the **Whapi.cloud API**, and pushes raw messages to the `whatsapp-messages` queue.

* **C. The Processing Queues (`core-queue` package using BullMQ):**
    * **`scraped-roles` & `whatsapp-messages` Queues:**
        * **Purpose:** To handle initial, raw data ingestion from their respective sources.
        * **Worker Logic:** The two workers (`scraped-role-worker.ts` and `whatsapp-message-worker.ts`) [cite: BACKEND_BUILD_REPORT.md] will take the raw data, pass it to the **OpenAI GPT-4 API** for structured data extraction (targeting the `CastingCall` schema), and then push the resulting clean JSON to the central `validation` queue.

    * **`validation` Queue (The Final Funnel):**
        * **Purpose:** To deduplicate, validate, and persist all structured data.
        * **Worker Logic:**
            1.  Takes structured JSON from the job.
            2.  Generates an MD5 **`contentHash`**.
            3.  Queries the `CastingCall` table for an existing record with the same hash.
            4.  If unique, it uses the Prisma client from the `core-db` package [cite: BACKEND_BUILD_REPORT.md] to create a new `CastingCall` record with `status: "pending_review"` and `isAggregated: true`.

* **D. The Data Sink (`CastingCall` Model):**
    * **Purpose:** The single source of truth for all casting data.
    * **Schema Reference:** The final `CastingCall` schema defined in your `BACKEND_BUILD_REPORT.md`, which includes all necessary fields like `status`, `sourceUrl`, `contentHash`, and `isAggregated` [cite: BACKEND_BUILD_REPORT.md].

### ### 3. Operational Workflow: The Admin Quality Control Loop

This workflow ensures that the automated data meets TakeOne's high standards before being published.

* **The Admin Validation Queue:**
    * **Interface:** A dedicated page in the Admin Dashboard, built using the `core-admin` package services [cite: BACKEND_BUILD_REPORT.md]. It displays a list of all `CastingCall` records with `status: "pending_review"`.
    * **Admin Actions:**
        1.  **Approve:** Changes status to `"active"`. This action triggers a call to the `core-search` package to index the record in **Algolia**, making it live.
        2.  **Edit & Approve:** Allows correction of AI extraction errors.
        3.  **Reject:** Changes status to `"rejected"`.

* **The Scaling Strategy:**
    * **Phase 1 (Launch):** 100% manual approval.
    * **Phase 2 (Post-Launch):** Implement a "Trusted Source" flag to auto-approve content from high-quality sources.
    * **Phase 3 (Scale):** Implement an AI-driven "Confidence Score" to automate 90%+ of the approval workflow.

### ### 4. Product & Go-to-Market Integration

This section details how the Digital Twin is exposed to users, turning our technical advantage into a powerful GTM weapon as defined in the `TAKEONE_PRD_v1.0.md` [cite: TAKEONE_PRD_v1.0.md].

* **For Talent (The Hook):**
    * **Homepage:** The **"Live Platform Feed"** is the primary element on the `/talent` landing page, showcasing real, aggregated casting calls. This immediately proves the core value prop: **"All the Roles. In One Place."**
    * **Onboarding:** The user's first experience post-signup is the live, searchable feed, powered by the `GET /search/talent` endpoint which queries the Algolia index [cite: BACKEND_BUILD_REPORT.md].

* **For Hirers (The Bridge to Monetization):**
    * **"Claim This Casting Call":** Every aggregated casting call (`isAggregated: true`) will feature a prominent "Are you the owner of this project? Claim it now" CTA.
    * **Claiming Workflow:**
        1.  Hirer clicks "Claim" and is directed to the `POST /auth/register` or `POST /auth/login` flow [cite: BACKEND_BUILD_REPORT.md].
        2.  After a simple verification (e.g., email confirmation), the backend associates the `CastingCall` with their new `User` ID and sets `isAggregated` to `false`.
        3.  The Hirer is now onboarded and can manage applicants for their claimed role directly within the TakeOne dashboard, transitioning them into the paid ecosystem (`Studio Tier` subscription) [cite: TAKEONE_PRD_v1.0.md].
    * **B2B Value Proposition:** The aggregated data is used as a premium feature for subscribed Hirers, providing market intelligence such as casting trends and salary benchmarks, as outlined in the GTM strategy [cite: TAKEONE_PRD_v1.0.md].