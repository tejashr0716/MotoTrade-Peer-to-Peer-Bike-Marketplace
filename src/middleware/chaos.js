// Production Chaos Engineering Middleware
class ChaosMiddleware {
  constructor() {
    this.latencyInjectionMs = 0;
    this.failureRate = 0.0;
  }

  setLatency(ms) { this.latencyInjectionMs = ms; }
  setFailureRate(rate) { this.failureRate = rate; }

  handle(req, res, next) {
    if (this.failureRate > 0 && Math.random() < this.failureRate) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Service Unavailable (Chaos Injected)', code: 'CHAOS_FAILURE' }));
      return;
    }

    if (this.latencyInjectionMs > 0) {
      setTimeout(() => { if (typeof next === 'function') next(); }, this.latencyInjectionMs);
    } else {
      if (typeof next === 'function') next();
    }
  }
}

module.exports = new ChaosMiddleware();
