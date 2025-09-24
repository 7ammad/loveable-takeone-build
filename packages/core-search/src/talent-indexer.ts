import { prisma } from '@/packages/core-db/src/client';
import { algoliaSearchProvider } from './algolia-adapter';
import { indexerQueue } from '@/packages/core-queue/src/queues';

export interface TalentProfileData {
  id: string;
  userId: string;
  name: string;
  bio: string;
  skills: string[];
  languages: string[];
  location: string;
  city: string;
  experience: number;
  specializations: string[];
  awards: string[];
  education: string[];
  profileImage?: string;
  verified: boolean;
  isMinor: boolean;
  availability: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields for search optimization
  searchableText: string;
  completeness: number; // Profile completeness score (0-1)
  locationCoords?: {
    lat: number;
    lng: number;
  };
  age?: number;
  gender?: string;
  ethnicity?: string;
  height?: number;
  weight?: number;
  eyeColor?: string;
  hairColor?: string;
  bodyType?: string;
  voiceType?: string;
  danceStyles?: string[];
  instruments?: string[];
  specialSkills?: string[];
  unionMemberships?: string[];
  agent?: string;
  manager?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
  demoReel?: string;
  headshots?: string[];
  resume?: string;
  availabilityStatus: 'available' | 'busy' | 'unavailable';
  travelWillingness: boolean;
  remoteWork: boolean;
  rateRange?: {
    min: number;
    max: number;
    currency: string;
  };
  previousWork?: {
    title: string;
    role: string;
    year: number;
    director?: string;
    production?: string;
  }[];
  training?: {
    institution: string;
    program: string;
    year: number;
    certificate?: string;
  }[];
  languagesSpoken?: {
    language: string;
    proficiency: 'native' | 'fluent' | 'conversational' | 'basic';
  }[];
}

export class TalentIndexer {
  /**
   * Index a single talent profile
   */
  async indexTalentProfile(profileId: string): Promise<void> {
    try {
      const profile = await this.getTalentProfileData(profileId);
      if (!profile) {
        console.warn(`Talent profile ${profileId} not found`);
        return;
      }

      const searchableProfile = this.prepareProfileForSearch(profile);
      await algoliaSearchProvider.indexTalentProfile(searchableProfile);
      
      console.log(`Successfully indexed talent profile ${profileId}`);
    } catch (error) {
      console.error(`Failed to index talent profile ${profileId}:`, error);
      throw error;
    }
  }

  /**
   * Batch index multiple talent profiles
   */
  async batchIndexTalentProfiles(profileIds: string[]): Promise<void> {
    try {
      const profiles = await Promise.all(
        profileIds.map(id => this.getTalentProfileData(id))
      );

      const validProfiles = profiles.filter(Boolean) as TalentProfileData[];
      const searchableProfiles = validProfiles.map(profile => 
        this.prepareProfileForSearch(profile)
      );

      await algoliaSearchProvider.batchIndexTalentProfiles(searchableProfiles);
      
      console.log(`Successfully batch indexed ${validProfiles.length} talent profiles`);
    } catch (error) {
      console.error('Failed to batch index talent profiles:', error);
      throw error;
    }
  }

