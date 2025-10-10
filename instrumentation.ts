/**
 * Next.js Instrumentation Hook
 * This file is executed once when the Next.js server starts
 * Perfect for initializing background services like Digital Twin
 * 
 * Requires: experimental.instrumentationHook = true in next.config.mjs
 */

export async function register() {
  // Only run on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[INSTRUMENTATION] Starting server-side initialization...');
    
    try {
      const { initializeDigitalTwin } = await import('./lib/digital-twin/background-service');
      
      console.log('[INSTRUMENTATION] Calling initializeDigitalTwin...');
      const service = initializeDigitalTwin();
      console.log('[INSTRUMENTATION] Digital Twin service initialized:', !!service);
      
      if (service) {
        console.log('[INSTRUMENTATION] ✅ Digital Twin is ready');
      } else {
        console.log('[INSTRUMENTATION] ⚠️  Digital Twin returned null');
      }
    } catch (error) {
      console.error('[INSTRUMENTATION] ❌ Failed to initialize Digital Twin:', error);
      console.error('[INSTRUMENTATION] Stack:', error instanceof Error ? error.stack : 'No stack trace');
    }
  }
}

