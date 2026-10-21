// Distributed Tracing & Request Correlation Middleware
const crypto = require('crypto');

function requestTracer(req, res, next) {
  const correlationId = req.headers['x-request-id'] || 'trace-' + crypto.randomBytes(8).toString('hex');
  req.correlationId = correlationId;
  res.setHeader('X-Request-ID', correlationId);
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);
    res.setHeader('X-Response-Time', `${durationMs}ms`);
  });

  if (typeof next === 'function') next();
}

module.exports = requestTracer;
