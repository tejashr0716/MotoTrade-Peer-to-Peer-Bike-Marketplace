// High-Resilience Circuit Breaker State Machine
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.cooldownPeriodMs = options.cooldownPeriodMs || 10000;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.successCount = 0;
  }

  async execute(action, fallback) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.cooldownPeriodMs) {
        this.state = 'HALF_OPEN';
        console.log('🔄 Circuit Breaker transitioning to HALF_OPEN trial state');
      } else {
        if (typeof fallback === 'function') return fallback(new Error('CIRCUIT_OPEN'));
        throw new Error('Circuit Breaker is OPEN. Downstream service call rejected.');
      }
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      if (typeof fallback === 'function') return fallback(err);
      throw err;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log('✅ Circuit Breaker recovered: Transitioned back to CLOSED (Healthy)');
    }
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold || this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      console.warn(`⚠️ Circuit Breaker TRIPPED to OPEN state. Failures: ${this.failureCount}`);
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

module.exports = CircuitBreaker;
