'use client';

import { useEffect } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BookAuditionProps {
  application: {
    id: string;
    castingCallTitle: string;
    talentName: string;
    talentEmail?: string;
  };
  casterName: string;
  casterEmail: string;
  onBookingComplete?: (bookingData: unknown) => void;
}

export function BookAudition({
  application,
  casterName,
  casterEmail,
  onBookingComplete,
}: BookAuditionProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal('ui', {
        theme: 'light',
        styles: {
          branding: {
            brandColor: '#000000',
          },
        },
      });

      // Listen for booking events
      cal('on', {
        action: 'bookingSuccessful',
        callback: (e) => {
          console.log('[Cal.com] Booking successful:', e.detail);
          if (onBookingComplete) {
            onBookingComplete(e.detail);
          }
        },
      });
    })();
  }, [onBookingComplete]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Schedule Audition</CardTitle>
        <p className="text-sm text-muted-foreground">
          Book an audition time with {application.talentName} for &quot;{application.castingCallTitle}&quot;
        </p>
      </CardHeader>
      <CardContent>
        <Cal
          calLink={`${process.env.NEXT_PUBLIC_CALCOM_USERNAME}/audition`}
          style={{
            width: '100%',
            height: '100%',
            overflow: 'scroll',
          }}
          config={{
            name: casterName,
            email: casterEmail,
            notes: `Audition for: ${application.castingCallTitle}\nApplicant: ${application.talentName}\nApplication ID: ${application.id}`,
            metadata: {
              applicationId: application.id,
              castingCallTitle: application.castingCallTitle,
              talentName: application.talentName,
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
