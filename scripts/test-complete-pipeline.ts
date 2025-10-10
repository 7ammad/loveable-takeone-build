/**
 * End-to-End Pipeline Test
 * Tests the complete flow from WhatsApp message to public display
 */

import { prisma } from '@packages/core-db';
import { DigitalTwinService } from '../lib/digital-twin/background-service';
import { apiClient } from '../lib/api/client';
import { logger } from '@packages/core-observability';

interface TestResult {
  step: string;
  success: boolean;
  duration: number;
  details?: any;
  error?: string;
}

class PipelineTester {
  private results: TestResult[] = [];
  private startTime: number = 0;

  private async measureStep<T>(stepName: string, fn: () => Promise<T>): Promise<T> {
    const stepStart = Date.now();
    try {
      console.log(`\n🔄 ${stepName}...`);
      const result = await fn();
      const duration = Date.now() - stepStart;
      
      this.results.push({
        step: stepName,
        success: true,
        duration,
        details: result
      });
      
      console.log(`✅ ${stepName} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - stepStart;
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      this.results.push({
        step: stepName,
        success: false,
        duration,
        error: errorMsg
      });
      
      console.log(`❌ ${stepName} failed in ${duration}ms: ${errorMsg}`);
      throw error;
    }
  }

  async runTest(): Promise<void> {
    this.startTime = Date.now();
    console.log('🚀 Starting End-to-End Pipeline Test');
    console.log('=====================================');

    try {
      // Step 1: Check initial state
      await this.measureStep('Check initial state', async () => {
        const pendingCalls = await prisma.castingCall.count({
          where: { status: 'pending_review' }
        });
        const openCalls = await prisma.castingCall.count({
          where: { status: 'open' }
        });
        const processedMessages = await prisma.processedMessage.count();
        
        return {
          pendingCalls,
          openCalls,
          processedMessages
        };
      });

      // Step 2: Run WhatsApp orchestration
      await this.measureStep('Run WhatsApp orchestration', async () => {
        const digitalTwin = new DigitalTwinService();
        await digitalTwin.runOrchestrationCycle();
        return { message: 'Orchestration completed' };
      });

      // Step 3: Wait for workers to process (with timeout)
      await this.measureStep('Wait for worker processing', async () => {
        const maxWaitTime = 60000; // 60 seconds
        const checkInterval = 2000; // 2 seconds
        let waited = 0;
        
        while (waited < maxWaitTime) {
          const pendingCalls = await prisma.castingCall.count({
            where: { status: 'pending_review' }
          });
          
          if (pendingCalls > 0) {
            console.log(`   Found ${pendingCalls} pending calls, waiting for processing...`);
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            waited += checkInterval;
          } else {
            break;
          }
        }
        
        if (waited >= maxWaitTime) {
          throw new Error('Timeout waiting for workers to process messages');
        }
        
        return { waitTime: waited };
      });

      // Step 4: Check validation queue
      await this.measureStep('Check validation queue', async () => {
        const pendingCalls = await prisma.castingCall.findMany({
          where: { status: 'pending_review' },
          orderBy: { createdAt: 'desc' },
          take: 5
        });
        
        return {
          count: pendingCalls.length,
          calls: pendingCalls.map(call => ({
            id: call.id,
            title: call.title,
            company: call.company,
            sourceUrl: call.sourceUrl
          }))
        };
      });

      // Step 5: Auto-approve first entry (if any)
      await this.measureStep('Auto-approve first entry', async () => {
        const firstPending = await prisma.castingCall.findFirst({
          where: { status: 'pending_review' },
          orderBy: { createdAt: 'desc' }
        });
        
        if (!firstPending) {
          return { message: 'No pending calls to approve' };
        }
        
        // Approve via API
        const response = await apiClient.post(
          `/api/v1/admin/casting-calls/${firstPending.id}/approve`
        );
        
        if (response.status !== 200) {
          throw new Error(`Approval failed: ${response.status}`);
        }
        
        return {
          approvedId: firstPending.id,
          title: firstPending.title
        };
      });

      // Step 6: Check public API
      await this.measureStep('Check public API', async () => {
        const response = await apiClient.get('/api/v1/casting-calls');
        
        if (response.status !== 200) {
          throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = response.data as any;
        if (!data.success) {
          throw new Error(`API returned error: ${data.error}`);
        }
        
        return {
          totalCalls: data.data.castingCalls.length,
          calls: data.data.castingCalls.map((call: any) => ({
            id: call.id,
            title: call.title,
            status: call.status
          }))
        };
      });

      // Step 7: Verify public page data
      await this.measureStep('Verify public page data', async () => {
        const openCalls = await prisma.castingCall.findMany({
          where: { status: 'open' },
          orderBy: { createdAt: 'desc' }
        });
        
        return {
          count: openCalls.length,
          calls: openCalls.map(call => ({
            id: call.id,
            title: call.title,
            company: call.company,
            location: call.location
            // roles field will be available after running database migration
          }))
        };
      });

      // Step 8: Test search functionality
      await this.measureStep('Test search functionality', async () => {
        const response = await apiClient.get('/api/v1/casting-calls?page=1&limit=10');
        
        if (response.status !== 200) {
          throw new Error(`Search API failed: ${response.status}`);
        }
        
        const data = response.data as any;
        return {
          searchable: data.success,
          results: data.data.castingCalls.length
        };
      });

      // Final summary
      this.printSummary();

    } catch (error) {
      console.error('\n💥 Pipeline test failed:', error);
      this.printSummary();
      process.exit(1);
    }
  }

  private printSummary(): void {
    const totalDuration = Date.now() - this.startTime;
    const successfulSteps = this.results.filter(r => r.success).length;
    const totalSteps = this.results.length;
    
    console.log('\n📊 Test Summary');
    console.log('================');
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log(`Successful Steps: ${successfulSteps}/${totalSteps}`);
    console.log(`Success Rate: ${((successfulSteps / totalSteps) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Step Details:');
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const duration = `${result.duration}ms`;
      console.log(`${status} ${index + 1}. ${result.step} (${duration})`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.details && typeof result.details === 'object') {
        console.log(`   Details:`, JSON.stringify(result.details, null, 2));
      }
    });
    
    if (successfulSteps === totalSteps) {
      console.log('\n🎉 All tests passed! Pipeline is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the details above.');
    }
  }
}

// Run the test
async function main() {
  const tester = new PipelineTester();
  await tester.runTest();
}

if (require.main === module) {
  main().catch(console.error);
}

export { PipelineTester };
