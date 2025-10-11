/**
 * Tests for RBAC and Auth Helpers
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  getCurrentUser,
  requireAuth,
  requireRole,
  createAuditLog,
  AuditEventType,
} from '@/lib/auth-helpers';
import { verifyAccessToken } from '@packages/core-auth';
import { prisma } from '@packages/core-db';

// Mock dependencies
vi.mock('@packages/core-auth', () => ({
  verifyAccessToken: vi.fn(),
}));

vi.mock('@packages/core-db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    auditEvent: {
      create: vi.fn(),
    },
  },
}));

describe('auth-helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAuditLog', () => {
    it('should create audit log successfully', async () => {
      vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as any);

      await createAuditLog({
        eventType: AuditEventType.LOGIN_SUCCESS,
        actorUserId: 'user-123',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        success: true,
      });

      expect(prisma.auditEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: AuditEventType.LOGIN_SUCCESS,
          actorUserId: 'user-123',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
          success: true,
        }),
      });
    });

    it('should retry on failure', async () => {
      vi.mocked(prisma.auditEvent.create)
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce({} as any);

      await createAuditLog({
        eventType: AuditEventType.LOGIN_SUCCESS,
        actorUserId: 'user-123',
        success: true,
      });

      expect(prisma.auditEvent.create).toHaveBeenCalledTimes(3);
    });

    it('should not throw error after all retries fail', async () => {
      vi.mocked(prisma.auditEvent.create).mockRejectedValue(new Error('Connection failed'));

      // Should not throw
      await expect(
        createAuditLog({
          eventType: AuditEventType.LOGIN_SUCCESS,
          actorUserId: 'user-123',
          success: true,
        })
      ).resolves.not.toThrow();

      expect(prisma.auditEvent.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('getCurrentUser', () => {
    const mockRequest = (token: string = 'valid-token') =>
      new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    it('should return null when no token provided', async () => {
      const req = new NextRequest('http://localhost:3000/api/test');
      const result = await getCurrentUser(req);

      expect(result).toBeNull();
    });

    it('should return null when token is invalid', async () => {
      vi.mocked(verifyAccessToken).mockResolvedValue(null);

      const req = mockRequest();
      const result = await getCurrentUser(req);

      expect(result).toBeNull();
    });

    it('should return user when token is valid', async () => {
      vi.mocked(verifyAccessToken).mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      } as any);

      const req = mockRequest();
      const result = await getCurrentUser(req);

      expect(result).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      });
    });
  });

  describe('requireRole', () => {
    const mockRequest = (token: string = 'valid-token', role: string = 'admin') =>
      new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-forwarded-for': '127.0.0.1',
          'user-agent': 'test-agent',
        },
      });

    it('should return 401 when no token provided', async () => {
      const req = new NextRequest('http://localhost:3000/api/test');
      const result = await requireRole(req, ['admin']);

      expect((result as any).status).toBe(401);
    });

    it('should return 401 when token is invalid', async () => {
      vi.mocked(verifyAccessToken).mockResolvedValue(null);

      const req = mockRequest();
      const result = await requireRole(req, ['admin']);

      expect((result as any).status).toBe(401);
    });

    it('should return 403 when user lacks required role', async () => {
      vi.mocked(verifyAccessToken).mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'talent',
      } as any);

      const req = mockRequest();
      const result = await requireRole(req, ['admin']);

      expect((result as any).status).toBe(403);
    });

    it('should return user when authorized', async () => {
      vi.mocked(verifyAccessToken).mockResolvedValue({
        userId: 'user-123',
        email: 'admin@example.com',
        role: 'admin',
      } as any);

      const req = mockRequest();
      const result = await requireRole(req, ['admin']);

      expect(result).toHaveProperty('userId', 'user-123');
      expect(result).toHaveProperty('email', 'admin@example.com');
      expect(result).toHaveProperty('role', 'admin');
    });

    it('should allow admin to access all roles', async () => {
      vi.mocked(verifyAccessToken).mockResolvedValue({
        userId: 'user-123',
        email: 'admin@example.com',
        role: 'admin',
      } as any);

      const req = mockRequest();
      const result = await requireRole(req, ['talent', 'caster']);

      // Admin should be allowed
      expect(result).toHaveProperty('userId', 'user-123');
    });
  });
});
