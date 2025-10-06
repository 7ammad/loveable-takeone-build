# 🚀 Cal.com Setup Guide - Quick Start

## ✅ Step 1: Add Your API Key to `.env.local`

Open `.env.local` and replace these placeholders with your actual values:

```bash
# ------------------------------------------------------------------------------
# CAL.COM BOOKING SYSTEM
# ------------------------------------------------------------------------------
CALCOM_API_KEY=cal_live_xxxxxxxxxxxxxxxxxxxxxxxxxx  # Your actual API key
NEXT_PUBLIC_CALCOM_USERNAME=your-username           # Your Cal.com username
```

### Where to Find These:

1. **API Key (`CALCOM_API_KEY`)**:
   - Go to https://app.cal.com/settings/developer/api-keys
   - Click "Create New API Key"
   - Copy the key (starts with `cal_live_...`)
   - Paste it in `.env.local`

2. **Username (`NEXT_PUBLIC_CALCOM_USERNAME`)**:
   - This is your Cal.com username
   - Found in your Cal.com URL: `https://cal.com/YOUR-USERNAME`
   - Example: If your link is `https://cal.com/john-doe`, your username is `john-doe`

---

## ✅ Step 2: Create "Audition" Event Type

1. Go to https://app.cal.com/event-types
2. Click **"New Event Type"**
3. Fill in:
   - **Title**: `Audition`
   - **URL**: `audition` (this will be `cal.com/your-username/audition`)
   - **Duration**: `30 minutes` (or your preference)
   - **Location**: Choose one:
     - 📹 Zoom
     - 📹 Google Meet
     - 📞 Phone call
     - 📍 In-person
4. Click **"Continue"**

### Optional: Add Custom Questions

Under **"Advanced"** → **"Custom Questions"**, add:
- Application ID
- Casting Call Title
- Talent Name

This helps track which audition each booking is for.

---

## ✅ Step 3: Test the Integration

1. **Restart your dev server**:
   ```powershell
   # Kill existing server
   taskkill /F /IM node.exe
   
   # Start fresh
   pnpm dev
   ```

2. **Navigate to Applications Page**:
   - Go to `/applications/caster`
   - Click on an application
   - Click **"Book Audition"** button (we'll add this next)

3. **You should see**:
   - Cal.com booking widget embedded
   - Your available time slots
   - Ability to book a time

---

## 🎯 Next: Integrate Booking Button into UI

### Add to `app/applications/caster/page.tsx`

```typescript
import { BookAudition } from '@/components/booking/BookAudition';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Calendar } from 'lucide-react';

// Inside component:
const [showBooking, setShowBooking] = useState<string | null>(null);
const [currentUser, setCurrentUser] = useState({ name: '', email: '' });

// Fetch current user
useEffect(() => {
  async function fetchUser() {
    const response = await apiClient.get('/api/v1/profiles/me');
    if (response.data.success) {
      setCurrentUser(response.data.data);
    }
  }
  fetchUser();
}, []);

// In the application card actions (where you have Accept/Reject buttons):
<Button 
  variant="outline" 
  size="sm"
  onClick={() => setShowBooking(application.id)}
>
  <Calendar className="w-4 h-4 mr-2" />
  Book Audition
</Button>

// Add dialog at the end of your component:
{showBooking && (
  <Dialog open={!!showBooking} onOpenChange={() => setShowBooking(null)}>
    <DialogContent className="max-w-4xl max-h-[80vh]">
      <BookAudition
        application={{
          id: applications.find(a => a.id === showBooking)?.id || '',
          castingCallTitle: applications.find(a => a.id === showBooking)?.castingCallTitle || '',
          talentName: applications.find(a => a.id === showBooking)?.talentUser?.name || '',
          talentEmail: applications.find(a => a.id === showBooking)?.talentUser?.email,
        }}
        casterName={currentUser.name}
        casterEmail={currentUser.email}
        onBookingComplete={(data) => {
          console.log('Booking created:', data);
          setShowBooking(null);
          // Optionally: Show success message
        }}
      />
    </DialogContent>
  </Dialog>
)}
```

---

## 🔄 Webhook Setup (Optional but Recommended)

To sync Cal.com bookings to your database:

1. **In Cal.com Dashboard**:
   - Go to Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/api/v1/webhooks/calcom`
   - Subscribe to: `BOOKING_CREATED`, `BOOKING_CANCELLED`, `BOOKING_RESCHEDULED`

2. **Already Created**:
   - Webhook handler is at `app/api/v1/webhooks/calcom/route.ts` (TODO)
   - Will automatically save bookings to your database

---

## 📊 View Bookings

Create a bookings page to view all scheduled auditions:

```typescript
// app/bookings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    async function fetchBookings() {
      const response = await apiClient.get('/api/v1/bookings?upcoming=true');
      if (response.data.success) {
        setBookings(response.data.data);
      }
    }
    fetchBookings();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Auditions</h1>
      {/* Display bookings */}
    </div>
  );
}
```

---

## ✅ Checklist

- [ ] Add `CALCOM_API_KEY` to `.env.local`
- [ ] Add `NEXT_PUBLIC_CALCOM_USERNAME` to `.env.local`
- [ ] Create "Audition" event type in Cal.com
- [ ] Restart dev server
- [ ] Add booking button to applications page
- [ ] Test booking flow
- [ ] (Optional) Set up webhooks
- [ ] (Optional) Create bookings management page

---

## 🆘 Troubleshooting

### "Cal.com widget not loading"
- Check that `NEXT_PUBLIC_CALCOM_USERNAME` is correct
- Verify event type URL is `/audition`
- Check browser console for errors

### "No available times showing"
- Go to Cal.com → Event Types → Audition → Availability
- Set your working hours
- Save changes

### "Booking not saving to database"
- Set up webhooks (see above)
- Or manually call `/api/v1/bookings` POST endpoint after booking

---

## 💡 Pro Tips

1. **Multiple Event Types**: Create different durations
   - `audition-quick` (15 min)
   - `audition-standard` (30 min)
   - `audition-extended` (60 min)

2. **Buffer Time**: Add 5-10 min buffer between bookings

3. **Confirmation**: Enable email confirmations in Cal.com settings

4. **Reminders**: Cal.com automatically sends reminders 24h and 1h before

---

## 📞 Need Help?

- Cal.com Docs: https://cal.com/docs
- API Reference: https://cal.com/docs/api-reference
- Community: https://cal.com/slack

---

**You're all set! 🎉**

Just add your API key and username to `.env.local`, restart the server, and you're ready to start booking auditions!
