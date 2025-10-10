#!/usr/bin/env tsx

/**
 * Start All Digital Twin Workers
 * Runs all workers needed for the casting call aggregation system
 */

import { fork } from 'child_process';
import path from 'path';

const workers = [
  {
    name: 'Scraped Role Worker',
    path: '../packages/core-queue/src/workers/scraped-role-worker.ts',
    description: 'Processes raw scraped content using LLM',
  },
  {
    name: 'Validation Worker',
    path: '../packages/core-queue/src/workers/validation-worker.ts',
    description: 'Validates and saves casting calls to database',
  },
];

console.log('🚀 Starting Digital Twin Workers...\n');

const workerProcesses: any[] = [];

workers.forEach((worker) => {
  console.log(`📦 Starting: ${worker.name}`);
  console.log(`   Description: ${worker.description}`);
  console.log(`   Path: ${worker.path}\n`);

  const workerPath = path.resolve(__dirname, worker.path);
  const childProcess = fork(workerPath, [], {
    stdio: 'inherit',
    execArgv: ['-r', 'tsx/register'],
  });

  workerProcesses.push({
    name: worker.name,
    process: childProcess,
  });

  childProcess.on('error', (err) => {
    console.error(`❌ Error in ${worker.name}:`, err);
  });

  childProcess.on('exit', (code) => {
    console.log(`⚠️  ${worker.name} exited with code ${code}`);
  });
});

console.log('✅ All workers started!\n');
console.log('📊 Active Workers:');
workerProcesses.forEach((w) => {
  console.log(`   - ${w.name} (PID: ${w.process.pid})`);
});

console.log('\n💡 Press Ctrl+C to stop all workers\n');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down all workers...');
  
  workerProcesses.forEach((w) => {
    console.log(`   Stopping ${w.name}...`);
    w.process.kill('SIGTERM');
  });

  setTimeout(() => {
    console.log('✅ All workers stopped');
    process.exit(0);
  }, 2000);
});

process.on('SIGTERM', () => {
  workerProcesses.forEach((w) => w.process.kill('SIGTERM'));
  process.exit(0);
});

