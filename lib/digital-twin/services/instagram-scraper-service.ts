/**
 * Instagram Scraper Service
 * Handles Instagram post scraping for Saudi casting accounts
 * 
 * Implementation Options:
 * 1. Apify Instagram Scraper (recommended) - https://apify.com/apify/instagram-scraper
 * 2. RapidAPI Instagram Scraper - https://rapidapi.com/restyler/api/instagram-scraper
 * 3. Manual webhook monitoring (for verified accounts)
 */

import { logger } from '@packages/core-observability';

interface InstagramPost {
  shortcode: string;
  url: string;
  caption: string;
  timestamp: Date;
  mediaType: 'image' | 'video' | 'carousel';
}

export class InstagramScraperService {
  private apifyApiKey: string;
  private isEnabled: boolean;

  constructor() {
    this.apifyApiKey = process.env.APIFY_API_KEY || '';
    this.isEnabled = !!this.apifyApiKey;

    if (!this.isEnabled) {
      logger.warn('⚠️  Apify API key not found - Instagram scraping disabled');
    }
  }

  async scrapeRecentPosts(username: string, limit: number = 10): Promise<InstagramPost[]> {
    if (!this.isEnabled) {
      logger.info('      ℹ️  Instagram scraping disabled (no API key)');
      return [];
    }

    try {
      // Remove @ if present
      const cleanUsername = username.replace('@', '');
      
      // Use Apify Instagram Scraper with sync endpoint (safer for small batches)
      // For production: Consider using async run + dataset fetch for reliability
      const response = await fetch('https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?timeout=60', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apifyApiKey}`,
        },
        body: JSON.stringify({
          directUrls: [`https://www.instagram.com/${cleanUsername}/`],
          resultsType: 'posts',
          resultsLimit: Math.min(limit, 12), // Limit to 12 to avoid timeouts
          searchType: 'user',
          searchLimit: 1,
          // Additional options for reliability
          proxy: {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Apify API ${response.status}: ${errorText}`);
      }

      const posts = await response.json();

      if (!Array.isArray(posts)) {
        logger.warn(`      Unexpected response format from Apify for @${username}`, {
          response: posts,
        });
        return [];
      }

      return posts.map((post: { shortCode?: string; shortcode?: string; url?: string; displayUrl?: string; caption?: string; timestamp?: number; likesCount?: number; commentsCount?: number; type?: string }) => ({
        shortcode: post.shortCode || post.shortcode || '',
        url: post.url || `https://www.instagram.com/p/${post.shortCode || post.shortcode}/`,
        caption: post.caption || '',
        timestamp: new Date(post.timestamp || Date.now()),
        mediaType: (post.type || 'image') as 'image' | 'video' | 'carousel',
      })).filter(post => post.shortcode); // Filter out invalid posts

    } catch (error) {
      logger.error(`      Failed to scrape Instagram @${username}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }
}

