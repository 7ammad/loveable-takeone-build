#!/usr/bin/env tsx

/**
 * Grant admin role to a user by email
 */

import { prisma } from '../packages/core-db/src/client';

async function grantAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Usage: pnpm tsx scripts/grant-admin.ts <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    await prisma.user.update({
      where: { email },
      data: { role: 'admin' },
    });

    console.log('✅ Admin role granted successfully!');
    console.log(`   User: ${user.name} (${user.email})`);
    console.log(`   Role: ${user.role} → admin`);
    console.log('\n📖 Admin Portal: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Error granting admin role:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

grantAdmin();

