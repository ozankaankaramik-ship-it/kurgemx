-- Üretim süresi ve tahmini token kolonu ekleme
ALTER TABLE dokumanlar ADD COLUMN IF NOT EXISTS uretim_suresi INTEGER;
ALTER TABLE dokumanlar ADD COLUMN IF NOT EXISTS token_tahmini INTEGER;
