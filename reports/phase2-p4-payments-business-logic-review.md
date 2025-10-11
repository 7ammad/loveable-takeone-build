# Phase 2 P4: Payments & Business Logic Review
**Project:** TakeOne  
**Date:** October 10, 2025  
**Priority:** P4 (Payments & Critical Business Logic)  
**Status:** ✅ COMPLETED

---

## Executive Summary

Payment integration is **basic but functional** for subscriptions only. **NO transaction/booking payment system exists** - this is a critical business logic gap. Moyasar webhook handling needs signature validation. Overall business logic is sound but incomplete for full marketplace functionality.

### Overall Rating: **6.0/10** ⚠️ INCOMPLETE

**Strengths:**
- ✅ Moyasar client properly configured
- ✅ Billing service handles subscription lifecycle
- ✅ Webhook signature validation pattern exists (Whapi)
- ✅ Outbox pattern for reliable event processing

**Critical Gaps:**
- 🔴 **NO booking/transaction payment system** (blocking revenue)
- 🔴 **NO escrow system** for talent payments
- 🔴 **NO Moyasar webhook handler** (payment confirmations not processed)
- ⚠️ No refund handling
- ⚠️ No platform commission capture (5% per PRD)

---

## 1. Moyasar Integration Analysis

### 1.1 Client Configuration ✅ BASIC

**File:** `packages/core-payments/src/moyasar-client.ts`

```typescript
const MOYASAR_API_KEY = process.env.MOYASAR_API_KEY!;
const MOYASAR_API_URL = 'https://api.moyasar.com/v1';

const moyasarClient = axios.create({
  baseURL: MOYASAR_API_URL,
  headers: {
    'Authorization': `Basic ${Buffer.from(`${MOYASAR_API_KEY}:`).toString('base64')}`,
    'Content-Type': 'application/json',
  },
});
```

#### ✅ Strengths:
1. **Basic Auth** properly implemented
2. **Environment variable** for API key
3. **Base64 encoding** correct for Moyasar

#### ⚠️ Issues:

1. **Missing Methods:**
   ```typescript
   // Only has:
   - createPaymentIntent()
   
   // Missing:
   - fetchPayment()  // Get payment status
   - cancelPayment()  // Cancel pending payment
   - createSubscription()  // Recurring payments
   - refundPayment()  // Process refunds
   - listPayments()  // List transactions
   ```

2. **No Retry Logic:**
   ```typescript
   export async function createPaymentIntent(params: CreatePaymentIntentParams) {
     try {
       const response = await moyasarClient.post('/payments', params);
       return response.data;
     } catch (error) {
       // ❌ No retry on network errors
       throw new Error('Failed to create Moyasar payment intent');
     }
   }
   ```

3. **Error Handling Too Generic:**
   ```typescript
   // Current: Generic error message
   throw new Error('Failed to create Moyasar payment intent');
   
   // Better: Preserve Moyasar error details
   if (axios.isAxiosError(error)) {
     const moyasarError = error.response?.data;
     throw new MoyasarError(moyasarError.type, moyasarError.message);
   }
   ```

### 1.2 Security Analysis

#### ✅ Good:
- API key in environment (not hardcoded)
- Basic Auth properly encoded
- HTTPS enforced (Moyasar API URL)

#### 🔴 CRITICAL: NO Webhook Handler

**File:** NOT FOUND - `app/api/v1/webhooks/moyasar/route.ts` **DOES NOT EXIST**

**Impact:** Payment confirmations NOT processed!

**What's Missing:**
```typescript
// REQUIRED FILE: app/api/v1/webhooks/moyasar/route.ts

import crypto from 'crypto';

function verifyMoyasarSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-moyasar-signature');
  const rawBody = await req.text();
  const webhookSecret = process.env.MOYASAR_WEBHOOK_SECRET!;
  
  // 1. Verify signature
  if (!verifyMoyasarSignature(rawBody, signature!, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = JSON.parse(rawBody);
  
  // 2. Handle payment events
  switch (event.type) {
    case 'payment.paid':
      await handlePaymentSuccess(event.data);
      break;
    case 'payment.failed':
      await handlePaymentFailure(event.data);
      break;
    case 'payment.refunded':
      await handlePaymentRefund(event.data);
      break;
  }
  
  return NextResponse.json({ received: true });
}
```

