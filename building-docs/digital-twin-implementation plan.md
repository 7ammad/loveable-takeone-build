# TakeOne "Digital Twin" - Comprehensive Implementation Plan

## Executive Summary (Updated)

This document outlines a **four-phase implementation plan** to build the "Digital Twin" aggregator for the TakeOne platform. The core strategy is to solve the marketplace "cold start" problem by using a **hybrid data ingestion model**. This model combines a **managed web scraping API (FireCrawl)**, AI-powered data extraction (OpenAI), and a specialized, **unofficial WhatsApp API (Whapi.cloud)** to automatically populate the platform with casting calls.

The plan is designed for an AI-assisted workflow with **Cursor AI**, leveraging the existing production-ready backend. The implementation is broken down into four sequential phases:

* **Phase 1: Database Foundation:** Establishes the necessary data models in the PostgreSQL database using the existing Prisma schema in the `core-db` package.
* **Phase 2: Web Scraping Automation:** Develops the core logic for fetching data from public websites using FireCrawl and processing it via the `core-queue` (BullMQ) package.
* **Phase 3: WhatsApp Ingestion Service (New):** Creates a new, **isolated service** to connect to Whapi.cloud, fetch messages from specific groups, and push them into our processing queue. This service is designed to be separate to mitigate risks associated with an unofficial API.
* **Phase 4: Admin Control & Unification:** Creates the necessary user interfaces within the **Admin Dashboard** for managing all data sources (web and WhatsApp) and validating the aggregated content in a unified queue.

The final result will be a scalable, self-populating system that provides immediate value to users by becoming the central hub for the Saudi casting ecosystem.

---

## Phase 1: The Database Foundation (Est. Time: <1 Hour)

This phase is updated to include a way to differentiate between web and WhatsApp sources.

### Task 1.1: Update the `CastingCall` Model

* **Cursor AI Prompt:**
    > "In my Prisma schema file, located in the `packages/core-db/` directory, modify the existing `CastingCall` model. Add the following fields:
    > - `status` as a `String` with a default value of `"pending_review"`
    > - `sourceUrl` as an optional `String`
    > - `contentHash` as an optional, unique `String`
    > - `isAggregated` as a `Boolean` with a default value of `true`"

### Task 1.2: Create the `IngestionSource` Model (Renamed)

* **Cursor AI Prompt:**
    > "In the same Prisma schema file, create a new model named `IngestionSource`. It should have these fields:
    > - `id` as a `String`, primary key, with a default of `cuid()`
    > - `sourceType` as a `String` (e.g., 'WEB', 'WHATSAPP')
    > - `sourceIdentifier` as a `String` (This will be the URL for 'WEB' and the Group Chat ID for 'WHATSAPP')
    > - `sourceName` as a `String` (e.g., "MBC Careers", "Riyadh Actors Group")
    > - `lastProcessedAt` as an optional `DateTime`
    > - `isActive` as a `Boolean` with a default of `true`"

### Task 1.3: Apply Database Changes

* **Cursor AI Prompt:**
    > "Generate and run a new Prisma migration to apply these schema changes to my PostgreSQL database."

---

## Phase 2: Web Scraping Automation (Est. Time: 2-3 Hours)

This phase remains the same but now uses the new `IngestionSource` model.

### Task 2.1: Build the Orchestrator Service

* **Cursor AI Prompt:**
    > "Create a new standalone Node.js script for a service called 'Orchestrator'. This script will:
    > 1.  Use Prisma to fetch all records from the `IngestionSource` table where `isActive` is true AND `sourceType` is 'WEB'.
    > 2.  Loop through each source and use its `sourceIdentifier` (the URL) to make an API call to **FireCrawl**.
    > 3.  Take the Markdown result and send it to the **OpenAI API** to extract casting call details into a JSON array.
    > 4.  For each valid JSON object returned, add a new job to my existing **`BullMQ` queue** on the 'process-scraped-role' queue. The job's payload should be the JSON object plus the original source URL."

### Task 2.2: Build the Backend Worker

* **Cursor AI Prompt:**
    > "In my `packages/core-queue/` directory, create a new BullMQ worker to process the 'process-scraped-role' queue. The worker's logic should: generate a hash, check for duplicates against `contentHash`, and if unique, save a new `CastingCall` record with a status of 'pending_review'."

### Task 2.3: Set Up the Cron Job

* **Cursor AI Prompt:**
    > "Set up a cron job to execute the 'Orchestrator' script every 4 hours."

---

## Phase 3: WhatsApp Ingestion Service (New) (Est. Time: 2-3 Hours)

This new, isolated service will handle all interactions with the unofficial Whapi.cloud API.

### Task 3.1: Create the WhatsApp Service

* **Cursor AI Prompt:**
    > "Create a new, separate Node.js service called 'WhatsappIngestor'. This service will have one main function that:
    > 1.  Uses Prisma to fetch all active `IngestionSource` records where `sourceType` is 'WHATSAPP'.
    > 2.  Loops through each source and uses its `sourceIdentifier` (the Group Chat ID) to make an API call to the **Whapi.cloud `GET/messages/list/{ChatID}` endpoint** to fetch recent messages.
    > 3.  For each message fetched, it will add a job to a **new BullMQ queue** called `process-whatsapp-message`. The payload should be the raw message content and the `sourceName`."

### Task 3.2: Create the WhatsApp Processing Worker

* **Cursor AI Prompt:**
    > "Create a new BullMQ worker to process the `process-whatsapp-message` queue. This worker will:
    > 1.  Take the raw message content and pass it to the **OpenAI API** with a prompt to determine if it is a casting call and, if so, extract the details into our standard JSON format.
    > 2.  If the AI returns valid JSON, the worker will then push that JSON object to our existing `process-scraped-role` queue, which will handle the hashing, duplicate checking, and saving."

### Task 3.3: Schedule the WhatsApp Service

* **Cursor AI Prompt:**
    > "Set up a cron job to execute the 'WhatsappIngestor' script every 15 minutes to ensure timely ingestion of new messages."

---

## Phase 4: Admin Control & Unification (Est. Time: 2-3 Hours)

This phase expands the admin UI to manage both data source types.

### Task 4.1: Create the Unified Source Management UI

* **Cursor AI Prompt:**
    > "In my **Admin Dashboard**, create a new page for managing 'Ingestion Sources'. The page must perform full CRUD on the `IngestionSource` model. When adding a new source, there must be a dropdown to select the `sourceType` ('WEB' or 'WHATSAPP'). The form should ask for a URL if 'WEB' is selected, and a Group Chat ID if 'WHATSAPP' is selected."

### Task 4.2: Use the Unified Validation Queue UI

* Since both the web and WhatsApp pipelines feed into the same `process-scraped-role` queue and result in a `CastingCall` record with a `pending_review` status, the validation queue UI we designed previously will work for both data types without any changes.