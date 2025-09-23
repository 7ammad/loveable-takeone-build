import { prisma } from '@/packages/core-db/src/client';
import { addToOutbox } from '@/packages/core-queue/src/outbox';

const GRACE_PERIOD_DAYS = 7; // 7 days grace period for past due subscriptions

/**
 * Handles subscription lifecycle events
 */
export class BillingService {
  /**
   * Processes a payment failure for a subscription
   */
  static async handlePaymentFailure(subscriptionId: string, failureReason: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Move to past_due status
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'past_due' },
    });

    // Add status event
    await prisma.subscriptionStatusEvent.create({
      data: {
        subscriptionId,
        fromStatus: subscription.status,
        toStatus: 'past_due',
      },
    });

    // Schedule grace period check
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_DAYS);

    await addToOutbox('BillingEvent', {
      type: 'grace_period_started',
      subscriptionId,
      userId: subscription.userId,
      gracePeriodEnd: gracePeriodEnd.toISOString(),
      failureReason,
    });

    return { gracePeriodEnd };
  }

  /**
   * Processes successful payment for a subscription
   */
  static async handlePaymentSuccess(subscriptionId: string, paymentId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const fromStatus = subscription.status;

    // Reactivate subscription
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'active' },
    });

    // Add status event
    await prisma.subscriptionStatusEvent.create({
      data: {
        subscriptionId,
        fromStatus,
        toStatus: 'active',
      },
    });

    await addToOutbox('BillingEvent', {
      type: 'subscription_reactivated',
      subscriptionId,
      userId: subscription.userId,
      paymentId,
    });
  }

  /**
   * Checks for subscriptions that have exceeded grace period and downgrades them
   */
  static async processExpiredGracePeriods() {
    const expiredGracePeriod = new Date();
    expiredGracePeriod.setDate(expiredGracePeriod.getDate() - GRACE_PERIOD_DAYS);

    // Find subscriptions that became past_due more than GRACE_PERIOD_DAYS ago
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'past_due',
      },
      include: {
        events: {
          orderBy: { at: 'desc' },
          take: 1,
        },
      },
    });

    // Filter subscriptions where the most recent status change to past_due was more than grace period ago
    const trulyExpiredSubscriptions = expiredSubscriptions.filter(sub => {
      const latestEvent = sub.events[0];
      return latestEvent && latestEvent.toStatus === 'past_due' && latestEvent.at < expiredGracePeriod;
    });

    for (const subscription of trulyExpiredSubscriptions) {
      await this.downgradeSubscription(subscription.id);
    }

    return trulyExpiredSubscriptions.length;
  }

  /**
   * Downgrades a subscription (cancels or moves to free tier)
   */
  static async downgradeSubscription(subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      return;
    }

    // Cancel the subscription
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'canceled' },
    });

    // Add status event
    await prisma.subscriptionStatusEvent.create({
      data: {
        subscriptionId,
        fromStatus: subscription.status,
        toStatus: 'canceled',
      },
    });

    await addToOutbox('BillingEvent', {
      type: 'subscription_canceled',
      subscriptionId,
      userId: subscription.userId,
      reason: 'grace_period_expired',
    });
  }

  /**
   * Extends subscription end date after successful renewal
   */
  static async extendSubscription(subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription || !subscription.plan) {
      throw new Error('Subscription or plan not found');
    }

    const newEndDate = new Date(subscription.endDate);

    // Extend based on plan type
    if (subscription.plan.name.toLowerCase().includes('monthly')) {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    } else {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    }

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { endDate: newEndDate },
    });

    await addToOutbox('BillingEvent', {
      type: 'subscription_extended',
      subscriptionId,
      userId: subscription.userId,
      newEndDate: newEndDate.toISOString(),
    });

    return { newEndDate };
  }
}

/**
 * Processes billing events from the outbox
 */
export async function processBillingEvent(eventData: any) {
  const { type, subscriptionId, userId } = eventData;

  switch (type) {
    case 'grace_period_started':
      console.log(`Grace period started for subscription ${subscriptionId}, user ${userId}`);
      // Could send email notification here
      break;

    case 'subscription_reactivated':
      console.log(`Subscription reactivated: ${subscriptionId}, user ${userId}`);
      // Could send reactivation confirmation
      break;

    case 'subscription_canceled':
      console.log(`Subscription canceled: ${subscriptionId}, user ${userId}`);
      // Could send cancellation notification
      break;

    case 'subscription_extended':
      console.log(`Subscription extended: ${subscriptionId}, user ${userId}`);
      // Could send renewal confirmation
      break;

    default:
      console.warn(`Unknown billing event type: ${type}`);
  }
}