**Current Risk:** Payments processed but NOT confirmed in database!

---

## 2. Business Logic Gaps 🔴 CRITICAL

### 2.1 NO Booking Payment System

**Current State:** Subscription payments ONLY

**Missing System:**
- ❌ Booking creation with payment
- ❌ Escrow for talent payments
- ❌ Platform commission (5%)
- ❌ Payment release after job completion
- ❌ Refund mechanism

**Required Models (NOT IN DATABASE):**
```prisma
model BookingPayment {
  id              String   @id @default(cuid())
  bookingId       String   @unique
  amount          Int      // Total amount in halalas
  platformFee     Int      // 5% commission
  talentPayout    Int      // Amount to talent
  status          String   // pending, escrowed, released, refunded
  moyasarPaymentId String?  @unique
  escrowedAt      DateTime?
  releasedAt      DateTime?
  refundedAt      DateTime?
  createdAt       DateTime @default(now())
  
  booking         AuditionBooking @relation(...)
}

model Payout {
  id            String   @id @default(cuid())
  talentUserId  String
  amount        Int
  status        String   // pending, processing, completed, failed
  paymentIds    String[]  // IDs of BookingPayments included
  requestedAt   DateTime @default(now())
  processedAt   DateTime?
  
  talent        User     @relation(...)
}
```

**Required APIs (NOT IMPLEMENTED):**
```
POST   /api/v1/bookings/{id}/payment/create
POST   /api/v1/bookings/{id}/payment/release
GET    /api/v1/payouts/balance
POST   /api/v1/payouts/request
POST   /api/v1/payments/refund
```

**Business Impact:** CANNOT GENERATE TRANSACTION REVENUE (blocking PRD goal)

---

### 2.2 Billing Service Analysis ✅ GOOD

**File:** `packages/core-payments/src/billing-service.ts`

#### ✅ Strengths:

1. **Subscription Lifecycle Handling:**
   ```typescript
   - handlePaymentFailure()  // → past_due
   - handlePaymentSuccess()  // → active
   - processExpiredGracePeriods()  // → canceled
   - extendSubscription()  // Renewal
   ```

2. **Grace Period Implementation:** 7 days ✅
3. **Status Event Tracking:** ✅
4. **Outbox Pattern:** Reliable event processing ✅

#### ⚠️ Issues:

1. **No Transaction Usage:**
   ```typescript
   // Current: Multiple separate DB calls
   await prisma.subscription.update({ ... });
   await prisma.subscriptionStatusEvent.create({ ... });
   await addToOutbox('BillingEvent', { ... });
   
   // Risk: If outbox fails, subscription updated but no event
   
   // Better: Wrap in transaction
   await prisma.$transaction(async (tx) => {
     await tx.subscription.update({ ... });
     await tx.subscriptionStatusEvent.create({ ... });
     await addToOutbox('BillingEvent', { ... }, tx);
   });
   ```

2. **Hardcoded Plan Duration Logic:**
   ```typescript
   // Line 175: Assumes monthly/yearly from plan name
   if (subscription.plan.name.toLowerCase().includes('monthly')) {
     newEndDate.setMonth(newEndDate.getMonth() + 1);
   } else {
     newEndDate.setFullYear(newEndDate.getFullYear() + 1);
   }
   ```
   
   **Better:** Add `duration` field to Plan model

3. **No Webhook Integration:**
   - Methods exist but NOT called by webhook handler
   - Payment events must be manually triggered

---

## 3. Webhook Security Review

### 3.1 Whapi Webhook ✅ EXCELLENT EXAMPLE

**File:** `app/api/v1/webhooks/whapi/route.ts`

```typescript
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(  // ✅ Timing-safe comparison
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-webhook-signature');
  const webhookSecret = process.env.WHAPI_WEBHOOK_SECRET;
  const rawBody = await req.text();  // ✅ Raw body for signature
  
  if (webhookSecret) {
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      logger.warn('Invalid webhook signature', { signature });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }
  
  const payload = JSON.parse(rawBody);
  // ... process webhook
}
```

