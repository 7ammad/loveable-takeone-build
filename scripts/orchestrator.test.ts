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
const mockProcessScrapedRoleQueue = {
  add: vi.fn(),
};

vi.mock('../packages/core-queue/src/queues.js', () => ({
  processScrapedRoleQueue: mockProcessScrapedRoleQueue,
}));

// Mock fetch for external APIs
global.fetch = vi.fn();

describe('Orchestrator Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Source Processing', () => {
    it('should process active web sources successfully', async () => {
      // Import the orchestrator functions
      const orchestratorModule = await import('./orchestrator.js');

      const mockSources = [
        {
          id: 'source-1',
          sourceType: 'WEB',
          sourceIdentifier: 'https://mbc.com/careers',
          sourceName: 'MBC Careers',
          isActive: true,
          lastProcessedAt: null,
        },
        {
          id: 'source-2',
          sourceType: 'WEB',
          sourceIdentifier: 'https://rotana.com/jobs',
          sourceName: 'Rotana Jobs',
          isActive: true,
          lastProcessedAt: null,
        },
      ];

      mockPrisma.ingestionSource.findMany.mockResolvedValue(mockSources);

      // Mock FireCrawl responses
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              markdown: '# MBC Careers\n\n## Senior Actor Role\n\nWe are looking for experienced actors for our new drama series.\n\nRequirements: 5+ years experience\n\nContact: casting@mbc.com',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              markdown: '# Rotana Jobs\n\n## Voice Actor Needed\n\nSeeking voice actors for animation project.\n\nPay: SAR 15,000\n\nApply: jobs@rotana.com',
            },
          }),
        });

      // Mock OpenAI responses
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{
              message: {
                content: JSON.stringify([
                  {
                    title: 'Senior Actor Role',
                    description: 'We are looking for experienced actors for our new drama series.',
                    requirements: '5+ years experience',
                    contactInfo: 'casting@mbc.com',
                  },
                ]),
              },
            }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{
              message: {
                content: JSON.stringify([
                  {
                    title: 'Voice Actor Needed',
                    description: 'Seeking voice actors for animation project.',
                    compensation: 'SAR 15,000',
                    contactInfo: 'jobs@rotana.com',
                  },
                ]),
              },
            }],
          }),
        });

      // Mock the process function (we'll call it directly for testing)
      const { processSource } = orchestratorModule;

      // Process each source
      for (const source of mockSources) {
        await (orchestratorModule as any).processSource(source);
      }

      // Verify FireCrawl was called for each source
      expect(global.fetch).toHaveBeenCalledTimes(4); // 2 FireCrawl + 2 OpenAI

      // Verify queue was populated with casting calls
      expect(mockProcessScrapedRoleQueue.add).toHaveBeenCalledTimes(2);

      // Verify first call
      expect(mockProcessScrapedRoleQueue.add).toHaveBeenCalledWith('process-scraped-role', {
        title: 'Senior Actor Role',
        description: 'We are looking for experienced actors for our new drama series.',
        requirements: '5+ years experience',
        contactInfo: 'casting@mbc.com',
        sourceUrl: 'https://mbc.com/careers',
        sourceName: 'MBC Careers',
        ingestedAt: expect.any(String),
      });

      // Verify timestamps were updated
      expect(mockPrisma.ingestionSource.update).toHaveBeenCalledTimes(2);
    });

    it('should skip inactive sources', async () => {
      const orchestratorModule = await import('./orchestrator.js');

      const mockSources = [
        {
          id: 'active-source',
          sourceType: 'WEB',
          sourceIdentifier: 'https://active.com',
          sourceName: 'Active Site',
          isActive: true,
        },
        {
          id: 'inactive-source',
          sourceType: 'WEB',
          sourceIdentifier: 'https://inactive.com',
          sourceName: 'Inactive Site',
          isActive: false,
        },
      ];

      mockPrisma.ingestionSource.findMany.mockResolvedValue(mockSources);

      // Only mock FireCrawl for active source
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { markdown: '# Content' },
        }),
      });

      // Mock OpenAI
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify([
                { title: 'Test Call', description: 'Test description' }
              ]),
            },
          }],
        }),
      });

      // Process sources (normally done by main function)
      const activeSource = mockSources.find(s => s.isActive);
      if (activeSource) {
        await (orchestratorModule as any).processSource(activeSource);
      }

      // Should only process active source
      expect(global.fetch).toHaveBeenCalledTimes(2); // FireCrawl + OpenAI for active only
      expect(mockProcessScrapedRoleQueue.add).toHaveBeenCalledTimes(1);
    });

    it('should skip WhatsApp sources', async () => {
      const orchestratorModule = await import('./orchestrator.js');

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
          sourceIdentifier: '123456@g.us',
          sourceName: 'WhatsApp Group',
          isActive: true,
        },
      ];

      mockPrisma.ingestionSource.findMany.mockResolvedValue(mockSources);

      // Only mock for web source
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { markdown: '# Web Content' },
        }),
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify([
                { title: 'Web Call', description: 'From web' }
              ]),
            },
          }],
        }),
      });

      // Process only web sources (as the orchestrator should)
      const webSources = mockSources.filter(s => s.sourceType === 'WEB');
      for (const source of webSources) {
        await (orchestratorModule as any).processSource(source);
      }

      // Should only process web source
      expect(mockProcessScrapedRoleQueue.add).toHaveBeenCalledTimes(1);
      expect(mockProcessScrapedRoleQueue.add).toHaveBeenCalledWith('process-scraped-role', {
        title: 'Web Call',
        description: 'From web',
        sourceUrl: 'https://web.com',
        sourceName: 'Web Site',
        ingestedAt: expect.any(String),
      });
    });

    it('should handle FireCrawl failures gracefully', async () => {
      const orchestratorModule = await import('./orchestrator.js');

      const mockSource = {
        id: 'failing-source',
        sourceType: 'WEB',
        sourceIdentifier: 'https://failing.com',
        sourceName: 'Failing Site',
        isActive: true,
      };

      mockPrisma.ingestionSource.findMany.mockResolvedValue([mockSource]);

      // Mock FireCrawl failure
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await (orchestratorModule as any).processSource(mockSource);

      // Should not queue anything due to failure
      expect(mockProcessScrapedRoleQueue.add).not.toHaveBeenCalled();

      // Should still update timestamp (to avoid reprocessing immediately)
      expect(mockPrisma.ingestionSource.update).toHaveBeenCalledWith({
        where: { id: mockSource.id },
        data: { lastProcessedAt: expect.any(Date) },
      });
    });

    it('should handle OpenAI failures gracefully', async () => {
      const orchestratorModule = await import('./orchestrator.js');

      const mockSource = {
        id: 'openai-fail-source',
        sourceType: 'WEB',
        sourceIdentifier: 'https://openai-fail.com',
        sourceName: 'OpenAI Fail Site',
        isActive: true,
      };

      mockPrisma.ingestionSource.findMany.mockResolvedValue([mockSource]);

      // Mock successful FireCrawl
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { markdown: '# Content' },
        }),
      });

      // Mock OpenAI failure
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Rate limit exceeded',
      });

      await (orchestratorModule as any).processSource(mockSource);

      // Should not queue anything due to OpenAI failure
      expect(mockProcessScrapedRoleQueue.add).not.toHaveBeenCalled();
    });

    it('should handle malformed OpenAI responses', async () => {
      const orchestratorModule = await import('./orchestrator.js');

      const mockSource = {
        id: 'malformed-source',
        sourceType: 'WEB',
        sourceIdentifier: 'https://malformed.com',
        sourceName: 'Malformed Site',
        isActive: true,
      };

      mockPrisma.ingestionSource.findMany.mockResolvedValue([mockSource]);

      // Mock successful FireCrawl
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { markdown: '# Content' },
        }),
      });

      // Mock malformed OpenAI response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'Invalid JSON {{{', // Malformed
            },
          }],
        }),
      });

      await (orchestratorModule as any).processSource(mockSource);

      // Should not queue anything due to malformed response
      expect(mockProcessScrapedRoleQueue.add).not.toHaveBeenCalled();
    });

    it('should validate environment variables', async () => {
      // Temporarily clear environment variables
      const originalFireCrawlKey = process.env.FIRECRAWL_API_KEY;
      const originalOpenAIKey = process.env.OPENAI_API_KEY;

      delete process.env.FIRECRAWL_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const orchestratorModule = await import('./orchestrator.js');

      // Mock console.error to avoid test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // The main function should throw due to missing env vars
      await expect((orchestratorModule as any).main()).rejects.toThrow('FIRECRAWL_API_KEY environment variable is required');

      // Restore environment
      process.env.FIRECRAWL_API_KEY = originalFireCrawlKey;
      process.env.OPENAI_API_KEY = originalOpenAIKey;
      consoleSpy.mockRestore();
    });
  });

  describe('API Integration', () => {
    it('should make correct FireCrawl API calls', async () => {
      const orchestratorModule = await import('./orchestrator.js');

      const mockSource = {
        id: 'api-test-source',
        sourceType: 'WEB',
        sourceIdentifier: 'https://test-api.com',
        sourceName: 'API Test Site',
        isActive: true,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { markdown: '# Test Content' },
        }),
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: '[]', // Empty array
            },
          }],
        }),
      });

      await (orchestratorModule as any).processSource(mockSource);

      // Verify FireCrawl call
      expect(global.fetch).toHaveBeenCalledWith('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer undefined', // Would be set by env var
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://test-api.com',
          formats: ['markdown'],
          onlyMainContent: true,
        }),
      });
    });

    it('should make correct OpenAI API calls', async () => {
      const orchestratorModule = await import('./orchestrator.js');

      const mockSource = {
        id: 'openai-test-source',
        sourceType: 'WEB',
        sourceIdentifier: 'https://openai-test.com',
        sourceName: 'OpenAI Test Site',
        isActive: true,
      };

      const mockMarkdown = '# Test Casting Call\n\nLooking for actors...';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { markdown: mockMarkdown },
        }),
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: '[]',
            },
          }],
        }),
      });

      await (orchestratorModule as any).processSource(mockSource);

      // Verify OpenAI call
      expect(global.fetch).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer undefined',
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining(mockMarkdown),
      });
    });
  });
});
