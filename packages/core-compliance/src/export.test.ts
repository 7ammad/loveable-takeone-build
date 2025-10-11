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
      // Mock data with all required fields
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        { 
          id: 'user-1', 
          email: 'adult@example.com',
          name: 'Adult User',
          role: 'talent',
          password: 'hashed-password',
          emailVerified: true,
          emailVerifiedAt: new Date(),
          phone: '+1234567890',
          phoneVerified: false,
          phoneVerifiedAt: null,
          avatar: null,
          bio: 'Test bio',
          isActive: true,
          lastLoginAt: new Date(),
          createdAt: new Date(), 
          updatedAt: new Date(),
          nafathVerified: false,
          nafathVerifiedAt: null,
          nafathNationalId: null,
          nafathTransactionId: null,
          nafathData: null,
          nafathExpiresAt: null,
          failedLoginAttempts: 0,
          lastFailedLoginAt: null,
          accountLockedUntil: null,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: []
        },
        { 
          id: 'user-2', 
          email: 'minor@example.com',
          name: 'Minor User',
          role: 'talent',
          password: 'hashed-password',
          emailVerified: false,
          emailVerifiedAt: null,
          phone: null,
          phoneVerified: false,
          phoneVerifiedAt: null,
          avatar: null,
          bio: null,
          isActive: true,
          lastLoginAt: null,
          createdAt: new Date(), 
          updatedAt: new Date(),
          nafathVerified: false,
          nafathVerifiedAt: null,
          nafathNationalId: null,
          nafathTransactionId: null,
          nafathData: null,
          nafathExpiresAt: null,
          failedLoginAttempts: 0,
          lastFailedLoginAt: null,
          accountLockedUntil: null,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: []
        },
      ])

      vi.mocked(prisma.talentProfile.findMany).mockResolvedValue([
        { 
          id: 'profile-1', 
          userId: 'user-1', 
          createdAt: new Date(),
          updatedAt: new Date(),
          stageName: 'Adult Talent',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'Other',
          height: 170,
          weight: 65,
          eyeColor: 'Brown',
          hairColor: 'Black',
          skills: ['Acting'],
          languages: ['English'],
          experience: 5,
          city: 'Riyadh',
          willingToTravel: true,
          portfolioUrl: null,
          demoReelUrl: null,
          instagramUrl: null,
          rating: 0,
          isMinor: false, 
          guardianUserId: null, 
          verified: true,
          completionPercentage: 80
        },
        { 
          id: 'profile-2', 
          userId: 'user-2', 
          createdAt: new Date(),
          updatedAt: new Date(),
          stageName: 'Minor Talent',
          dateOfBirth: new Date('2010-01-01'),
          gender: 'Other',
          height: 150,
          weight: 45,
          eyeColor: 'Brown',
          hairColor: 'Black',
          skills: ['Acting'],
          languages: ['English'],
          experience: 1,
          city: 'Jeddah',
          willingToTravel: false,
          portfolioUrl: null,
          demoReelUrl: null,
          instagramUrl: null,
          rating: 0,
          isMinor: true, 
          guardianUserId: 'guardian-1', 
          verified: false,
          completionPercentage: 50
        },
      ])

      const result = await exportComplianceData({ includeMinors: true })

      expect(result).toHaveProperty('exportDate')
      expect(result).toHaveProperty('options')
      expect(result).toHaveProperty('data')

      expect(result.data.users).toHaveLength(2)
      expect(result.data.talentProfiles).toHaveLength(2)
    })

    it('should redact minors data when includeMinors is false', async () => {
      // Mock data with all required fields
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        { 
          id: 'user-1', 
          email: 'adult@example.com',
          name: 'Adult User',
          role: 'talent',
          password: 'hashed-password',
          emailVerified: true,
          emailVerifiedAt: new Date(),
          phone: '+1234567890',
          phoneVerified: false,
          phoneVerifiedAt: null,
          avatar: null,
          bio: 'Test bio',
          isActive: true,
          lastLoginAt: new Date(),
          createdAt: new Date(), 
          updatedAt: new Date(),
          nafathVerified: false,
          nafathVerifiedAt: null,
          nafathNationalId: null,
          nafathTransactionId: null,
          nafathData: null,
          nafathExpiresAt: null,
          failedLoginAttempts: 0,
          lastFailedLoginAt: null,
          accountLockedUntil: null,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: []
        },
        { 
          id: 'user-2', 
          email: 'minor@example.com',
          name: 'Minor User',
          role: 'talent',
          password: 'hashed-password',
          emailVerified: false,
          emailVerifiedAt: null,
          phone: null,
          phoneVerified: false,
          phoneVerifiedAt: null,
          avatar: null,
          bio: null,
          isActive: true,
          lastLoginAt: null,
          createdAt: new Date(), 
          updatedAt: new Date(),
          nafathVerified: false,
          nafathVerifiedAt: null,
          nafathNationalId: null,
          nafathTransactionId: null,
          nafathData: null,
          nafathExpiresAt: null,
          failedLoginAttempts: 0,
          lastFailedLoginAt: null,
          accountLockedUntil: null,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: []
        },
      ])

      vi.mocked(prisma.talentProfile.findMany).mockResolvedValue([
        { 
          id: 'profile-1', 
          userId: 'user-1', 
          createdAt: new Date(),
          updatedAt: new Date(),
          stageName: 'Adult Talent',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'Other',
          height: 170,
          weight: 65,
          eyeColor: 'Brown',
          hairColor: 'Black',
          skills: ['Acting'],
          languages: ['English'],
          experience: 5,
          city: 'Riyadh',
          willingToTravel: true,
          portfolioUrl: null,
          demoReelUrl: null,
          instagramUrl: null,
          rating: 0,
          isMinor: false, 
          guardianUserId: null, 
          verified: true,
          completionPercentage: 80
        },
        { 
          id: 'profile-2', 
          userId: 'user-2', 
          createdAt: new Date(),
          updatedAt: new Date(),
          stageName: 'Minor Talent',
          dateOfBirth: new Date('2010-01-01'),
          gender: 'Other',
          height: 150,
          weight: 45,
          eyeColor: 'Brown',
          hairColor: 'Black',
          skills: ['Acting'],
          languages: ['English'],
          experience: 1,
          city: 'Jeddah',
          willingToTravel: false,
          portfolioUrl: null,
          demoReelUrl: null,
          instagramUrl: null,
          rating: 0,
          isMinor: true, 
          guardianUserId: 'guardian-1', 
          verified: false,
          completionPercentage: 50
        },
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
