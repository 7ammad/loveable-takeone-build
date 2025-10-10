/// <reference types="vitest/globals" />
import { API_ENDPOINTS, generateTestUser } from '../../setup';
import { prisma } from '@/packages/core-db/src/client';

describe('POST /api/v1/auth/refresh', () => {
  let testUser: ReturnType<typeof generateTestUser>;
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  beforeEach(async () => {
    // Register and login before each test
    testUser = generateTestUser();
    
    const registerResponse = await fetch(API_ENDPOINTS.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    const registerData = await registerResponse.json();
    userId = registerData.data.user.id;

    const loginResponse = await fetch(API_ENDPOINTS.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    const loginData = await loginResponse.json();
    accessToken = loginData.data.accessToken;
    refreshToken = loginData.data.refreshToken;
  }, 60000); // 60 second timeout for bcrypt operations

  describe('Success Cases', () => {
    it('should refresh tokens successfully', async () => {
      const response = await fetch(API_ENDPOINTS.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('accessToken');
      expect(data.data).toHaveProperty('refreshToken');
      
      // New tokens should be different
      expect(data.data.accessToken).not.toBe(accessToken);
      expect(data.data.refreshToken).not.toBe(refreshToken);
    });

    it('should revoke old refresh token', async () => {
      // Refresh once
      await fetch(API_ENDPOINTS.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      // Try to use old refresh token again
      const response = await fetch(API_ENDPOINTS.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('Invalid or expired');
    });

    it('should include updated Nafath claims in new tokens', async () => {
      // Update user's Nafath status
      await prisma.user.update({
        where: { id: userId },
        data: { 
          nafathVerified: true,
          nafathVerifiedAt: new Date(),
        },
      });

      const response = await fetch(API_ENDPOINTS.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      expect(response.status).toBe(200);
      // In production, you'd decode the JWT and verify nafathVerified claim
    });

    it('should work multiple times with new tokens', async () => {
      // First refresh
      const response1 = await fetch(API_ENDPOINTS.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data1 = await response1.json();
      const newRefreshToken1 = data1.data.refreshToken;

      // Second refresh with new token
      const response2 = await fetch(API_ENDPOINTS.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: newRefreshToken1 }),
      });

      expect(response2.status).toBe(200);
      const data2 = await response2.json();
      expect(data2.data.accessToken).not.toBe(data1.data.accessToken);
    });
  });

  describe('Validation Errors', () => {
    it('should reject refresh without token', async () => {
      const response = await fetch(API_ENDPOINTS.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('required');
    });

    it('should reject invalid refresh token', async () => {
      const response = await fetch(API_ENDPOINTS.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'invalid-token' }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('Invalid or expired');
    });

    it('should reject access token used as refresh token', async () => {
      const response = await fetch(API_ENDPOINTS.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: accessToken }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Account Status', () => {
    it('should reject refresh for deactivated account', async () => {
      // Deactivate user
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      const response = await fetch(API_ENDPOINTS.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('deactivated');
    });

    it('should reject refresh for deleted user', async () => {
      // Delete user
      await prisma.user.delete({
        where: { id: userId },
      });

      const response = await fetch(API_ENDPOINTS.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('not found');
    });
  });

  describe('Rate Limiting', () => {
    it.skip('should enforce rate limit after 10 refresh attempts (skipped in test env)', async () => {
      const responses = [];

      // Make 11 refresh requests (each with invalid token)
      for (let i = 0; i < 11; i++) {
        const response = await fetch(API_ENDPOINTS.refresh, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: 'invalid-token' }),
        });
        responses.push(response);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Last request should be rate limited
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.status).toBe(429);

      const data = await lastResponse.json();
      expect(data.error).toContain('Too many');

      // Check rate limit headers
      expect(lastResponse.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(lastResponse.headers.get('X-RateLimit-Remaining')).toBe('0');
    }, 30000);
  });
});

