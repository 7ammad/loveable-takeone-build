/**
 * Seed Script: Caster Taxonomy Data
 * Populates the database with reference data for caster types and categories
 */

import { PrismaClient } from '@prisma/client';
import { CASTER_TAXONOMY, getAllCasterTypes, getAllCategories } from '../../lib/constants/caster-taxonomy';

const prisma = new PrismaClient();

async function seedCasterTaxonomy() {
  console.log('🌱 Seeding caster taxonomy data...\n');

  // Log taxonomy summary
  const categories = getAllCategories();
  const types = getAllCasterTypes();
  
  console.log(`📊 Taxonomy Summary:`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Caster Types: ${types.length}\n`);

  // Display taxonomy structure
  console.log('📋 Taxonomy Structure:\n');
  for (const [categoryKey, category] of Object.entries(CASTER_TAXONOMY)) {
    console.log(`\n🏢 ${category.label_en} (${category.label_ar})`);
    console.log(`   Key: ${categoryKey}`);
    console.log(`   Types (${Object.keys(category.types).length}):`);
    
    for (const [typeKey, type] of Object.entries(category.types)) {
      console.log(`     • ${type.label_en} (${type.label_ar})`);
      console.log(`       - Key: ${typeKey}`);
      console.log(`       - Description: ${type.description}`);
      console.log(`       - Hiring: ${type.typical_hiring}`);
      if (type.saudi_examples && type.saudi_examples.length > 0) {
        console.log(`       - Examples: ${type.saudi_examples.join(', ')}`);
      }
    }
  }

  console.log('\n\n✅ Caster taxonomy data ready for use!');
  console.log('📝 Note: This data is stored in code constants and loaded dynamically.');
  console.log('   No database seeding required for taxonomy structure.\n');
}

async function main() {
  try {
    await seedCasterTaxonomy();
    console.log('✅ Seed completed successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

