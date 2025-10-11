// Optional OpenTelemetry imports - gracefully fail if not installed
interface TracerProvider {
  addSpanProcessor: (processor: unknown) => void;
  register: () => void;
  getTracer: (name: string) => Tracer;
}

interface Tracer {
  startSpan: (name: string) => Span;
}

interface Span {
  setStatus: (status: { code: number; message?: string }) => void;
  setAttributes: (attributes: Record<string, unknown>) => void;
  recordException: (error: Error) => void;
  end: () => void;
}

let NodeTracerProvider: new (options: { resource: unknown }) => TracerProvider | undefined;
let SimpleSpanProcessor: new (exporter: unknown) => unknown | undefined;
let OTLPTraceExporter: new (options: { url: string; headers: Record<string, unknown> }) => unknown | undefined;
let Resource: new (attributes: Record<string, unknown>) => unknown | undefined;
let SemanticResourceAttributes: Record<string, string> | undefined;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  NodeTracerProvider = require('@opentelemetry/sdk-trace-node').NodeTracerProvider;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SimpleSpanProcessor = require('@opentelemetry/sdk-trace-base').SimpleSpanProcessor;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  OTLPTraceExporter = require('@opentelemetry/exporter-otlp-http').OTLPTraceExporter;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Resource = require('@opentelemetry/resources').Resource;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SemanticResourceAttributes = require('@opentelemetry/semantic-conventions').SemanticResourceAttributes;
} catch {
  console.warn('OpenTelemetry packages not installed, tracing disabled');
}

let tracerProvider: TracerProvider | null | undefined = null;

/**
 * Initialize OpenTelemetry tracing
 */
export function initTracing() {
  if (!NodeTracerProvider || !SimpleSpanProcessor || !OTLPTraceExporter || !Resource || !SemanticResourceAttributes) {
    // Return a no-op tracer if packages not available
    return {
      startSpan: () => ({ setStatus: () => {}, setAttributes: () => {}, recordException: () => {}, end: () => {} }),
    };
  }

  if (tracerProvider) {
    return tracerProvider.getTracer('saudi-casting-marketplace');
  }

  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'saudi-casting-marketplace',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.SERVICE_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  });

  if (!NodeTracerProvider || !SimpleSpanProcessor || !OTLPTraceExporter) {
    throw new Error('OpenTelemetry dependencies not available');
  }

  tracerProvider = new NodeTracerProvider({ resource });

  // Configure OTLP exporter
  const otlpExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    headers: {},
  });

  if (tracerProvider) {
    tracerProvider.addSpanProcessor(new SimpleSpanProcessor(otlpExporter));
    tracerProvider.register();

    return tracerProvider.getTracer('saudi-casting-marketplace');
  } else {
    throw new Error('Failed to initialize tracer provider');
  }
}

/**
 * Create a tracing wrapper for functions
 */
export function withTracing<T extends unknown[], R>(
  name: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const tracer = initTracing();
    const span = tracer.startSpan(name);

    try {
      const result = await fn(...args);
      span.setStatus({ code: 1 }); // OK
      return result;
    } catch (error) {
      span.setStatus({ code: 2, message: (error as Error).message }); // ERROR
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  };
}

/**
 * Add tracing to Next.js API routes
 */
export function traceApiRoute(
  handler: (request: Request, context?: unknown) => Promise<Response>,
  routeName: string
) {
  return async (request: Request, context?: unknown): Promise<Response> => {
    const tracer = initTracing();
    const span = tracer.startSpan(`api.${routeName}`);

    span.setAttributes({
      'http.method': request.method,
      'http.url': request.url,
      'user.id': request.headers.get('x-user-id') || 'anonymous',
    });

    try {
      const result = await handler(request, context);
      span.setStatus({ code: 1 });
      span.setAttributes({
        'http.status_code': result.status || 200,
      });
      return result;
    } catch (error) {
      span.setStatus({ code: 2, message: (error as Error).message });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  };
}
