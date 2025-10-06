import { describe, it, expect } from 'vitest';
import { API_ENDPOINTS, generateTestUser } from '../../setup';
import { prisma } from '@/packages/core-db/src/client';

describe('POST /api/v1/auth/register', () => {
  describe('Success Cases', () => {
    it('should register a new talent user successfully', async () => {
      const testUser = generateTestUser('talent');

      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('user');
      expect(data.data).toHaveProperty('accessToken');
      expect(data.data).toHaveProperty('refreshToken');
      expect(data.data.user.email).toBe(testUser.email);
      expect(data.data.user.name).toBe(testUser.name);
      expect(data.data.user.role).toBe('talent');
      expect(data.data.user).not.toHaveProperty('password');

      // Verify user exists in database
      const dbUser = await prisma.user.findUnique({
        where: { email: testUser.email },
      });
      expect(dbUser).toBeTruthy();
      expect(dbUser?.email).toBe(testUser.email);

      // Verify TalentProfile was created
      const talentProfile = await prisma.talentProfile.findUnique({
        where: { userId: dbUser!.id },
      });
      expect(talentProfile).toBeTruthy();
      expect(talentProfile?.completionPercentage).toBe(10);
    });

    it('should register a new caster user successfully', async () => {
      const testUser = generateTestUser('caster');

      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.data.user.role).toBe('caster');

      // Verify CasterProfile was created
      const dbUser = await prisma.user.findUnique({
        where: { email: testUser.email },
      });
      const casterProfile = await prisma.casterProfile.findUnique({
        where: { userId: dbUser!.id },
      });
      expect(casterProfile).toBeTruthy();
      expect(casterProfile?.verified).toBe(false);
    });

    it('should hash password correctly', async () => {
      const testUser = generateTestUser();

      await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });

      const dbUser = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      // Password should not match plain text
      expect(dbUser?.password).not.toBe(testUser.password);
      // Password should be bcrypt hash (starts with $2b$)
      expect(dbUser?.password).toMatch(/^\$2[aby]\$/);
    });

    it('should normalize email to lowercase', async () => {
      const testUser = generateTestUser();
      testUser.email = testUser.email.toUpperCase();

      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });

      const data = await response.json();
      expect(data.data.user.email).toBe(testUser.email.toLowerCase());
    });
  });

  describe('Validation Errors', () => {
    it('should reject registration with missing email', async () => {
      const testUser = generateTestUser();
      delete (testUser as { email?: string }).email;

      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('required');
    });

    it('should reject registration with invalid email', async () => {
      const testUser = generateTestUser();
      testUser.email = 'invalid-email';

      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('email');
    });

    it('should reject registration with weak password', async () => {
      const testUser = generateTestUser();
      testUser.password = '123'; // Too short

      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('8 characters');
    });

    it('should reject registration with invalid role', async () => {
      const testUser = generateTestUser();
      (testUser as { role: string }).role = 'invalid';

      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('role');
    });

    it('should reject duplicate email registration', async () => {
      const testUser = generateTestUser();

      // First registration
      await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });

      // Second registration with same email
      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error).toContain('already exists');
    });
  });

  describe('Rate Limiting', () => {
    it.skip('should enforce rate limit after 10 attempts (skipped in test env)', async () => {
      const responses = [];

      // Make 11 requests
      for (let i = 0; i < 11; i++) {
        const testUser = generateTestUser();
        const response = await fetch(API_ENDPOINTS.register, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testUser),
        });
        responses.push(response);
      }

      // Last request should be rate limited
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.status).toBe(429);

      const data = await lastResponse.json();
      expect(data.error).toContain('Too many');

      // Check rate limit headers
      expect(lastResponse.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(lastResponse.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(lastResponse.headers.get('X-RateLimit-Reset')).toBeTruthy();
    }, 30000); // 30 second timeout for this test
  });
});

