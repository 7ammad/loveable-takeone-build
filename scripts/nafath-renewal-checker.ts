#!/usr/bin/env tsx

/**
 * Nafath Renewal Checker Script
 * Run this script periodically (e.g., daily) to check for expiring verifications
 * and send renewal notifications to users.
 */

import { checkExpiringVerifications, sendRenewalNotification } from '../packages/core-security/src/nafath-gate';

async function main() {
  console.log('🔍 Starting Nafath renewal check...');

  try {
    // Check for verifications expiring within 30 days
    const expiringUsers = await checkExpiringVerifications(30);

    console.log(`📊 Found ${expiringUsers.length} users with verifications expiring soon`);

    if (expiringUsers.length === 0) {
      console.log('✅ No expiring verifications found');
      return;
    }

    // Send notifications to each user
    for (const user of expiringUsers) {
      try {
        await sendRenewalNotification(user);
        console.log(`📧 Sent renewal notification to user ${user.id}`);
      } catch (error) {
        console.error(`❌ Failed to notify user ${user.id}:`, error);
      }
    }

    console.log('✅ Nafath renewal check completed');

  } catch (error) {
    console.error('❌ Nafath renewal check failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as checkNafathRenewals };
