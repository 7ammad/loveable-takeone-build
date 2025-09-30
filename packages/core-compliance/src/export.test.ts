import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportComplianceData } from './export'
import { prisma } from '@/packages/core-db/src/client'

vi.mock('@/packages/core-db/src/client', () => ({
  prisma: {
    user: { findMany: vi.fn() },
    talentProfile: { findMany: vi.fn() },
    application: { findMany: vi.fn() },
    auditEvent: { findMany: vi.fn() },
  },
}));

describe('Compliance Export', () => {
  beforeEach(() => {
    // Reset mocks and provide default implementations for all of them
    vi.mocked(prisma.user.findMany).mockReset().mockResolvedValue([]);
    vi.mocked(prisma.talentProfile.findMany).mockReset().mockResolvedValue([]);
    vi.mocked(prisma.application.findMany).mockReset().mockResolvedValue([]);
    vi.mocked(prisma.auditEvent.findMany).mockReset().mockResolvedValue([]);
  });

  describe('exportComplianceData', () => {
    it('should export data with minors included when specified', async () => {
      // Mock data
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        { 
          id: 'user-1', 
          email: 'adult@example.com', 
          password: 'hashed-password',
          createdAt: new Date(), 
          updatedAt: new Date(),
          nafathVerified: false,
          nafathVerifiedAt: null,
          nafathNationalId: null,
          nafathTransactionId: null,
          nafathData: null,
          nafathExpiresAt: null
        },
        { 
          id: 'user-2', 
          email: 'minor@example.com', 
          password: 'hashed-password',
          createdAt: new Date(), 
          updatedAt: new Date(),
          nafathVerified: false,
          nafathVerifiedAt: null,
          nafathNationalId: null,
          nafathTransactionId: null,
          nafathData: null,
          nafathExpiresAt: null
        },
      ])

      vi.mocked(prisma.talentProfile.findMany).mockResolvedValue([
        { id: 'profile-1', userId: 'user-1', isMinor: false, guardianUserId: null, verified: true },
        { id: 'profile-2', userId: 'user-2', isMinor: true, guardianUserId: 'guardian-1', verified: false },
      ])

      const result = await exportComplianceData({ includeMinors: true })

      expect(result).toHaveProperty('exportDate')
      expect(result).toHaveProperty('options')
      expect(result).toHaveProperty('data')

      expect(result.data.users).toHaveLength(2)
      expect(result.data.talentProfiles).toHaveLength(2)
    })

    it('should redact minors data when includeMinors is false', async () => {
      // Mock data
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        { 
          id: 'user-1', 
          email: 'adult@example.com', 
          password: 'hashed-password',
          createdAt: new Date(), 
          updatedAt: new Date(),
          nafathVerified: false,
          nafathVerifiedAt: null,
          nafathNationalId: null,
          nafathTransactionId: null,
          nafathData: null,
          nafathExpiresAt: null
        },
        { 
          id: 'user-2', 
          email: 'minor@example.com', 
          password: 'hashed-password',
          createdAt: new Date(), 
          updatedAt: new Date(),
          nafathVerified: false,
          nafathVerifiedAt: null,
          nafathNationalId: null,
          nafathTransactionId: null,
          nafathData: null,
          nafathExpiresAt: null
        },
      ])

      vi.mocked(prisma.talentProfile.findMany).mockResolvedValue([
        { id: 'profile-1', userId: 'user-1', isMinor: false, guardianUserId: null, verified: true },
        { id: 'profile-2', userId: 'user-2', isMinor: true, guardianUserId: 'guardian-1', verified: false },
      ])

      const result = await exportComplianceData({ includeMinors: false })

      expect(result.data.users).toHaveLength(2)

      // Check adult user (not redacted)
      const adultUser = result.data.users.find(u => u.id === 'user-1')
      expect(adultUser?.email).toBe('adult@example.com')
      expect(adultUser?.role).toBe('TALENT')

      // Check minor user (redacted)
      const minorUser = result.data.users.find(u => u.id === 'user-2')
      expect(minorUser?.email).toBe('REDACTED')
      expect(minorUser?.role).toBe('MINOR_REDACTED')
      expect(minorUser?.hasGuardian).toBe(true)
    })

    it('should filter by date range when specified', async () => {
      const fromDate = new Date('2024-01-01')
      const toDate = new Date('2024-01-31')

      await exportComplianceData({
        includeMinors: false,
        dateRange: { from: fromDate, to: toDate },
      })

      expect(prisma.application.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: fromDate,
            lte: toDate,
          },
        },
      })

      expect(prisma.auditEvent.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: fromDate,
            lte: toDate,
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should include purpose filter for audit events', async () => {
      const purpose = 'user_consent'

      await exportComplianceData({
        includeMinors: false,
        purpose,
      })

      expect(prisma.auditEvent.findMany).toHaveBeenCalledWith({
        where: {
          purpose,
        },
        orderBy: { createdAt: 'desc' },
      })
    })
  })
})
