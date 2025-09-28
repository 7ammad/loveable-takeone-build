#!/usr/bin/env tsx

/**
 * TakeOne Digital Twin - Web Orchestrator Service
 *
 * This service runs on a cron job (every 4 hours) and orchestrates the web scraping pipeline.
 * It fetches active web sources from the IngestionSource table and processes them using FireCrawl + OpenAI.
 */

import { PrismaClient } from '@prisma/client';
import { processScrapedRoleQueue } from '../packages/core-queue/src/queues.js';

const prisma = new PrismaClient();

// Environment variables
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface CastingCallData {
  title: string;
  description?: string;
  company?: string;
  location?: string;
  compensation?: string;
  requirements?: string;
  deadline?: string;
  contactInfo?: string;
}

interface FireCrawlResponse {
  success: boolean;
  data?: {
    markdown: string;
  };
  error?: string;
}

async function scrapeWithFireCrawl(url: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    const result: FireCrawlResponse = await response.json();

    if (!result.success || !result.data?.markdown) {
      console.error(`FireCrawl failed for ${url}:`, result.error);
      return null;
    }

    return result.data.markdown;
  } catch (error) {
    console.error(`FireCrawl error for ${url}:`, error);
    return null;
  }
}

async function extractCastingCallsWithOpenAI(markdown: string, sourceName: string): Promise<CastingCallData[]> {
  try {
    const prompt = `
You are an expert at extracting casting call information from web content.

Analyze the following markdown content from "${sourceName}" and extract all casting calls/opportunities.

For each casting call, return a JSON object with these fields:
- title: The job/role title
- description: Detailed description of the role
- company: Company/production name
- location: Where the work will take place
- compensation: Pay rate or salary information
- requirements: Skills, experience, or qualifications needed
- deadline: Application deadline (if mentioned)
- contactInfo: How to apply or contact information

Return ONLY a valid JSON array of casting call objects. If no casting calls are found, return an empty array [].

Important: Be thorough but accurate. Only extract real casting opportunities, not general job postings.

Content to analyze:
${markdown}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1, // Low temperature for consistent extraction
        max_tokens: 4000,
      }),
    });

    const result = await response.json();

    if (!result.choices?.[0]?.message?.content) {
      console.error('OpenAI API error:', result);
      return [];
    }

    const content = result.choices[0].message.content.trim();

    try {
      const castingCalls = JSON.parse(content);
      if (!Array.isArray(castingCalls)) {
        console.error('OpenAI did not return an array:', content);
        return [];
      }

      // Validate each casting call has at least a title
      return castingCalls.filter((call: any) =>
        call && typeof call === 'object' && call.title && typeof call.title === 'string'
      );
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', content);
      return [];
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return [];
  }
}

async function processSource(source: { id: string; sourceIdentifier: string; sourceName: string }): Promise<void> {
  console.log(`Processing source: ${source.sourceName} (${source.sourceIdentifier})`);

  // Scrape the website
  const markdown = await scrapeWithFireCrawl(source.sourceIdentifier);
  if (!markdown) {
    console.log(`Skipping ${source.sourceName} - scraping failed`);
    return;
  }

  // Extract casting calls with AI
  const castingCalls = await extractCastingCallsWithOpenAI(markdown, source.sourceName);

  console.log(`Found ${castingCalls.length} casting calls from ${source.sourceName}`);

  // Queue each casting call for processing
  for (const castingCall of castingCalls) {
    try {
      await processScrapedRoleQueue.add('process-scraped-role', {
        ...castingCall,
        sourceUrl: source.sourceIdentifier,
        sourceName: source.sourceName,
        ingestedAt: new Date().toISOString(),
      });

      console.log(`Queued casting call: ${castingCall.title}`);
    } catch (error) {
      console.error(`Failed to queue casting call "${castingCall.title}":`, error);
    }
  }

  // Update last processed timestamp
  await prisma.ingestionSource.update({
    where: { id: source.id },
    data: { lastProcessedAt: new Date() },
  });
}

async function main() {
  console.log('🚀 Starting TakeOne Digital Twin Orchestrator');

  // Validate environment variables
  if (!FIRECRAWL_API_KEY) {
    throw new Error('FIRECRAWL_API_KEY environment variable is required');
  }
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  try {
    // Fetch all active web sources
    const webSources = await prisma.ingestionSource.findMany({
      where: {
        sourceType: 'WEB',
        isActive: true,
      },
    });

    console.log(`Found ${webSources.length} active web sources to process`);

    // Process each source
    for (const source of webSources) {
      try {
        await processSource(source);

        // Small delay between sources to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to process source ${source.sourceName}:`, error);
        // Continue with other sources
      }
    }

    console.log('✅ Orchestrator run completed successfully');
  } catch (error) {
    console.error('❌ Orchestrator run failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the orchestrator
main().catch(console.error);
