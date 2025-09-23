import { describe, it, expect } from 'vitest'
import { generateWatermark, verifyWatermark } from './signed-hls'

describe('Watermark Functions', () => {
  describe('generateWatermark', () => {
    it('should generate a base64 encoded watermark', () => {
      const roleId = 'role-123'
      const applicationId = 'app-456'
      const timestamp = 1640995200000 // 2022-01-01 00:00:00 UTC

      const watermark = generateWatermark(roleId, applicationId, timestamp)
      expect(typeof watermark).toBe('string')
      expect(() => Buffer.from(watermark, 'base64')).not.toThrow()
    })

    it('should include role ID, application ID, and timestamp', () => {
      const roleId = 'role-123'
      const applicationId = 'app-456'
      const timestamp = 1640995200000

      const watermark = generateWatermark(roleId, applicationId, timestamp)
      const decoded = Buffer.from(watermark, 'base64').toString()
      const [decodedRoleId, decodedAppId, decodedTimestamp] = decoded.split('|')

      expect(decodedRoleId).toBe(roleId)
      expect(decodedAppId).toBe(applicationId)
      expect(decodedTimestamp).toBe(timestamp.toString())
    })
  })

  describe('verifyWatermark', () => {
    it('should verify a valid watermark', () => {
      const roleId = 'role-123'
      const applicationId = 'app-456'
      const timestamp = 1640995200000

      const watermark = generateWatermark(roleId, applicationId, timestamp)
      const result = verifyWatermark(watermark)

      expect(result).toEqual({
        roleId,
        applicationId,
        timestamp,
      })
    })

    it('should return null for invalid base64', () => {
      const result = verifyWatermark('invalid-base64!')
      expect(result).toBeNull()
    })

    it('should return null for malformed data', () => {
      const invalidWatermark = Buffer.from('invalid|data').toString('base64')
      const result = verifyWatermark(invalidWatermark)
      expect(result).toBeNull()
    })

    it('should return null for non-numeric timestamp', () => {
      const invalidWatermark = Buffer.from('role-123|app-456|not-a-number').toString('base64')
      const result = verifyWatermark(invalidWatermark)
      expect(result).toBeNull()
    })
  })

  describe('watermark roundtrip', () => {
    it('should maintain data integrity through generate and verify', () => {
      const testCases = [
        { roleId: 'role-1', applicationId: 'app-1', timestamp: 1000000000 },
        { roleId: 'casting-director-abc', applicationId: 'application-xyz', timestamp: Date.now() },
        { roleId: 'role-with-dashes', applicationId: 'app_with_underscores', timestamp: 1640995200000 },
      ]

      testCases.forEach(({ roleId, applicationId, timestamp }) => {
        const watermark = generateWatermark(roleId, applicationId, timestamp)
        const result = verifyWatermark(watermark)

        expect(result).toEqual({
          roleId,
          applicationId,
          timestamp,
        })
      })
    })
  })
})
