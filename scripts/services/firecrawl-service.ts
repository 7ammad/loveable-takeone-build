/**
 * FireCrawl Service
 * Integrates with FireCrawl API to scrape web content
 */

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

  constructor() {
    this.apiKey = process.env.FIRE_CRAWL_API_KEY!;
    this.baseUrl = 'https://api.firecrawl.dev';

    if (!this.apiKey) {
      throw new Error('FIRE_CRAWL_API_KEY environment variable is required');
    }
  }

  async scrapeUrl(url: string): Promise<ScrapedContent | null> {
    try {
      console.log(`🔥 Scraping URL: ${url}`);

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
          includeTags: ['h1', 'h2', 'h3', 'p', 'li'], // Focus on content tags
        }),
      });

      if (!response.ok) {
        throw new Error(`FireCrawl API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        console.warn(`FireCrawl scrape failed for ${url}:`, data.error);
        return null;
      }

      return {
        url,
        markdown: data.data.markdown,
        title: data.data.title,
        description: data.data.description,
        metadata: data.data.metadata,
      };

    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error);
      throw error;
    }
  }

  async scrapeMultipleUrls(urls: string[]): Promise<(ScrapedContent | null)[]> {
    const results = await Promise.allSettled(
      urls.map(url => this.scrapeUrl(url))
    );

    return results.map(result =>
      result.status === 'fulfilled' ? result.value : null
    );
  }
}
