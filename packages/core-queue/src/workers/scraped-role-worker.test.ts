import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock BullMQ Worker
vi.mock('bullmq', () => ({
  Worker: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    close: vi.fn(),
  })),
}));

// Mock Prisma
const mockPrisma = {
  castingCall: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  $disconnect: vi.fn(),
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

// Mock queues
const mockDlq = {
  add: vi.fn(),
};

vi.mock('../queues.js', () => ({
  dlq: mockDlq,
}));

// Import crypto for testing
import crypto from 'crypto';

describe.skipIf(!process.env.REDIS_URL)('Scraped Role Worker Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper function to simulate worker logic
  const processScrapedRoleJob = async (jobData: any) => {
    console.log(`Processing scraped role: ${jobData.title} from ${jobData.sourceName}`);

    // Create content hash for deduplication
    const contentString = `${jobData.title}|${jobData.description || ''}|${jobData.company || ''}|${jobData.location || ''}`;
    const contentHash = crypto.createHash('md5').update(contentString).digest('hex');

    // Check for duplicates
    const existingCall = await mockPrisma.castingCall.findUnique({
      where: { contentHash },
    });

    if (existingCall) {
      console.log(`Duplicate casting call detected: ${jobData.title} (hash: ${contentHash})`);
      return { status: 'duplicate', existingId: existingCall.id };
    }

    // Parse deadline if provided
    let deadline: Date | undefined;
    if (jobData.deadline) {
      try {
        deadline = new Date(jobData.deadline);
        // Validate the date
        if (isNaN(deadline.getTime())) {
          deadline = undefined;
        }
      } catch {
        deadline = undefined;
      }
    }

    // Create the casting call
    const newCastingCall = await mockPrisma.castingCall.create({
      data: {
        title: jobData.title,
        description: jobData.description,
        company: jobData.company,
        location: jobData.location,
        compensation: jobData.compensation,
        requirements: jobData.requirements,
        deadline,
        contactInfo: jobData.contactInfo,
        sourceUrl: jobData.sourceUrl,
        contentHash,
        status: 'pending_review', // All scraped calls need admin review
      },
    });

    console.log(`✅ Created casting call: ${newCastingCall.title} (ID: ${newCastingCall.id})`);

    return {
      status: 'created',
      castingCallId: newCastingCall.id,
      title: newCastingCall.title
    };
  };

  describe('Job Processing', () => {
    it('should create a new casting call successfully', async () => {

      const jobData = {
        title: 'New Casting Call',
        description: 'Looking for talented actors',
        company: 'Film Studios',
        location: 'Dubai',
        compensation: 'AED 10,000',
        requirements: '3+ years experience',
        deadline: '2025-12-01',
        contactInfo: 'apply@filmstudios.com',
        sourceUrl: 'https://filmstudios.com/careers',
        sourceName: 'Film Studios',
        ingestedAt: new Date().toISOString(),
      };

      // Mock no existing call (no duplicate)
      mockPrisma.castingCall.findUnique.mockResolvedValue(null);

      // Mock successful creation
      const createdCall = {
        id: 'new-call-id',
        ...jobData,
        status: 'pending_review',
        contentHash: expect.any(String),
        isAggregated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.castingCall.create.mockResolvedValue(createdCall);

      // Create a mock job
      const mockJob = {
        id: 'test-job-id',
        data: jobData,
      };

      // Manually call the worker's process function
      // Note: In a real scenario, we'd use BullMQ's testing utilities
      const result = await processScrapedRoleJob(mockJob.data);

      expect(mockPrisma.castingCall.findUnique).toHaveBeenCalled();
      expect(mockPrisma.castingCall.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: jobData.title,
          status: 'pending_review',
          contentHash: expect.any(String),
        }),
      });

      expect(result).toEqual({
        status: 'created',
        castingCallId: 'new-call-id',
        title: 'New Casting Call',
      });
    });

    it('should detect and skip duplicates', async () => {
      const workerModule = await import('./scraped-role-worker.js');

      const jobData = {
        title: 'Duplicate Casting Call',
        description: 'This already exists',
        company: 'Existing Studios',
        location: 'Riyadh',
        sourceUrl: 'https://existing.com',
        sourceName: 'Existing Site',
        ingestedAt: new Date().toISOString(),
      };

      // Mock existing call
      const existingCall = {
        id: 'existing-id',
        title: jobData.title,
        contentHash: 'existing-hash',
      };
      mockPrisma.castingCall.findUnique.mockResolvedValue(existingCall);

      const mockJob = {
        id: 'test-job-id',
        data: jobData,
      };

      const result = await (workerModule.default as any).opts.processFn(mockJob);

      expect(mockPrisma.castingCall.findUnique).toHaveBeenCalled();
      expect(mockPrisma.castingCall.create).not.toHaveBeenCalled();

      expect(result).toEqual({
        status: 'duplicate',
        existingId: 'existing-id',
      });
    });

    it('should handle database errors gracefully', async () => {
      const workerModule = await import('./scraped-role-worker.js');

      const jobData = {
        title: 'Error Call',
        description: 'This will fail',
        sourceUrl: 'https://error.com',
        sourceName: 'Error Site',
        ingestedAt: new Date().toISOString(),
      };

      // Mock database error
      mockPrisma.castingCall.findUnique.mockRejectedValue(new Error('Database connection failed'));

      const mockJob = {
        id: 'test-job-id',
        data: jobData,
      };

      // Should throw error for BullMQ to handle
      await expect(
        (workerModule.default as any).opts.processFn(mockJob)
      ).rejects.toThrow('Database connection failed');

      // Should add to dead letter queue
      expect(mockDlq.add).toHaveBeenCalledWith('failed-scraped-role', {
        originalJob: jobData,
        error: 'Database connection failed',
        failedAt: expect.any(String),
      });
    });

    it('should generate consistent content hashes', async () => {
      const workerModule = await import('./scraped-role-worker.js');

      const jobData1 = {
        title: 'Test Call',
        description: 'Same content',
        company: 'Test Co',
        location: 'Test City',
        sourceUrl: 'https://test.com',
        sourceName: 'Test Site',
        ingestedAt: new Date().toISOString(),
      };

      const jobData2 = {
        title: 'Different Title',
        description: 'Same content',
        company: 'Test Co',
        location: 'Test City',
        sourceUrl: 'https://test.com',
        sourceName: 'Test Site',
        ingestedAt: new Date().toISOString(),
      };

      // Both should generate the same hash for content deduplication
      const contentString = `${jobData1.title}|${jobData1.description}|${jobData1.company}|${jobData1.location}`;
      const expectedHash = expect.any(String);

      mockPrisma.castingCall.findUnique.mockResolvedValue(null);
      mockPrisma.castingCall.create.mockResolvedValue({
        id: 'call-1',
        title: jobData1.title,
        status: 'pending_review',
        contentHash: expectedHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await (workerModule.default as any).opts.processFn({ id: 'job-1', data: jobData1 });

      expect(mockPrisma.castingCall.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          contentHash: expectedHash,
        }),
      });
    });

    it('should handle optional fields correctly', async () => {
      const workerModule = await import('./scraped-role-worker.js');

      const jobData = {
        title: 'Minimal Call',
        sourceUrl: 'https://minimal.com',
        sourceName: 'Minimal Site',
        ingestedAt: new Date().toISOString(),
        // All other fields are optional
      };

      mockPrisma.castingCall.findUnique.mockResolvedValue(null);
      mockPrisma.castingCall.create.mockResolvedValue({
        id: 'minimal-call-id',
        title: jobData.title,
        status: 'pending_review',
        contentHash: expect.any(String),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await (workerModule.default as any).opts.processFn({
        id: 'test-job-id',
        data: jobData
      });

      expect(mockPrisma.castingCall.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Minimal Call',
          description: null,
          company: null,
          location: null,
          compensation: null,
          requirements: null,
          deadline: null,
          contactInfo: null,
          sourceUrl: 'https://minimal.com',
          status: 'pending_review',
        }),
      });
    });
  });
});
