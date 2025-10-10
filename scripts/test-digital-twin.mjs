#!/usr/bin/env node

/**
 * Digital Twin Test Script
 * 
 * This script tests the digital twin functionality:
 * 1. Creates test ingestion sources
 * 2. Triggers the digital twin orchestration
 * 3. Checks for AI-generated casting calls
 * 4. Tests approval workflow
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN; // Will need to be set

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[Step ${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: ADMIN_TOKEN ? {
    'Authorization': `Bearer ${ADMIN_TOKEN}`
  } : {},
});

// Test data
const testSources = [
  {
    sourceType: 'WEB',
    sourceIdentifier: 'https://www.mbc.net/en/careers',
    sourceName: 'MBC Careers - Saudi Productions',
    isActive: true,
  },
  {
    sourceType: 'INSTAGRAM',
    sourceIdentifier: '@saudicastingcalls',
    sourceName: 'Saudi Casting Calls Instagram',
    isActive: true,
  },
  {
    sourceType: 'WEB',
    sourceIdentifier: 'https://example.com/casting',
    sourceName: 'Test Casting Site',
    isActive: true,
  },
];

async function step1_createTestSources() {
  logStep(1, 'Creating test ingestion sources...');
  
  const createdSources = [];
  
  for (const source of testSources) {
    try {
      const response = await api.post('/api/v1/admin/sources', source);
      if (response.data.data) {
        createdSources.push(response.data.data);
        logSuccess(`Created source: ${source.sourceName} (${source.sourceType})`);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        logWarning(`Source already exists: ${source.sourceName}`);
      } else {
        logError(`Failed to create source: ${source.sourceName}`);
        console.error(error.response?.data || error.message);
      }
    }
  }
  
  return createdSources;
}

async function step2_checkDigitalTwinStatus() {
  logStep(2, 'Checking digital twin status...');
  
  try {
    const response = await api.get('/api/digital-twin/status');
    const status = response.data.data;
    
    logSuccess(`Digital Twin is ${status.isRunning ? 'RUNNING' : 'STOPPED'}`);
    log(`  - Interval: ${status.interval}`, 'bright');
    log(`  - Next Run: ${status.nextRun}`, 'bright');
    
    return status;
  } catch (error) {
    logError('Failed to get digital twin status');
    console.error(error.response?.data || error.message);
    return null;
  }
}

async function step3_triggerOrchestration() {
  logStep(3, 'Manually triggering digital twin orchestration...');
  
  try {
    const response = await api.post('/api/digital-twin/status');
    
    logSuccess('Orchestration triggered successfully!');
    log(response.data.data.message, 'bright');
    logWarning('Note: This runs in the background. Wait 30-60 seconds for results.');
    
    return true;
  } catch (error) {
    logError('Failed to trigger orchestration');
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function step4_waitAndCheckQueue() {
  logStep(4, 'Waiting 30 seconds for orchestration to process...');
  
  // Wait for 30 seconds
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  logStep(4.5, 'Checking validation queue for AI-generated casting calls...');
  
  try {
    const response = await api.get('/api/v1/admin/digital-twin/validation-queue');
    const queue = response.data.data;
    
    if (queue && queue.length > 0) {
      logSuccess(`Found ${queue.length} casting call(s) in validation queue!`);
      
      queue.forEach((call, index) => {
        log(`\n  Casting Call #${index + 1}:`, 'bright');
        log(`    - Title: ${call.title}`);
        log(`    - Role: ${call.roleTitle || 'N/A'}`);
        log(`    - Source: ${call.sourceType} - ${call.sourceName}`);
        log(`    - Status: ${call.status}`);
        log(`    - ID: ${call.id}`);
      });
      
      return queue;
    } else {
      logWarning('No casting calls found in validation queue yet.');
      logWarning('The orchestration might still be running, or no new content was found.');
      return [];
    }
  } catch (error) {
    logError('Failed to check validation queue');
    console.error(error.response?.data || error.message);
    return [];
  }
}

async function step5_approveFirstCall(queue) {
  if (!queue || queue.length === 0) {
    logWarning('No casting calls to approve. Skipping approval test.');
    return;
  }
  
  logStep(5, 'Testing approval workflow...');
  
  const firstCall = queue[0];
  log(`Attempting to approve: "${firstCall.title}"`, 'bright');
  
  try {
    const response = await api.post(`/api/v1/admin/casting-calls/${firstCall.id}/approve`);
    
    logSuccess(`Casting call approved successfully!`);
    log(`  - Status changed to: open`, 'bright');
    log(`  - Call ID: ${firstCall.id}`, 'bright');
    logSuccess(`Casting call should now be visible to talent users!`);
    
    return response.data.data;
  } catch (error) {
    logError('Failed to approve casting call');
    console.error(error.response?.data || error.message);
    return null;
  }
}

async function step6_verifyPublicListing() {
  logStep(6, 'Verifying public casting calls listing...');
  
  try {
    const response = await api.get('/api/v1/casting-calls');
    const calls = response.data.data?.castingCalls || [];
    
    if (calls.length > 0) {
      logSuccess(`Found ${calls.length} public casting call(s)!`);
      
      calls.slice(0, 3).forEach((call, index) => {
        log(`\n  Public Call #${index + 1}:`, 'bright');
        log(`    - Title: ${call.title}`);
        log(`    - Status: ${call.status}`);
        log(`    - Location: ${call.location || 'N/A'}`);
      });
    } else {
      logWarning('No public casting calls found.');
    }
    
    return calls;
  } catch (error) {
    logError('Failed to fetch public casting calls');
    console.error(error.response?.data || error.message);
    return [];
  }
}

async function main() {
  log('\n='.repeat(70), 'cyan');
  log('DIGITAL TWIN & AI CASTING CALL POPULATION TEST', 'bright');
  log('='.repeat(70), 'cyan');
  
  if (!ADMIN_TOKEN) {
    logWarning('\nNo ADMIN_TOKEN provided. Admin-only operations may fail.');
    logWarning('Set ADMIN_TOKEN environment variable with a valid admin JWT token.');
  }
  
  try {
    // Step 1: Create test sources
    const sources = await step1_createTestSources();
    
    // Step 2: Check digital twin status
    const status = await step2_checkDigitalTwinStatus();
    
    // Step 3: Trigger orchestration
    const triggered = await step3_triggerOrchestration();
    
    if (!triggered) {
      logError('\nOrchestration trigger failed. Cannot continue test.');
      process.exit(1);
    }
    
    // Step 4: Wait and check validation queue
    const queue = await step4_waitAndCheckQueue();
    
    // Step 5: Approve first casting call
    const approved = await step5_approveFirstCall(queue);
    
    // Step 6: Verify public listing
    const publicCalls = await step6_verifyPublicListing();
    
    // Summary
    log('\n' + '='.repeat(70), 'cyan');
    log('TEST SUMMARY', 'bright');
    log('='.repeat(70), 'cyan');
    logSuccess(`✓ Test sources created: ${sources.length}`);
    logSuccess(`✓ Digital twin status checked: ${status ? 'Yes' : 'No'}`);
    logSuccess(`✓ Orchestration triggered: ${triggered ? 'Yes' : 'No'}`);
    logSuccess(`✓ Validation queue items: ${queue.length}`);
    logSuccess(`✓ Approved calls: ${approved ? 1 : 0}`);
    logSuccess(`✓ Public casting calls: ${publicCalls.length}`);
    
    log('\n✅ Test completed!', 'green');
    
  } catch (error) {
    logError('\n❌ Test failed with unexpected error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
main().catch(console.error);

