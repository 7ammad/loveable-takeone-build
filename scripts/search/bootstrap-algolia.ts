import 'dotenv/config';
import { configureAlgoliaIndex, algoliaSearchProvider } from '@/packages/core-search/src/algolia-adapter';
import { prisma } from '@/packages/core-db/src/client';

async function bootstrap() {
  console.log('Bootstrapping Algolia index...');

  // 1. Configure index settings
  await configureAlgoliaIndex();

  // 2. Clear existing index (optional, use with caution)
  console.log('Clearing existing documents from the index...');
  await algoliaSearchProvider.clearIndex();
  
  // 3. Fetch all talent profiles from the database
  console.log('Fetching talent profiles from the database...');
  const profiles = await prisma.talentProfile.findMany({
    // Add includes for related data if needed for the index
    // e.g., include: { user: { select: { email: true } } }
  });

  if (profiles.length === 0) {
    console.log('No talent profiles found in the database to index.');
  } else {
    // 4. Index all profiles in batches
    console.log(`Found ${profiles.length} profiles. Indexing in batches...`);
    await algoliaSearchProvider.batchIndexTalentProfiles(profiles);
    console.log('Finished indexing all talent profiles.');
  }

  // 5. Verify index stats
  const stats = await algoliaSearchProvider.getIndexStats();
  console.log('Current index statistics:', stats);

  console.log('Algolia bootstrap complete.');
}

bootstrap().catch((error) => {
  console.error('Algolia bootstrap failed:', error);
  process.exit(1);
});

