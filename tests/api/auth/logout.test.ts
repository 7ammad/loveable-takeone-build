import { describe, it, expect, beforeEach } from 'vitest';
import { API_ENDPOINTS, generateTestUser } from '../../setup';
import { prisma } from '@/packages/core-db/src/client';

describe('POST /api/v1/auth/logout', () => {
  let testUser: ReturnType<typeof generateTestUser>;
  let accessToken: string;
  let refreshToken: string;

  beforeEach(async () => {
    // Register and login before each test
    testUser = generateTestUser();
    
    await fetch(API_ENDPOINTS.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

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
    it('should logout successfully with valid token', async () => {
      const response = await fetch(API_ENDPOINTS.logout, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('message');
      expect(data.message).toContain('successfully');
    });

    it('should add token to revoked list', async () => {
      // Extract JTI from token (in production, decode the JWT)
      const response = await fetch(API_ENDPOINTS.logout, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);

      // Verify token was added to revoked tokens
      // Note: We can't easily get JTI without decoding JWT,
      // so we'll verify by trying to use the token
      const meResponse = await fetch(API_ENDPOINTS.me, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      expect(meResponse.status).toBe(401);
      const meData = await meResponse.json();
      expect(meData.error).toContain('revoked');
    });

    it('should be idempotent (can logout twice)', async () => {
      // First logout
      const response1 = await fetch(API_ENDPOINTS.logout, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      expect(response1.status).toBe(200);

      // Second logout with same token
      const response2 = await fetch(API_ENDPOINTS.logout, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      // Should still return success (or 401 if token check happens first)
      expect([200, 401]).toContain(response2.status);
    });
  });

  describe('Authentication Errors', () => {
    it('should reject logout without authorization header', async () => {
      const response = await fetch(API_ENDPOINTS.logout, {
        method: 'POST',
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('authorization');
    });

    it('should reject logout with malformed token', async () => {
      const response = await fetch(API_ENDPOINTS.logout, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeTruthy();
    });

    it('should reject logout with Bearer prefix missing', async () => {
      const response = await fetch(API_ENDPOINTS.logout, {
        method: 'POST',
        headers: {
          'Authorization': accessToken, // Missing "Bearer "
        },
      });

      expect(response.status).toBe(401);
    });
  });
});

