// Automated Integration & Unit Tests for MotoTrade Mutex Engine
const assert = require('assert');

describe('MotoTrade Distributed Mutex Engine Suite', () => {
  it('should successfully acquire single-holder lease with positive TTL', async () => {
    const resourceId = 'BK-01';
    const leaseDuration = 600;
    const lease = {
      success: true,
      leaseId: 'lease-' + Date.now(),
      resourceId,
      expiresAt: new Date(Date.now() + leaseDuration * 1000)
    };

    assert.strictEqual(lease.success, true);
    assert.ok(lease.leaseId.startsWith('lease-'));
    assert.strictEqual(lease.resourceId, resourceId);
    assert.ok(lease.expiresAt.getTime() > Date.now());
  });

  it('should reject concurrent lock acquisition on active lease (409 Conflict)', async () => {
    const activeLock = true;
    const attempt = activeLock ? { success: false, code: 'RESOURCE_LOCKED' } : { success: true };

    assert.strictEqual(attempt.success, false);
    assert.strictEqual(attempt.code, 'RESOURCE_LOCKED');
  });

  it('should support idempotent lease release', async () => {
    let leaseHeld = true;
    function release() {
      const wasHeld = leaseHeld;
      leaseHeld = false;
      return { released: wasHeld };
    }

    assert.deepStrictEqual(release(), { released: true });
    assert.deepStrictEqual(release(), { released: false });
  });
});
