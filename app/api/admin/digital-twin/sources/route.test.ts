import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { GET, POST } from './route';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
const mockPrisma = {
  ingestionSource: {
    findMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

describe('Digital Twin Sources API', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/digital-twin/sources', () => {
    it('should return all ingestion sources', async () => {
      const mockSources = [
        {
          id: 'source-1',
          sourceType: 'WEB',
          sourceIdentifier: 'https://example.com',
          sourceName: 'Example Site',
          isActive: true,
          lastProcessedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.ingestionSource.findMany.mockResolvedValue(mockSources);

      const request = new Request('http://localhost/api/admin/digital-twin/sources');
      const response = await GET();

      expect(mockPrisma.ingestionSource.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.sources).toEqual(mockSources);
    });

    it('should handle database errors', async () => {
      mockPrisma.ingestionSource.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET();

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch sources');
    });
  });

  describe('POST /api/admin/digital-twin/sources', () => {
    it('should create a new web source', async () => {
      const newSource = {
        sourceType: 'WEB',
        sourceIdentifier: 'https://newsite.com',
        sourceName: 'New Site',
        isActive: true,
      };

      const createdSource = {
        id: 'new-source-id',
        ...newSource,
        lastProcessedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.ingestionSource.findFirst.mockResolvedValue(null); // No duplicate
      mockPrisma.ingestionSource.create.mockResolvedValue(createdSource);

      const request = new Request('http://localhost/api/admin/digital-twin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSource),
      });

      // Mock the request object
      const mockRequest = {
        json: vi.fn().mockResolvedValue(newSource),
      };

      const response = await POST(mockRequest as any);

      expect(mockPrisma.ingestionSource.findFirst).toHaveBeenCalledWith({
        where: { sourceIdentifier: newSource.sourceIdentifier },
      });

      expect(mockPrisma.ingestionSource.create).toHaveBeenCalledWith({
        data: newSource,
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.source).toEqual(createdSource);
    });

    it('should create a WhatsApp source', async () => {
      const newSource = {
        sourceType: 'WHATSAPP',
        sourceIdentifier: '123456789@g.us',
        sourceName: 'Test Group',
        isActive: true,
      };

      const createdSource = {
        id: 'whatsapp-source-id',
        ...newSource,
        lastProcessedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.ingestionSource.findFirst.mockResolvedValue(null);
      mockPrisma.ingestionSource.create.mockResolvedValue(createdSource);

      const mockRequest = {
        json: vi.fn().mockResolvedValue(newSource),
      };

      const response = await POST(mockRequest as any);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.source.sourceType).toBe('WHATSAPP');
    });

    it('should reject invalid source type', async () => {
      const invalidSource = {
        sourceType: 'INVALID',
        sourceIdentifier: 'test',
        sourceName: 'Test',
      };

      const mockRequest = {
        json: vi.fn().mockResolvedValue(invalidSource),
      };

      const response = await POST(mockRequest as any);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid source type');
    });

    it('should reject duplicate source identifiers', async () => {
      const duplicateSource = {
        sourceType: 'WEB',
        sourceIdentifier: 'https://existing.com',
        sourceName: 'Existing Site',
      };

      mockPrisma.ingestionSource.findFirst.mockResolvedValue({
        id: 'existing-id',
        sourceIdentifier: 'https://existing.com',
      });

      const mockRequest = {
        json: vi.fn().mockResolvedValue(duplicateSource),
      };

      const response = await POST(mockRequest as any);

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error).toBe('Source identifier already exists');
    });

    it('should require all fields', async () => {
      const incompleteSource = {
        sourceType: 'WEB',
        // Missing sourceIdentifier and sourceName
      };

      const mockRequest = {
        json: vi.fn().mockResolvedValue(incompleteSource),
      };

      const response = await POST(mockRequest as any);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Missing required fields');
    });
  });
});
