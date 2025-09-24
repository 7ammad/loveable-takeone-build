import { prisma } from '@/packages/core-db/src/client';
import { algoliaSearchProvider } from './algolia-adapter';
import { talentIndexer } from './talent-indexer';
import { searchRankingEngine, SearchContext } from './search-ranking';
import { SearchFilterValidator } from './search-filters';

export interface SearchRequest {
  term: string;
  filters?: Record<string, any>;
  page?: number;
  hitsPerPage?: number;
  sortBy?: 'relevance' | 'experience' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  userId?: string;
  location?: {
    lat: number;
    lng: number;
  };
  userPreferences?: {
    preferredSkills?: string[];
    preferredLocations?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'professional' | 'expert';
    ageRange?: {
      min: number;
      max: number;
    };
    gender?: string;
    verifiedOnly?: boolean;
  };
}

export interface SearchResponse {
  hits: any[];
  page: number;
  nbPages: number;
  hitsPerPage: number;
  nbHits: number;
  query: string;
  explain?: any;
  facets?: Record<string, any>;
  facetHits?: any[];
  processingTimeMs: number;
  params?: string;
  index?: string;
  nbSortedHits?: number;
  exhaustiveFacetsCount?: boolean;
  exhaustiveNbHits?: boolean;
  exhaustiveTypo?: boolean;
  aroundLatLng?: string;
  aroundRadius?: number;
  ranking?: any;
  _rankingInfo?: any;
  _explain?: {
    searchTimestamp: string;
    userId?: string;
    query: {
      term: string;
      filters?: Record<string, any>;
      page: number;
      hitsPerPage: number;
    };
    totalResults: number;
    searchId: string;
  };
}

export class SearchService {
  /**
   * Perform a comprehensive talent search
   */
  async searchTalent(request: SearchRequest): Promise<SearchResponse> {
    const startTime = Date.now();
    const searchId = this.generateSearchId();

    try {
      // Validate and process filters
      const validatedFilters = request.filters ? 
        SearchFilterValidator.validateFilters(request.filters) : {};

      // Build search context
      const context: SearchContext = {
        userId: request.userId,
        searchTerm: request.term,
        filters: validatedFilters,
        location: request.location,
        userPreferences: request.userPreferences,
        searchHistory: await this.getUserSearchHistory(request.userId)
      };

      // Perform Algolia search
      const searchResults = await algoliaSearchProvider.searchTalentWithAnalytics({
        term: request.term,
        page: (request.page || 1) - 1, // Convert to 0-based
        hitsPerPage: request.hitsPerPage || 20,
        filters: validatedFilters
      }, request.userId);

      // Apply custom ranking if needed
      if (request.sortBy === 'relevance' && request.term) {
        const rankedHits = await this.applyCustomRanking(searchResults.hits, context);
        searchResults.hits = rankedHits;
      }

      // Log search execution
      await this.logSearchExecution({
        userId: request.userId,
        searchTerm: request.term,
        filters: validatedFilters,
        resultsCount: searchResults.nbHits,
        executionTime: Date.now() - startTime,
        searchId
      });

      // Add explainability payload
      const explainabilityPayload = {
        searchTimestamp: new Date().toISOString(),
        userId: request.userId,
        query: {
          term: request.term,
          filters: validatedFilters,
          page: request.page || 1,
          hitsPerPage: request.hitsPerPage || 20,
        },
        totalResults: searchResults.nbHits,
        searchId
      };

      return {
        ...searchResults,
        processingTimeMs: searchResults.processingTimeMs ?? 0,
        _explain: explainabilityPayload
      } as SearchResponse;

    } catch (error) {
      console.error('Search service error:', error);
      throw error;
    }
  }

  /**
   * Apply custom ranking to search results
   */
  private async applyCustomRanking(hits: any[], context: SearchContext): Promise<any[]> {
    const customWeights = searchRankingEngine.getCustomWeights(context);
    
    const rankedHits = hits.map(hit => {
      const factors = searchRankingEngine.calculateRankingFactors(hit, context);
      const customScore = searchRankingEngine.calculateRankingScore(factors, customWeights);
      
      return {
        ...hit,
        _customRankingScore: customScore,
        _rankingFactors: factors
      };
    });

    // Sort by custom ranking score
    return rankedHits.sort((a, b) => b._customRankingScore - a._customRankingScore);
  }

