// Optional OpenTelemetry imports - gracefully fail if not installed
let NodeTracerProvider: any;
let SimpleSpanProcessor: any;
let OTLPTraceExporter: any;
let Resource: any;
let SemanticResourceAttributes: any;

try {
  NodeTracerProvider = require('@opentelemetry/sdk-trace-node').NodeTracerProvider;
  SimpleSpanProcessor = require('@opentelemetry/sdk-trace-base').SimpleSpanProcessor;
  OTLPTraceExporter = require('@opentelemetry/exporter-otlp-http').OTLPTraceExporter;
  Resource = require('@opentelemetry/resources').Resource;
  SemanticResourceAttributes = require('@opentelemetry/semantic-conventions').SemanticResourceAttributes;
} catch (error) {
  console.warn('OpenTelemetry packages not installed, tracing disabled');
}

let tracerProvider: any = null;

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

  tracerProvider = new NodeTracerProvider({ resource });

  // Configure OTLP exporter
  const otlpExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    headers: {},
  });

  tracerProvider.addSpanProcessor(new SimpleSpanProcessor(otlpExporter));
  tracerProvider.register();

  return tracerProvider.getTracer('saudi-casting-marketplace');
}

/**
 * Create a tracing wrapper for functions
 */
export function withTracing<T extends any[], R>(
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
export function traceApiRoute(handler: Function, routeName: string) {
  return async (request: any, context?: any) => {
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
