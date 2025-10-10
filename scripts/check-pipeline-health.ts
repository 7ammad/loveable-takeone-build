/**
 * Pipeline Health Check Script
 * Monitors the health of the WhatsApp casting call pipeline
 */

import { prisma } from '@packages/core-db';
import { scrapedRolesQueue, validationQueue, dlq } from '@packages/core-queue';
import { logger } from '@packages/core-observability';

interface HealthMetrics {
  timestamp: string;
  queues: {
    scrapedRoles: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
    validation: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
    dlq: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
  };
  database: {
    pendingCalls: number;
    openCalls: number;
    processedMessages: number;
    activeSources: number;
  };
  processing: {
    lastProcessedMessage: string | null;
    avgProcessingTime: number | null;
    successRate: number;
  };
}

class PipelineHealthChecker {
  async checkHealth(): Promise<HealthMetrics> {
    const timestamp = new Date().toISOString();
    
    // Check queue statuses
    const queueMetrics = await this.checkQueues();
    
    // Check database metrics
    const dbMetrics = await this.checkDatabase();
    
    // Check processing metrics
    const processingMetrics = await this.checkProcessing();
    
    return {
      timestamp,
      queues: queueMetrics,
      database: dbMetrics,
      processing: processingMetrics
    };
  }

  private async checkQueues() {
    try {
      const [scrapedRoles, validation, deadLetter] = await Promise.all([
        this.getQueueMetrics(scrapedRolesQueue),
        this.getQueueMetrics(validationQueue),
        this.getQueueMetrics(dlq)
      ]);

      return {
        scrapedRoles,
        validation,
        dlq: deadLetter
      };
    } catch (error) {
      logger.error('Failed to check queue metrics', { error });
      return {
        scrapedRoles: { waiting: 0, active: 0, completed: 0, failed: 0 },
        validation: { waiting: 0, active: 0, completed: 0, failed: 0 },
        dlq: { waiting: 0, active: 0, completed: 0, failed: 0 }
      };
    }
  }

  private async getQueueMetrics(queue: any) {
    try {
      const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaiting().then((jobs: any[]) => jobs.length),
        queue.getActive().then((jobs: any[]) => jobs.length),
        queue.getCompleted().then((jobs: any[]) => jobs.length),
        queue.getFailed().then((jobs: any[]) => jobs.length)
      ]);

