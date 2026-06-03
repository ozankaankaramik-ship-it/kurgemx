-- Public okuma izni: paylasim_id set edilmiş ve aktif olan dokümanlar
-- herkese (anonim dahil) açık olmalı — /share/[uuid] route'u için
CREATE POLICY IF NOT EXISTS "dokumanlar_paylasim_public_select"
  ON public.dokumanlar
  FOR SELECT
  USING (paylasim_id IS NOT NULL AND paylasim_aktif = true);
