import { PrismaClient } from '@prisma/client';
const url = process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL!;
export const prisma = new PrismaClient({ datasources: { db: { url } } });
