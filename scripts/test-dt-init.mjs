#!/usr/bin/env node
/**
 * Test Digital Twin Initialization
 * This script manually tests if the Digital Twin can initialize
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load environment
dotenv.config({ path: join(rootDir, '.env.local') });
dotenv.config({ path: join(rootDir, '.env') });

console.log('='.repeat(70));
console.log('DIGITAL TWIN INITIALIZATION TEST');
console.log('='.repeat(70));

console.log('\n✅ Environment Variables:');
console.log('   DIGITAL_TWIN_ENABLED:', process.env.DIGITAL_TWIN_ENABLED || '(not set - defaults to true)');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('   REDIS_URL:', process.env.REDIS_URL ? '✅ Set' : '❌ Not set');
console.log('   OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `✅ Set (${process.env.OPENAI_API_KEY.substring(0, 10)}...)` : '❌ Not set');

console.log('\n✅ Initialization Logic Test:');
const isEnabled = process.env.DIGITAL_TWIN_ENABLED !== 'false';
console.log('   isEnabled check:', isEnabled);
console.log('   Should initialize:', isEnabled ? 'YES ✅' : 'NO ❌');

console.log('\n📝 Testing imports...');
try {
  console.log('   Importing background-service...');
  // Can't actually import the service here due to Next.js dependencies
  // But we can check if the files exist
  const fs = await import('fs');
  const servicePath = join(rootDir, 'lib/digital-twin/background-service.ts');
  const initPath = join(rootDir, 'lib/digital-twin/init.ts');
  
  if (fs.existsSync(servicePath)) {
    console.log('   ✅ background-service.ts exists');
  } else {
    console.log('   ❌ background-service.ts NOT FOUND');
  }
  
  if (fs.existsSync(initPath)) {
    console.log('   ✅ init.ts exists');
  } else {
    console.log('   ❌ init.ts NOT FOUND');
  }
} catch (error) {
  console.log('   ❌ Error checking files:', error.message);
}

console.log('\n🔍 Checking Redis connection...');
try {
  const Redis = (await import('ioredis')).default;
  const redis = new Redis(process.env.REDIS_URL);
  
  await new Promise((resolve, reject) => {
    redis.ping((err, result) => {
      if (err) {
        console.log('   ❌ Redis connection failed:', err.message);
        reject(err);
      } else {
        console.log('   ✅ Redis PING successful:', result);
        resolve(result);
      }
      redis.disconnect();
    });
  });
} catch (error) {
  console.log('   ❌ Redis test failed:', error.message);
  console.log('   WARNING: This could be why Digital Twin isn\'t starting!');
}

console.log('\n' + '='.repeat(70));
console.log('DIAGNOSIS:');
console.log('='.repeat(70));

if (!process.env.REDIS_URL) {
  console.log('❌ REDIS_URL not set - Digital Twin workers cannot start');
} else if (!process.env.OPENAI_API_KEY) {
  console.log('❌ OPENAI_API_KEY not set - AI extraction will fail');
} else if (!isEnabled) {
  console.log('❌ DIGITAL_TWIN_ENABLED is set to "false"');
} else {
  console.log('✅ All environment variables are set correctly');
  console.log('INFO: If Digital Twin still isn\'t starting, check:');
  console.log('   1. Server logs for initialization errors');
  console.log('   2. BullMQ worker initialization errors');
  console.log('   3. Redis connection from Next.js process');
}

console.log('\nNext Step: Check server terminal output for errors during startup');
console.log('='.repeat(70) + '\n');

