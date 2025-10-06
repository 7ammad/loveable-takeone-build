import { sendEmail, SendEmailParams } from './email-service';
import { createNotification, getUserByEmail, getUserById } from '@packages/core-db/src/notifications';

export interface NotificationData {
  userId: string;
  type: 'new_application' | 'application_status_update' | 'casting_call_published' | 'deadline_reminder' | 'profile_completion_reminder' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  sendEmail?: boolean;
  emailLanguage?: 'en' | 'ar';
}

export interface EmailNotificationData extends NotificationData {
  emailTemplate: keyof typeof import('./templates/emails').emailTemplates;
  emailContext: Record<string, any>;
  recipientEmail: string;
  recipientName: string;
}

/**
 * Send both in-app notification and email notification
 */
export async function sendNotificationWithEmail(data: EmailNotificationData): Promise<void> {
  try {
    // 1. Create in-app notification
    await createNotification(
      data.userId,
      data.type,
      data.title,
      data.message,
      data.actionUrl,
      data.metadata
    );

    // 2. Send email notification if enabled
    if (data.sendEmail !== false) {
      await sendEmail({
        to: data.recipientEmail,
        template: data.emailTemplate,
        language: data.emailLanguage || 'en',
        context: data.emailContext,
      });
    }
  } catch (error) {
    console.error('Failed to send notification with email:', error);
    throw error;
  }
}

/**
 * Send notification for new application
 */
export async function sendNewApplicationNotification(
  casterUserId: string,
  talentName: string,
  castingCallTitle: string,
  applicationId: string,
  appliedAt: string
): Promise<void> {
  try {
    // Get caster user details
    const caster = await getUserById(casterUserId);
    if (!caster) {
      throw new Error('Caster not found');
    }

    const applicationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/applications/caster?applicationId=${applicationId}`;

    await sendNotificationWithEmail({
      userId: casterUserId,
      type: 'new_application',
      title: 'New Application Received',
      message: `You have received a new application for "${castingCallTitle}" from ${talentName}`,
      actionUrl: applicationUrl,
      metadata: {
        applicationId,
        castingCallTitle,
        talentName,
        appliedAt,
      },
      sendEmail: true,
      emailTemplate: 'new_application',
      emailContext: {
        casterName: caster.name,
        talentName,
        castingCallTitle,
        appliedAt,
        applicationUrl,
      },
      recipientEmail: caster.email,
      recipientName: caster.name,
      emailLanguage: 'en', // Default to English, could be made dynamic based on user preference
    });
  } catch (error) {
    console.error('Failed to send new application notification:', error);
    throw error;
  }
}

/**
 * Send notification for application status update
 */
export async function sendApplicationStatusUpdateNotification(
  talentUserId: string,
  castingCallTitle: string,
  status: string,
  applicationId: string,
  message?: string
): Promise<void> {
  try {
    // Get talent user details
    const talent = await getUserById(talentUserId);
    if (!talent) {
      throw new Error('Talent not found');
    }

    const applicationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/applications?applicationId=${applicationId}`;

    await sendNotificationWithEmail({
      userId: talentUserId,
      type: 'application_status_update',
      title: 'Application Status Updated',
      message: `Your application for "${castingCallTitle}" has been updated to ${status}`,
      actionUrl: applicationUrl,
      metadata: {
        applicationId,
        castingCallTitle,
        status,
        message,
      },
      sendEmail: true,
      emailTemplate: 'application_status_update',
      emailContext: {
        talentName: talent.name,
        castingCallTitle,
        status,
        message: message || '',
        applicationUrl,
      },
      recipientEmail: talent.email,
      recipientName: talent.name,
      emailLanguage: 'en',
    });
  } catch (error) {
    console.error('Failed to send application status update notification:', error);
    throw error;
  }
}

/**
 * Send notification for casting call published
 */
export async function sendCastingCallPublishedNotification(
  casterUserId: string,
  castingCallTitle: string,
  castingCallId: string
): Promise<void> {
  try {
    // Get caster user details
    const caster = await getUserById(casterUserId);
    if (!caster) {
      throw new Error('Caster not found');
    }

    const castingCallUrl = `${process.env.NEXT_PUBLIC_APP_URL}/casting-calls/${castingCallId}`;

    await sendNotificationWithEmail({
      userId: casterUserId,
      type: 'casting_call_published',
      title: 'Casting Call Published',
      message: `Your casting call "${castingCallTitle}" has been approved and is now live`,
      actionUrl: castingCallUrl,
      metadata: {
        castingCallId,
        castingCallTitle,
      },
      sendEmail: true,
      emailTemplate: 'casting_call_published',
      emailContext: {
        casterName: caster.name,
        title: castingCallTitle,
        castingCallUrl,
      },
      recipientEmail: caster.email,
      recipientName: caster.name,
      emailLanguage: 'en',
    });
  } catch (error) {
    console.error('Failed to send casting call published notification:', error);
    throw error;
  }
}

/**
 * Send deadline reminder notification
 */
export async function sendDeadlineReminderNotification(
  casterUserId: string,
  castingCallTitle: string,
  deadline: string,
  applicationCount: number,
  castingCallId: string
): Promise<void> {
  try {
    // Get caster user details
    const caster = await getUserById(casterUserId);
    if (!caster) {
      throw new Error('Caster not found');
    }

    const castingCallUrl = `${process.env.NEXT_PUBLIC_APP_URL}/casting-calls/${castingCallId}`;

    await sendNotificationWithEmail({
      userId: casterUserId,
      type: 'deadline_reminder',
      title: 'Deadline Reminder',
      message: `Your casting call "${castingCallTitle}" deadline is approaching`,
      actionUrl: castingCallUrl,
      metadata: {
        castingCallId,
        castingCallTitle,
        deadline,
        applicationCount,
      },
      sendEmail: true,
      emailTemplate: 'deadline_reminder',
      emailContext: {
        casterName: caster.name,
        castingCallTitle,
        deadline,
        applicationCount,
        castingCallUrl,
      },
      recipientEmail: caster.email,
      recipientName: caster.name,
      emailLanguage: 'en',
    });
  } catch (error) {
    console.error('Failed to send deadline reminder notification:', error);
    throw error;
  }
}

/**
 * Send profile completion reminder
 */
export async function sendProfileCompletionReminder(
  userId: string,
  completionPercentage: number
): Promise<void> {
  try {
    // Get user details
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/profile`;

    await sendNotificationWithEmail({
      userId,
      type: 'profile_completion_reminder',
      title: 'Complete Your Profile',
      message: `Your profile is ${completionPercentage}% complete. Complete it to get more opportunities`,
      actionUrl: profileUrl,
      metadata: {
        completionPercentage,
      },
      sendEmail: true,
      emailTemplate: 'profile_completion_reminder',
      emailContext: {
        name: user.name,
        completionPercentage,
        profileUrl,
      },
      recipientEmail: user.email,
      recipientName: user.name,
      emailLanguage: 'en',
    });
  } catch (error) {
    console.error('Failed to send profile completion reminder:', error);
    throw error;
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  userId: string,
  userEmail: string,
  userName: string
): Promise<void> {
  try {
    await sendEmail({
      to: userEmail,
      template: 'welcome',
      language: 'en',
      context: {
        name: userName,
      },
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}
