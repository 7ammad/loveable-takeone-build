# TakeOne MVP Stabilization Plan

## Phase 1: Core Stabilization - Navigation and Security (P0)

**Goal:** Ensure users can navigate the authenticated state, use the platform on mobile, and log out securely.

### Task 1.1: Implement Authenticated Navigation (P0.1)

**Context:** Authenticated users currently have no navigation menu.

**Files:**

  * `components/DashboardNav.tsx` (Create New)
  * `app/dashboard/layout.tsx` (or relevant authenticated layouts)
  * `lib/contexts/auth-context.tsx` (For role checking)

**Cursor Instruction:**

```
@workspace Create a new component `components/DashboardNav.tsx`.
This component must be persistent across all authenticated routes.
Use the Auth Context to determine the user's role (Talent or Caster).

Implement the following structure using shadcn/ui components:
1. Logo (links to /dashboard).
2. Primary Nav Links (Role-based):
   - Talent: Dashboard, Browse Jobs (/casting-calls), My Applications (/applications), Messages (/messages).
   - Caster: Dashboard, Post Job (/casting-calls/create), Applications, Search Talent (/talent), Messages.
3. User Avatar Dropdown (Implement details in Task 1.2).

Finally, integrate this new `DashboardNav` into the authenticated layouts (e.g., `app/dashboard/layout.tsx`).
```

### Task 1.2: Implement Logout Functionality (P0.4)

**Context:** Users cannot log out, which is a security issue.

**Files:**

  * `components/DashboardNav.tsx`
  * `lib/contexts/auth-context.tsx`

**Cursor Instruction:**

```
In `components/DashboardNav.tsx`, implement the User Avatar Dropdown using `shadcn/ui DropdownMenu`.
Add menu items:
1. Profile (/profile)
2. Settings (/settings)
3. Separator
4. Logout (Styled as destructive/text-red)

Implement the `handleLogout` function for the Logout item. This function must call the `logout()` method from `lib/contexts/auth-context.tsx`.

Ensure the `logout()` function in `auth-context.tsx` correctly invalidates the session (via API call), clears client-side tokens/cookies, and redirects the user to the homepage (/).
```

### Task 1.3: Implement Mobile Navigation (P0.5)

**Context:** Navigation is hidden on mobile breakpoints (no hamburger menu).

**Files:**

  * `components/Header.tsx` (Public Nav)
  * `components/DashboardNav.tsx` (Auth Nav)

**Cursor Instruction:**

```
Modify both `components/Header.tsx` and `components/DashboardNav.tsx` to be fully responsive.
1. Hide the desktop navigation links on mobile breakpoints (e.g., `hidden md:flex`).
2. Add a Hamburger Menu icon (lucide-react `Menu`) visible only on mobile.
3. Implement a mobile menu drawer using the `shadcn/ui Sheet` component.
4. When the hamburger icon is clicked, open the Sheet displaying all relevant navigation links.
5. Ensure the menu closes when a link is clicked or the close button is tapped.
```

-----

## Phase 2: The Critical Path - Application Flow (P0/P1)

**Goal:** Fix the broken "Apply" flow and enable secure file uploads, which is the core value proposition of the platform.

### Task 2.1: Application Data Model and API (P0.3)

**Context:** The "Apply" flow doesn't submit data to the database.

**Files:**

  * `packages/core-db/prisma/schema.prisma`
  * `app/api/v1/applications/route.ts` (Create/Update)

**Cursor Instruction (Backend):**

```
@workspace Review `schema.prisma`. Ensure an `Application` model exists with relationships to `User` and `CastingCall`. It must include fields for: `status` (e.g., PENDING), `coverLetter`, `availability`, `headshotUrl`, `portfolioUrl`.

Next, implement `app/api/v1/applications/route.ts`.
Create the POST handler to receive application data.
It must:
1. Validate the input (e.g., using Zod).
2. Verify the user is authenticated and has the correct role (Talent).
3. Create the new `Application` record using Prisma.
4. Return a success response (201) with the created application ID.
```

### Task 2.2: Implement Secure File Uploads (P1.12)

**Context:** Talent cannot upload required materials (headshots/reels). We will use S3 Presigned URLs for security and efficiency.

