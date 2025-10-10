#!/usr/bin/env tsx
/**
 * List all users in the database
 */

import { prisma } from '../packages/core-db/src/client';

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (users.length === 0) {
      console.log('❌ No users found in database.');
      console.log('   Register at: http://localhost:3000/register');
      return;
    }

    console.log('📋 Users in database:\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}\n`);
    });

    console.log('💡 To grant admin access, run:');
    console.log('   npx tsx scripts/grant-admin.ts <email>\n');

  } catch (error) {
    console.error('❌ Error listing users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();

