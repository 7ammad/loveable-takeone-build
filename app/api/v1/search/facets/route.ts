import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { algoliaSearchProvider } from '@/packages/core-search/src/algolia-adapter';
import { SearchFilterValidator } from '@/packages/core-search/src/search-filters';

// Force Node.js runtime for external dependencies
export const runtime = 'nodejs';

const facetQuerySchema = z.object({
  term: z.string().default(''),
  filters: z.string().optional(),
  facets: z.string().optional(), // comma-separated list of facets to retrieve
  maxValuesPerFacet: z.preprocess((val) => val === undefined ? 100 : Number(val), z.number().int().positive().max(1000).default(100)),
  sortFacetsBy: z.enum(['count', 'alpha']).default('count'),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    console.log('[SEARCH FACETS] Request received:', {
      userId,
      path: request.nextUrl.pathname,
      headers: Object.fromEntries(request.headers.entries())
    });

    if (!userId) {
      return NextResponse.json({
        ok: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validation = facetQuerySchema.safeParse(query);

    if (!validation.success) {
      return NextResponse.json({
        ok: false,
        error: validation.error.format()
      }, { status: 422 });
    }

    const { term, filters, facets, maxValuesPerFacet, sortFacetsBy } = validation.data;

    // Parse and validate filters
    let parsedFilters: Record<string, unknown> = {};
    if (filters) {
      try {
        parsedFilters = JSON.parse(filters);
        parsedFilters = SearchFilterValidator.validateFilters(parsedFilters);
      } catch {
        return NextResponse.json({
          ok: false,
          error: 'Invalid filters format'
        }, { status: 400 });
      }
    }

    // Parse requested facets
    const requestedFacets = facets ? facets.split(',').map(f => f.trim()) : [
      'skills',
      'location',
      'city',
      'languages',
      'experience',
      'specializations',
      'gender',
      'ethnicity',
      'eyeColor',
      'hairColor',
      'bodyType',
      'voiceType',
      'danceStyles',
      'instruments',
      'specialSkills',
      'unionMemberships',
      'availability',
      'verified',
      'isMinor'
    ];

    // Build search parameters for facet retrieval
    const facetSearchParams = {
      term,
      page: 0, // We only need facets, not results
      hitsPerPage: 0, // No hits needed
      filters: parsedFilters,
      facets: requestedFacets,
      maxValuesPerFacet,
      sortFacetsBy
    };

    // Get facets from Algolia
    const searchResults = await algoliaSearchProvider.searchTalentWithAnalytics(facetSearchParams, userId);

    // Process and format facets
    const processedFacets = processFacets(searchResults.facets || {}, requestedFacets, sortFacetsBy);

    return NextResponse.json({
      ok: true,
      facets: processedFacets,
      totalHits: searchResults.nbHits,
      query: term,
      filters: parsedFilters,
      requestedFacets,
      maxValuesPerFacet,
      sortFacetsBy
    });

  } catch (error) {
    console.error('Search facets error:', error);
    return NextResponse.json({
      ok: false,
      error: 'Internal Server Error'
    }, { status: 500 });
  }
}

/**
 * Process and format facets for better presentation
 */
function processFacets(facets: Record<string, unknown>, requestedFacets: string[], sortFacetsBy: string) {
  const processedFacets: Record<string, unknown> = {};

  for (const facetName of requestedFacets) {
    const facetData = facets[facetName];
    
    if (!facetData || typeof facetData !== 'object') {
      processedFacets[facetName] = {
        values: [],
        total: 0,
        type: getFacetType(facetName)
      };
      continue;
    }

    // Convert facet data to array format
    const facetValues = Object.entries(facetData as Record<string, number>).map(([value, count]) => ({
      value,
      count,
      label: formatFacetLabel(facetName, value)
    }));

    // Sort facets
    if (sortFacetsBy === 'count') {
      facetValues.sort((a, b) => b.count - a.count);
    } else if (sortFacetsBy === 'alpha') {
      facetValues.sort((a, b) => a.label.localeCompare(b.label));
    }

    processedFacets[facetName] = {
      values: facetValues,
      total: facetValues.length,
      type: getFacetType(facetName),
      displayName: getFacetDisplayName(facetName),
      description: getFacetDescription(facetName)
    };
  }

  return processedFacets;
}

/**
 * Get facet type for UI rendering
 */
function getFacetType(facetName: string): string {
  const facetTypes: Record<string, string> = {
    skills: 'multi-select',
    languages: 'multi-select',
    specializations: 'multi-select',
    gender: 'single-select',
    ethnicity: 'multi-select',
    eyeColor: 'multi-select',
    hairColor: 'multi-select',
    bodyType: 'multi-select',
    voiceType: 'multi-select',
    danceStyles: 'multi-select',
    instruments: 'multi-select',
    specialSkills: 'multi-select',
    unionMemberships: 'multi-select',
    location: 'single-select',
    city: 'single-select',
    experience: 'range',
    availability: 'single-select',
    verified: 'boolean',
    isMinor: 'boolean'
  };

  return facetTypes[facetName] || 'multi-select';
}

/**
 * Format facet label for display
 */
function formatFacetLabel(facetName: string, value: string): string {
  // Capitalize first letter and replace underscores with spaces
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Get display name for facet
 */
function getFacetDisplayName(facetName: string): string {
  const displayNames: Record<string, string> = {
    skills: 'Skills',
    languages: 'Languages',
    specializations: 'Specializations',
    gender: 'Gender',
    ethnicity: 'Ethnicity',
    eyeColor: 'Eye Color',
    hairColor: 'Hair Color',
    bodyType: 'Body Type',
    voiceType: 'Voice Type',
    danceStyles: 'Dance Styles',
    instruments: 'Instruments',
    specialSkills: 'Special Skills',
    unionMemberships: 'Union Memberships',
    location: 'Location',
    city: 'City',
    experience: 'Experience Level',
    availability: 'Availability',
    verified: 'Verified Talent',
    isMinor: 'Minor Status'
  };

  return displayNames[facetName] || facetName;
}

/**
 * Get description for facet
 */
function getFacetDescription(facetName: string): string {
  const descriptions: Record<string, string> = {
    skills: 'Filter by acting and performance skills',
    languages: 'Filter by spoken languages',
    specializations: 'Filter by industry specializations',
    gender: 'Filter by gender identity',
    ethnicity: 'Filter by ethnic background',
    eyeColor: 'Filter by eye color',
    hairColor: 'Filter by hair color',
    bodyType: 'Filter by body type',
    voiceType: 'Filter by voice type',
    danceStyles: 'Filter by dance styles',
    instruments: 'Filter by musical instruments',
    specialSkills: 'Filter by special skills and talents',
    unionMemberships: 'Filter by union memberships',
    location: 'Filter by general location',
    city: 'Filter by specific city',
    experience: 'Filter by years of experience',
    availability: 'Filter by current availability',
    verified: 'Show only verified talent profiles',
    isMinor: 'Filter by minor status'
  };

  return descriptions[facetName] || '';
}
