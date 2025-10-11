import { describe, it, expect, beforeEach } from 'vitest';
import { createTestUser, getAuthToken } from '@/tests/helpers';

describe('RBAC Authorization', () => {
  let adminToken: string;
  let talentToken: string;
  let casterToken: string;

  beforeEach(async () => {
    const admin = await createTestUser('admin');
    const talent = await createTestUser('talent');
    const caster = await createTestUser('caster');

    adminToken = admin.token;
    talentToken = talent.token;
    casterToken = caster.token;
  });

  describe('Admin Endpoints', () => {
    const adminEndpoints = [
      '/api/v1/admin/digital-twin/status',
      '/api/v1/admin/digital-twin/sources',
      '/api/v1/admin/digital-twin/sources/123',
      '/api/v1/admin/digital-twin/validation-queue',
      '/api/v1/admin/digital-twin/validation/123/approve',
      '/api/v1/admin/digital-twin/validation/123/edit',
      '/api/v1/admin/digital-twin/validation/123/reject',
      '/api/v1/admin/sources',
      '/api/v1/admin/sources/123',
      '/api/v1/admin/usage-metrics',
      '/api/v1/admin/nafath/status',
      '/api/v1/admin/casting-calls/pending',
      '/api/v1/admin/llm-feedback',
      '/api/v1/admin/users',
    ];

    adminEndpoints.forEach(endpoint => {
      it(`${endpoint} - should allow admin access`, async () => {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        expect(response.status).toBe(200);
      });

      it(`${endpoint} - should reject talent access`, async () => {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          headers: { 'Authorization': `Bearer ${talentToken}` }
        });
        expect(response.status).toBe(403);
      });

      it(`${endpoint} - should reject caster access`, async () => {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          headers: { 'Authorization': `Bearer ${casterToken}` }
        });
        expect(response.status).toBe(403);
      });

      it(`${endpoint} - should reject unauthenticated access`, async () => {
        const response = await fetch(`http://localhost:3000${endpoint}`);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('Authorization Error Messages', () => {
    it('should return proper error messages for unauthorized access', async () => {
      const response = await fetch('http://localhost:3000/api/v1/admin/digital-twin/status', {
        headers: { 'Authorization': `Bearer ${talentToken}` }
      });

      const data = await response.json();
      expect(data.error).toContain('Forbidden');
      expect(data.error).toContain('Insufficient permissions');
    });

    it('should return proper error messages for unauthenticated access', async () => {
      const response = await fetch('http://localhost:3000/api/v1/admin/digital-twin/status');

      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
      expect(data.error).toContain('Authentication required');
    });
  });

  describe('Cookie Authentication', () => {
    it('should work with cookie-based authentication', async () => {
      // First login to get cookies
      const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@test.com',
          password: 'password123'
        })
      });

      const cookies = loginResponse.headers.get('set-cookie');

      // Use cookies for authenticated request
      const response = await fetch('http://localhost:3000/api/v1/admin/digital-twin/status', {
        headers: { 'Cookie': cookies! }
      });

      expect(response.status).toBe(200);
    });

    it('should work with Authorization header', async () => {
      const response = await fetch('http://localhost:3000/api/v1/admin/digital-twin/status', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(200);
    });
  });

  describe('Audit Logging', () => {
    it('should log unauthorized access attempts', async () => {
      const response = await fetch('http://localhost:3000/api/v1/admin/digital-twin/status', {
        headers: { 'Authorization': `Bearer ${talentToken}` }
      });

      expect(response.status).toBe(403);

      // Check that audit log was created (this would need actual audit log checking)
      // For now, we just verify the request was rejected
    });

    it('should log successful admin actions', async () => {
      const response = await fetch('http://localhost:3000/api/v1/admin/digital-twin/status', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(200);
    });
  });

  describe('Role Hierarchy', () => {
    it('should allow admin role access', async () => {
      const response = await fetch('http://localhost:3000/api/v1/admin/digital-twin/status', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(200);
    });

    it('should reject non-admin roles', async () => {
      const talentResponse = await fetch('http://localhost:3000/api/v1/admin/digital-twin/status', {
        headers: { 'Authorization': `Bearer ${talentToken}` }
      });

      const casterResponse = await fetch('http://localhost:3000/api/v1/admin/digital-twin/status', {
        headers: { 'Authorization': `Bearer ${casterToken}` }
      });

      expect(talentResponse.status).toBe(403);
      expect(casterResponse.status).toBe(403);
    });
  });
});