  /**
   * Reindex all talent profiles
   */
  async reindexAllTalentProfiles(): Promise<void> {
    try {
      console.log('Starting full reindex of talent profiles...');
      
      // Clear existing index
      await algoliaSearchProvider.clearIndex();
      
      // Get all talent profiles in batches
      const batchSize = 100;
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const profiles = await prisma.talentProfile.findMany({
          skip: offset,
          take: batchSize
        });

        if (profiles.length === 0) {
          hasMore = false;
          break;
        }

        const searchableProfiles = profiles.map(profile => 
          this.prepareProfileForSearch(this.mapTalentProfileToData(profile))
        );

        await algoliaSearchProvider.batchIndexTalentProfiles(searchableProfiles);
        
        offset += batchSize;
        console.log(`Indexed ${offset} profiles so far...`);
      }

      console.log('Full reindex completed successfully');
    } catch (error) {
      console.error('Failed to reindex all talent profiles:', error);
      throw error;
    }
  }

  /**
   * Remove talent profile from index
   */
  async removeTalentProfile(profileId: string): Promise<void> {
    try {
      await algoliaSearchProvider.deleteTalentProfile(profileId);
      console.log(`Successfully removed talent profile ${profileId} from index`);
    } catch (error) {
      console.error(`Failed to remove talent profile ${profileId}:`, error);
      throw error;
    }
  }

  /**
   * Get talent profile data from database
   */
  private async getTalentProfileData(profileId: string): Promise<TalentProfileData | null> {
    const profile = await prisma.talentProfile.findUnique({
      where: { id: profileId }
    });

    if (!profile) {
      return null;
    }

    return this.mapTalentProfileToData(profile);
  }

  /**
   * Map Prisma talent profile to search data format
   */
  private mapTalentProfileToData(profile: any): TalentProfileData {
    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.name || profile.user.name || 'Unknown',
      bio: profile.bio || '',
      skills: profile.skills || [],
      languages: profile.languages || [],
      location: profile.location || '',
      city: profile.city || '',
      experience: profile.experience || 0,
      specializations: profile.specializations || [],
      awards: profile.awards || [],
      education: profile.education || [],
      profileImage: profile.profileImage,
      verified: profile.verified || false,
      isMinor: profile.isMinor || false,
      availability: profile.availability || 'available',
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      searchableText: this.buildSearchableText(profile),
      completeness: this.calculateProfileCompleteness(profile),
      locationCoords: profile.locationCoords,
      age: profile.age,
      gender: profile.gender,
      ethnicity: profile.ethnicity,
      height: profile.height,
      weight: profile.weight,
      eyeColor: profile.eyeColor,
      hairColor: profile.hairColor,
      bodyType: profile.bodyType,
      voiceType: profile.voiceType,
      danceStyles: profile.danceStyles || [],
      instruments: profile.instruments || [],
      specialSkills: profile.specialSkills || [],
      unionMemberships: profile.unionMemberships || [],
      agent: profile.agent,
      manager: profile.manager,
      website: profile.website,
      socialMedia: profile.socialMedia || {},
      demoReel: profile.demoReel,
      headshots: profile.headshots || [],
      resume: profile.resume,
      availabilityStatus: profile.availabilityStatus || 'available',
      travelWillingness: profile.travelWillingness || false,
      remoteWork: profile.remoteWork || false,
      rateRange: profile.rateRange,
      previousWork: profile.previousWork || [],
      training: profile.training || [],
      languagesSpoken: profile.languagesSpoken || []
    };
  }

  /**
   * Build searchable text from profile data
   */
  private buildSearchableText(profile: any): string {
    const parts = [
      profile.name,
      profile.bio,
      ...(profile.skills || []),
      ...(profile.languages || []),
      profile.location,
      profile.city,
      ...(profile.specializations || []),
      ...(profile.awards || []),
      ...(profile.education || []),
      ...(profile.danceStyles || []),
      ...(profile.instruments || []),
      ...(profile.specialSkills || []),
      ...(profile.unionMemberships || []),
      profile.agent,
      profile.manager,
      profile.website
    ].filter(Boolean);

    return parts.join(' ').toLowerCase();
  }

  /**
   * Prepare profile data for search indexing
   */
  private prepareProfileForSearch(profile: TalentProfileData): any {
    return {
      objectID: profile.id,
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
      bio: profile.bio,
      skills: profile.skills,
      languages: profile.languages,
      location: profile.location,
      city: profile.city,
      experience: profile.experience,
      specializations: profile.specializations,
      awards: profile.awards,
      education: profile.education,
      profileImage: profile.profileImage,
      verified: profile.verified,
      isMinor: profile.isMinor,
      availability: profile.availability,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      searchableText: profile.searchableText,
      locationCoords: profile.locationCoords,
      age: profile.age,
      gender: profile.gender,
      ethnicity: profile.ethnicity,
      height: profile.height,
      weight: profile.weight,
      eyeColor: profile.eyeColor,
      hairColor: profile.hairColor,
      bodyType: profile.bodyType,
      voiceType: profile.voiceType,
      danceStyles: profile.danceStyles,
      instruments: profile.instruments,
      specialSkills: profile.specialSkills,
      unionMemberships: profile.unionMemberships,
      agent: profile.agent,
      manager: profile.manager,
      website: profile.website,
      socialMedia: profile.socialMedia,
      demoReel: profile.demoReel,
      headshots: profile.headshots,
      resume: profile.resume,
      availabilityStatus: profile.availabilityStatus,
      travelWillingness: profile.travelWillingness,
      remoteWork: profile.remoteWork,
      rateRange: profile.rateRange,
      previousWork: profile.previousWork,
      training: profile.training,
      languagesSpoken: profile.languagesSpoken,
      // Search optimization fields
      _tags: this.generateSearchTags(profile),
      _geoloc: profile.locationCoords ? {
        lat: profile.locationCoords.lat,
        lng: profile.locationCoords.lng
      } : undefined
    };
  }

  /**
   * Calculate profile completeness score (0-1)
   */
  private calculateProfileCompleteness(profile: TalentProfileData): number {
    let score = 0;
    let totalFields = 0;

    // Basic profile fields (required)
    const basicFields = [
      'name', 'bio', 'skills', 'languages', 'location', 'city', 'experience',
      'specializations', 'availability'
    ];

    for (const field of basicFields) {
      totalFields++;
      const value = profile[field as keyof TalentProfileData];
      if (value !== undefined && value !== null &&
          (Array.isArray(value) ? value.length > 0 : value !== '')) {
        score += 1;
      }
    }

    // Additional profile fields (bonus)
    const additionalFields = [
      'profileImage', 'verified', 'awards', 'education', 'demoReel',
      'headshots', 'resume', 'website', 'socialMedia', 'previousWork',
      'training', 'age', 'gender', 'height', 'weight'
    ];

    for (const field of additionalFields) {
      totalFields++;
      const value = profile[field as keyof TalentProfileData];
      if (value !== undefined && value !== null &&
          (Array.isArray(value) ? value.length > 0 :
           typeof value === 'object' && value !== null ? Object.keys(value).length > 0 :
           value !== '')) {
        score += 1;
      }
    }

    return Math.min(1, score / totalFields);
  }

  /**
   * Generate search tags for better discoverability
   */
  private generateSearchTags(profile: TalentProfileData): string[] {
    const tags: string[] = [];

    // Add skill tags
    if (profile.skills) {
      tags.push(...profile.skills.map(skill => `skill:${skill.toLowerCase()}`));
    }

    // Add language tags
    if (profile.languages) {
      tags.push(...profile.languages.map(lang => `lang:${lang.toLowerCase()}`));
    }

    // Add specialization tags
    if (profile.specializations) {
      tags.push(...profile.specializations.map(spec => `spec:${spec.toLowerCase()}`));
    }

    // Add location tags
    if (profile.city) {
      tags.push(`city:${profile.city.toLowerCase()}`);
    }
    if (profile.location) {
      tags.push(`location:${profile.location.toLowerCase()}`);
    }

    // Add experience level tags
    if (profile.experience >= 10) {
      tags.push('experience:expert');
    } else if (profile.experience >= 5) {
      tags.push('experience:professional');
    } else if (profile.experience >= 2) {
      tags.push('experience:intermediate');
    } else {
      tags.push('experience:beginner');
    }

    // Add availability tags
    tags.push(`availability:${profile.availabilityStatus}`);

    // Add verification tags
    if (profile.verified) {
      tags.push('verified:true');
    }

    // Add minor status tags
    if (profile.isMinor) {
      tags.push('minor:true');
    } else {
      tags.push('minor:false');
    }

    return tags;
  }

  /**
   * Queue talent profile for indexing
   */
  async queueTalentProfileIndexing(profileId: string, action: 'index' | 'update' | 'delete' = 'index'): Promise<void> {
    try {
      await indexerQueue.add('index-talent', {
        type: 'index-talent',
        payload: {
          profileId,
          action
        }
      });
      console.log(`Queued talent profile ${profileId} for ${action}`);
    } catch (error) {
      console.error(`Failed to queue talent profile ${profileId}:`, error);
      throw error;
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStatistics(): Promise<any> {
    try {
      const stats = await algoliaSearchProvider.getIndexStats();
      return {
        ...stats,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get index statistics:', error);
      throw error;
    }
  }
}

export const talentIndexer = new TalentIndexer();
