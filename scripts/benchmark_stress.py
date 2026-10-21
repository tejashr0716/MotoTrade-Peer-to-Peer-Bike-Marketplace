#!/usr/bin/env python3
import asyncio
import time
import httpx

async def stress_worker(client, worker_id, target_url):
    success, latency = 0, []
    for _ in range(50):
        t0 = time.perf_counter()
        try:
            r = await client.post(target_url, json={"worker": worker_id, "timestamp": time.time()}, timeout=2.0)
            if r.status_code == 200:
                success += 1
            latency.append((time.perf_counter() - t0) * 1000)
        except Exception:
            pass
    return success, latency

async def main():
    print("🚀 Running Extreme Stress Benchmark on MotoTrade-Peer-to-Peer-Bike-Marketplace (1,000 Atomic Mutex Transactions)...")
    url = "http://localhost:3000/v1/mutex/batch-acquire"
    async with httpx.AsyncClient(limits=httpx.Limits(max_connections=100)) as client:
        t_start = time.perf_counter()
        tasks = [stress_worker(client, i, url) for i in range(20)]
        results = await asyncio.gather(*tasks)
        total_time = (time.perf_counter() - t_start)
    
    total_reqs = sum(r[0] for r in results)
    all_latencies = [lat for r in results for lat in r[1]]
    p50 = sorted(all_latencies)[int(len(all_latencies)*0.5)] if all_latencies else 0
    p99 = sorted(all_latencies)[int(len(all_latencies)*0.99)] if all_latencies else 0
    
    print(f"✅ Finished: {total_reqs}/1000 successful transactions in {total_time:.2f}s")
    print(f"📊 P50 Latency: {p50:.2f}ms | P99 Latency: {p99:.2f}ms")

if __name__ == "__main__":
    asyncio.run(main())
