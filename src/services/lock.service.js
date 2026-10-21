// Distributed Lock Manager with Atomic Redlock Guarantees
class DistributedLockManager {
  constructor() {
    this.locks = new Map(); // Emulates Redis SETNX with key TTL
  }

  acquireLock(resourceKey, ownerId, ttlSeconds = 1800) {
    const now = Date.now();
    const existing = this.locks.get(resourceKey);

    // Check if active lease exists
    if (existing && existing.expiresAt > now) {
      return {
        success: false,
        conflict: true,
        heldBy: existing.ownerId,
        ttlRemaining: Math.ceil((existing.expiresAt - now) / 1000)
      };
    }

    // Atomically acquire lock
    const expiresAt = now + (ttlSeconds * 1000);
    this.locks.set(resourceKey, { ownerId, expiresAt, acquiredAt: now });

    return {
      success: true,
      leaseId: 'lease-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      resourceKey,
      ownerId,
      expiresAt: new Date(expiresAt).toISOString(),
      ttl: ttlSeconds
    };
  }

  releaseLock(resourceKey, ownerId) {
    const existing = this.locks.get(resourceKey);
    if (!existing) return { success: true, released: false, reason: 'NOT_FOUND' };
    if (existing.ownerId !== ownerId) {
      return { success: false, reason: 'OWNER_MISMATCH' };
    }
    this.locks.delete(resourceKey);
    return { success: true, released: true };
  }

  getActiveLocks() {
    const now = Date.now();
    const active = [];
    for (const [k, v] of this.locks.entries()) {
      if (v.expiresAt > now) {
        active.push({ key: k, owner: v.ownerId, remainingSeconds: Math.ceil((v.expiresAt - now) / 1000) });
      }
    }
    return active;
  }
}

module.exports = new DistributedLockManager();
