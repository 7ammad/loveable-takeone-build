# 🧪 Booking System - Test Guide

## ✅ **What's Integrated:**

1. **"Book Audition" button** added to Applications page (`/applications/caster`)
2. **Booking modal** with Cal.com embed
3. **User info pre-filled** (caster name & email)
4. **Application metadata** passed to Cal.com

---

## 🧪 **How to Test:**

### **Step 1: Navigate to Applications**
1. Log in as a **caster** account
2. Go to **Applications** page (from dashboard nav)
3. You should see all applications for your casting calls

### **Step 2: Click "Book Audition"**
1. Find any application (preferably one with status "shortlisted" or "accepted")
2. Click the **"Book Audition"** button (blue button with calendar icon)
3. A modal should pop up with the Cal.com booking widget

### **Step 3: Book a Time**
1. In the modal, you should see:
   - Your available time slots from Cal.com
   - Talent name and casting call title at the top
   - Your name and email pre-filled
2. Select a date and time
3. Fill in any additional details
4. Click **"Confirm"** or **"Book"**

### **Step 4: Verify Booking**
1. You should see a success message
2. Both you and the talent should receive confirmation emails from Cal.com
3. The booking should appear in your Cal.com dashboard

---

## 🔍 **What to Check:**

### **Frontend:**
- [ ] "Book Audition" button appears on all applications
- [ ] Button is disabled for rejected applications
- [ ] Modal opens when button is clicked
- [ ] Cal.com widget loads inside modal
- [ ] Application details are shown (talent name, casting call title)
- [ ] Modal can be closed (X button or clicking outside)

### **Cal.com Widget:**
- [ ] Your available time slots are displayed
- [ ] Caster name is pre-filled
- [ ] Caster email is pre-filled
- [ ] Application metadata is passed (check Cal.com dashboard after booking)
- [ ] Booking can be completed successfully

### **After Booking:**
- [ ] Success alert appears
- [ ] Modal closes automatically
- [ ] Confirmation email sent to caster
- [ ] Confirmation email sent to talent (if Cal.com is configured)
- [ ] Booking appears in Cal.com dashboard
- [ ] Calendar event created (if calendar sync is enabled)

---

## 🐛 **Common Issues & Fixes:**

### **Issue 1: Cal.com widget not loading**
**Symptoms:** Blank modal or "Loading..." forever

**Fix:**
1. Check `.env.local` has correct `NEXT_PUBLIC_CALCOM_USERNAME`
2. Verify event type exists at `cal.com/your-username/audition`
3. Check browser console for errors
4. Try opening Cal.com link directly: `https://cal.com/your-username/audition`

### **Issue 2: No available times showing**
**Symptoms:** Widget loads but shows "No available times"

**Fix:**
1. Go to Cal.com → Event Types → Audition
2. Click "Availability"
3. Set your working hours (e.g., Mon-Fri 9am-5pm)
4. Save and refresh the page

### **Issue 3: Booking not saving to database**
**Symptoms:** Booking works in Cal.com but doesn't appear in your app

**Note:** This is expected for now! Webhooks are not yet set up.

**To fix later:**
1. Set up Cal.com webhooks (see `CAL_COM_SETUP_GUIDE.md`)
2. Webhook will automatically save bookings to your database

### **Issue 4: Modal doesn't close**
**Symptoms:** Modal stays open after booking

**Fix:**
1. Click the X button in top-right
2. Or click outside the modal
3. Or refresh the page

---

## 📊 **Expected Flow:**

```
1. Caster clicks "Book Audition"
   ↓
2. Modal opens with Cal.com widget
   ↓
3. Caster selects date/time
   ↓
4. Cal.com processes booking
   ↓
5. Success message shown
   ↓
6. Modal closes
   ↓
7. Emails sent (Cal.com)
   ↓
8. [Future] Webhook saves to database
```

---

## 🎯 **Next Steps:**

### **Immediate (Optional):**
1. **Customize Cal.com event**:
   - Add custom questions (Application ID, etc.)
   - Set buffer times between bookings
   - Add meeting location (Zoom/Google Meet)

2. **Test with real talent**:
   - Have a colleague apply to your casting call
   - Book an audition with them
   - Verify they receive the email

### **Future Enhancements:**
1. **Set up webhooks** to save bookings to database
2. **Create bookings page** to view all scheduled auditions
3. **Add reschedule/cancel** functionality
4. **Automated reminders** (24h, 1h before)
5. **Calendar sync** (Google Calendar, Outlook)

---

## 📝 **Test Checklist:**

- [ ] Logged in as caster
- [ ] Navigated to Applications page
- [ ] Clicked "Book Audition" button
- [ ] Modal opened successfully
- [ ] Cal.com widget loaded
- [ ] Selected a time slot
- [ ] Completed booking
- [ ] Received success message
- [ ] Modal closed
- [ ] Received confirmation email
- [ ] Booking appears in Cal.com dashboard

---

## 🆘 **Need Help?**

1. **Check `.env.local`**: Verify `CALCOM_API_KEY` and `NEXT_PUBLIC_CALCOM_USERNAME` are correct
2. **Check Cal.com dashboard**: Verify "Audition" event type exists
3. **Check browser console**: Look for any JavaScript errors
4. **Check network tab**: Look for failed API calls
5. **Restart dev server**: Kill node processes and run `pnpm dev` again

---

**Ready to test? Go to `/applications/caster` and click "Book Audition"! 🚀**
