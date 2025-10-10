/**
 * Standalone worker script to process queued jobs
 * This runs the BullMQ workers independently without needing the full server
 */

// CRITICAL: Load environment variables first
import 'dotenv/config';

import { startWorkers, stopWorkers } from '../lib/digital-twin/workers-init';
import { logger } from '@packages/core-observability';

console.log('🚀 Starting BullMQ Workers...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Start the workers
startWorkers();

console.log('✅ Workers started and listening for jobs');
console.log('📊 Processing queued jobs from recent orchestration...\n');
console.log('Press Ctrl+C to stop.\n');

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down workers...');
  await stopWorkers();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Shutting down workers...');
  await stopWorkers();
  process.exit(0);
});

// Keep the process running
setInterval(() => {
  // Just keep alive
}, 5000);

