/**
 * FireCrawl Service
 * Web scraping for Saudi casting websites
 */

import { logger } from '@packages/core-observability';

interface ScrapedContent {
  url: string;
  markdown: string;
  title?: string;
  description?: string;
  metadata?: any;
}

export class FireCrawlService {
  private apiKey: string;
  private baseUrl: string;
  private isEnabled: boolean;

  constructor() {
    this.apiKey = process.env.FIRE_CRAWL_API_KEY || '';
    this.baseUrl = 'https://api.firecrawl.dev';
    this.isEnabled = !!this.apiKey;

    if (!this.isEnabled) {
      logger.warn('⚠️  FireCrawl API key not found - web scraping disabled');
    }
  }

  async scrapeUrl(url: string): Promise<ScrapedContent | null> {
    if (!this.isEnabled) {
      logger.info('      ℹ️  FireCrawl disabled (no API key)');
      return null;
    }

    try {
      // FireCrawl v1 API (stable)
      const response = await fetch(`${this.baseUrl}/v1/scrape`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['markdown'],
          onlyMainContent: true,
          includeTags: ['h1', 'h2', 'h3', 'h4', 'p', 'li', 'a'],
          excludeTags: ['nav', 'footer', 'aside', 'script', 'style'],
          timeout: 30000, // 30 second timeout
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`FireCrawl API ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.success) {
        logger.warn(`      FireCrawl failed for ${url}`, { error: data.error || 'Unknown error' });
        return null;
      }

      // Handle both v1 response formats
      const content = data.data || data;
      
      return {
        url,
        markdown: content.markdown || content.content || '',
        title: content.title || '',
        description: content.description || '',
        metadata: content.metadata || {},
      };

    } catch (error) {
      logger.error(`      Failed to scrape ${url}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}

