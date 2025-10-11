# TakeOne API Documentation

**Version:** 1.0  
**Base URL:** `https://api.takeone.sa/api/v1`  
**Authentication:** JWT Bearer Token or httpOnly Cookie

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Profiles](#user-profiles)
3. [Casting Calls](#casting-calls)
4. [Applications](#applications)
5. [Bookings](#bookings)
6. [Admin APIs](#admin-apis)
7. [Health & Monitoring](#health--monitoring)
8. [Error Handling](#error-handling)

---

## Authentication

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "talent" // or "caster"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "user": {
    "id": "clxxx",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "talent"
  }
}
```

**Validation:**
- Email: Valid email format, max 255 chars
- Password: 8-128 characters
- Name: 1-255 characters
- Role: Must be "talent" or "caster"

---

### POST /auth/login
Login to existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "clxxx",
    "email": "user@example.com",
    "role": "talent"
  }
}
```

**Notes:**
- Tokens set as httpOnly cookies
- Account locks after 10 failed attempts
- Progressive delays: 1s, 2s, 4s, 8s, 16s

---

### POST /auth/logout
Logout and revoke tokens.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /auth/refresh
Refresh access token using refresh token.

**Cookies:**
- `refreshToken`: JWT refresh token

**Response:** `200 OK`
```json
{
  "success": true
}
```

**Notes:**
- New access token set as httpOnly cookie
- Old tokens revoked

---

### POST /auth/2fa/setup
Setup Two-Factor Authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "backupCodes": ["123456", "789012", ...]
}
```

---

### POST /auth/2fa/verify
Verify 2FA code during login.

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "2FA verified successfully"
}
```

---

### POST /auth/verify-email
Verify email address.

**Query Parameters:**
- `token`: Email verification token

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## User Profiles

### GET /profiles/me
Get current user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "profile": {
    "id": "clxxx",
    "userId": "clxxx",
    "stageName": "John Talent",
    "dateOfBirth": "1995-01-01",
    "gender": "male",
    "city": "Riyadh",
    // ... other profile fields
  }
}
```

---

### POST /profiles/talent
Create talent profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "stageName": "John Talent",
  "dateOfBirth": "1995-01-01",
  "gender": "male",
  "city": "Riyadh",
  "height": 180,
  "weight": 75,
  "skills": ["acting", "dancing"],
  "languages": ["Arabic", "English"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "profile": { /* ... */ }
}
```

**Validation:**
- stageName: 1-255 characters
- dateOfBirth: YYYY-MM-DD format
- gender: "male", "female", or "other"
- height: 50-300 cm
- weight: 20-500 kg
- skills: Array, max 50 items
- languages: Array, max 20 items

---

### PUT /profiles/talent
Update talent profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** Same as POST, all fields optional

**Response:** `200 OK`

---

### POST /profiles/caster
Create caster profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "companyNameEn": "Production Company",
  "companyNameAr": "شركة الإنتاج",
  "companyType": "production_house",
  "city": "Riyadh",
  "businessPhone": "+966501234567",
  "businessEmail": "contact@company.com",
  "specializations": ["film", "tv", "commercials"]
}
```

**Response:** `201 Created`

---

## Casting Calls

### GET /casting-calls
List casting calls with pagination and filters.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `q`: Search query
- `projectType`: Filter by project type
- `location`: Filter by location
- `compensationType`: "paid", "unpaid", "negotiable"
- `status`: "draft", "pending_review", "published", "cancelled", "expired"

**Response:** `200 OK`
```json
{
  "success": true,
  "castingCalls": [
    {
      "id": "clxxx",
      "title": "Lead Actor Needed",
      "description": "...",
      "location": "Riyadh",
      "compensation": "10000 SAR",
      "compensationType": "paid",
      "deadline": "2025-12-31T23:59:59Z",
      "rolesNeeded": 1,
      "status": "published"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

### POST /casting-calls
Create a new casting call (Caster only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Lead Actor Needed",
  "description": "Looking for a lead actor...",
  "projectType": "feature_film",
  "location": "Riyadh",
  "compensation": "Competitive",
  "compensationType": "paid",
  "requirements": "...",
  "deadline": "2025-12-31",
  "status": "draft",
  "rolesNeeded": 1,
  "ageRangeMin": 25,
  "ageRangeMax": 35,
  "genderPreference": "any",
  "skills": ["acting", "arabic"],
  "languages": ["Arabic", "English"]
}
```

**Response:** `201 Created`

**Validation:**
- title: 3-255 characters (sanitized)
- description: 10-5000 characters (sanitized)
- rolesNeeded: 1-1000
- ageRangeMin/Max: 0-120, Min <= Max
- skills: Max 50 items
- languages: Max 20 items

---

### GET /casting-calls/:id
Get single casting call details.

**Response:** `200 OK`

---

### PUT /casting-calls/:id
Update casting call (Owner or Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Request Body:** Same as POST, all fields optional

**Response:** `200 OK`

---

### DELETE /casting-calls/:id
Delete casting call (Owner or Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Response:** `204 No Content`

---

## Applications

### POST /applications
Apply to a casting call (Talent only).

**Headers:**
```
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Request Body:**
```json
{
  "castingCallId": "clxxx",
  "coverLetter": "I would be perfect for this role because...",
  "portfolioUrl": "https://myportfolio.com",
  "availableFrom": "2025-11-01",
  "availableTo": "2025-12-31"
}
```

**Response:** `201 Created`

---

### GET /applications
List user's applications.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`, `limit`: Pagination

**Response:** `200 OK`

---

### PUT /applications/:id/status
Update application status (Caster only, for their casting calls).

**Headers:**
```
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Request Body:**
```json
{
  "status": "shortlisted", // pending, under_review, shortlisted, accepted, rejected, withdrawn
  "notes": "Great audition"
}
```

**Response:** `200 OK`

---

## Bookings

### POST /bookings
Create an audition booking (Caster only).

**Headers:**
```
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Request Body:**
```json
{
  "applicationId": "clxxx",
  "castingCallId": "clxxx",
  "talentUserId": "clxxx",
  "scheduledDate": "2025-11-15",
  "scheduledTime": "14:30",
  "duration": 60,
  "location": "Studio A, Riyadh",
  "notes": "Please arrive 15 minutes early"
}
```

**Response:** `201 Created`

**Validation:**
- scheduledTime: HH:MM format
- duration: 15-480 minutes (15 min to 8 hours)

---

### GET /bookings
List user's bookings.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

---

### PUT /bookings/:id
Update booking status.

**Headers:**
```
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Request Body:**
```json
{
  "status": "confirmed", // scheduled, confirmed, cancelled, completed, no_show
  "notes": "Updated time"
}
```

**Response:** `200 OK`

---

## Admin APIs

All admin APIs require `admin` role.

### GET /admin/users
List all users (Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `role`: Filter by role
- `isActive`: Filter by active status

**Response:** `200 OK`

---

### GET /admin/audit-logs
View audit logs (Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `eventType`: Filter by event type
- `actorUserId`: Filter by user
- `resourceType`: Filter by resource
- `startDate`, `endDate`: Date range

**Response:** `200 OK`
```json
{
  "success": true,
  "logs": [
    {
      "id": "clxxx",
      "eventType": "LOGIN_SUCCESS",
      "actorUserId": "clxxx",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2025-10-10T12:00:00Z",
      "metadata": {}
    }
  ]
}
```

---

### POST /admin/casting-calls/:id/approve
Approve pending casting call (Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Response:** `200 OK`

---

### POST /admin/casting-calls/:id/reject
Reject casting call (Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Request Body:**
```json
{
  "reason": "Does not meet community guidelines"
}
```

**Response:** `200 OK`

---

## Health & Monitoring

### GET /api/health
Overall system health.

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2025-10-10T12:00:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

---

### GET /api/health/live
Liveness probe for Kubernetes.

**Response:** `200 OK`
```json
{
  "status": "live"
}
```

---

### GET /api/health/ready
Readiness probe for Kubernetes.

**Response:** `200 OK`
```json
{
  "status": "ready"
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no response body |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `ACCOUNT_LOCKED`: Account locked due to failed login attempts
- `TOKEN_EXPIRED`: JWT token expired
- `TOKEN_REVOKED`: JWT token revoked
- `CSRF_INVALID`: CSRF token invalid
- `RATE_LIMIT_EXCEEDED`: Too many requests

---

## Rate Limiting

**Limits:**
- Authentication endpoints: 5 requests / 15 minutes per IP
- General API: 100 requests / 15 minutes per user
- Admin API: 200 requests / 15 minutes per admin

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699999999
```

---

## Authentication Methods

### 1. httpOnly Cookies (Recommended for Web)
Tokens automatically sent with requests. Most secure for browser clients.

### 2. Authorization Header
```
Authorization: Bearer <access_token>
```

Good for mobile apps and API clients.

---

## Security Best Practices

1. **Always use HTTPS** in production
2. **Include CSRF token** for state-changing operations (POST, PUT, DELETE)
3. **Handle token expiration** gracefully (use refresh token flow)
4. **Never log tokens** in client-side code
5. **Validate all user input** on client and server
6. **Use Content Security Policy** headers
7. **Implement proper error handling**

---

## Postman Collection

Import our Postman collection for easy API testing:
```
https://api.takeone.sa/postman/collection.json
```

---

## OpenAPI Specification

Full OpenAPI 3.0 specification available at:
```
https://api.takeone.sa/openapi.json
```

---

## Support

- **Email:** api-support@takeone.sa
- **Documentation:** https://docs.takeone.sa
- **Status Page:** https://status.takeone.sa

---

**Last Updated:** October 10, 2025  
**API Version:** 1.0  
**Documentation Version:** 1.0

