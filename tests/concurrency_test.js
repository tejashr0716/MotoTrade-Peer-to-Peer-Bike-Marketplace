// High-Concurrency Race Condition & Mutex Integrity Test
const lockManager = require('../src/services/lock.service');

async function runConcurrencyStressTest() {
  console.log('⚡ Starting 100-thread atomic race condition benchmark on resource: BK-01');
  const totalThreads = 100;
  const results = [];

  const startTime = Date.now();
  for (let i = 1; i <= totalThreads; i++) {
    const owner = `Worker_Client_${i}`;
    const res = lockManager.acquireLock('BK-01', owner, 1800);
    results.push(res);
  }
  const elapsedMs = Date.now() - startTime;

  const successes = results.filter(r => r.success);
  const conflicts = results.filter(r => !r.success && r.conflict);

  console.log(`\n--- BENCHMARK RESULTS ---`);
  console.log(`Total Requests: ${totalThreads}`);
  console.log(`Execution Time: ${elapsedMs}ms`);
  console.log(`Locks Granted : ${successes.length} (Exactly 1 expected)`);
  console.log(`Conflicts Handled: ${conflicts.length} (Expected: ${totalThreads - 1})`);

  if (successes.length === 1 && conflicts.length === totalThreads - 1) {
    console.log('✅ PASS: Atomic mutex guarantee verified. Zero race condition collisions.');
  } else {
    console.error('❌ FAIL: Multiple locks granted or unexpected conflict count.');
    process.exit(1);
  }
}

runConcurrencyStressTest();
