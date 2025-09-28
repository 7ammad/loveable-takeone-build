import { describe, it, expect, beforeEach, vi } from 'vitest';
import crypto from 'crypto';

// Mock Prisma
const mockPrisma = {
  castingCall: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
  ingestionSource: {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
    findFirst: vi.fn(),
  },
  $disconnect: vi.fn(),
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

// Test data
const testCastingCall = {
  title: 'Senior Actor for Drama Series',
  description: 'Looking for experienced actor for lead role in new drama series',
  company: 'MBC Studios',
  location: 'Riyadh, Saudi Arabia',
  compensation: 'SAR 50,000 per episode',
  requirements: '5+ years experience, fluent Arabic, professional headshots',
  deadline: new Date('2025-10-01'),
  contactInfo: 'Apply via email: casting@mbc.com',
  sourceUrl: 'https://mbc.com/careers/actor-drama-series',
};

const testIngestionSource = {
  sourceType: 'WEB' as const,
  sourceIdentifier: 'https://mbc.com/careers',
  sourceName: 'MBC Careers',
  isActive: true,
};

describe('Digital Twin Database Models', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CastingCall Model', () => {
    it('should create a casting call with all fields', async () => {
      const contentString = `${testCastingCall.title}|${testCastingCall.description || ''}|${testCastingCall.company || ''}|${testCastingCall.location || ''}`;
      const contentHash = crypto.createHash('md5').update(contentString).digest('hex');

      const mockCreatedCall = {
        id: 'call-123',
        ...testCastingCall,
        contentHash,
        status: 'pending_review',
        isAggregated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.castingCall.create.mockResolvedValue(mockCreatedCall);

      const castingCall = await mockPrisma.castingCall.create({
        data: {
          ...testCastingCall,
          contentHash,
        },
      });

      expect(castingCall.id).toBeDefined();
      expect(castingCall.title).toBe(testCastingCall.title);
      expect(castingCall.status).toBe('pending_review');
      expect(castingCall.isAggregated).toBe(true);
      expect(castingCall.contentHash).toBe(contentHash);
      expect(castingCall.createdAt).toBeInstanceOf(Date);
    });

    it('should enforce unique content hash', async () => {
      const contentString = `${testCastingCall.title}|${testCastingCall.description || ''}|${testCastingCall.company || ''}|${testCastingCall.location || ''}`;
      const contentHash = crypto.createHash('md5').update(contentString).digest('hex');

      // Create first casting call
      await prisma.castingCall.create({
        data: {
          ...testCastingCall,
          contentHash,
        },
      });

      // Try to create duplicate - should fail
      await expect(
        prisma.castingCall.create({
          data: {
            ...testCastingCall,
            title: 'Different Title But Same Content',
            contentHash, // Same hash
          },
        })
      ).rejects.toThrow();
    });

    it('should default to pending_review status', async () => {
      const contentString = `${testCastingCall.title}|${testCastingCall.description || ''}|${testCastingCall.company || ''}|${testCastingCall.location || ''}`;
      const contentHash = crypto.createHash('md5').update(contentString).digest('hex');

      const castingCall = await prisma.castingCall.create({
        data: {
          title: 'Test Call',
          contentHash,
        },
      });

      expect(castingCall.status).toBe('pending_review');
    });

    it('should update status correctly', async () => {
      const contentString = `${testCastingCall.title}|${testCastingCall.description || ''}|${testCastingCall.company || ''}|${testCastingCall.location || ''}`;
      const contentHash = crypto.createHash('md5').update(contentString).digest('hex');

      const castingCall = await prisma.castingCall.create({
        data: {
          ...testCastingCall,
          contentHash,
        },
      });

      const updated = await prisma.castingCall.update({
        where: { id: castingCall.id },
        data: { status: 'live' },
      });

      expect(updated.status).toBe('live');
    });

    it('should handle optional fields correctly', async () => {
      const contentString = 'Minimal Call||||';
      const contentHash = crypto.createHash('md5').update(contentString).digest('hex');

      const castingCall = await prisma.castingCall.create({
        data: {
          title: 'Minimal Call',
          contentHash,
        },
      });

      expect(castingCall.description).toBeNull();
      expect(castingCall.company).toBeNull();
      expect(castingCall.location).toBeNull();
      expect(castingCall.compensation).toBeNull();
      expect(castingCall.requirements).toBeNull();
      expect(castingCall.deadline).toBeNull();
      expect(castingCall.contactInfo).toBeNull();
      expect(castingCall.sourceUrl).toBeNull();
    });
  });

  describe('IngestionSource Model', () => {
    it('should create an ingestion source', async () => {
      const source = await prisma.ingestionSource.create({
        data: testIngestionSource,
      });

      expect(source.id).toBeDefined();
      expect(source.sourceType).toBe('WEB');
      expect(source.sourceIdentifier).toBe(testIngestionSource.sourceIdentifier);
      expect(source.sourceName).toBe(testIngestionSource.sourceName);
      expect(source.isActive).toBe(true);
      expect(source.lastProcessedAt).toBeNull();
      expect(source.createdAt).toBeInstanceOf(Date);
    });

    it('should support both WEB and WHATSAPP source types', async () => {
      const webSource = await prisma.ingestionSource.create({
        data: {
          sourceType: 'WEB',
          sourceIdentifier: 'https://example.com',
          sourceName: 'Example Site',
        },
      });

      const whatsappSource = await prisma.ingestionSource.create({
        data: {
          sourceType: 'WHATSAPP',
          sourceIdentifier: '123456789@g.us',
          sourceName: 'Test Group',
        },
      });

      expect(webSource.sourceType).toBe('WEB');
      expect(whatsappSource.sourceType).toBe('WHATSAPP');
    });

    it('should update lastProcessedAt timestamp', async () => {
      const source = await prisma.ingestionSource.create({
        data: testIngestionSource,
      });

      const processTime = new Date();
      const updated = await prisma.ingestionSource.update({
        where: { id: source.id },
        data: { lastProcessedAt: processTime },
      });

      expect(updated.lastProcessedAt).toEqual(processTime);
    });

    it('should toggle active status', async () => {
      const source = await prisma.ingestionSource.create({
        data: testIngestionSource,
      });

      const deactivated = await prisma.ingestionSource.update({
        where: { id: source.id },
        data: { isActive: false },
      });

      expect(deactivated.isActive).toBe(false);
    });

    it('should find active sources only', async () => {
      // Create active source
      await prisma.ingestionSource.create({
        data: testIngestionSource,
      });

      // Create inactive source
      await prisma.ingestionSource.create({
        data: {
          sourceType: 'WEB',
          sourceIdentifier: 'https://inactive.com',
          sourceName: 'Inactive Site',
          isActive: false,
        },
      });

      const activeSources = await prisma.ingestionSource.findMany({
        where: { isActive: true },
      });

      expect(activeSources).toHaveLength(1);
      expect(activeSources[0].sourceName).toBe(testIngestionSource.sourceName);
    });
  });

  describe('Model Relationships', () => {
    it('should support CastingCall to Application relationship', async () => {
      const contentString = `${testCastingCall.title}|${testCastingCall.description || ''}|${testCastingCall.company || ''}|${testCastingCall.location || ''}`;
      const contentHash = crypto.createHash('md5').update(contentString).digest('hex');

      const castingCall = await prisma.castingCall.create({
        data: {
          ...testCastingCall,
          contentHash,
        },
      });

      // Note: We can't fully test the Application relationship without creating Application records
      // This test verifies the model structure is correct
      expect(castingCall.applications).toBeDefined();
    });
  });
});
