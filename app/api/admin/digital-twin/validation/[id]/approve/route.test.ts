import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from './route';

// Mock Prisma
const mockPrisma = {
  castingCall: {
    update: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

describe('Digital Twin Validation Approve API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/admin/digital-twin/validation/[id]/approve', () => {
    it('should approve a casting call', async () => {
      const callId = 'test-call-id';
      const mockUpdatedCall = {
        id: callId,
        title: 'Approved Call',
        status: 'live',
        updatedAt: new Date(),
      };

      mockPrisma.castingCall.update.mockResolvedValue(mockUpdatedCall);

      const mockParams = { params: { id: callId } };
      const response = await POST({} as any, mockParams);

      expect(mockPrisma.castingCall.update).toHaveBeenCalledWith({
        where: { id: callId },
        data: { status: 'live' },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.call).toEqual(mockUpdatedCall);
    });

    it('should handle database errors', async () => {
      const callId = 'test-call-id';
      mockPrisma.castingCall.update.mockRejectedValue(new Error('Database error'));

      const mockParams = { params: { id: callId } };
      const response = await POST({} as any, mockParams);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to approve casting call');
    });
  });
});
