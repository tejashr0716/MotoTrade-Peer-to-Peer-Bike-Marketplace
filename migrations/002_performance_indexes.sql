-- Migration 002: B-Tree and GiST Indexes for Sub-Millisecond Scans
CREATE INDEX IF NOT EXISTS idx_mototrade_status ON mototrade_entities (status);
CREATE INDEX IF NOT EXISTS idx_mototrade_cat_status ON mototrade_entities (category, status);
CREATE INDEX IF NOT EXISTS idx_mototrade_lease_expires ON mototrade_leases (entity_id, expires_at) WHERE released = FALSE;
