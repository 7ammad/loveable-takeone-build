import { Redis } from '@upstash/redis';

/**
 * LLM Response Caching
 * Caches LLM responses for identical prompts to reduce API costs and improve latency.
 */

interface CachedLLMResponse {
  response: Record<string, unknown> | string;
  cachedAt: number;
  provider: string;
}

class LLMCache {
  private redis: Redis | null = null;
  private isEnabled: boolean = false;
  private defaultTTL: number = 7 * 24 * 60 * 60; // 7 days in seconds

  constructor() {
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (upstashUrl && upstashToken) {
      this.redis = new Redis({
        url: upstashUrl,
        token: upstashToken,
      });
      this.isEnabled = true;
      console.log('✅ LLM cache enabled (Upstash Redis)');
    } else {
      console.warn('⚠️  LLM cache disabled (no Upstash Redis credentials)');
    }
  }

  /**
   * Generate a cache key from the prompt and provider
   */
  private getCacheKey(prompt: string, provider: string): string {
    // Use a simple hash of the prompt + provider
    const hash = this.simpleHash(prompt + provider);
    return `llm:cache:${provider}:${hash}`;
  }

  /**
   * Simple string hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached LLM response
   */
  async get(prompt: string, provider: string): Promise<any | null> {
    if (!this.isEnabled || !this.redis) {
      return null;
    }

    try {
      const key = this.getCacheKey(prompt, provider);
      const cached = await this.redis.get<CachedLLMResponse>(key);

      if (cached) {
        console.log(`      ✅ LLM cache HIT (provider=${provider}, age=${Math.floor((Date.now() - cached.cachedAt) / 1000)}s)`);
        return cached.response;
      }

      console.log(`      ⏭️  LLM cache MISS (provider=${provider})`);
      return null;
    } catch (error) {
      console.error('LLM cache get error:', (error as Error).message);
      return null;
    }
  }

  /**
   * Set cached LLM response
   */
  async set(prompt: string, provider: string, response: Record<string, unknown> | string, ttl: number = this.defaultTTL): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      const key = this.getCacheKey(prompt, provider);
      const cacheEntry: CachedLLMResponse = {
        response,
        cachedAt: Date.now(),
        provider,
      };

      await this.redis.set(key, cacheEntry, { ex: ttl });
      console.log(`      ✅ LLM response cached (provider=${provider}, ttl=${ttl}s)`);
    } catch (error) {
      console.error('LLM cache set error:', (error as Error).message);
    }
  }

  /**
   * Clear all cached LLM responses (use with caution)
   */
  async clearAll(): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      // Note: This is a simple implementation. For production, use Redis SCAN pattern
      console.warn('⚠️  LLM cache clearAll not fully implemented (requires SCAN pattern)');
    } catch (error) {
      console.error('LLM cache clearAll error:', (error as Error).message);
    }
  }
}

export const llmCache = new LLMCache();

