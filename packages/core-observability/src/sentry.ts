// Optional Sentry import - gracefully fail if not installed
interface SentryType {
  init: (options: Record<string, unknown>) => void;
  setUser: (user: Record<string, unknown>) => void;
  captureException: (error: Error) => void;
  captureMessage: (message: string, level?: string) => void;
  withScope: (callback: (scope: SentryScope) => void) => void;
  addBreadcrumb: (breadcrumb: Record<string, unknown>) => void;
  startTransaction: (options: Record<string, unknown>) => SentryTransaction;
  Integrations?: {
    Console: new (options: { levels: string[] }) => unknown;
    Http: new () => unknown;
  };
}

interface SentryScope {
  setTag: (key: string, value: unknown) => void;
  setContext: (key: string, value: unknown) => void;
  setLevel: (level: string) => void;
}

interface SentryTransaction {
  end: () => void;
}

let Sentry: SentryType;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Sentry = require('@sentry/nextjs') as SentryType;
} catch {
  console.warn('Sentry package not installed, error monitoring disabled');
  Sentry = {
    init: () => {},
    setUser: () => {},
    captureException: () => {},
    captureMessage: () => {},
    withScope: (callback: (scope: SentryScope) => void) => callback({ setTag: () => {}, setContext: () => {}, setLevel: () => {} }),
    addBreadcrumb: () => {},
    startTransaction: () => ({ end: () => {} }),
  };
}

let sentryInitialized = false;

/**
 * Initialize Sentry error monitoring
 */
export function initSentry() {
  if (sentryInitialized || !process.env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV !== 'production',

    // Capture console logs as breadcrumbs
    integrations: Sentry.Integrations ? [
      new Sentry.Integrations.Console({
        levels: ['warn', 'error'],
      }),
      new Sentry.Integrations.Http(),
    ] : [],

    // Performance monitoring
    enableTracing: true,

    // Filter out health check errors
    beforeSend(event: Record<string, unknown>) {
      // Don't send events for health check endpoints
      const request = event.request as { url?: string } | undefined;
      if (request?.url?.includes('/health')) {
        return null;
      }
      return event;
    },

    // Custom error filtering
    beforeSendTransaction(event: Record<string, unknown>) {
      // Filter out transactions for static assets
      const request = event.request as { url?: string } | undefined;
      if (request?.url?.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
        return null;
      }
      return event;
    },
  });

  sentryInitialized = true;
}

/**
 * Capture an exception with context
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  if (context) {
    Sentry.withScope((scope: SentryScope) => {
      Object.keys(context).forEach((key) => {
        scope.setTag(key, context[key]);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Capture a message with level and context
 */
export function captureMessage(message: string, level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info', context?: Record<string, unknown>) {
  if (context) {
    Sentry.withScope((scope: SentryScope) => {
      Object.keys(context).forEach((key) => {
        scope.setTag(key, context[key]);
      });
      Sentry.captureMessage(message, level);
    });
  } else {
    Sentry.captureMessage(message, level);
  }
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string, role?: string) {
  Sentry.setUser({
    id: userId,
    email,
    role,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category?: string, level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug') {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level: level || 'info',
    timestamp: Date.now() / 1000,
  });
}

/**
 * Start a transaction for performance monitoring
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  });
}
