/**
 * Digital Twin Background Service
 * Runs automatically when the Next.js server starts
 * Handles web crawling, Instagram scraping, and job aggregation
 */

import { WebOrchestrator } from './orchestrators/web-orchestrator';
import { InstagramOrchestrator } from './orchestrators/instagram-orchestrator';
import { WhatsAppOrchestrator } from './orchestrators/whatsapp-orchestrator';
import { startWorkers, stopWorkers } from './workers-init';
import { logger } from '@packages/core-observability';

let isRunning = false;
let orchestrationInterval: NodeJS.Timeout | null = null;
let lastRunTime: Date | null = null;
let nextRunTime: Date | null = null;

const ORCHESTRATION_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

export class DigitalTwinService {
  private webOrchestrator: WebOrchestrator;
  private instagramOrchestrator: InstagramOrchestrator;
  private whatsappOrchestrator: WhatsAppOrchestrator;

  constructor() {
    this.webOrchestrator = new WebOrchestrator();
    this.instagramOrchestrator = new InstagramOrchestrator();
    this.whatsappOrchestrator = new WhatsAppOrchestrator();
  }

  /**
   * Start the Digital Twin service
   * Runs initial crawl and then schedules periodic runs
   */
  async start() {
    if (isRunning) {
      logger.warn('⚠️  Digital Twin service is already running');
      return;
    }

    logger.info('🤖 Starting Digital Twin Background Service...');
    isRunning = true;

    // Start BullMQ workers
    startWorkers();

    // Skip initial crawl to avoid startup errors
    // Will run on first scheduled interval (4 hours)
    
    // Schedule periodic runs
    orchestrationInterval = setInterval(async () => {
      await this.runOrchestrationCycle();
    }, ORCHESTRATION_INTERVAL);

    logger.info(`✅ Digital Twin service started (runs every 4 hours)`);
  }

  /**
   * Stop the Digital Twin service
   */
  async stop() {
    if (orchestrationInterval) {
      clearInterval(orchestrationInterval);
      orchestrationInterval = null;
    }
    await stopWorkers();
    isRunning = false;
    logger.info('🛑 Digital Twin service stopped');
  }

  /**
   * Run a complete orchestration cycle
   * Made public for manual triggering and testing
   */
  async runOrchestrationCycle() {
    try {
      logger.info('🤖 Digital Twin Orchestration Cycle Started');
      lastRunTime = new Date();

      // Run WhatsApp orchestrator (PRIMARY SOURCE - 90% of Saudi casting calls)
      logger.info('📱 Running WhatsApp Orchestrator...');
      await this.whatsappOrchestrator.run();

      // Web orchestrator disabled (0% success rate with current sources)
      // Re-enable if we find better web platforms
      // logger.info('🌐 Running Web Orchestrator...');
      // await this.webOrchestrator.run();

      nextRunTime = new Date(Date.now() + ORCHESTRATION_INTERVAL);

      logger.info('✅ Digital Twin Orchestration Cycle Complete', { 
        nextRun: nextRunTime.toISOString() 
      });

    } catch (error) {
      logger.error('❌ Digital Twin orchestration failed:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  /**
   * Manually trigger an orchestration run
   */
  async triggerManualRun() {
    logger.info('🔄 Manual orchestration triggered');
    await this.runOrchestrationCycle();
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning,
      interval: ORCHESTRATION_INTERVAL,
      intervalHours: ORCHESTRATION_INTERVAL / (60 * 60 * 1000),
      lastRunTime: lastRunTime?.toISOString() || null,
      nextRunTime: nextRunTime?.toISOString() || null,
    };
  }
}

// Singleton instance
let digitalTwinService: DigitalTwinService | null = null;

/**
 * Initialize the Digital Twin service
 * Call this once when the server starts
 */
export function initializeDigitalTwin() {
  // Skip during Next.js production build phase
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
  if (isBuildPhase) {
    if (!(globalThis as any).__DT_BUILD_NOTICE_SHOWN) {
      logger.info('ℹ️  Digital Twin initialization skipped during build');
      (globalThis as any).__DT_BUILD_NOTICE_SHOWN = true;
    }
    return null;
  }

  // Global single-init guard across module contexts
  if ((globalThis as any).__DT_INITIALIZED) {
    return digitalTwinService;
  }

  if (!digitalTwinService) {
    digitalTwinService = new DigitalTwinService();
    
    // Only start if we're in production or explicitly enabled
    const isEnabled = process.env.DIGITAL_TWIN_ENABLED !== 'false';
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isEnabled) {
      digitalTwinService.start();
      (globalThis as any).__DT_INITIALIZED = true;
      
      // Graceful shutdown
      process.on('SIGTERM', async () => {
        await digitalTwinService?.stop();
      });
      
      process.on('SIGINT', async () => {
        await digitalTwinService?.stop();
        process.exit(0);
      });
    } else {
      logger.warn('ℹ️  Digital Twin is disabled (set DIGITAL_TWIN_ENABLED=true to enable)');
    }
  }
  
  return digitalTwinService;
}

/**
 * Get the Digital Twin service instance
 */
export function getDigitalTwinService(): DigitalTwinService | null {
  return digitalTwinService;
}

