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
  facets?: Record<string, any>;
  facetHits?: any[];
  processingTimeMs?: number;
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
