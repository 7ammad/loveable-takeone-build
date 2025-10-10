#!/usr/bin/env ts-node
/**
 * Digital Twin Status Checker
 * Run this script to diagnose why Digital Twin isn't starting
 */

console.log('='.repeat(70));
console.log('DIGITAL TWIN DIAGNOSTIC CHECK');
console.log('='.repeat(70));

console.log('\n1. Environment Variables:');
console.log('   DIGITAL_TWIN_ENABLED:', process.env.DIGITAL_TWIN_ENABLED || '(not set)');
console.log('   NODE_ENV:', process.env.NODE_ENV || '(not set)');
console.log('   REDIS_URL:', process.env.REDIS_URL ? '✅ Set' : '❌ Not set');
console.log('   OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');

console.log('\n2. Testing Redis Connection...');
const REDIS_URL = process.env.REDIS_URL;
if (REDIS_URL) {
  console.log('   Redis URL:', REDIS_URL.replace(/:[^:@]+@/, ':****@'));
  // Basic test would require Redis client
  console.log('   ⚠️  Full Redis test requires running Redis client');
} else {
  console.log('   ❌ REDIS_URL not set');
}

console.log('\n3. Testing OpenAI API Key...');
const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (OPENAI_KEY) {
  console.log('   API Key format:', OPENAI_KEY.startsWith('sk-') ? '✅ Valid format' : '❌ Invalid format');
  console.log('   Key length:', OPENAI_KEY.length, 'characters');
} else {
  console.log('   ❌ OPENAI_API_KEY not set');
}

console.log('\n4. Initialization Logic Check:');
const isEnabled = process.env.DIGITAL_TWIN_ENABLED !== 'false';
console.log('   isEnabled (DIGITAL_TWIN_ENABLED !== "false"):', isEnabled);
console.log('   → Should start:', isEnabled ? '✅ YES' : '❌ NO');

console.log('\n5. Recommended Actions:');
if (!isEnabled) {
  console.log('   ❌ Set DIGITAL_TWIN_ENABLED=true in .env file');
}
if (!REDIS_URL) {
  console.log('   ❌ Set REDIS_URL in .env file');
}
if (!OPENAI_KEY) {
  console.log('   ❌ Set OPENAI_API_KEY in .env file');
}
if (isEnabled && REDIS_URL && OPENAI_KEY) {
  console.log('   ✅ All environment variables are set correctly!');
  console.log('   ℹ️  If Digital Twin still not starting, check server logs for errors');
}

console.log('\n' + '='.repeat(70));
console.log('To manually test the service:');
console.log('1. Restart dev server: pnpm dev');
console.log('2. Check logs for: "🤖 Starting Digital Twin Background Service..."');
console.log('3. Test endpoint: curl http://localhost:3000/api/digital-twin/status');
console.log('='.repeat(70) + '\n');

