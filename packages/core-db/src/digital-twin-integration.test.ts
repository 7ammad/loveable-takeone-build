import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

describe.skipIf(!process.env.DATABASE_URL)('Digital Twin Integration Tests', () => {
  beforeAll(async () => {
    // Ensure clean state
    await prisma.castingCall.deleteMany();
    await prisma.ingestionSource.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up between tests
    await prisma.castingCall.deleteMany();
    await prisma.ingestionSource.deleteMany();
  });

  describe('End-to-End Web Scraping Flow', () => {
    it('should complete full web scraping workflow', async () => {
      // 1. Create ingestion source
      const source = await prisma.ingestionSource.create({
        data: {
          sourceType: 'WEB',
          sourceIdentifier: 'https://mbc.com/careers',
          sourceName: 'MBC Careers',
          isActive: true,
        },
      });

      expect(source.id).toBeDefined();
      expect(source.isActive).toBe(true);

      // 2. Simulate scraped data (what would come from FireCrawl + OpenAI)
      const scrapedData = {
        title: 'Senior Television Actor',
        description: 'Seeking experienced actor for lead role in MBC drama series',
        company: 'MBC Studios',
        location: 'Riyadh, Saudi Arabia',
        compensation: 'SAR 80,000 per episode',
        requirements: '8+ years acting experience, fluent Arabic, professional portfolio',
        deadline: new Date('2025-02-15'),
        contactInfo: 'Submit applications to: casting@mbc.com',
        sourceUrl: 'https://mbc.com/careers',
        sourceName: 'MBC Careers',
        ingestedAt: new Date().toISOString(),
      };

      // 3. Process the scraped data (simulate queue worker)
      const contentString = `${scrapedData.title}|${scrapedData.description || ''}|${scrapedData.company || ''}|${scrapedData.location || ''}`;
      const contentHash = crypto.createHash('md5').update(contentString).digest('hex');

      // Check for duplicates (should be none)
      const existing = await prisma.castingCall.findUnique({
        where: { contentHash },
      });
      expect(existing).toBeNull();

      // Create the casting call
      const castingCall = await prisma.castingCall.create({
        data: {
          title: scrapedData.title,
          description: scrapedData.description,
          company: scrapedData.company,
          location: scrapedData.location,
          compensation: scrapedData.compensation,
          requirements: scrapedData.requirements,
          deadline: scrapedData.deadline,
          contactInfo: scrapedData.contactInfo,
          sourceUrl: scrapedData.sourceUrl,
          contentHash,
          status: 'pending_review',
        },
      });

      expect(castingCall.id).toBeDefined();
      expect(castingCall.status).toBe('pending_review');
      expect(castingCall.contentHash).toBe(contentHash);

      // 4. Simulate admin approval
      const approved = await prisma.castingCall.update({
        where: { id: castingCall.id },
        data: { status: 'live' },
      });

      expect(approved.status).toBe('live');

      // 5. Verify final state
      const finalCall = await prisma.castingCall.findUnique({
        where: { id: castingCall.id },
        include: { applications: true },
      });

      expect(finalCall?.status).toBe('live');
      expect(finalCall?.applications).toEqual([]);
    });

    it('should handle duplicate detection correctly', async () => {
      // Create first casting call
      const originalData = {
        title: 'Voice Actor Position',
        description: 'Same description for duplicate test',
        company: 'Test Studios',
        location: 'Jeddah',
      };

      const contentString = `${originalData.title}|${originalData.description}|${originalData.company}|${originalData.location}`;
      const contentHash = crypto.createHash('md5').update(contentString).digest('hex');

      const firstCall = await prisma.castingCall.create({
        data: {
          ...originalData,
          contentHash,
          status: 'live', // Already approved
        },
      });

      // Simulate duplicate scraped data
      const duplicateData = {
        title: 'Voice Actor Position', // Same title
        description: 'Same description for duplicate test', // Same description
        company: 'Test Studios', // Same company
        location: 'Jeddah', // Same location
        sourceUrl: 'https://different-site.com', // Different source
        sourceName: 'Different Site',
        ingestedAt: new Date().toISOString(),
      };

      // Check for duplicates
      const existing = await prisma.castingCall.findUnique({
        where: { contentHash },
      });
      expect(existing).toBeDefined();
      expect(existing?.id).toBe(firstCall.id);

      // Should not create duplicate
      const duplicateCall = await prisma.castingCall.findUnique({
        where: { contentHash },
      });
      expect(duplicateCall?.title).toBe('Voice Actor Position');
    });
  });

  describe('End-to-End WhatsApp Flow', () => {
    it('should complete full WhatsApp ingestion workflow', async () => {
      // 1. Create WhatsApp source
      const source = await prisma.ingestionSource.create({
        data: {
          sourceType: 'WHATSAPP',
          sourceIdentifier: '120363123456@g.us',
          sourceName: 'Riyadh Actors Group',
          isActive: true,
        },
      });

      // 2. Simulate WhatsApp message data
      const messageData = {
        messageId: 'msg-12345',
        content: 'Urgent: Casting call for film project. Looking for 3-5 actors aged 25-35. Pay: SAR 20,000. Location: Riyadh. Contact: director@filmprod.com',
        sourceName: 'Riyadh Actors Group',
        groupChatId: '120363123456@g.us',
        timestamp: 1704067200,
        ingestedAt: new Date().toISOString(),
      };

      // 3. Simulate message processing (would be done by WhatsApp worker)
      // In real flow, this would go through OpenAI analysis first

      // 4. Create casting call from processed message
      const callData = {
        title: 'Film Actors Needed',
        description: 'Casting call for film project seeking 3-5 actors',
        company: 'Film Production Company',
        location: 'Riyadh',
        compensation: 'SAR 20,000',
        contactInfo: 'director@filmprod.com',
        sourceUrl: 'whatsapp://120363123456@g.us',
        sourceName: 'Riyadh Actors Group',
      };

      const contentString = `${callData.title}|${callData.description || ''}|${callData.company || ''}|${callData.location || ''}`;
      const contentHash = crypto.createHash('md5').update(contentString).digest('hex');

      const castingCall = await prisma.castingCall.create({
        data: {
          ...callData,
          contentHash,
          status: 'pending_review',
        },
      });

      expect(castingCall.sourceUrl).toBe('whatsapp://120363123456@g.us');
      expect(castingCall.status).toBe('pending_review');

      // 5. Admin review and approval
      const approved = await prisma.castingCall.update({
        where: { id: castingCall.id },
        data: { status: 'live' },
      });

      expect(approved.status).toBe('live');

      // 6. Verify source tracking
      const updatedSource = await prisma.ingestionSource.update({
        where: { id: source.id },
        data: { lastProcessedAt: new Date() },
      });

      expect(updatedSource.lastProcessedAt).toBeInstanceOf(Date);
    });
  });

  describe('Source Management Integration', () => {
    it('should manage multiple sources correctly', async () => {
      // Create multiple sources
      const sources = await Promise.all([
        prisma.ingestionSource.create({
          data: {
            sourceType: 'WEB',
            sourceIdentifier: 'https://mbc.com/careers',
            sourceName: 'MBC Careers',
            isActive: true,
          },
        }),
        prisma.ingestionSource.create({
          data: {
            sourceType: 'WEB',
            sourceIdentifier: 'https://rotana.com/jobs',
            sourceName: 'Rotana Jobs',
            isActive: false, // Inactive
          },
        }),
        prisma.ingestionSource.create({
          data: {
            sourceType: 'WHATSAPP',
            sourceIdentifier: '120363111@g.us',
            sourceName: 'Riyadh Actors',
            isActive: true,
          },
        }),
      ]);

      // Query active sources only
      const activeSources = await prisma.ingestionSource.findMany({
        where: { isActive: true },
      });

      expect(activeSources).toHaveLength(2);
      expect(activeSources.map(s => s.sourceName)).toEqual(
        expect.arrayContaining(['MBC Careers', 'Riyadh Actors'])
      );

      // Query by type
      const webSources = await prisma.ingestionSource.findMany({
        where: { sourceType: 'WEB' },
      });

      expect(webSources).toHaveLength(2);

      const whatsappSources = await prisma.ingestionSource.findMany({
        where: { sourceType: 'WHATSAPP' },
      });

      expect(whatsappSources).toHaveLength(1);
    });

    it('should handle source updates', async () => {
      const source = await prisma.ingestionSource.create({
        data: {
          sourceType: 'WEB',
          sourceIdentifier: 'https://example.com',
          sourceName: 'Example Site',
          isActive: true,
        },
      });

      // Update source
      const updated = await prisma.ingestionSource.update({
        where: { id: source.id },
        data: {
          sourceName: 'Updated Example Site',
          isActive: false,
          lastProcessedAt: new Date(),
        },
      });

      expect(updated.sourceName).toBe('Updated Example Site');
      expect(updated.isActive).toBe(false);
      expect(updated.lastProcessedAt).toBeInstanceOf(Date);
    });
  });

  describe('Validation Queue Integration', () => {
    it('should manage pending calls queue', async () => {
      // Create multiple calls with different statuses
      await Promise.all([
        prisma.castingCall.create({
          data: {
            title: 'Pending Call 1',
            contentHash: 'hash1',
            status: 'pending_review',
          },
        }),
        prisma.castingCall.create({
          data: {
            title: 'Live Call',
            contentHash: 'hash2',
            status: 'live',
          },
        }),
        prisma.castingCall.create({
          data: {
            title: 'Rejected Call',
            contentHash: 'hash3',
            status: 'rejected',
          },
        }),
        prisma.castingCall.create({
          data: {
            title: 'Pending Call 2',
            contentHash: 'hash4',
            status: 'pending_review',
          },
        }),
      ]);

      // Get pending calls only
      const pendingCalls = await prisma.castingCall.findMany({
        where: { status: 'pending_review' },
        orderBy: { createdAt: 'desc' },
      });

      expect(pendingCalls).toHaveLength(2);
      expect(pendingCalls.map(c => c.title)).toEqual([
        'Pending Call 2',
        'Pending Call 1',
      ]);

      // Approve one call
      await prisma.castingCall.update({
        where: { id: pendingCalls[0].id },
        data: { status: 'live' },
      });

      // Check remaining pending
      const remainingPending = await prisma.castingCall.findMany({
        where: { status: 'pending_review' },
      });

      expect(remainingPending).toHaveLength(1);
      expect(remainingPending[0].title).toBe('Pending Call 1');
    });
  });

  describe('Application Relationship', () => {
    it('should maintain casting call to application relationship', async () => {
      // Create casting call
      const castingCall = await prisma.castingCall.create({
        data: {
          title: 'Call With Applications',
          contentHash: 'app-test-hash',
          status: 'live',
        },
      });

      // Verify the applications relation exists (even if empty)
      const callWithApps = await prisma.castingCall.findUnique({
        where: { id: castingCall.id },
        include: { applications: true },
      });

      expect(callWithApps?.applications).toEqual([]);

      // Note: Full application testing would require creating Application records
      // This test verifies the model relationship is correctly set up
    });
  });
});
