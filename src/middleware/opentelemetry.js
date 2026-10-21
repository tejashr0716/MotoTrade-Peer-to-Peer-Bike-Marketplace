// OpenTelemetry W3C Distributed Tracing Middleware
const crypto = require('crypto');

class OpenTelemetryTracer {
  constructor(serviceName) {
    this.serviceName = serviceName;
  }

  generateTraceId() {
    return crypto.randomBytes(16).toString('hex');
  }

  generateSpanId() {
    return crypto.randomBytes(8).toString('hex');
  }

  traceMiddleware(req, res, next) {
    const rawTraceParent = req.headers['traceparent'];
    let traceId, parentSpanId;

    if (rawTraceParent && rawTraceParent.startsWith('00-')) {
      const parts = rawTraceParent.split('-');
      traceId = parts[1];
      parentSpanId = parts[2];
    } else {
      traceId = this.generateTraceId();
      parentSpanId = '0000000000000000';
    }

    const currentSpanId = this.generateSpanId();
    const traceParentHeader = `00-${traceId}-${currentSpanId}-01`;

    res.setHeader('traceparent', traceParentHeader);
    res.setHeader('X-Trace-ID', traceId);
    res.setHeader('X-Span-ID', currentSpanId);

    req.telemetry = {
      traceId,
      spanId: currentSpanId,
      parentSpanId,
      startTime: process.hrtime.bigint()
    };

    res.on('finish', () => {
      const durationNs = Number(process.hrtime.bigint() - req.telemetry.startTime);
      const durationMs = (durationNs / 1e6).toFixed(3);
      // In production, export to Jaeger / OTLP Collector
      // console.log(`[OTel Span] ${req.method} ${req.url} ${res.statusCode} ${durationMs}ms [trace_id=${traceId}]`);
    });

    if (typeof next === 'function') next();
  }
}

module.exports = OpenTelemetryTracer;
