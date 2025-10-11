import { algoliasearch } from 'algoliasearch';
import type { SearchProvider, TalentSearchQuery, TalentSearchResult } from './provider';
import { createAuditLog, AuditEventType } from '@/lib/enhanced-audit';

// Validate required environment variables
if (!process.env.ALGOLIA_APP_ID) {
  throw new Error('ALGOLIA_APP_ID environment variable is required');
}
if (!process.env.ALGOLIA_API_KEY) {
  throw new Error('ALGOLIA_API_KEY environment variable is required');
}
if (!process.env.ALGOLIA_WRITE_API_KEY) {
  throw new Error('ALGOLIA_WRITE_API_KEY environment variable is required');
}

// Create separate clients for search and write operations
const searchClient = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_API_KEY // Search API Key
);

const writeClient = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_WRITE_API_KEY // Write API Key
);

const INDEX_NAME = 'talent_profiles';
const SEARCH_INDEX_NAME = 'talent_profiles_search';

export async function configureAlgoliaIndex() {
  try {
    // Check if we have valid Algolia credentials
    if (!process.env.ALGOLIA_APP_ID || !process.env.ALGOLIA_WRITE_API_KEY) {
      console.warn('Algolia credentials not configured. Skipping index setup.');
      return;
    }

    // Configure search index with Arabic support and custom ranking
    await writeClient.setSettings({
      indexName: INDEX_NAME,
      indexSettings: {
        searchableAttributes: [
          'name',
          'bio',
          'skills',
          'languages',
          'location',
          'city',
          'experience',
          'specializations',
          'awards',
          'education'
        ],
        attributesForFaceting: [
          'searchable(skills)',
          'searchable(location)',
          'searchable(city)',
          'searchable(languages)',
          'searchable(experience)',
          'searchable(specializations)',
          'searchable(isMinor)',
          'searchable(verified)',
          'searchable(availability)'
        ],
        customRanking: [
          'desc(verified)',
          'desc(experience)',
          'desc(createdAt)'
        ],
        typoTolerance: true,
        ignorePlurals: ['en', 'ar'],
        queryLanguages: ['en', 'ar'],
        attributesToRetrieve: [
          'objectID',
          'name',
          'bio',
          'skills',
          'location',
          'city',
          'experience',
          'languages',
          'specializations',
          'awards',
          'education',
          'profileImage',
          'verified',
          'isMinor',
          'availability',
          'createdAt',
          'updatedAt'
        ],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
        snippetEllipsisText: '...',
        hitsPerPage: 20,
        maxValuesPerFacet: 100,
        distinct: false,
        replaceSynonymsInHighlight: true,
        minProximity: 1,
        responseFields: ['*'],
        maxFacetHits: 100,
        camelCaseAttributes: ['objectID'],
        decompoundQuery: true,
        enableRules: true,
        enablePersonalization: true
      }
    });
    console.log(`Algolia index '${INDEX_NAME}' settings configured successfully.`);
  } catch (error) {
    console.warn('Failed to configure Algolia index settings (this is expected in development):', (error as Error).message);
    // Don't throw error - allow graceful fallback
  }
}

export class AlgoliaSearchAdapter implements SearchProvider {
  private async initializeIndex() {
    // This can be called lazily or pre-emptively by the bootstrap script
    await configureAlgoliaIndex();
  }

