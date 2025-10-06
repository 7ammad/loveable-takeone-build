import { describe, it, expect, beforeEach } from 'vitest';
import { API_ENDPOINTS, generateTestUser } from '../../setup';
import { prisma } from '@/packages/core-db/src/client';

describe('GET /api/v1/auth/me', () => {
  let testUser: ReturnType<typeof generateTestUser>;
  let accessToken: string;
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
  }, 60000); // 60 second timeout for bcrypt operations

  describe('Success Cases', () => {
    it('should return current user with valid token', async () => {
      const response = await fetch(API_ENDPOINTS.me, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe(testUser.email);
      expect(data.user.name).toBe(testUser.name);
      expect(data.user).not.toHaveProperty('password');
    });

    it('should return all user fields', async () => {
      const response = await fetch(API_ENDPOINTS.me, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('email');
      expect(data.user).toHaveProperty('name');
      expect(data.user).toHaveProperty('role');
      expect(data.user).toHaveProperty('emailVerified');
      expect(data.user).toHaveProperty('nafathVerified');
      expect(data.user).toHaveProperty('createdAt');
      expect(data.user).toHaveProperty('updatedAt');
    });

    it('should return fresh data from database', async () => {
      // Update user in database
      await prisma.user.update({
        where: { id: userId },
        data: { name: 'Updated Name' },
      });

      const response = await fetch(API_ENDPOINTS.me, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      expect(data.user.name).toBe('Updated Name');
    });
  });

  describe('Authentication Errors', () => {
    it('should reject request without authorization header', async () => {
      const response = await fetch(API_ENDPOINTS.me, {
        method: 'GET',
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('authorization');
    });

    it('should reject request with invalid token', async () => {
      const response = await fetch(API_ENDPOINTS.me, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('Invalid or expired');
    });

    it('should reject request with expired token', async () => {
      // Create an expired token (this is a mock, in production you'd use a real expired token)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJleHAiOjF9.invalid';
      
      const response = await fetch(API_ENDPOINTS.me, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${expiredToken}`,
        },
      });

      expect(response.status).toBe(401);
    });

    it('should reject request with revoked token', async () => {
      // Logout first to revoke the token
      await fetch(API_ENDPOINTS.logout, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      // Try to use the revoked token
      const response = await fetch(API_ENDPOINTS.me, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('revoked');
    });

    it('should reject request for deactivated account', async () => {
      // Deactivate user
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      const response = await fetch(API_ENDPOINTS.me, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('deactivated');
    });
  });
});

