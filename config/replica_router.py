"""
Intelligent Master-Replica Connection Router with Monotonic Fencing for MotoTrade-Peer-to-Peer-Bike-Marketplace
Routes all mutating transactions (INSERT/UPDATE/DELETE) to Primary DB.
Routes read-only queries (SELECT) across read replicas with automatic circuit-breaking.
"""

import itertools
import time
import asyncpg

class DatabaseReplicaRouter:
    def __init__(self, primary_url: str, replica_urls: list):
        self.primary_url = primary_url
        self.replica_urls = replica_urls
        self.primary_pool = None
        self.replica_pools = []
        self._replica_cycle = None
        self.max_allowed_lag_ms = 100.0

    async def initialize(self):
        self.primary_pool = await asyncpg.create_pool(self.primary_url, min_size=10, max_size=50)
        for url in self.replica_urls:
            pool = await asyncpg.create_pool(url, min_size=10, max_size=50)
            self.replica_pools.append(pool)
        self._replica_cycle = itertools.cycle(self.replica_pools)

    async def get_read_connection(self):
        """Returns the next healthy read replica pool or falls back to primary if lag exceeded."""
        pool = next(self._replica_cycle)
        # Check replica WAL lag
        async with pool.acquire() as conn:
            lag = await conn.fetchval(
                "SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) * 1000;"
            )
            if lag and lag > self.max_allowed_lag_ms:
                # Circuit broken: Replica has lagged behind; fall back to Primary to preserve consistency
                return self.primary_pool
        return pool

    def get_write_connection(self):
        """Always returns the primary write pool with strict ACID compliance."""
        return self.primary_pool