  async searchTalent(query: TalentSearchQuery): Promise<TalentSearchResult> {
    const { term, filters, page, hitsPerPage } = query;

    // Initialize index settings if not already done
    await this.initializeIndex();

    const searchParams = {
      indexName: INDEX_NAME,
      query: term,
      filters: this.buildFilterString(filters),
      page: page || 0,
      hitsPerPage: hitsPerPage || 20,
      facets: ['skills', 'location', 'city', 'languages', 'experience', 'specializations'],
      facetFilters: this.buildFacetFilters(filters),
      numericFilters: this.buildNumericFilters(filters),
      aroundLatLng: filters?.location ? `${filters.location.lat},${filters.location.lng}` : undefined,
      aroundRadius: filters?.radius || 50000, // 50km default radius
      getRankingInfo: true,
      explain: ['match', 'typo', 'geo', 'proximity', 'attribute', 'exact', 'filters', 'pagination'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
      snippetEllipsisText: '...',
      attributesToRetrieve: [
        'objectID',
        'name',
        'bio',
        'skills',
        'location',
        'city',
        'experience',
        'languages',
        'specializations',
        'awards',
        'education',
        'profileImage',
        'verified',
        'isMinor',
        'availability',
        'createdAt',
        'updatedAt'
      ]
    };

    const response = await searchClient.search({
      requests: [searchParams],
    });

    const result = response.results[0] as any;
    return {
      hits: result.hits || [],
      page: result.page || 0,
      nbPages: result.nbPages || 0,
      hitsPerPage: result.hitsPerPage || 0,
      nbHits: result.nbHits || 0,
      query: result.query || '',
      explain: result.explain,
      facets: result.facets || {},
      facetHits: result.facetHits || [],
      processingTimeMs: result.processingTimeMs || 0,
      params: result.params || '',
      index: result.index || INDEX_NAME,
      nbSortedHits: result.nbSortedHits || 0,
      exhaustiveFacetsCount: result.exhaustiveFacetsCount || false,
      exhaustiveNbHits: result.exhaustiveNbHits || false,
      exhaustiveTypo: result.exhaustiveTypo || false,
      aroundLatLng: result.aroundLatLng || '',
      aroundRadius: result.aroundRadius || 0,
      ranking: result.ranking || {},
      _rankingInfo: result._rankingInfo || {}
    } as TalentSearchResult;
  }

  async indexTalentProfile(profile: any): Promise<void> {
    await writeClient.saveObject({
      indexName: INDEX_NAME,
      body: {
      objectID: profile.id,
      ...profile,
      },
    });
  }

  async deleteTalentProfile(profileId: string): Promise<void> {
    await writeClient.deleteObject({
      indexName: INDEX_NAME,
      objectID: profileId,
    });
  }

  private buildFilterString(filters?: Record<string, any>): string {
    if (!filters) return '';
    
    const filterParts: string[] = [];
    
    if (filters.skills && filters.skills.length > 0) {
      filterParts.push(`skills:${filters.skills.join(' OR skills:')}`);
    }
    
    if (filters.location) {
      filterParts.push(`location:"${filters.location}"`);
    }
    
    if (filters.experience) {
      filterParts.push(`experience:${filters.experience}`);
    }

    if (filters.isMinor !== undefined) {
      filterParts.push(`isMinor:${filters.isMinor}`);
    }

    if (filters.verified !== undefined) {
      filterParts.push(`verified:${filters.verified}`);
    }

    if (filters.availability) {
      filterParts.push(`availability:${filters.availability}`);
    }
    
    return filterParts.join(' AND ');
  }

  private buildFacetFilters(filters?: Record<string, any>): string[] {
    if (!filters) return [];
    
    const facetFilters: string[] = [];
    
    if (filters.skills && filters.skills.length > 0) {
      facetFilters.push(filters.skills.map((skill: string) => `skills:${skill}`));
    }
    
    if (filters.languages && filters.languages.length > 0) {
      facetFilters.push(filters.languages.map((lang: string) => `languages:${lang}`));
    }
    
    if (filters.specializations && filters.specializations.length > 0) {
      facetFilters.push(filters.specializations.map((spec: string) => `specializations:${spec}`));
    }
    
    return facetFilters;
  }

  private buildNumericFilters(filters?: Record<string, any>): string[] {
    if (!filters) return [];
    
    const numericFilters: string[] = [];
    
    if (filters.minExperience !== undefined) {
      numericFilters.push(`experience >= ${filters.minExperience}`);
    }
    
    if (filters.maxExperience !== undefined) {
      numericFilters.push(`experience <= ${filters.maxExperience}`);
    }

    if (filters.ageRange) {
      if (filters.ageRange.min !== undefined) {
        numericFilters.push(`age >= ${filters.ageRange.min}`);
      }
      if (filters.ageRange.max !== undefined) {
        numericFilters.push(`age <= ${filters.ageRange.max}`);
      }
    }
    
    return numericFilters;
  }

  // Enhanced search with analytics and personalization
  async searchTalentWithAnalytics(query: TalentSearchQuery, userId?: string): Promise<TalentSearchResult> {
    const searchParams = {
      indexName: INDEX_NAME,
      query: query.term,
      filters: this.buildFilterString(query.filters),
      page: query.page || 0,
      hitsPerPage: query.hitsPerPage || 20,
      facets: ['skills', 'location', 'city', 'languages', 'experience', 'specializations'],
      facetFilters: this.buildFacetFilters(query.filters),
      numericFilters: this.buildNumericFilters(query.filters),
      aroundLatLng: query.filters?.location ? `${query.filters.location.lat},${query.filters.location.lng}` : undefined,
      aroundRadius: query.filters?.radius || 50000,
      getRankingInfo: true,
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
      snippetEllipsisText: '...',
      userToken: userId, // For personalization
      attributesToRetrieve: [
        'objectID',
        'name',
        'bio',
        'skills',
        'location',
        'city',
        'experience',
        'languages',
        'specializations',
        'awards',
        'education',
        'profileImage',
        'verified',
        'isMinor',
        'availability',
        'createdAt',
        'updatedAt'
      ]
    };

    const response = await searchClient.search({
      requests: [searchParams],
    });

    const result = response.results[0] as any;
    
    // Log search analytics for fairness audits
    await createAuditLog({
      eventType: AuditEventType.DATA_EXPORTED,
      actorUserId: userId,
      resourceType: 'TalentSearch',
      metadata: {
        query: query.term,
        filters: query.filters,
        nbHits: result.nbHits,
        processingTimeMs: result.processingTimeMs,
        cohort: query.filters?.isMinor ? 'minor' : 'adult'
      }
    });

    return {
      hits: result.hits || [],
      page: result.page || 0,
      nbPages: result.nbPages || 0,
      hitsPerPage: result.hitsPerPage || 0,
      nbHits: result.nbHits || 0,
      query: result.query || '',
      explain: result.explain,
      facets: result.facets || {},
      facetHits: result.facetHits || [],
      processingTimeMs: result.processingTimeMs || 0,
      params: result.params || '',
      index: result.index || INDEX_NAME,
      nbSortedHits: result.nbSortedHits || 0,
      exhaustiveFacetsCount: result.exhaustiveFacetsCount || false,
      exhaustiveNbHits: result.exhaustiveNbHits || false,
      exhaustiveTypo: result.exhaustiveTypo || false,
      aroundLatLng: result.aroundLatLng || '',
      aroundRadius: result.aroundRadius || 0,
      ranking: result.ranking || {},
      _rankingInfo: result._rankingInfo || {}
    } as TalentSearchResult;
  }

  // Batch operations for better performance
  async batchIndexTalentProfiles(profiles: any[]): Promise<void> {
    const objects = profiles.map(profile => ({
      objectID: profile.id,
      ...profile,
    }));

    await writeClient.saveObjects({
      indexName: INDEX_NAME,
      objects,
    });
  }

  // Search suggestions and autocomplete
  async getSearchSuggestions(query: string, maxSuggestions: number = 5): Promise<string[]> {
    const response = await searchClient.search({
      requests: [{
        indexName: INDEX_NAME,
        query,
        hitsPerPage: 0,
        facets: ['skills', 'location', 'city', 'languages', 'specializations'],
        maxValuesPerFacet: maxSuggestions
      }],
    });

    const result = response.results[0] as any;
    const suggestions: string[] = [];

    // Extract suggestions from facets
    if (result.facets) {
      Object.values(result.facets).forEach((facetValues: any) => {
        if (Array.isArray(facetValues)) {
          suggestions.push(...facetValues.slice(0, maxSuggestions));
        }
      });
    }

    return suggestions.slice(0, maxSuggestions);
  }

  // Clear index (for testing/reset)
  async clearIndex(): Promise<void> {
    await writeClient.clearObjects({
      indexName: INDEX_NAME,
    });
  }

  // Get index statistics
  async getIndexStats(): Promise<any> {
    try {
      // Get basic index info
      const response = await searchClient.getSettings({
        indexName: INDEX_NAME,
      });

      // Get index stats by doing a simple search
      const statsResponse = await searchClient.search({
        requests: [{
          indexName: INDEX_NAME,
          query: '',
          hitsPerPage: 0
        }]
      });

      const stats = statsResponse.results[0] as any;

      return {
        nbHits: stats?.nbHits || 0,
        nbPages: stats?.nbPages || 0,
        hitsPerPage: stats?.hitsPerPage || 20,
        processingTimeMs: stats?.processingTimeMs || 0,
        lastBuild: null,
        createdAt: null,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.warn('Failed to get index stats:', error);
      return {
        nbHits: 0,
        nbPages: 0,
        hitsPerPage: 20,
        processingTimeMs: 0,
        lastBuild: null,
        createdAt: null,
        updatedAt: null
      };
    }
  }
}

export const algoliaSearchProvider = new AlgoliaSearchAdapter();
