[Amplified: CoT]

***

## 🛑 STRATEGIC MANDATE OVERRIDE: One-Time Nafath Verification (Annual Policy)

**ATTENTION CURSOR AI TEAM:** This plan supersedes any prior "Nafath building status" reports. The operational directive is the transition from potentially repeated session-based checks to a **one-time, durable verification** model, supported by an explicit annual renewal policy.

This shift treats the initial Nafath transaction as the definitive **Know Your Customer (KYC)** event, prioritizing user experience (UX) and transaction velocity. Subsequently, we rely on secure application tokens for identity assurance, challenging the need for repeated, friction-heavy identity checks.

---

## 🧭 Phase 1: Foundational API Integration & Data Modeling

This phase establishes the technical foundation for persisting the verification state.

### Key Milestones & Actions

1.  **`Data Model Update`**:
    * Introduce a new column in the User Profile Database (e.g., `user_verification_status` or `nafath_verified_at`).
    * Ensure the model can securely store the **National ID** retrieved during the process, as this is the primary identity key.

2.  **`Initial Verification Flow Implementation`**:
    * Integrate the Nafath API endpoint for initial verification: ``/verify-by-nafath`` (per the ``authenticasa.docs.apiary.io/#reference``).
    * The request body requires the user's ``national_id``.

3.  **`Secure Webhook Configuration`**:
    * Configure and secure a system endpoint to receive the **Webhook Notifications** from Authentica after verification.
    * **Crucial Step:** Implement logic to verify the request's authenticity using the ``Password`` field in the payload, as suggested in the documentation.

---

## 🛠️ Phase 2: State Persistence & Tokenization

This phase implements the "one-time" logic by persisting the successful Nafath verification state and linking it to the user's session.

### Technical Implementation Steps

1.  **`Successful Verification Handling`**:
    * Upon receiving a Webhook payload with ``Status: COMPLETED``:
        * **Action 1 (Persistence):** Update the User Profile Database, setting the `user_verification_status` to `VERIFIED` and recording the `nafath_verified_at` timestamp.
        * **Action 2 (Data Retrieval):** Securely store the returned ``NationalId`` and TransactionId. *Challenging thought:* Consider using the "Nafath Verification with data Workflow" (`/nafath/request` and `/nafath/verify`) if additional user data beyond the ID is required for a complete one-time profile setup.

2.  **`Post-Verification Token Strategy`**:
    * After successful persistence, issue the user a **long-lived application token** (e.g., a **JWT**) that *includes* a claim asserting the user is **Nafath-Verified**. This token bypasses future identity checks.

3.  **`User Session Management`**:
    * For subsequent logins (e.g., via username/password or OTP), the system checks the user's `user_verification_status` in the database:
        * IF `VERIFIED`, proceed directly to the application dashboard.
        * IF `NOT VERIFIED`, initiate the Nafath verification flow.

---

## 🛡️ Phase 3: Security, Edge Cases & Rollout (Policy Update)

This phase addresses the security implications of moving from real-time verification to state-based trust, incorporating the final policy decision.

### Security & Compliance Checklist

1.  **`Re-Verification Policy` (UPDATED)**:
    * The defined policy is **Annual (12 Months)**. Re-verification is required upon expiration of the 12-month period since the last successful Nafath check. Other triggers include user device change or high-risk transactions. *This is a necessary security trade-off.*

2.  **`Stored Data Security`**:
    * Ensure the **National ID** and verification timestamps are encrypted at rest and accessible only to necessary backend services.

3.  **`Error Handling`**:
    * Implement robust retry logic for API calls and clear user messaging for `Status: REJECTED` webhook responses, directing them to troubleshooting or support.

4.  **`Rollout Plan`**:
    * **Pilot Group:** Test the new flow with a small, contained user group (e.g., Beta users).
    * **Monitoring:** Track success rates and latency of the new one-time flow against the original, repetitive flow.
    * **Full Deployment:** Roll out globally upon successful pilot completion and performance validation.

---

> **Strategist's Constructive Feedback:** The **one-time verification** model is excellent for UX, but it places the onus on our application to maintain the integrity of the verified state. We must ensure the application-issued tokens are robust and the **annual re-verification policy** is strictly enforced, balancing **convenience** with **regulatory compliance**. The **Nafath Webhook** is the single point of truth; its security is paramount.