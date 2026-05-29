ALTER TABLE public.projeler
  ADD COLUMN IF NOT EXISTS hikaye_sayisi integer NOT NULL DEFAULT 0;
