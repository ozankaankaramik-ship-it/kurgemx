-- ============================================================
-- kullanicilar tablosuna durum ve silme_talep_tarihi ekle
-- ============================================================

ALTER TABLE public.kullanicilar
  ADD COLUMN IF NOT EXISTS durum text NOT NULL DEFAULT 'aktif'
    CHECK (durum IN ('aktif', 'pasif')),
  ADD COLUMN IF NOT EXISTS silme_talep_tarihi timestamptz;

-- Mevcut kullanıcıları aktif yap
UPDATE public.kullanicilar SET durum = 'aktif' WHERE durum IS NULL;
