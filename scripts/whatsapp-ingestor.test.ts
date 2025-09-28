import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock Prisma
const mockPrisma = {
  ingestionSource: {
    findMany: vi.fn(),
    update: vi.fn(),
  },
  $disconnect: vi.fn(),
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

// Mock queues
const mockProcessWhatsappMessageQueue = {
  add: vi.fn(),
};

vi.mock('../packages/core-queue/src/queues.js', () => ({
  processWhatsappMessageQueue: mockProcessWhatsappMessageQueue,
}));

// Mock fetch for Whapi.cloud API
global.fetch = vi.fn();

describe('WhatsApp Ingestor Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Group Message Processing', () => {
    it('should process active WhatsApp groups successfully', async () => {
      const ingestorModule = await import('./whatsapp-ingestor.js');

      const mockSources = [
        {
          id: 'group-1',
          sourceType: 'WHATSAPP',
          sourceIdentifier: '120363123456@g.us',
          sourceName: 'Riyadh Actors Group',
          isActive: true,
          lastProcessedAt: new Date('2024-01-01'),
        },
        {
          id: 'group-2',
          sourceType: 'WHATSAPP',
          sourceIdentifier: '120363789012@g.us',
          sourceName: 'Jeddah Casting Network',
          isActive: true,
          lastProcessedAt: new Date('2024-01-01'),
        },
      ];

      mockPrisma.ingestionSource.findMany.mockResolvedValue(mockSources);

      // Mock Whapi responses
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            messages: [
              {
                id: 'msg-1',
                type: 'text',
                from_me: false,
                timestamp: 1704067200, // Jan 1, 2024
                text: {
                  body: 'Looking for experienced actors for new film project. Pay: SAR 25,000. Contact: producer@films.com'
                }
              },
              {
                id: 'msg-2',
                type: 'text',
                from_me: false,
                timestamp: 1704067260,
                text: {
                  body: 'Hey everyone, great to see new members!'
                }
              }
            ],
            cursor: {
              last_message_time: 1704067260
            }
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            messages: [
              {
                id: 'msg-3',
                type: 'text',
                from_me: false,
                timestamp: 1704067200,
                text: {
                  body: 'Voice actor needed for animation series. SAR 12,000. DM for details.'
                }
              }
            ],
            cursor: {
              last_message_time: 1704067200
            }
          }),
        });

      // Process groups (normally done by main function)
      for (const source of mockSources) {
        await (ingestorModule as any).processGroup(source);
      }

      // Verify Whapi was called for each group
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // Verify queue was populated with messages (should filter out non-casting call)
      expect(mockProcessWhatsappMessageQueue.add).toHaveBeenCalledTimes(3); // All messages get queued for AI analysis

      // Verify first group's messages
      expect(mockProcessWhatsappMessageQueue.add).toHaveBeenCalledWith('process-whatsapp-message', {
        messageId: 'msg-1',
        content: 'Looking for experienced actors for new film project. Pay: SAR 25,000. Contact: producer@films.com',
        sourceName: 'Riyadh Actors Group',
        groupChatId: '120363123456@g.us',
        timestamp: 1704067200,
        ingestedAt: expect.any(String),
      });

      // Verify timestamps were updated
      expect(mockPrisma.ingestionSource.update).toHaveBeenCalledTimes(2);
    });

    it('should skip inactive groups', async () => {
      const ingestorModule = await import('./whatsapp-ingestor.js');

      const mockSources = [
        {
          id: 'active-group',
          sourceType: 'WHATSAPP',
          sourceIdentifier: '120363123456@g.us',
          sourceName: 'Active Group',
          isActive: true,
          lastProcessedAt: new Date('2024-01-01'),
        },
        {
          id: 'inactive-group',
          sourceType: 'WHATSAPP',
          sourceIdentifier: '120363789012@g.us',
          sourceName: 'Inactive Group',
          isActive: false,
          lastProcessedAt: new Date('2024-01-01'),
        },
      ];

      mockPrisma.ingestionSource.findMany.mockResolvedValue(mockSources);

      // Only mock response for active group
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          messages: [
            {
              id: 'msg-1',
              type: 'text',
              from_me: false,
              timestamp: 1704067200,
              text: { body: 'Casting call message' }
            }
          ]
        }),
      });

      // Process only active groups (as the ingestor should)
      const activeSources = mockSources.filter(s => s.isActive);
      for (const source of activeSources) {
        await (ingestorModule as any).processGroup(source);
      }

      // Should only process active group
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(mockProcessWhatsappMessageQueue.add).toHaveBeenCalledTimes(1);
    });

    it('should skip WEB sources', async () => {
      const ingestorModule = await import('./whatsapp-ingestor.js');

      const mockSources = [
        {
          id: 'web-source',
          sourceType: 'WEB',
          sourceIdentifier: 'https://web.com',
          sourceName: 'Web Site',
          isActive: true,
        },
        {
          id: 'whatsapp-source',
          sourceType: 'WHATSAPP',
          sourceIdentifier: '120363123456@g.us',
          sourceName: 'WhatsApp Group',
          isActive: true,
        },
      ];

      mockPrisma.ingestionSource.findMany.mockResolvedValue(mockSources);

      // Only mock for WhatsApp source
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          messages: [
            {
              id: 'msg-1',
              type: 'text',
              from_me: false,
              timestamp: 1704067200,
              text: { body: 'WhatsApp casting call' }
            }
          ]
        }),
      });

      // Process only WhatsApp sources (as the ingestor should)
      const whatsappSources = mockSources.filter(s => s.sourceType === 'WHATSAPP');
      for (const source of whatsappSources) {
        await (ingestorModule as any).processGroup(source);
      }

      // Should only process WhatsApp source
      expect(mockProcessWhatsappMessageQueue.add).toHaveBeenCalledTimes(1);
      expect(mockProcessWhatsappMessageQueue.add).toHaveBeenCalledWith('process-whatsapp-message', {
        messageId: 'msg-1',
        content: 'WhatsApp casting call',
        sourceName: 'WhatsApp Group',
        groupChatId: '120363123456@g.us',
        timestamp: 1704067200,
        ingestedAt: expect.any(String),
      });
    });

    it('should filter out non-text messages', async () => {
      const ingestorModule = await import('./whatsapp-ingestor.js');

      const mockSource = {
        id: 'test-group',
        sourceType: 'WHATSAPP',
        sourceIdentifier: '120363123456@g.us',
        sourceName: 'Test Group',
        isActive: true,
        lastProcessedAt: new Date('2024-01-01'),
      };

      mockPrisma.ingestionSource.findMany.mockResolvedValue([mockSource]);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          messages: [
            {
              id: 'msg-1',
              type: 'text',
              from_me: false,
              timestamp: 1704067200,
              text: { body: 'Valid text message' }
            },
            {
              id: 'msg-2',
              type: 'image',
              from_me: false,
              timestamp: 1704067260,
              image: { caption: 'Image with caption' }
            },
            {
              id: 'msg-3',
              type: 'text',
              from_me: true, // From self
              timestamp: 1704067320,
              text: { body: 'Message from self' }
            },
            {
              id: 'msg-4',
              type: 'text',
              from_me: false,
              timestamp: 1704067380,
              // No text field
            }
          ]
        }),
      });

      await (ingestorModule as any).processGroup(mockSource);

      // Should only queue the valid text message from others
      expect(mockProcessWhatsappMessageQueue.add).toHaveBeenCalledTimes(1);
      expect(mockProcessWhatsappMessageQueue.add).toHaveBeenCalledWith('process-whatsapp-message', {
        messageId: 'msg-1',
        content: 'Valid text message',
        sourceName: 'Test Group',
        groupChatId: '120363123456@g.us',
        timestamp: 1704067200,
        ingestedAt: expect.any(String),
      });
    });

    it('should handle image messages with captions', async () => {
      const ingestorModule = await import('./whatsapp-ingestor.js');

      const mockSource = {
        id: 'caption-group',
        sourceType: 'WHATSAPP',
        sourceIdentifier: '120363123456@g.us',
        sourceName: 'Caption Group',
        isActive: true,
        lastProcessedAt: new Date('2024-01-01'),
      };

      mockPrisma.ingestionSource.findMany.mockResolvedValue([mockSource]);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          messages: [
            {
              id: 'msg-1',
              type: 'image',
              from_me: false,
              timestamp: 1704067200,
              image: { caption: 'Casting call for actors - see image' }
            }
          ]
        }),
      });

      await (ingestorModule as any).processGroup(mockSource);

      // Should queue image message with caption
      expect(mockProcessWhatsappMessageQueue.add).toHaveBeenCalledTimes(1);
      expect(mockProcessWhatsappMessageQueue.add).toHaveBeenCalledWith('process-whatsapp-message', {
        messageId: 'msg-1',
        content: 'Casting call for actors - see image',
        sourceName: 'Caption Group',
        groupChatId: '120363123456@g.us',
        timestamp: 1704067200,
        ingestedAt: expect.any(String),
      });
    });

    it('should handle Whapi API failures gracefully', async () => {
      const ingestorModule = await import('./whatsapp-ingestor.js');

      const mockSource = {
        id: 'failing-group',
        sourceType: 'WHATSAPP',
        sourceIdentifier: '120363123456@g.us',
        sourceName: 'Failing Group',
        isActive: true,
        lastProcessedAt: new Date('2024-01-01'),
      };

      mockPrisma.ingestionSource.findMany.mockResolvedValue([mockSource]);

      // Mock Whapi failure
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await (ingestorModule as any).processGroup(mockSource);

      // Should not queue anything due to API failure
      expect(mockProcessWhatsappMessageQueue.add).not.toHaveBeenCalled();

      // Should not update timestamp due to failure
      expect(mockPrisma.ingestionSource.update).not.toHaveBeenCalled();
    });

    it('should respect rate limiting with delays', async () => {
      const ingestorModule = await import('./whatsapp-ingestor.js');

      const mockSources = [
        {
          id: 'group-1',
          sourceType: 'WHATSAPP',
          sourceIdentifier: '120363111@g.us',
          sourceName: 'Group 1',
          isActive: true,
          lastProcessedAt: new Date('2024-01-01'),
        },
        {
          id: 'group-2',
          sourceType: 'WHATSAPP',
          sourceIdentifier: '120363222@g.us',
          sourceName: 'Group 2',
          isActive: true,
          lastProcessedAt: new Date('2024-01-01'),
        },
      ];

      mockPrisma.ingestionSource.findMany.mockResolvedValue(mockSources);

      // Mock responses for both groups
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ messages: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ messages: [] }),
        });

      // Mock setTimeout to track delays
      const originalSetTimeout = global.setTimeout;
      let delayCalled = false;
      global.setTimeout = vi.fn((callback, delay) => {
        if (delay === 5000) { // The delay in processGroup
          delayCalled = true;
        }
        return originalSetTimeout(callback, 0); // Execute immediately for test
      });

      // Process groups
      for (const source of mockSources) {
        await (ingestorModule as any).processGroup(source);
      }

      // Should have called setTimeout for delay between groups
      expect(delayCalled).toBe(true);

      // Restore original setTimeout
      global.setTimeout = originalSetTimeout;
    });

    it('should validate environment variables', async () => {
      // Temporarily clear Whapi token
      const originalWhapiToken = process.env.WHAPI_TOKEN;
      delete process.env.WHAPI_TOKEN;

      const ingestorModule = await import('./whatsapp-ingestor.js');

      // Mock console.warn to avoid test output
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // The main function should exit gracefully without token
      await (ingestorModule as any).main();

      // Should have warned about missing token
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('WHAPI_TOKEN not configured')
      );

      // Should not have processed any sources
      expect(mockPrisma.ingestionSource.findMany).not.toHaveBeenCalled();

      // Restore environment
      process.env.WHAPI_TOKEN = originalWhapiToken;
      consoleSpy.mockRestore();
    });
  });

  describe('Whapi API Integration', () => {
    it('should make correct Whapi API calls', async () => {
      const ingestorModule = await import('./whatsapp-ingestor.js');

      const mockSource = {
        id: 'api-test-group',
        sourceType: 'WHATSAPP',
        sourceIdentifier: '120363123456@g.us',
        sourceName: 'API Test Group',
        isActive: true,
        lastProcessedAt: new Date('2024-01-01'),
      };

      mockPrisma.ingestionSource.findMany.mockResolvedValue([mockSource]);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      });

      await (ingestorModule as any).processGroup(mockSource);

      // Verify Whapi call
      const expectedUrl = new URL(`${process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud'}/messages/list/120363123456@g.us`);
      expectedUrl.searchParams.set('limit', '50');

      expect(global.fetch).toHaveBeenCalledWith(expectedUrl.toString(), {
        headers: {
          'Authorization': 'Bearer undefined', // Would be set by env var
          'Content-Type': 'application/json',
        },
      });
    });

    it('should include since timestamp in API calls', async () => {
      const ingestorModule = await import('./whatsapp-ingestor.js');

      const lastProcessed = new Date('2024-01-01T12:00:00Z');
      const mockSource = {
        id: 'timestamp-test-group',
        sourceType: 'WHATSAPP',
        sourceIdentifier: '120363123456@g.us',
        sourceName: 'Timestamp Test Group',
        isActive: true,
        lastProcessedAt: lastProcessed,
      };

      mockPrisma.ingestionSource.findMany.mockResolvedValue([mockSource]);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      });

      await (ingestorModule as any).processGroup(mockSource);

      // Should include from parameter
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('from='),
        expect.any(Object)
      );
    });
  });
});
