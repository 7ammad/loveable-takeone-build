#!/usr/bin/env tsx

/**
 * TakeOne Digital Twin - Cron Job Setup
 *
 * Sets up scheduled jobs for the Digital Twin ingestion system.
 * - Orchestrator: Runs every 4 hours to scrape web sources
 * - WhatsApp Ingestor: Runs every 15 minutes to fetch WhatsApp messages
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cron job configurations
const CRON_JOBS = [
  {
    name: 'orchestrator',
    command: 'tsx',
    args: [path.join(__dirname, 'orchestrator.ts')],
    schedule: '0 */4 * * *', // Every 4 hours
    description: 'Scrape web sources for casting calls'
  },
  {
    name: 'whatsapp-ingestor',
    command: 'tsx',
    args: [path.join(__dirname, 'whatsapp-ingestor.ts')],
    schedule: '*/15 * * * *', // Every 15 minutes
    description: 'Fetch WhatsApp messages for casting calls'
  }
];

function runJob(job: typeof CRON_JOBS[0]) {
  console.log(`🚀 Running ${job.name}: ${job.description}`);

  const child = spawn(job.command, job.args, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, NODE_ENV: 'production' }
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log(`✅ ${job.name} completed successfully`);
    } else {
      console.error(`❌ ${job.name} failed with code ${code}`);
    }
  });

  child.on('error', (error) => {
    console.error(`❌ ${job.name} error:`, error);
  });

  return child;
}

// Manual execution mode
if (process.argv.includes('--run-once')) {
  const jobName = process.argv[process.argv.indexOf('--run-once') + 1];
  const job = CRON_JOBS.find(j => j.name === jobName);

  if (!job) {
    console.error(`❌ Job "${jobName}" not found. Available jobs:`, CRON_JOBS.map(j => j.name));
    process.exit(1);
  }

  console.log(`🔄 Running ${job.name} once...`);
  runJob(job);
  return;
}

// Setup mode (for production deployment)
if (process.argv.includes('--setup')) {
  console.log('🔧 Setting up cron jobs for production...');

  const cronCommands = CRON_JOBS.map(job =>
    `${job.schedule} cd ${path.resolve(__dirname, '..')} && ${job.command} ${job.args.join(' ')}`
  ).join('\n');

  console.log('\n📋 Add these lines to your crontab (run `crontab -e`):');
  console.log('='.repeat(50));
  console.log(cronCommands);
  console.log('='.repeat(50));

  console.log('\n💡 Or use a process manager like PM2 for better reliability in production.');
  return;
}

// Development mode - run jobs on demand
console.log('🎬 TakeOne Digital Twin Cron Job Manager');
console.log('Available commands:');
console.log('  --run-once <job-name>    Run a specific job once');
console.log('  --setup                 Show production cron setup');
console.log('');
console.log('Available jobs:');
CRON_JOBS.forEach(job => {
  console.log(`  ${job.name.padEnd(20)} ${job.schedule.padEnd(15)} ${job.description}`);
});

export { CRON_JOBS, runJob };
