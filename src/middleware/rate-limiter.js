// Token Bucket In-Memory High-Throughput Rate Limiter
class TokenBucketRateLimiter {
  constructor(capacity = 50, refillRate = 25) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.clients = new Map();
  }

  isAllowed(clientId) {
    const now = Date.now();
    let bucket = this.clients.get(clientId);

    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
      this.clients.set(clientId, bucket);
    } else {
      const elapsed = (now - bucket.lastRefill) / 1000;
      bucket.tokens = Math.min(this.capacity, bucket.tokens + elapsed * this.refillRate);
      bucket.lastRefill = now;
    }

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }
    return false;
  }
}

const limiter = new TokenBucketRateLimiter();

function rateLimiterMiddleware(req, res, next) {
  const ip = req.socket.remoteAddress || '127.0.0.1';
  if (!limiter.isAllowed(ip)) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Too Many Requests', code: 'RATE_LIMIT_EXCEEDED' }));
    return;
  }
  if (typeof next === 'function') next();
}

module.exports = rateLimiterMiddleware;
