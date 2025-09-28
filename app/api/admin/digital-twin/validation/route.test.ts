import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';

// Mock Prisma
const mockPrisma = {
  castingCall: {
    findMany: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

describe('Digital Twin Validation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/digital-twin/validation', () => {
    it('should return pending casting calls', async () => {
      const mockCalls = [
        {
          id: 'call-1',
          title: 'Senior Actor Role',
          description: 'Looking for experienced actor',
          company: 'MBC Studios',
          location: 'Riyadh',
          status: 'pending_review',
          sourceUrl: 'https://mbc.com/careers',
          createdAt: new Date(),
        },
        {
          id: 'call-2',
          title: 'Voice Actor Needed',
          description: 'Voice over work',
          company: 'Sound Studios',
          location: 'Jeddah',
          status: 'pending_review',
          sourceUrl: null,
          createdAt: new Date(),
        },
      ];

      mockPrisma.castingCall.findMany.mockResolvedValue(mockCalls);

      const response = await GET();

      expect(mockPrisma.castingCall.findMany).toHaveBeenCalledWith({
        where: { status: 'pending_review' },
        orderBy: { createdAt: 'desc' },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.calls).toEqual(mockCalls);
    });

    it('should handle empty results', async () => {
      mockPrisma.castingCall.findMany.mockResolvedValue([]);

      const response = await GET();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.calls).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockPrisma.castingCall.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET();

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch pending calls');
    });
  });
});