#### ✅ Security Best Practices:
1. **HMAC-SHA256** signature verification
2. **Timing-safe comparison** (prevents timing attacks)
3. **Raw body** used for signature (correct)
4. **Optional secret** (graceful degradation)
5. **Logs invalid attempts**

**This pattern should be reused for Moyasar webhook!**

### 3.2 Missing Moyasar Webhook 🔴 CRITICAL

**Status:** NOT IMPLEMENTED

**Required Implementation:**
1. Create `/api/v1/webhooks/moyasar/route.ts`
2. Copy Whapi signature pattern
3. Handle payment events:
   - `payment.paid` → call `BillingService.handlePaymentSuccess()`
   - `payment.failed` → call `BillingService.handlePaymentFailure()`
   - `payment.refunded` → handle refund logic

---

## 4. PCI DSS Compliance Analysis

### 4.1 Compliance Status: ✅ MOSTLY COMPLIANT

#### ✅ Good Practices:

1. **NO Card Data Storage:**
   ```prisma
   model Receipt {
     providerPaymentId String @unique  // Only Moyasar ID
     // ❌ No card numbers, CVV, or expiry dates
   }
   ```
   ✅ All card data handled by Moyasar (PCI Level 1 compliant)

2. **API Key Security:**
   - Stored in environment variables ✅
   - Not logged in error messages ✅
   - Basic Auth encoding ✅

3. **HTTPS Enforced:**
   - Moyasar API uses HTTPS ✅
   - Webhook endpoints use HTTPS (Vercel default) ✅

#### ⚠️ Compliance Gaps:

1. **No Receipt Encryption:**
   ```prisma
   model Receipt {
     raw Json  // ❌ Full Moyasar response stored unencrypted
   }
   ```
   
   **Issue:** May contain sensitive payment method details
   
   **Fix:** Encrypt `raw` field or sanitize before storing

2. **No Payment Audit Trail:**
   - Should log all payment attempts
   - Should track refunds
   - Should monitor failed payments

3. **Missing Access Controls:**
   - Receipt model has no user relation ✅ (Fixed in DB review)
   - But no API to access receipts yet

---

## 5. Saudi Market Compliance (Moyasar-specific)

### 5.1 Currency Handling ✅ CORRECT

```typescript
interface CreatePaymentIntentParams {
  amount: number;  // in halalas
  currency: string;  // "SAR"
  description: string;
}
```

✅ **Halalas:** Smallest unit for SAR (1 SAR = 100 halalas)
✅ **No floating point:** Uses integers (avoids precision errors)

### 5.2 VAT Compliance ⚠️ MISSING

**Issue:** No VAT calculation or storage

**Saudi Requirement:** 15% VAT on services

**Fix Required:**
```prisma
model Receipt {
  amount       Int  // Total including VAT
  amountBeforeVAT Int
  vatAmount    Int  // 15%
  vatRate      Float @default(0.15)
}
```

**Business Logic:**
```typescript
const amountBeforeVAT = Math.round(baseAmount);
const vatAmount = Math.round(baseAmount * 0.15);
const totalAmount = amountBeforeVAT + vatAmount;
```

---

## 6. Error Handling & Resilience

### 6.1 Current State: ⚠️ BASIC

#### Issues Found:

1. **No Idempotency Keys:**
   ```typescript
   // Moyasar supports idempotency keys
   const response = await moyasarClient.post('/payments', {
     ...params,
     idempotency_key: generateIdempotencyKey()  // ❌ NOT IMPLEMENTED
   });
   ```
   
   **Risk:** Duplicate payments on retry

2. **No Timeout Handling:**
   ```typescript
   const moyasarClient = axios.create({
     baseURL: MOYASAR_API_URL,
     // ❌ No timeout configured
   });
   ```
   
   **Better:**
   ```typescript
   const moyasarClient = axios.create({
     baseURL: MOYASAR_API_URL,
     timeout: 30000,  // 30 seconds
     headers: { ... }
   });
   ```

