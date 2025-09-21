export interface TalentSearchQuery {
  term: string;
  filters?: Record<string, any>;
  page?: number;
  hitsPerPage?: number;
}

export interface TalentSearchResult {
  hits: any[];
  page: number;
  nbPages: number;
  hitsPerPage: number;
  nbHits: number;
  query: string;
  explain?: any; // For fairness audits and explainability
}

/**
 * Defines the contract for a search provider.
 * This allows us to swap between providers like Algolia and OpenSearch.
 */
export interface SearchProvider {
  searchTalent(query: TalentSearchQuery): Promise<TalentSearchResult>;
  indexTalentProfile(profile: any): Promise<void>;
  deleteTalentProfile(profileId: string): Promise<void>;
}
