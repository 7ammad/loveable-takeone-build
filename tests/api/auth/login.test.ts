/// <reference types="vitest/globals" />
import { API_ENDPOINTS, generateTestUser } from '../../setup';
import { prisma } from '@/packages/core-db/src/client';

describe('POST /api/v1/auth/login', () => {
  let testUser: ReturnType<typeof generateTestUser>;
  let registeredUser: { id: string; email: string };

  beforeEach(async () => {
    // Register a user before each test
    testUser = generateTestUser();
    const response = await fetch(API_ENDPOINTS.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const data = await response.json();
    registeredUser = data.data.user;
  });

  describe('Success Cases', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('user');
      expect(data.data).toHaveProperty('accessToken');
      expect(data.data).toHaveProperty('refreshToken');
      expect(data.data.user.email).toBe(testUser.email);
      expect(data.data.user).not.toHaveProperty('password');
    });

    it('should update lastLoginAt timestamp', async () => {
      const beforeLogin = await prisma.user.findUnique({
        where: { email: testUser.email },
      });
      expect(beforeLogin?.lastLoginAt).toBeNull();

      await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      const afterLogin = await prisma.user.findUnique({
        where: { email: testUser.email },
      });
      expect(afterLogin?.lastLoginAt).toBeTruthy();
      expect(afterLogin?.lastLoginAt).toBeInstanceOf(Date);
    });

    it('should accept email in any case', async () => {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email.toUpperCase(),
          password: testUser.password,
        }),
      });

      expect(response.status).toBe(200);
    });

    it('should include Nafath verification claims in tokens', async () => {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      const data = await response.json();
      expect(data.data.user).toHaveProperty('nafathVerified');
      expect(data.data.user.nafathVerified).toBe(false);
    });
  });

  describe('Authentication Errors', () => {
    it('should reject login with incorrect password', async () => {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: 'WrongPassword123!',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('Invalid email or password');
    });

    it('should reject login with non-existent email', async () => {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: testUser.password,
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('Invalid email or password');
    });

    it('should reject login for deactivated account', async () => {
      // Deactivate user
      await prisma.user.update({
        where: { email: testUser.email },
        data: { isActive: false },
      });

      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('deactivated');
    });

    it('should reject login with missing credentials', async () => {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('required');
    });
  });

  describe('Rate Limiting', () => {
    it.skip('should enforce strict rate limit after 5 login attempts (skipped in test env)', async () => {
      const responses = [];

      // Make 6 failed login attempts
      for (let i = 0; i < 6; i++) {
        const response = await fetch(API_ENDPOINTS.login, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testUser.email,
            password: 'WrongPassword',
          }),
        });
        responses.push(response);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      }

      // 6th attempt should be rate limited
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.status).toBe(429);

      const data = await lastResponse.json();
      expect(data.error).toContain('Too many login attempts');

      // Check rate limit headers
      expect(lastResponse.headers.get('X-RateLimit-Limit')).toBe('5');
      expect(lastResponse.headers.get('X-RateLimit-Remaining')).toBe('0');
    }, 30000);
  });

  describe('Security', () => {
    it('should not reveal whether email exists in error message', async () => {
      // Non-existent email
      const response1 = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password',
        }),
      });
      const data1 = await response1.json();

      // Wrong password
      const response2 = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: 'wrongpassword',
        }),
      });
      const data2 = await response2.json();

      // Both should return the same generic error
      expect(data1.error).toBe(data2.error);
      expect(data1.error).toContain('Invalid email or password');
    });
  });
});

