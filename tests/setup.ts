/// <reference types="vitest/globals" />
import { prisma } from '@/packages/core-db/src/client';

declare const process: { env: { [key: string]: string | undefined } };

// Setup before all tests
beforeAll(async () => {
  console.log('🧪 Setting up test environment...');
  
  // Verify database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
});

// Cleanup after each test
afterEach(async () => {
  // Clean up test data (optional - comment out if you want to inspect data)
  // await prisma.user.deleteMany({
  //   where: { email: { contains: 'test-' } }
  // });
});

// Cleanup after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
});

// Global test utilities
export const TEST_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  apiVersion: 'v1',
};

export const API_ENDPOINTS = {
  register: `${TEST_CONFIG.baseURL}/api/${TEST_CONFIG.apiVersion}/auth/register`,
  login: `${TEST_CONFIG.baseURL}/api/${TEST_CONFIG.apiVersion}/auth/login`,
  logout: `${TEST_CONFIG.baseURL}/api/${TEST_CONFIG.apiVersion}/auth/logout`,
  me: `${TEST_CONFIG.baseURL}/api/${TEST_CONFIG.apiVersion}/auth/me`,
  refresh: `${TEST_CONFIG.baseURL}/api/${TEST_CONFIG.apiVersion}/auth/refresh`,
};

// Generate unique test email
export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

// Generate test user data
export function generateTestUser(role: 'talent' | 'caster' = 'talent') {
  return {
    email: generateTestEmail(),
    password: 'TestPass123!',
    name: `Test User ${Date.now()}`,
    role,
  };
}

