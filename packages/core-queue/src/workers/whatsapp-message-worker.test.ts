import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock Prisma
const mockPrisma = {
  castingCall: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

// Mock queues
const mockProcessScrapedRoleQueue = {
  add: vi.fn(),
};
const mockDlq = {
  add: vi.fn(),
};

vi.mock('../queues.js', () => ({
  processScrapedRoleQueue: mockProcessScrapedRoleQueue,
  dlq: mockDlq,
}));

// Mock fetch for OpenAI API
global.fetch = vi.fn();

describe('WhatsApp Message Worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Message Analysis', () => {
    it('should identify casting calls correctly', async () => {
      const workerModule = await import('./whatsapp-message-worker.js');

      const castingCallMessage = {
        messageId: 'msg-123',
        content: 'Urgent: Looking for experienced actors for new drama series. Pay: SAR 30,000. Contact: director@production.com',
        sourceName: 'Riyadh Actors Group',
        groupChatId: '120363123456@g.us',
        timestamp: 1640995200,
        ingestedAt: new Date().toISOString(),
      };

      // Mock OpenAI response indicating this IS a casting call
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'YES'
            }
          }]
        })
      });

      // Mock successful casting call extraction
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                title: 'Actor for Drama Series',
                company: 'Production Company',
                compensation: 'SAR 30,000',
                contactInfo: 'director@production.com'
              })
            }
          }]
        })
      });

      const mockJob = {
        id: 'whatsapp-job-id',
        data: castingCallMessage,
      };

      const result = await (workerModule.default as any).opts.processFn(mockJob);

      expect(global.fetch).toHaveBeenCalledTimes(2); // Analysis + extraction
      expect(mockProcessScrapedRoleQueue.add).toHaveBeenCalledWith('process-scraped-role', {
        title: 'Actor for Drama Series',
        company: 'Production Company',
        compensation: 'SAR 30,000',
        contactInfo: 'director@production.com',
        sourceUrl: 'whatsapp://120363123456@g.us',
        sourceName: 'Riyadh Actors Group',
        ingestedAt: castingCallMessage.ingestedAt,
        whatsappMessageId: 'msg-123',
      });

      expect(result).toEqual({
        status: 'queued',
        title: 'Actor for Drama Series',
        messageId: 'msg-123',
      });
    });

    it('should skip non-casting call messages', async () => {
      const workerModule = await import('./whatsapp-message-worker.js');

      const regularMessage = {
        messageId: 'msg-456',
        content: 'Hey everyone, how is the weather today?',
        sourceName: 'Riyadh Actors Group',
        groupChatId: '120363123456@g.us',
        timestamp: 1640995200,
        ingestedAt: new Date().toISOString(),
      };

      // Mock OpenAI response indicating this is NOT a casting call
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'NO'
            }
          }]
        })
      });

      const mockJob = {
        id: 'whatsapp-job-id',
        data: regularMessage,
      };

      const result = await (workerModule.default as any).opts.processFn(mockJob);

      expect(global.fetch).toHaveBeenCalledTimes(1); // Only analysis, no extraction
      expect(mockProcessScrapedRoleQueue.add).not.toHaveBeenCalled();

      expect(result).toEqual({
        status: 'not_casting_call',
      });
    });

    it('should handle OpenAI analysis failures gracefully', async () => {
      const workerModule = await import('./whatsapp-message-worker.js');

      const message = {
        messageId: 'msg-789',
        content: 'Some message content',
        sourceName: 'Test Group',
        groupChatId: '120363123456@g.us',
        timestamp: 1640995200,
        ingestedAt: new Date().toISOString(),
      };

      // Mock OpenAI failure
      (global.fetch as any).mockRejectedValueOnce(new Error('API rate limit'));

      const mockJob = {
        id: 'whatsapp-job-id',
        data: message,
      };

      const result = await (workerModule.default as any).opts.processFn(mockJob);

      expect(result).toEqual({
        status: 'not_casting_call',
      });
    });

    it('should handle extraction failures', async () => {
      const workerModule = await import('./whatsapp-message-worker.js');

      const message = {
        messageId: 'msg-999',
        content: 'Casting call message',
        sourceName: 'Test Group',
        groupChatId: '120363123456@g.us',
        timestamp: 1640995200,
        ingestedAt: new Date().toISOString(),
      };

      // Mock analysis says YES
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'YES'
            }
          }]
        })
      });

      // Mock extraction failure
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'Invalid JSON response'
            }
          }]
        })
      });

      const mockJob = {
        id: 'whatsapp-job-id',
        data: message,
      };

      const result = await (workerModule.default as any).opts.processFn(mockJob);

      expect(result).toEqual({
        status: 'extraction_failed',
      });
    });

    it('should handle malformed extraction responses', async () => {
      const workerModule = await import('./whatsapp-message-worker.js');

      const message = {
        messageId: 'msg-111',
        content: 'Valid casting call',
        sourceName: 'Test Group',
        groupChatId: '120363123456@g.us',
        timestamp: 1640995200,
        ingestedAt: new Date().toISOString(),
      };

      // Mock analysis says YES
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'YES'
            }
          }]
        })
      });

      // Mock extraction returns empty object
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({}) // No title
            }
          }]
        })
      });

      const mockJob = {
        id: 'whatsapp-job-id',
        data: message,
      };

      const result = await (workerModule.default as any).opts.processFn(mockJob);

      expect(result).toEqual({
        status: 'extraction_failed',
      });
    });

    it('should send failures to dead letter queue', async () => {
      const workerModule = await import('./whatsapp-message-worker.js');

      const message = {
        messageId: 'msg-fail',
        content: 'Test message',
        sourceName: 'Test Group',
        groupChatId: '120363123456@g.us',
        timestamp: 1640995200,
        ingestedAt: new Date().toISOString(),
      };

      // Mock OpenAI completely failing
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const mockJob = {
        id: 'whatsapp-job-id',
        data: message,
      };

      // Should throw error to be handled by BullMQ
      await expect(
        (workerModule.default as any).opts.processFn(mockJob)
      ).rejects.toThrow('Network error');

      // Should add to dead letter queue
      expect(mockDlq.add).toHaveBeenCalledWith('failed-whatsapp-message', {
        originalJob: message,
        error: 'Network error',
        failedAt: expect.any(String),
      });
    });
  });

  describe('OpenAI API Integration', () => {
    it('should make correct analysis API call', async () => {
      const workerModule = await import('./whatsapp-message-worker.js');

      const message = {
        messageId: 'msg-test',
        content: 'Test casting call message',
        sourceName: 'Test Group',
        groupChatId: '120363123456@g.us',
        timestamp: 1640995200,
        ingestedAt: new Date().toISOString(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'YES'
            }
          }]
        })
      });

      await (workerModule.default as any).opts.processFn({
        id: 'test-job',
        data: message
      });

      expect(global.fetch).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer undefined', // Would be set by env var
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Test casting call message'),
      });
    });
  });
});