3. **No Circuit Breaker:**
   - If Moyasar down, all payment attempts fail
   - Should implement circuit breaker pattern

---

## 7. Testing & Validation

### 7.1 Payment Amount Validation ⚠️ MISSING

```typescript
export async function createPaymentIntent(params: CreatePaymentIntentParams) {
  // ❌ No validation!
  const response = await moyasarClient.post('/payments', params);
}
```

**Required Validation:**
```typescript
if (params.amount <= 0) {
  throw new Error('Amount must be positive');
}
if (params.amount < 100) {  // Minimum 1 SAR
  throw new Error('Amount must be at least 1 SAR');
}
if (params.amount > 100000000) {  // Maximum 1M SAR
  throw new Error('Amount exceeds maximum');
}
if (params.currency !== 'SAR') {
  throw new Error('Only SAR currency supported');
}
```

### 7.2 Webhook Replay Attack Protection ⚠️ MISSING

**Issue:** No timestamp validation in Whapi webhook

**Fix:**
```typescript
// Check message age
if (!isMessageRecent(timestamp, 24)) {  // ✅ EXISTS
  return NextResponse.json({ skipped: 'old_message' });
}

// BUT: Need to prevent replay of recent messages
// Add: Nonce storage or timestamp + signature validation
```

---

## Critical Issues Summary

### 🔴 BLOCKING PRODUCTION:

1. **NO Moyasar Webhook Handler**
   - **Impact:** Payment confirmations not processed
   - **Effort:** 4-6 hours
   - **Priority:** CRITICAL

2. **NO Booking Payment System**
   - **Impact:** Cannot generate transaction revenue
   - **Effort:** 20-30 hours (full implementation)
   - **Priority:** CRITICAL (Business blocker)

3. **NO Escrow System**
   - **Impact:** Cannot hold/release talent payments
   - **Effort:** 15-20 hours
   - **Priority:** CRITICAL

### ⚠️ HIGH PRIORITY:

4. **Add Transaction Wrapping in Billing Service**
   - **Effort:** 2-3 hours

5. **Implement VAT Calculation**
   - **Effort:** 3-4 hours

6. **Add Payment Idempotency**
   - **Effort:** 2-3 hours

### 📝 MEDIUM PRIORITY:

7. **Add Refund Handling**
8. **Implement Audit Logging**
9. **Add Receipt Encryption**
10. **Create Payout System**

---

## Payments & Business Logic Score

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Moyasar Integration | 6.0/10 | 20% | 1.20 |
| Payment Security | 7.0/10 | 25% | 1.75 |
| Webhook Handling | 3.0/10 | 20% | 0.60 |
| Business Logic Completeness | 4.0/10 | 25% | 1.00 |
| Compliance (PCI DSS) | 7.5/10 | 10% | 0.75 |

**Overall Score: 5.3/10** 🔴 **CRITICAL GAPS**

**With Booking System: 7.5/10** ⚠️ **FUNCTIONAL**

---

## Recommendations

### Immediate (Week 1):

1. **Implement Moyasar Webhook Handler**
   - Copy Whapi signature pattern
   - Handle payment.paid/failed events
   - Test with Moyasar sandbox

2. **Add Transaction Wrapping**
   - Billing service operations
   - Payment status updates

3. **Implement VAT Calculation**
   - Add to payment intent creation
   - Store in Receipt model

### Short-term (Weeks 2-4):

4. **Build Booking Payment System**
   - Database models
   - API endpoints
   - Payment flow

5. **Implement Escrow System**
   - Hold funds
   - Release after completion
   - Platform commission capture

6. **Add Refund System**
   - Refund API
   - Partial refunds
   - Refund policies

### Long-term (Ongoing):

7. **Payout System for Talent**
8. **Payment Analytics Dashboard**
9. **Fraud Detection**
10. **Multi-currency Support** (if expanding beyond KSA)

---

**Review Completed:** Phase 2 P4 - Payments & Business Logic ✅  
**Next Phase:** Phase 2 P5 - Shared Utilities Review  
**Critical Gap:** Booking payment system must be implemented before launch

