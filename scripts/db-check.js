require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

async function main() {
  const url = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;
  if (!url) {
    console.error('No DATABASE_URL_POOLED or DATABASE_URL found in .env');
    process.exit(1);
  }
  console.log('Using URL:', url.replace(/:\w+@/, '://****@'));
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    await prisma.$connect();
    const result = await prisma.$queryRawUnsafe('select 1 as ok');
    console.log('Query result:', result);
    console.log('ok');
  } catch (e) {
    console.error('ERROR:', e.code || e.message || e);
    process.exit(2);
  } finally {
    await prisma.$disconnect();
  }
}

main();
