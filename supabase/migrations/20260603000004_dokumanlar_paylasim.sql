ALTER TABLE dokumanlar
  ADD COLUMN IF NOT EXISTS paylasim_id   uuid    UNIQUE,
  ADD COLUMN IF NOT EXISTS paylasim_aktif boolean DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_dokumanlar_paylasim_id
  ON dokumanlar(paylasim_id)
  WHERE paylasim_id IS NOT NULL;