      return { waiting, active, completed, failed };
    } catch (error) {
      logger.error('Failed to get queue metrics', { error, queueName: queue.name });
      return { waiting: 0, active: 0, completed: 0, failed: 0 };
    }
  }

  private async checkDatabase() {
    try {
      const [pendingCalls, openCalls, processedMessages, activeSources] = await Promise.all([
        prisma.castingCall.count({ where: { status: 'pending_review' } }),
        prisma.castingCall.count({ where: { status: 'open' } }),
        prisma.processedMessage.count(),
        prisma.ingestionSource.count({ where: { isActive: true } })
      ]);

      return {
        pendingCalls,
        openCalls,
        processedMessages,
        activeSources
      };
    } catch (error) {
      logger.error('Failed to check database metrics', { error });
      return {
        pendingCalls: 0,
        openCalls: 0,
        processedMessages: 0,
        activeSources: 0
      };
    }
  }

  private async checkProcessing() {
    try {
      // Get last processed message
      const lastProcessed = await prisma.processedMessage.findFirst({
        orderBy: { processedAt: 'desc' }
      });

      // Calculate success rate from last 100 processed messages
      const recentMessages = await prisma.processedMessage.findMany({
        where: {
          processedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        orderBy: { processedAt: 'desc' },
        take: 100
      });

      // Count successful extractions (calls that made it to validation queue)
      const successfulExtractions = await prisma.castingCall.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          },
          isAggregated: true
        }
      });

      const successRate = recentMessages.length > 0 
        ? (successfulExtractions / recentMessages.length) * 100 
        : 0;

      return {
        lastProcessedMessage: lastProcessed?.processedAt.toISOString() || null,
        avgProcessingTime: null, // TODO: Calculate from job completion times
        successRate: Math.round(successRate * 100) / 100
      };
    } catch (error) {
      logger.error('Failed to check processing metrics', { error });
      return {
        lastProcessedMessage: null,
        avgProcessingTime: null,
        successRate: 0
      };
    }
  }

  printHealthReport(metrics: HealthMetrics) {
    console.log('\n🏥 Pipeline Health Report');
    console.log('==========================');
    console.log(`Timestamp: ${metrics.timestamp}`);
    
    console.log('\n📊 Queue Status:');
    console.log(`  Scraped Roles: ${metrics.queues.scrapedRoles.waiting} waiting, ${metrics.queues.scrapedRoles.active} active, ${metrics.queues.scrapedRoles.completed} completed, ${metrics.queues.scrapedRoles.failed} failed`);
    console.log(`  Validation: ${metrics.queues.validation.waiting} waiting, ${metrics.queues.validation.active} active, ${metrics.queues.validation.completed} completed, ${metrics.queues.validation.failed} failed`);
    console.log(`  Dead Letter: ${metrics.queues.dlq.waiting} waiting, ${metrics.queues.dlq.active} active, ${metrics.queues.dlq.completed} completed, ${metrics.queues.dlq.failed} failed`);
    
    console.log('\n🗄️  Database Status:');
    console.log(`  Pending Calls: ${metrics.database.pendingCalls}`);
    console.log(`  Open Calls: ${metrics.database.openCalls}`);
    console.log(`  Processed Messages: ${metrics.database.processedMessages}`);
    console.log(`  Active Sources: ${metrics.database.activeSources}`);
    
    console.log('\n⚙️  Processing Status:');
    console.log(`  Last Processed: ${metrics.processing.lastProcessedMessage || 'Never'}`);
    console.log(`  Success Rate: ${metrics.processing.successRate}%`);
    
    // Health indicators
    console.log('\n🔍 Health Indicators:');
    
    const hasBacklog = metrics.queues.scrapedRoles.waiting > 10 || metrics.queues.validation.waiting > 10;
    const hasFailures = metrics.queues.dlq.waiting > 0 || metrics.queues.scrapedRoles.failed > 0 || metrics.queues.validation.failed > 0;
    const lowSuccessRate = metrics.processing.successRate < 50;
    const noRecentProcessing = !metrics.processing.lastProcessedMessage || 
      (Date.now() - new Date(metrics.processing.lastProcessedMessage).getTime()) > 2 * 60 * 60 * 1000; // 2 hours
    
    if (hasBacklog) {
      console.log('  ⚠️  Queue backlog detected - workers may be overloaded');
    }
    
    if (hasFailures) {
      console.log('  ❌ Failed jobs detected - check error logs');
    }
    
    if (lowSuccessRate) {
      console.log('  ⚠️  Low success rate - check LLM extraction or pre-filter');
    }
    
    if (noRecentProcessing) {
      console.log('  ⚠️  No recent processing - check orchestrator and workers');
    }
    
    if (!hasBacklog && !hasFailures && !lowSuccessRate && !noRecentProcessing) {
      console.log('  ✅ All systems healthy');
    }
  }

  async runHealthCheck() {
    try {
      const metrics = await this.checkHealth();
      this.printHealthReport(metrics);
      
      // Return health status for programmatic use
      const isHealthy = !(
        metrics.queues.scrapedRoles.waiting > 10 ||
        metrics.queues.validation.waiting > 10 ||
        metrics.queues.dlq.waiting > 0 ||
        metrics.processing.successRate < 50 ||
        !metrics.processing.lastProcessedMessage ||
        (Date.now() - new Date(metrics.processing.lastProcessedMessage).getTime()) > 2 * 60 * 60 * 1000
      );
      
      return { metrics, isHealthy };
    } catch (error) {
      console.error('Health check failed:', error);
      return { metrics: null, isHealthy: false };
    }
  }
}

// Run health check if called directly
async function main() {
  const checker = new PipelineHealthChecker();
  const result = await checker.runHealthCheck();
  
  if (!result.isHealthy) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { PipelineHealthChecker };