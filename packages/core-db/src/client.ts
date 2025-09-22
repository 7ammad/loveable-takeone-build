import { PrismaClient } from '@prisma/client';
const url = process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL!;

function maskDsn(u?: string): string {
  if (!u) return 'undefined';
  try {
    const parsed = new URL(u);
    return `${parsed.protocol}//***@${parsed.hostname}:${parsed.port || '5432'}`;
  } catch {
    return 'invalid';
  }
}

if (process.env.NODE_ENV !== 'production') {
  // Log once at module load to verify which DSN the route runtime sees
  console.log('[core-db] Prisma datasource (masked):', maskDsn(url));
}

export const prisma = new PrismaClient({ datasources: { db: { url } } });
