# 📅 Booking System Implementation - Cal.com Integration

## ✅ **What's Been Implemented**

### **1. Database Schema** ✅
Added two new models to `packages/core-db/prisma/schema.prisma`:

#### **AvailabilitySlot**
- Talent can set recurring availability (e.g., "Every Monday 9am-5pm")
- Or one-time availability for specific dates
- Timezone support (default: Asia/Riyadh)

#### **AuditionBooking**
- Links to Application (one-to-one)
- Stores meeting details (time, duration, type, location)
- Video meeting integration (URL, password)
- Status tracking (scheduled, confirmed, cancelled, completed, no-show)
- Reminder tracking (24h, 1h before)
- Cal.com integration fields (eventId, bookingUid)
- Notes from both caster and talent

### **2. API Endpoints** ✅

#### **POST /api/v1/bookings**
- Create a new audition booking
- Only caster who created the casting call can book
- Validates application exists and no duplicate booking
- Returns full booking details with talent/caster info

#### **GET /api/v1/bookings**
- Get all bookings for authenticated user (as talent or caster)
- Query params:
  - `status`: Filter by status
  - `upcoming=true`: Only future bookings
- Returns bookings with full details

#### **GET /api/v1/bookings/[id]**
- Get specific booking details
- Access control: only talent or caster involved

#### **PATCH /api/v1/bookings/[id]**
- Update booking (reschedule, cancel, add notes)
- Tracks who cancelled and when
- Returns updated booking

#### **DELETE /api/v1/bookings/[id]**
- Hard delete booking
- Only caster can delete

### **3. Frontend Component** ✅

#### **BookAudition Component** (`components/booking/BookAudition.tsx`)
- Cal.com embed integration
- Pre-fills caster info (name, email)
- Passes application metadata to Cal.com
- Listens for booking success events
- Customizable theme and branding

---

## 🚀 **Next Steps to Complete**

### **Step 1: Set Up Cal.com Account**

