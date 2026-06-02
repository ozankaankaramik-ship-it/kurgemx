-- Migration: kullanicilar tablosuna terms_onay ve terms_onay_tarih ekle
ALTER TABLE public.kullanicilar
  ADD COLUMN IF NOT EXISTS terms_onay       boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_onay_tarih timestamptz;
