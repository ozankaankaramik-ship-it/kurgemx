-- projeler tablosuna dil ve kaynak_dokuman_url alanları eklenir (H6 ve H8 için)
ALTER TABLE public.projeler
  ADD COLUMN IF NOT EXISTS dil varchar(2) NOT NULL DEFAULT 'TR';

ALTER TABLE public.projeler
  ADD COLUMN IF NOT EXISTS kaynak_dokuman_url text;

-- durum kısıtına 'taslak' değeri eklenir
ALTER TABLE public.projeler
  DROP CONSTRAINT IF EXISTS projeler_durum_check;

ALTER TABLE public.projeler
  ADD CONSTRAINT projeler_durum_check
  CHECK (durum IN ('aktif', 'taslak', 'pasif', 'arsiv', 'arsivlendi'));
