-- Migration: kullanicilar tablosuna pazarlama_onay ve pazarlama_onay_tarih ekle
ALTER TABLE public.kullanicilar
  ADD COLUMN IF NOT EXISTS pazarlama_onay       boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pazarlama_onay_tarih timestamptz;
