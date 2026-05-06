-- Performance indexes for dokumanlar table
-- Run this in Supabase SQL Editor

CREATE INDEX IF NOT EXISTS idx_dokumanlar_proje_tip
ON dokumanlar(proje_id, tip_id);

CREATE INDEX IF NOT EXISTS idx_dokumanlar_proje_id
ON dokumanlar(proje_id);

-- Required for upsert conflict resolution (proje_id + tip_id combination must be unique)
ALTER TABLE dokumanlar
ADD CONSTRAINT IF NOT EXISTS dokumanlar_proje_tip_unique UNIQUE (proje_id, tip_id);
