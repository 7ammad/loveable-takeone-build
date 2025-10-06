import { Queue, Worker } from 'bullmq';
import { redis } from '../queues';
import { prisma } from '@packages/core-db';
import { sendEmail } from '@packages/core-notify';

// Queue for scheduling booking reminders
export const bookingReminderQueue = new Queue('booking-reminders', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

interface BookingReminderJob {
  bookingId: string;
  reminderType: '24h' | '1h';
}

// Worker to process booking reminders
export const bookingReminderWorker = new Worker<BookingReminderJob>(
  'booking-reminders',
  async (job) => {
    const { bookingId, reminderType } = job.data;

    console.log(`[Booking Reminder] Processing ${reminderType} reminder for booking ${bookingId}`);

    try {
      // Get booking details
      const booking = await prisma.auditionBooking.findUnique({
        where: { id: bookingId },
        include: {
          talent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          caster: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          castingCall: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      if (!booking) {
        console.log(`[Booking Reminder] Booking ${bookingId} not found`);
        return;
      }

      // Check if booking is still scheduled/confirmed
      if (!['scheduled', 'confirmed'].includes(booking.status)) {
        console.log(`[Booking Reminder] Booking ${bookingId} is ${booking.status}, skipping reminder`);
        return;
      }

      // Check if reminder was already sent
      if (reminderType === '24h' && booking.reminderSent24h) {
        console.log(`[Booking Reminder] 24h reminder already sent for booking ${bookingId}`);
        return;
      }
      if (reminderType === '1h' && booking.reminderSent1h) {
        console.log(`[Booking Reminder] 1h reminder already sent for booking ${bookingId}`);
        return;
      }

      // Format date and time
      const scheduledDate = new Date(booking.scheduledAt);
      const dateStr = scheduledDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const timeStr = scheduledDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: booking.timezone,
      });

      const timeUntil = reminderType === '24h' ? '24 hours' : '1 hour';

      // Send reminder to talent
      await sendEmail({
        to: booking.talent.email,
        subject: `Reminder: Audition in ${timeUntil} - ${booking.castingCall.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Audition Reminder</h2>
            <p>Hi ${booking.talent.name},</p>
            <p>This is a reminder that your audition is coming up in <strong>${timeUntil}</strong>!</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">${booking.castingCall.title}</h3>
              <p style="margin: 10px 0;"><strong>Date:</strong> ${dateStr}</p>
              <p style="margin: 10px 0;"><strong>Time:</strong> ${timeStr} (${booking.timezone})</p>
              <p style="margin: 10px 0;"><strong>Duration:</strong> ${booking.duration} minutes</p>
              <p style="margin: 10px 0;"><strong>With:</strong> ${booking.caster.name}</p>
              <p style="margin: 10px 0;"><strong>Type:</strong> ${booking.meetingType.replace('-', ' ')}</p>
              ${booking.meetingUrl ? `<p style="margin: 10px 0;"><strong>Meeting Link:</strong> <a href="${booking.meetingUrl}">${booking.meetingUrl}</a></p>` : ''}
              ${booking.location ? `<p style="margin: 10px 0;"><strong>Location:</strong> ${booking.location}</p>` : ''}
            </div>

            ${booking.talentNotes ? `<p><strong>Your Notes:</strong><br/>${booking.talentNotes}</p>` : ''}
            
            <p>Good luck with your audition!</p>
            
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              If you need to reschedule or cancel, please visit your <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings">bookings page</a>.
            </p>
          </div>
        `,
      });

      // Send reminder to caster
      await sendEmail({
        to: booking.caster.email,
        subject: `Reminder: Audition in ${timeUntil} with ${booking.talent.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Audition Reminder</h2>
            <p>Hi ${booking.caster.name},</p>
            <p>This is a reminder that you have an audition scheduled in <strong>${timeUntil}</strong>!</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">${booking.castingCall.title}</h3>
              <p style="margin: 10px 0;"><strong>Date:</strong> ${dateStr}</p>
              <p style="margin: 10px 0;"><strong>Time:</strong> ${timeStr} (${booking.timezone})</p>
              <p style="margin: 10px 0;"><strong>Duration:</strong> ${booking.duration} minutes</p>
              <p style="margin: 10px 0;"><strong>Talent:</strong> ${booking.talent.name}</p>
              <p style="margin: 10px 0;"><strong>Type:</strong> ${booking.meetingType.replace('-', ' ')}</p>
              ${booking.meetingUrl ? `<p style="margin: 10px 0;"><strong>Meeting Link:</strong> <a href="${booking.meetingUrl}">${booking.meetingUrl}</a></p>` : ''}
              ${booking.location ? `<p style="margin: 10px 0;"><strong>Location:</strong> ${booking.location}</p>` : ''}
            </div>

            ${booking.casterNotes ? `<p><strong>Your Notes:</strong><br/>${booking.casterNotes}</p>` : ''}
            
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              Manage this audition on your <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings">bookings page</a>.
            </p>
          </div>
        `,
      });

      // Mark reminder as sent
      const updateData = reminderType === '24h' 
        ? { reminderSent24h: true }
        : { reminderSent1h: true };

      await prisma.auditionBooking.update({
        where: { id: bookingId },
        data: updateData,
      });

      console.log(`[Booking Reminder] ${reminderType} reminder sent successfully for booking ${bookingId}`);
    } catch (error) {
      console.error(`[Booking Reminder] Error processing ${reminderType} reminder for booking ${bookingId}:`, error);
      throw error; // Re-throw to trigger retry
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

/**
 * Schedule reminders for a booking
 * @param bookingId - The booking ID
 * @param scheduledAt - The scheduled date/time of the booking
 */
export async function scheduleBookingReminders(bookingId: string, scheduledAt: Date) {
  const now = new Date();
  const bookingTime = new Date(scheduledAt);

  // Calculate reminder times
  const reminder24h = new Date(bookingTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
  const reminder1h = new Date(bookingTime.getTime() - 60 * 60 * 1000); // 1 hour before

  // Schedule 24-hour reminder if it's in the future
  if (reminder24h > now) {
    await bookingReminderQueue.add(
      `reminder-24h-${bookingId}`,
      {
        bookingId,
        reminderType: '24h',
      },
      {
        delay: reminder24h.getTime() - now.getTime(),
        jobId: `reminder-24h-${bookingId}`, // Prevent duplicates
      }
    );
    console.log(`[Booking Reminder] Scheduled 24h reminder for booking ${bookingId} at ${reminder24h.toISOString()}`);
  }

  // Schedule 1-hour reminder if it's in the future
  if (reminder1h > now) {
    await bookingReminderQueue.add(
      `reminder-1h-${bookingId}`,
      {
        bookingId,
        reminderType: '1h',
      },
      {
        delay: reminder1h.getTime() - now.getTime(),
        jobId: `reminder-1h-${bookingId}`, // Prevent duplicates
      }
    );
    console.log(`[Booking Reminder] Scheduled 1h reminder for booking ${bookingId} at ${reminder1h.toISOString()}`);
  }
}

/**
 * Cancel scheduled reminders for a booking
 * @param bookingId - The booking ID
 */
export async function cancelBookingReminders(bookingId: string) {
  try {
    // Remove both reminder jobs
    const job24h = await bookingReminderQueue.getJob(`reminder-24h-${bookingId}`);
    if (job24h) {
      await job24h.remove();
      console.log(`[Booking Reminder] Cancelled 24h reminder for booking ${bookingId}`);
    }

    const job1h = await bookingReminderQueue.getJob(`reminder-1h-${bookingId}`);
    if (job1h) {
      await job1h.remove();
      console.log(`[Booking Reminder] Cancelled 1h reminder for booking ${bookingId}`);
    }
  } catch (error) {
    console.error(`[Booking Reminder] Error cancelling reminders for booking ${bookingId}:`, error);
  }
}

// Handle worker events
bookingReminderWorker.on('completed', (job) => {
  console.log(`[Booking Reminder] Job ${job.id} completed`);
});

bookingReminderWorker.on('failed', (job, err) => {
  console.error(`[Booking Reminder] Job ${job?.id} failed:`, err);
});

bookingReminderWorker.on('error', (err) => {
  console.error('[Booking Reminder] Worker error:', err);
});
