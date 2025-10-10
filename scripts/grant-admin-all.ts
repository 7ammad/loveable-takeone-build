#!/usr/bin/env tsx
/**
 * Grant admin role to all users (or specific list)
 */

import { prisma } from '../packages/core-db/src/client';

async function grantAdminToAll() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (users.length === 0) {
      console.log('❌ No users found in database.');
      return;
    }

    console.log('🔄 Granting admin access to all users...\n');

    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      if (user.role === 'admin') {
        console.log(`⏭️  Skipped: ${user.email} (already admin)`);
        skipped++;
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'admin' },
        });
        console.log(`✅ Updated: ${user.email} (${user.role} → admin)`);
        updated++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Users updated to admin: ${updated}`);
    console.log(`   - Already admin (skipped): ${skipped}`);
    console.log(`   - Total users: ${users.length}`);
    console.log('\n✅ All users now have admin access!');
    console.log('📖 Admin Portal: http://localhost:3000/admin\n');

  } catch (error) {
    console.error('❌ Error granting admin roles:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

grantAdminToAll();