**Files:**

  * `app/api/v1/uploads/presign/route.ts` (Create New)
  * `next.config.js`

**Cursor Instruction (Backend & Config):**

````
@workspace First, update `next.config.js`. Although we are using S3 direct uploads, it's best practice to increase the Next.js Server Action limit if any server actions handle form data, as the default 1MB limit is restrictive (Fact-Check Insight).
```javascript
// next.config.js
module.exports = {
  // ... other configs
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Adjust based on expected form data size
    },
  },
};
````

```
Next, create `app/api/v1/uploads/presign/route.ts`. This route generates short-lived S3 Presigned URLs.
CRITICAL SECURITY REQUIREMENTS (Based on Fact Check):
1. Authenticate the request.
2. The server MUST generate the final S3 key/path (e.g., `uploads/{userId}/{uuid}-{sanitizedFileName}`). Do NOT allow the client to control the destination path.
3. Enforce strict `Content-Type` headers (e.g., image/jpeg, video/mp4) and file size limits in the S3 policy generation.
4. Return the Presigned URL and the final S3 object URL to the client.
```

### Task 2.3: Connect Application Form (P0.3)

**Context:** The frontend form needs to handle the file upload process and then submit the data.

**Files:**

  * `app/casting-calls/[id]/apply/page.tsx`
  * `lib/utils/upload-client.ts` (Create New)

**Cursor Instruction (Frontend):**

```
Create a utility `lib/utils/upload-client.ts`. Implement a function `uploadFile(file)` that:
1. Requests a presigned URL from the API (Task 2.2).
2. Uploads the file directly to S3 using the presigned URL and the enforced Content-Type.
3. Returns the final S3 object URL upon success.

Now, update `app/casting-calls/[id]/apply/page.tsx`. Refactor the `handleSubmit` function:
1. Set `isSubmitting` state.
2. Call `uploadFile()` for the headshot and portfolio files. Show upload progress.
3. Once uploads are complete, gather the S3 URLs and the rest of the form data.
4. Submit this data to the Application API (Task 2.1).
5. Handle Success: Show confirmation toast and redirect to `/applications`.
6. Handle Errors: Display error messages if uploads or submission fails.
```

-----

## Phase 3: Onboarding and User Guidance (P0/P1)

**Goal:** Guide new users effectively and provide feedback when data is missing.

### Task 3.1: Implement Empty States (P0.6)

**Context:** Empty dashboards show "0" or blank spaces, making the platform feel broken.

**Files:**

  * `components/ui/empty-state.tsx` (Create New)
  * `components/dashboard/TalentDashboard.tsx`
  * `components/dashboard/HirerDashboard.tsx`
  * `app/applications/page.tsx`

**Cursor Instruction:**

```
Create a reusable component `components/ui/empty-state.tsx`.
It should accept props: `icon` (ReactNode), `title` (string), `description` (string), and `action` (optional ReactNode, usually a Button). Design it to be centered and encouraging.

Next, update `TalentDashboard.tsx` and `HirerDashboard.tsx`. Identify sections with lists (e.g., Recent Activity, Applications). Implement conditional rendering: If the data array is empty, render the `EmptyState` component with a relevant CTA (e.g., "Browse Casting Calls" or "Post Your First Job").
```

### Task 3.2: Implement Post-Registration Onboarding Flow (P0.2)

**Context:** New users are dumped onto an empty dashboard with no guidance on completing their profile.

**Files:**

  * `lib/contexts/auth-context.tsx` (or registration API handler)
  * `app/onboarding/page.tsx` (Create New)
  * `components/onboarding/ProfileWizard.tsx` (Create New)

**Cursor Instruction:**

```
@workspace First, modify the registration logic to redirect new users to `/onboarding` instead of `/dashboard`. This requires a flag on the user model (e.g., `isOnboardingComplete`).

Next, create `app/onboarding/page.tsx` and the associated `components/onboarding/ProfileWizard.tsx`.

Implement a multi-step form wizard:
1. Welcome Step: Brief introduction and "Get Started" CTA.
2. Talent Steps: Basic Info (Age, Location, Height), Skills/Languages, Upload Media.
3. Caster Steps: Company Info, Verification Details.