  /**
   * Get user search history for personalization
   */
  private async getUserSearchHistory(userId?: string): Promise<any> {
    if (!userId) return undefined;

    try {
      const recentSearches = await prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          searchTerm: true,
          createdAt: true
        }
      });

      const clickedProfiles = await prisma.searchExecution.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          searchTerm: true,
          createdAt: true
        }
      });

      return {
        recentSearches: recentSearches.map(s => s.searchTerm),
        clickedProfiles: [], // Would be populated from click tracking
        savedProfiles: [] // Would be populated from saved profiles
      };
    } catch (error) {
      console.warn('Failed to get user search history:', error);
      return undefined;
    }
  }

  /**
   * Log search execution for analytics
   */
  private async logSearchExecution(data: {
    userId?: string;
    searchTerm: string;
    filters: Record<string, any>;
    resultsCount: number;
    executionTime: number;
    searchId: string;
  }): Promise<void> {
    if (!data.userId) return;

    try {
      await prisma.searchHistory.create({
        data: {
          userId: data.userId,
          searchTerm: data.searchTerm,
          filters: data.filters,
          resultsCount: data.resultsCount,
          executionTime: data.executionTime
        }
      });
    } catch (error) {
      console.warn('Failed to log search execution:', error);
    }
  }

  /**
   * Generate unique search ID
   */
  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    return algoliaSearchProvider.getSearchSuggestions(query, limit);
  }

  /**
   * Get search facets
   */
  async getSearchFacets(request: {
    term: string;
    filters?: Record<string, any>;
    facets?: string[];
    maxValuesPerFacet?: number;
    sortFacetsBy?: 'count' | 'alpha';
  }): Promise<Record<string, any>> {
    const validatedFilters = request.filters ? 
      SearchFilterValidator.validateFilters(request.filters) : {};

    const searchResults = await algoliaSearchProvider.searchTalentWithAnalytics({
      term: request.term,
      page: 0,
      hitsPerPage: 0,
      filters: validatedFilters
    });

    return searchResults.facets || {};
  }

  /**
   * Index talent profile
   */
  async indexTalentProfile(profileId: string): Promise<void> {
    return talentIndexer.indexTalentProfile(profileId);
  }

  /**
   * Batch index talent profiles
   */
  async batchIndexTalentProfiles(profileIds: string[]): Promise<void> {
    return talentIndexer.batchIndexTalentProfiles(profileIds);
  }

  /**
   * Reindex all talent profiles
   */
  async reindexAllTalentProfiles(): Promise<void> {
    return talentIndexer.reindexAllTalentProfiles();
  }

  /**
   * Remove talent profile from index
   */
  async removeTalentProfile(profileId: string): Promise<void> {
    return talentIndexer.removeTalentProfile(profileId);
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(params: {
    startDate?: Date;
    endDate?: Date;
    cohort?: string;
    userId?: string;
  }): Promise<any> {
    // This would query your analytics database
    // For now, return mock data
    return {
      totalSearches: 1250,
      uniqueUsers: 340,
      averageSearchTime: 245,
      topQueries: [
        { query: 'actor', count: 45 },
        { query: 'actress', count: 38 },
        { query: 'director', count: 32 }
      ],
      searchByCohort: {
        minor: { searches: 180, uniqueUsers: 45 },
        adult: { searches: 1070, uniqueUsers: 295 }
      },
      indexStats: await talentIndexer.getIndexStatistics()
    };
  }

  /**
   * Get search performance metrics
   */
  async getSearchPerformanceMetrics(): Promise<any> {
    try {
      const stats = await talentIndexer.getIndexStatistics();
      
      return {
        indexSize: stats.nbHits || 0,
        averageResponseTime: stats.processingTimeMs || 0,
        lastUpdated: stats.lastUpdated || new Date().toISOString(),
        health: stats.nbHits > 0 ? 'healthy' : 'empty'
      };
    } catch (error) {
      console.error('Failed to get search performance metrics:', error);
      return {
        indexSize: 0,
        averageResponseTime: 0,
        lastUpdated: new Date().toISOString(),
        health: 'error'
      };
    }
  }
}

export const searchService = new SearchService();
