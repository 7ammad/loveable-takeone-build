import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';
import { generateAccessToken } from '@packages/core-auth';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

describe('Analytics Dashboard API', () => {
  let casterToken: string;
  let talentToken: string;
  let casterId: string;

  beforeAll(async () => {
    // Generate test tokens
    casterId = 'test-caster-' + Date.now();
    const casterJti = 'jti-caster-' + Date.now();
    const talentJti = 'jti-talent-' + Date.now();
    casterToken = generateAccessToken(casterId, casterJti, 'caster');
    talentToken = generateAccessToken('test-talent-' + Date.now(), talentJti, 'talent');
  });

  describe('GET /api/v1/analytics/dashboard', () => {
    it('should return 401 when not authenticated', async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/v1/analytics/dashboard`);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }
    });

    it('should return 401 with invalid token', async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/v1/analytics/dashboard`, {
          headers: { Authorization: 'Bearer invalid-token' }
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }
    });

    it('should return 403 when user is not a caster', async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/v1/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${talentToken}` }
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response?.status).toBe(403);
        expect(error.response?.data?.error).toContain('Only casters');
      }
    });

    it('should return analytics data for a caster', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${casterToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeDefined();
      
      const { data } = response.data;
      
      // Check overview structure
      expect(data.overview).toBeDefined();
      expect(data.overview).toHaveProperty('totalCastingCalls');
      expect(data.overview).toHaveProperty('activeCastingCalls');
      expect(data.overview).toHaveProperty('totalApplications');
      expect(data.overview).toHaveProperty('applicationsThisMonth');
      
      // All counts should be numbers
      expect(typeof data.overview.totalCastingCalls).toBe('number');
      expect(typeof data.overview.activeCastingCalls).toBe('number');
      expect(typeof data.overview.totalApplications).toBe('number');
      expect(typeof data.overview.applicationsThisMonth).toBe('number');
    });

    it('should return application stats', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${casterToken}` }
      });

      const { applicationStats } = response.data.data;
      
      expect(applicationStats).toBeDefined();
      expect(applicationStats).toHaveProperty('pending');
      expect(applicationStats).toHaveProperty('shortlisted');
      expect(applicationStats).toHaveProperty('accepted');
      expect(applicationStats).toHaveProperty('rejected');
      expect(applicationStats).toHaveProperty('conversionRate');
      expect(applicationStats).toHaveProperty('shortlistRate');
      
      // All counts should be numbers
      expect(typeof applicationStats.pending).toBe('number');
      expect(typeof applicationStats.shortlisted).toBe('number');
      expect(typeof applicationStats.accepted).toBe('number');
      expect(typeof applicationStats.rejected).toBe('number');
      
      // Rates should be strings with %
      expect(typeof applicationStats.conversionRate).toBe('string');
      expect(applicationStats.conversionRate).toMatch(/%$/);
      expect(typeof applicationStats.shortlistRate).toBe('string');
      expect(applicationStats.shortlistRate).toMatch(/%$/);
    });

    it('should return zero stats for caster with no casting calls', async () => {
      const newCasterId = 'new-caster-' + Date.now();
      const newCasterJti = 'jti-new-caster-' + Date.now();
      const newCasterToken = generateAccessToken(newCasterId, newCasterJti, 'caster');

      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${newCasterToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      
      const { data } = response.data;
      
      expect(data.overview.totalCastingCalls).toBe(0);
      expect(data.overview.activeCastingCalls).toBe(0);
      expect(data.overview.totalApplications).toBe(0);
      expect(data.overview.applicationsThisMonth).toBe(0);
      
      expect(data.applicationStats.pending).toBe(0);
      expect(data.applicationStats.shortlisted).toBe(0);
      expect(data.applicationStats.accepted).toBe(0);
      expect(data.applicationStats.rejected).toBe(0);
      expect(data.applicationStats.conversionRate).toBe('0%');
      expect(data.applicationStats.shortlistRate).toBe('0%');
      
      expect(data.recentApplications).toEqual([]);
      expect(data.popularProjectTypes).toEqual([]);
      expect(data.trends).toEqual([]);
    });
  });
});
