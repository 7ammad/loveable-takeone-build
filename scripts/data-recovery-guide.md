# Data Recovery & Prevention Guide

## 📋 What Happened

During the migration `20251006140928_enhanced_caster_profile_system`, the database schema was reset and data was lost.

### Lost Columns
- `CasterProfile.companyName` → Dropped (replaced with `companyNameEn` + `companyNameAr`)
- `CasterProfile.yearsInBusiness` → Dropped (replaced with `establishedYear`)

### Why Reset Occurred
Prisma detected "drift" - the database schema didn't match migration history, likely due to:
1. Manual database changes
2. Failed migrations
3. Running migrations in different environments

When Prisma prompts: "We need to reset the schema... All data will be lost", it means **ALL DATA** across all tables will be wiped.

---

## 🔄 Recovery Options

### Option 1: Database Backup (If Available)
If you have a database backup from before the migration:

```bash
# Restore from backup (Supabase example)
psql $DATABASE_URL < backup.sql

# Then write a data migration script
npx tsx scripts/migrate-old-data.ts
```

### Option 2: Manual Data Re-entry
If data was minimal (development environment):
- Users can re-register
- Casters can re-fill their profiles
- No recovery needed

### Option 3: Accept Data Loss
For development environments with test data:
- Continue with clean slate
- Focus on preventing future data loss

---

## 🛡️ Prevention Strategies

### 1. Always Review Migration Files
Before running `prisma migrate dev`, check the generated SQL:
```bash
# Review the migration
cat packages/core-db/prisma/migrations/[migration-name]/migration.sql

# Look for:
# - DROP COLUMN (data loss!)
# - DROP TABLE (data loss!)
# - ALTER COLUMN with incompatible types
```

### 2. Write Data Migrations When Needed
If renaming/restructuring fields, write a custom migration:

```sql
-- Instead of:
-- ALTER TABLE "CasterProfile" DROP COLUMN "companyName";
-- ALTER TABLE "CasterProfile" ADD COLUMN "companyNameEn" TEXT;

-- Do this:
-- Migrate data from old column to new columns
ALTER TABLE "CasterProfile" ADD COLUMN "companyNameEn" TEXT;
UPDATE "CasterProfile" SET "companyNameEn" = "companyName";
ALTER TABLE "CasterProfile" DROP COLUMN "companyName";
```

### 3. Use Staging Environments
- Test migrations on staging database first
- Verify data integrity
- Only then apply to production

### 4. Backup Before Major Migrations
```bash
# For Supabase/PostgreSQL
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### 5. Use Prisma Migrate Deploy for Production
```bash
# Development (can reset)
npx prisma migrate dev

# Production (no reset, fails if drift detected)
npx prisma migrate deploy
```

---

## 🔨 Writing a Data Migration Script

If you had backup data, here's how to migrate it:

```typescript
// scripts/migrate-old-caster-data.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateData() {
  // Assuming you have old data in a JSON file
  const oldData = [
    { userId: 'user1', companyName: 'ABC Productions', yearsInBusiness: 5 },
    { userId: 'user2', companyName: 'XYZ Studios', yearsInBusiness: 10 },
  ];

  for (const old of oldData) {
    await prisma.casterProfile.update({
      where: { userId: old.userId },
      data: {
        companyNameEn: old.companyName, // Map old field to new
        establishedYear: new Date().getFullYear() - old.yearsInBusiness, // Calculate from years
        // Fill in other required fields with defaults
        companyType: 'film_production',
        companyCategory: 'production_companies',
        businessPhone: 'TBD',
        businessEmail: 'TBD',
        city: 'Riyadh',
      },
    });
  }

  console.log('✅ Data migration complete!');
}

migrateData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 📝 Best Practices Summary

1. ✅ **Always review migration files** before applying
2. ✅ **Backup before major schema changes**
3. ✅ **Test migrations on staging first**
4. ✅ **Write custom data migrations for field renames**
5. ✅ **Use `migrate deploy` in production** (never `migrate dev`)
6. ✅ **Keep old columns temporarily** during transitions
7. ✅ **Version control your backups**

---

## 🎯 For This Specific Case

**Current Situation:**
- Only 1 empty caster profile exists
- Development environment
- No production data lost

**Recommendation:**
✅ **Accept the data loss and continue** - This is a development environment with minimal data. Focus on:
1. Implementing proper backup strategy going forward
2. Testing all functionality with the new schema
3. Documenting the enhanced profile fields

**When to Worry:**
❌ If this were production with real users
❌ If hundreds of profiles existed
❌ If data was business-critical

---

## 🚀 Moving Forward

The new caster profile system is now live with:
- 30+ enhanced fields
- Portfolio management
- Team member support
- Review system
- Full taxonomy (23 types)

**Next Steps:**
1. Continue with Sprint 2 (frontend pages)
2. Implement automatic backups
3. Set up staging environment
4. Document the new profile structure

---

**Created:** October 6, 2025  
**Status:** Data loss acknowledged, prevention strategies documented