1. **Go to [cal.com](https://cal.com) and sign up**
   - Use your TakeOne email
   - Or self-host Cal.com (same tech stack!)

2. **Create an Event Type**
   - Name: "Audition"
   - Duration: 30 minutes (or customize)
   - Location: Video call (Zoom/Google Meet)
   - Add custom questions:
     - Application ID
     - Casting Call Title
     - Talent Name

3. **Get Your Cal.com Link**
   - Format: `your-username/audition`
   - Replace in `BookAudition.tsx` line 62:
     ```typescript
     calLink="your-username/audition"
     ```

### **Step 2: Integrate BookAudition into Applications Page**

Update `app/applications/caster/page.tsx`:

```typescript
import { BookAudition } from '@/components/booking/BookAudition';
import { useState } from 'react';

// Inside component:
const [showBooking, setShowBooking] = useState<string | null>(null);

// In the application card actions:
<Button 
  variant="outline" 
  size="sm"
  onClick={() => setShowBooking(application.id)}
>
  <Calendar className="w-4 h-4 mr-2" />
  Book Audition
</Button>

// Add modal/dialog:
{showBooking && (
  <Dialog open={!!showBooking} onOpenChange={() => setShowBooking(null)}>
    <DialogContent className="max-w-4xl">
      <BookAudition
        application={applications.find(a => a.id === showBooking)!}
        casterName={currentUser.name}
        casterEmail={currentUser.email}
        onBookingComplete={(data) => {
          console.log('Booking created:', data);
          setShowBooking(null);
          // Optionally: Call your API to save booking to database
        }}
      />
    </DialogContent>
  </Dialog>
)}
```

### **Step 3: Create Bookings Management Page**

Create `app/bookings/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video, MapPin, Phone } from 'lucide-react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      const response = await apiClient.get('/api/v1/bookings?upcoming=true');
      if (response.data.success) {
        setBookings(response.data.data);
      }
      setLoading(false);
    }
    fetchBookings();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Auditions</h1>
      
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{booking.castingCall.title}</h3>
                  <p className="text-muted-foreground">
                    With {booking.talent.name}
                  </p>
                  
                  <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(booking.scheduledAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(booking.scheduledAt).toLocaleTimeString()}
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.meetingType === 'video' && <Video className="w-4 h-4" />}
                      {booking.meetingType === 'phone' && <Phone className="w-4 h-4" />}
                      {booking.meetingType === 'in-person' && <MapPin className="w-4 h-4" />}
                      {booking.meetingType}
                    </div>
                  </div>
                </div>
                
                <Badge>{booking.status}</Badge>
              </div>
              
              <div className="flex gap-2 mt-4">
                {booking.meetingUrl && (
                  <Button asChild>
                    <a href={booking.meetingUrl} target="_blank" rel="noopener noreferrer">
                      Join Meeting
                    </a>
                  </Button>
                )}
                <Button variant="outline">Reschedule</Button>
                <Button variant="ghost" className="text-destructive">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### **Step 4: Set Up Cal.com Webhooks** (Optional but Recommended)

1. **In Cal.com Dashboard:**
   - Go to Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/api/v1/webhooks/calcom`
   - Subscribe to events: `BOOKING_CREATED`, `BOOKING_CANCELLED`, `BOOKING_RESCHEDULED`

2. **Create webhook handler** (`app/api/v1/webhooks/calcom/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { triggerEvent, payload } = body;

    // Verify webhook signature (Cal.com provides this)
    // const signature = req.headers.get('x-cal-signature');
    // TODO: Verify signature

    switch (triggerEvent) {
      case 'BOOKING_CREATED':
        // Save booking to your database
        await prisma.auditionBooking.create({
          data: {
            // Map Cal.com data to your schema
            calcomBookingUid: payload.uid,
            scheduledAt: new Date(payload.startTime),
            // ... other fields from metadata
          },
        });
        break;

      case 'BOOKING_CANCELLED':
        // Update booking status
        await prisma.auditionBooking.update({
          where: { calcomBookingUid: payload.uid },
          data: { status: 'cancelled' },
        });
        break;

      case 'BOOKING_RESCHEDULED':
        // Update booking time
        await prisma.auditionBooking.update({
          where: { calcomBookingUid: payload.uid },
          data: { scheduledAt: new Date(payload.startTime) },
        });
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Cal.com Webhook] Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
```

### **Step 5: Add Automated Reminders** (Future Enhancement)

Create a cron job or background worker:

```typescript
// scripts/send-booking-reminders.ts
import { prisma } from '@packages/core-db';
import { sendEmail } from '@packages/core-notify';

async function sendReminders() {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

  // 24-hour reminders
  const bookings24h = await prisma.auditionBooking.findMany({
    where: {
      scheduledAt: { gte: now, lte: in24Hours },
      reminderSent24h: false,
      status: 'scheduled',
    },
    include: { talent: true, caster: true, castingCall: true },
  });

  for (const booking of bookings24h) {
    await sendEmail({
      to: booking.talent.email,
      template: 'audition_reminder_24h',
      language: 'en',
      context: {
        talentName: booking.talent.name,
        castingCallTitle: booking.castingCall.title,
        scheduledAt: booking.scheduledAt.toLocaleString(),
        meetingUrl: booking.meetingUrl,
      },
    });

    await prisma.auditionBooking.update({
      where: { id: booking.id },
      data: { reminderSent24h: true },
    });
  }

  // 1-hour reminders (similar logic)
}

// Run every 15 minutes
setInterval(sendReminders, 15 * 60 * 1000);
```

---

## 📊 **Database Schema Reference**

```prisma
model AvailabilitySlot {
  id            String   @id @default(cuid())
  talentUserId  String
  talent        User     @relation(...)
  
  dayOfWeek     Int?     // 0-6 (Sunday-Saturday)
  startTime     String   // "09:00"
  endTime       String   // "17:00"
  timezone      String   @default("Asia/Riyadh")
  specificDate  DateTime?
  
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model AuditionBooking {
  id              String   @id @default(cuid())
  applicationId   String   @unique
  talentUserId    String
  casterUserId    String
  castingCallId   String
  
  scheduledAt     DateTime
  duration        Int      // minutes
  timezone        String   @default("Asia/Riyadh")
  
  meetingType     String   // "in-person", "video", "phone"
  location        String?
  meetingUrl      String?
  meetingPassword String?
  
  status          String   @default("scheduled")
  cancelledBy     String?
  cancelledAt     DateTime?
  cancellationReason String?
  
  reminderSent24h Boolean  @default(false)
  reminderSent1h  Boolean  @default(false)
  
  casterNotes     String?
  talentNotes     String?
  
  calcomEventId   String?
  calcomBookingUid String? @unique
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## 🎯 **Summary**

### **✅ Completed:**
1. Database schema for bookings and availability
2. Full CRUD API for bookings
3. Cal.com embed component
4. Authentication and authorization
5. Relationship with applications

### **⏳ Remaining:**
1. Set up Cal.com account and get your link
2. Integrate BookAudition component into applications page
3. Create bookings management UI
4. Set up webhooks (optional)
5. Add automated reminders (optional)

### **🚀 Quick Start:**
1. Sign up at [cal.com](https://cal.com)
2. Create "Audition" event type
3. Copy your Cal.com link
4. Update `BookAudition.tsx` with your link
5. Add booking button to applications page
6. Test the flow!

---

## 💡 **Alternative: Self-Host Cal.com**

If you want full control, you can self-host Cal.com:

```bash
# Clone Cal.com
git clone https://github.com/calcom/cal.com

# It uses the same stack:
# - Next.js
# - Prisma
# - PostgreSQL
# - Tailwind CSS

# Share your existing database
# Update .env to point to your Supabase database
```

This gives you complete customization and no monthly fees!
