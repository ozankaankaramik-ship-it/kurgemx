-- Migration: planlar tablosuna fiyat_tl kolonu ekle
ALTER TABLE public.planlar ADD COLUMN IF NOT EXISTS fiyat_tl numeric;

UPDATE public.planlar SET fiyat_tl = 0   WHERE kod = 'freemium';
UPDATE public.planlar SET fiyat_tl = 399  WHERE kod = 'analyst';
UPDATE public.planlar SET fiyat_tl = 999  WHERE kod = 'advanced';
