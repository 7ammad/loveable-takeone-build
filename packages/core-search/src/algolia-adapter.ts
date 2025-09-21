import algoliasearch from 'algoliasearch';
import type { SearchProvider, TalentSearchQuery, TalentSearchResult } from './provider';

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_API_KEY!
);

const talentIndex = client.initIndex('talent_profiles');

export class AlgoliaSearchAdapter implements SearchProvider {
  async searchTalent(query: TalentSearchQuery): Promise<TalentSearchResult> {
    const { term, filters, page, hitsPerPage } = query;

    const response = await talentIndex.search(term, {
      filters: this.buildFilterString(filters),
      page,
      hitsPerPage,
    });

    return {
      hits: response.hits,
      page: response.page,
      nbPages: response.nbPages,
      hitsPerPage: response.hitsPerPage,
      nbHits: response.nbHits,
      query: response.query,
      explain: response.explain,
    };
  }

  async indexTalentProfile(profile: any): Promise<void> {
    await talentIndex.saveObject({
      objectID: profile.id,
      ...profile,
    });
  }

  async deleteTalentProfile(profileId: string): Promise<void> {
    await talentIndex.deleteObject(profileId);
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

// Export a singleton instance of the adapter
export const algoliaSearchProvider = new AlgoliaSearchAdapter();
