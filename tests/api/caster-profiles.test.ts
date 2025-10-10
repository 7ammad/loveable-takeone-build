/**
 * Caster Profile API Tests
 */

/// <reference types="vitest/globals" />
import axios, { AxiosInstance } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

describe('Caster Profile API', () => {
  let client: AxiosInstance;
  let authToken: string;
  let casterUserId: string;
  let casterProfileId: string;
  
  beforeAll(async () => {
    client = axios.create({
      baseURL: API_BASE,
      validateStatus: () => true // Don't throw on any status
    });
    
    // Login as a caster user for testing
    // You'll need to create a test caster user first
    const loginResponse = await client.post('/api/v1/auth/login', {
      email: 'test-caster@example.com',
      password: 'Test123!@#'
    });
    
    if (loginResponse.status === 200 && loginResponse.data.success) {
      authToken = loginResponse.data.data.accessToken;
      casterUserId = loginResponse.data.data.user.id;
    }
  });
  
  describe('POST /api/v1/caster-profiles', () => {
    it('should create a new caster profile', async () => {
      const profileData = {
        companyNameEn: 'Test Production Company',
        companyNameAr: 'شركة إنتاج الاختبار',
        companyType: 'film_production',
        companyCategory: 'production_companies',
        companyDescription: 'A test film production company',
        businessPhone: '+966501234567',
        businessEmail: 'contact@testproduction.com',
        city: 'Riyadh',
        address: '123 Test Street, Riyadh',
        companySize: 'small',
        establishedYear: 2020,
        teamSize: 15,
        specializations: ['Feature Films', 'Documentaries'],
        website: 'https://testproduction.com'
      };
      
      const response = await client.post('/api/v1/caster-profiles', profileData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data.companyNameEn).toBe(profileData.companyNameEn);
      expect(response.data.data.companyType).toBe(profileData.companyType);
      
      casterProfileId = response.data.data.id;
    });
    
    it('should reject profile creation without auth', async () => {
      const response = await client.post('/api/v1/caster-profiles', {
        companyNameEn: 'Test'
      });
      
      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);
    });
    
    it('should reject profile creation with missing required fields', async () => {
      const response = await client.post('/api/v1/caster-profiles', {
        companyNameEn: 'Test Only'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
      expect(response.data.error).toContain('required');
    });
    
    it('should reject profile creation with invalid taxonomy', async () => {
      const response = await client.post('/api/v1/caster-profiles', {
        companyNameEn: 'Test',
        companyType: 'invalid_type',
        companyCategory: 'invalid_category',
        businessPhone: '+966501234567',
        businessEmail: 'test@test.com',
        city: 'Riyadh'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });
  });
  
  describe('GET /api/v1/caster-profiles', () => {
    it('should list caster profiles', async () => {
      const response = await client.get('/api/v1/caster-profiles');
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('profiles');
      expect(response.data.data).toHaveProperty('pagination');
      expect(Array.isArray(response.data.data.profiles)).toBe(true);
    });
    
    it('should filter profiles by category', async () => {
      const response = await client.get('/api/v1/caster-profiles?category=production_companies');
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      
      if (response.data.data.profiles.length > 0) {
        expect(response.data.data.profiles[0].companyCategory).toBe('production_companies');
      }
    });
    
    it('should filter profiles by verified status', async () => {
      const response = await client.get('/api/v1/caster-profiles?verified=true');
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
    
    it('should search profiles by name', async () => {
      const response = await client.get('/api/v1/caster-profiles?search=Test');
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
    
    it('should paginate results', async () => {
      const response = await client.get('/api/v1/caster-profiles?page=1&limit=5');
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.pagination.page).toBe(1);
      expect(response.data.data.pagination.limit).toBe(5);
    });
  });
  
  describe('GET /api/v1/caster-profiles/[id]', () => {
    it('should get a single caster profile', async () => {
      if (!casterProfileId) {
        expect.skip();
        return;
      }
      
      const response = await client.get(`/api/v1/caster-profiles/${casterProfileId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.id).toBe(casterProfileId);
      expect(response.data.data).toHaveProperty('user');
      expect(response.data.data).toHaveProperty('_count');
    });
    
    it('should return 404 for non-existent profile', async () => {
      const response = await client.get('/api/v1/caster-profiles/non-existent-id');
      
      expect(response.status).toBe(404);
      expect(response.data.success).toBe(false);
    });
  });
  
  describe('PATCH /api/v1/caster-profiles/[id]', () => {
    it('should update a caster profile', async () => {
      if (!casterProfileId || !authToken) {
        expect.skip();
        return;
      }
      
      const updateData = {
        companyDescription: 'Updated description for testing',
        teamSize: 20,
        website: 'https://updated.testproduction.com'
      };
      
      const response = await client.patch(`/api/v1/caster-profiles/${casterProfileId}`, updateData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.companyDescription).toBe(updateData.companyDescription);
      expect(response.data.data.teamSize).toBe(updateData.teamSize);
    });
    
    it('should reject update without auth', async () => {
      if (!casterProfileId) {
        expect.skip();
        return;
      }
      
      const response = await client.patch(`/api/v1/caster-profiles/${casterProfileId}`, {
        companyDescription: 'Unauthorized update'
      });
      
      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);
    });
  });
  
  describe('GET /api/v1/caster-profiles/taxonomy', () => {
    it('should return complete taxonomy structure', async () => {
      const response = await client.get('/api/v1/caster-profiles/taxonomy');
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('taxonomy');
      expect(response.data.data).toHaveProperty('meta');
      expect(response.data.data.meta).toHaveProperty('categories');
      expect(response.data.data.meta).toHaveProperty('types');
      expect(Array.isArray(response.data.data.meta.categories)).toBe(true);
      expect(Array.isArray(response.data.data.meta.types)).toBe(true);
      expect(response.data.data.meta.types.length).toBeGreaterThan(20); // Should have 23 types
    });
  });
  
  describe('POST /api/v1/caster-profiles/[id]/projects', () => {
    it('should add a project to the profile', async () => {
      if (!casterProfileId || !authToken) {
        expect.skip();
        return;
      }
      
      const projectData = {
        projectName: 'Test Film Project',
        projectType: 'Feature Film',
        projectYear: 2023,
        clientName: 'Test Client',
        projectDescription: 'A test film project for API testing',
        imageUrls: ['https://example.com/image1.jpg'],
        featured: true
      };
      
      const response = await client.post(
        `/api/v1/caster-profiles/${casterProfileId}/projects`,
        projectData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.projectName).toBe(projectData.projectName);
      expect(response.data.data.projectYear).toBe(projectData.projectYear);
    });
  });
  
  describe('POST /api/v1/caster-profiles/[id]/team', () => {
    it('should add a team member to the profile', async () => {
      if (!casterProfileId || !authToken) {
        expect.skip();
        return;
      }
      
      const memberData = {
        name: 'John Doe',
        role: 'Casting Director',
        email: 'john@testproduction.com',
        bio: 'Experienced casting director with 10 years in the industry',
        permissions: ['view_applications', 'edit_jobs']
      };
      
      const response = await client.post(
        `/api/v1/caster-profiles/${casterProfileId}/team`,
        memberData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.name).toBe(memberData.name);
      expect(response.data.data.role).toBe(memberData.role);
      expect(response.data.data.permissions).toEqual(memberData.permissions);
    });
  });
});

