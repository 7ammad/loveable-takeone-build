import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';
import { generateAccessToken } from '@packages/core-auth';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

describe('Talent Analytics Dashboard API', () => {
  let talentToken: string;
  let casterToken: string;
  let talentId: string;

  beforeAll(async () => {
    // Generate test tokens
    talentId = 'test-talent-' + Date.now();
    const talentJti = 'jti-talent-' + Date.now();
    const casterJti = 'jti-caster-' + Date.now();
    talentToken = generateAccessToken(talentId, talentJti, 'talent');
    casterToken = generateAccessToken('test-caster-' + Date.now(), casterJti, 'caster');
  });

  describe('GET /api/v1/analytics/talent-dashboard', () => {
    it('should return 401 when not authenticated', async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/v1/analytics/talent-dashboard`);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }
    });

    it('should return 401 with invalid token', async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/v1/analytics/talent-dashboard`, {
          headers: { Authorization: 'Bearer invalid-token' }
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }
    });

    it('should return 403 when user is not a talent', async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/v1/analytics/talent-dashboard`, {
          headers: { Authorization: `Bearer ${casterToken}` }
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response?.status).toBe(403);
        expect(error.response?.data?.error).toContain('Only talent');
      }
    });

    it('should return analytics data for a talent user', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/talent-dashboard`, {
        headers: { Authorization: `Bearer ${talentToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeDefined();
      
      const { data } = response.data;
      
      // Check overview structure
      expect(data.overview).toBeDefined();
      expect(data.overview).toHaveProperty('totalApplications');
      expect(data.overview).toHaveProperty('activeApplications');
      expect(data.overview).toHaveProperty('profileViews');
      expect(data.overview).toHaveProperty('profileCompletion');
      
      // All counts should be numbers
      expect(typeof data.overview.totalApplications).toBe('number');
      expect(typeof data.overview.activeApplications).toBe('number');
      expect(typeof data.overview.profileViews).toBe('number');
      expect(typeof data.overview.profileCompletion).toBe('number');
    });

    it('should return application stats', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/talent-dashboard`, {
        headers: { Authorization: `Bearer ${talentToken}` }
      });

      const { applicationStats } = response.data.data;
      
      expect(applicationStats).toBeDefined();
      expect(applicationStats).toHaveProperty('pending');
      expect(applicationStats).toHaveProperty('underReview');
      expect(applicationStats).toHaveProperty('shortlisted');
      expect(applicationStats).toHaveProperty('accepted');
      expect(applicationStats).toHaveProperty('rejected');
      expect(applicationStats).toHaveProperty('successRate');
      expect(applicationStats).toHaveProperty('responseRate');
      
      // All counts should be numbers
      expect(typeof applicationStats.pending).toBe('number');
      expect(typeof applicationStats.underReview).toBe('number');
      expect(typeof applicationStats.shortlisted).toBe('number');
      expect(typeof applicationStats.accepted).toBe('number');
      expect(typeof applicationStats.rejected).toBe('number');
      
      // Rates should be strings with %
      expect(typeof applicationStats.successRate).toBe('string');
      expect(applicationStats.successRate).toMatch(/%$/);
      expect(typeof applicationStats.responseRate).toBe('string');
      expect(applicationStats.responseRate).toMatch(/%$/);
    });

    it('should return recent applications', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/talent-dashboard`, {
        headers: { Authorization: `Bearer ${talentToken}` }
      });

      const { recentApplications } = response.data.data;
      
      expect(Array.isArray(recentApplications)).toBe(true);
      expect(recentApplications.length).toBeLessThanOrEqual(10);
      
      // If there are applications, check structure
      if (recentApplications.length > 0) {
        const app = recentApplications[0];
        expect(app).toHaveProperty('id');
        expect(app).toHaveProperty('castingCallId');
        expect(app).toHaveProperty('title');
        expect(app).toHaveProperty('status');
        expect(app).toHaveProperty('appliedDate');
      }
    });

    it('should return trends data', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/talent-dashboard`, {
        headers: { Authorization: `Bearer ${talentToken}` }
      });

      const { trends } = response.data.data;
      
      expect(Array.isArray(trends)).toBe(true);
      
      // If there are trends, check structure
      if (trends.length > 0) {
        const trend = trends[0];
        expect(trend).toHaveProperty('date');
        expect(trend).toHaveProperty('count');
        expect(typeof trend.count).toBe('number');
      }
    });

    it('should return profile information', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/talent-dashboard`, {
        headers: { Authorization: `Bearer ${talentToken}` }
      });

      const { profile } = response.data.data;
      
      expect(profile).toBeDefined();
      expect(profile).toHaveProperty('verified');
      expect(profile).toHaveProperty('completionPercentage');
      expect(typeof profile.verified).toBe('boolean');
      expect(typeof profile.completionPercentage).toBe('number');
    });

    it('should filter by date range when days parameter is provided', async () => {
      const response7days = await axios.get(`${API_BASE_URL}/api/v1/analytics/talent-dashboard?days=7`, {
        headers: { Authorization: `Bearer ${talentToken}` }
      });

      const response30days = await axios.get(`${API_BASE_URL}/api/v1/analytics/talent-dashboard?days=30`, {
        headers: { Authorization: `Bearer ${talentToken}` }
      });

      expect(response7days.status).toBe(200);
      expect(response30days.status).toBe(200);
      
      // Both should return valid data structures
      expect(response7days.data.success).toBe(true);
      expect(response30days.data.success).toBe(true);
    });

    it('should handle invalid days parameter gracefully', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/talent-dashboard?days=invalid`, {
        headers: { Authorization: `Bearer ${talentToken}` }
      });

      // Should default to 30 days and not error
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    it('should return zero stats for talent with no applications', async () => {
      const newTalentId = 'new-talent-' + Date.now();
      const newTalentJti = 'jti-new-talent-' + Date.now();
      const newTalentToken = generateAccessToken(newTalentId, newTalentJti, 'talent');

      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/talent-dashboard`, {
        headers: { Authorization: `Bearer ${newTalentToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      
      const { data } = response.data;
      
      expect(data.overview.totalApplications).toBe(0);
      expect(data.overview.activeApplications).toBe(0);
      
      expect(data.applicationStats.pending).toBe(0);
      expect(data.applicationStats.underReview).toBe(0);
      expect(data.applicationStats.shortlisted).toBe(0);
      expect(data.applicationStats.accepted).toBe(0);
      expect(data.applicationStats.rejected).toBe(0);
      expect(data.applicationStats.successRate).toBe('0%');
      expect(data.applicationStats.responseRate).toBe('0%');
      
      expect(data.recentApplications).toEqual([]);
      expect(data.trends).toEqual([]);
    });

    it('should correctly calculate success and response rates', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/talent-dashboard`, {
        headers: { Authorization: `Bearer ${talentToken}` }
      });

      const { data } = response.data;
      const { overview, applicationStats } = data;
      
      const totalApps = overview.totalApplications;
      const acceptedApps = applicationStats.accepted;
      const rejectedApps = applicationStats.rejected;
      const pendingApps = applicationStats.pending;
      
      if (totalApps > 0) {
        // Success rate should be based on reviewed applications only
        const reviewedApps = acceptedApps + rejectedApps;
        if (reviewedApps > 0) {
          const expectedSuccessRate = ((acceptedApps / reviewedApps) * 100).toFixed(1);
          expect(applicationStats.successRate).toBe(`${expectedSuccessRate}%`);
        }
        
        // Response rate should be based on all applications
        const respondedApps = totalApps - pendingApps;
        const expectedResponseRate = ((respondedApps / totalApps) * 100).toFixed(1);
        expect(applicationStats.responseRate).toBe(`${expectedResponseRate}%`);
      } else {
        expect(applicationStats.successRate).toBe('0%');
        expect(applicationStats.responseRate).toBe('0%');
      }
    });
  });
});