Ensure data is saved to the user profile via API upon completion of each step. On the final step, update the `isOnboardingComplete` flag and redirect to `/dashboard`.
```

### Task 3.3: Profile Completion Indicator (P1.7)

**Context:** Users don't know if their profile is complete enough to apply for jobs.

**Files:**

  * `components/dashboard/TalentDashboard.tsx`
  * `components/dashboard/ProfileProgress.tsx` (Create New)

**Cursor Instruction:**

```
Create `components/dashboard/ProfileProgress.tsx`.
This component should calculate the profile completion percentage based on required fields (e.g., Bio, Headshot, Skills).
Display this using a `shadcn/ui Progress` bar.
If incomplete, provide a clear CTA: "Complete Your Profile to Apply", linking to the profile edit page.
Add this component prominently to `TalentDashboard.tsx`.
```

-----

## Phase 4: Communication and Management (P1)

**Goal:** Enable basic communication and allow casters to manage their posts.

### Task 4.1: Implement Message Sending (P1.11)

**Files:**

  * `app/api/v1/messages/route.ts`
  * `app/messages/page.tsx`

**Cursor Instruction:**

```
@workspace Implement `POST /api/v1/messages`. Validate the input (`conversationId`, `content`) and ensure the sender is authorized. Save the message to the database.

In `app/messages/page.tsx`, connect the message input form to this API.
Implement optimistic updates (show the message immediately, then confirm).
(Fact Check Insight): For near-real-time updates, implement simple polling (e.g., refetch messages every 10 seconds) as an MVP solution. WebSockets are more efficient but complex; defer them for now.
```

### Task 4.2: Implement Basic Notifications (P1.9)

**Files:**

  * `components/DashboardNav.tsx`
  * `components/notifications/NotificationDropdown.tsx` (Create New)

**Cursor Instruction:**

```
In `DashboardNav.tsx`, add a Notification Bell icon. Implement an API route to fetch the unread notification count and display it as a badge.

Create `NotificationDropdown.tsx`. When the bell is clicked, show a dropdown/popover listing recent notifications (e.g., "New message received", "Application status updated"). Include "Mark as read" functionality.
```

### Task 4.3: Casting Call Management (P1.14)

**Files:**

  * `app/casting-calls/[id]/edit/page.tsx` (Create/Update)
  * `components/dashboard/HirerDashboard.tsx`

**Cursor Instruction:**

```
Implement the edit page `app/casting-calls/[id]/edit/page.tsx`. It should pre-fill the casting call form with existing data.

In `HirerDashboard.tsx`, link the "Edit" button to this page. Add a "Delete" option that uses a `shadcn/ui AlertDialog` for confirmation before calling the delete API endpoint. Ensure the API verifies ownership before allowing edits or deletions.
```

-----

## Phase 5: Search and Discovery (P1/P2)

**Goal:** Improve the ability for users to find relevant talent and jobs efficiently.

### Task 5.1: Implement Search Functionality (P1.8)

**Files:**

  * `app/casting-calls/page.tsx`
  * `app/talent/page.tsx`

**Cursor Instruction:**

```
Update the API routes for fetching casting calls and talent to accept a `searchQuery` parameter. Use Prisma's search capabilities (e.g., `contains`, `mode: 'insensitive'`).

In `app/casting-calls/page.tsx` and `app/talent/page.tsx`, connect the existing search input fields to the data fetching logic.
Crucially, implement a debounce (300ms) on the input to prevent excessive API calls while typing. Add a "No results found" empty state.
```

### Task 5.2: Implement Pagination (P1.10)

**Files:**

  * `app/casting-calls/page.tsx`
  * Relevant API routes

**Cursor Instruction:**

```
Refactor the data fetching on list pages to use pagination instead of loading all data.
Update the API routes to implement cursor-based pagination (recommended by Prisma for performance).
On the frontend, implement either Infinite Scroll (using an intersection observer) or a "Load More" button. Show loading skeleton while fetching the next page.
```

### Task 5.3: Implement Filters (P2.17)

**Files:**

  * `app/casting-calls/page.tsx`

**Cursor Instruction:**

```
Connect the existing filter UI components (dropdowns, checkboxes) on the `/casting-calls` page. Implement filtering logic for key criteria: Location, Job Type, Deadline, and Compensation. Ensure filters work in conjunction with the search query and pagination.
```