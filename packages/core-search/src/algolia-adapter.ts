import { algoliasearch } from 'algoliasearch';
import type { SearchProvider, TalentSearchQuery, TalentSearchResult } from './provider';

// Create separate clients for search and write operations
const searchClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_API_KEY! // Search API Key
);

const writeClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_WRITE_API_KEY! // Write API Key
);

const INDEX_NAME = 'talent_profiles';

export class AlgoliaSearchAdapter implements SearchProvider {
  async searchTalent(query: TalentSearchQuery): Promise<TalentSearchResult> {
    const { term, filters, page, hitsPerPage } = query;

    const response = await searchClient.search({
      requests: [{
        indexName: INDEX_NAME,
        query: term,
        filters: this.buildFilterString(filters),
        page,
        hitsPerPage,
      }],
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
    if (!filters) {
      return '';
    }
    return Object.entries(filters)
      .map(([key, value]) => `${key}:${value}`)
      .join(' AND ');
  }
}

export const algoliaSearchProvider = new AlgoliaSearchAdapter();
