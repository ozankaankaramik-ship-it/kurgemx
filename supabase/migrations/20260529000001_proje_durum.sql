-- ============================================================
-- Proje durum alanı temizliği
-- Geçerli değerler: aktif | tamamlandi | arsivlendi
-- ============================================================

-- 1. Mevcut geçersiz değerleri düzelt (constraint drop'tan önce)
UPDATE public.projeler SET durum = 'aktif'      WHERE durum IN ('taslak', 'pasif');
UPDATE public.projeler SET durum = 'arsivlendi' WHERE durum = 'arsiv';

-- 2. Eski kısıtı kaldır
ALTER TABLE public.projeler
  DROP CONSTRAINT IF EXISTS projeler_durum_check;

-- 3. Yeni kısıtı ekle
ALTER TABLE public.projeler
  ADD CONSTRAINT projeler_durum_check
  CHECK (durum IN ('aktif', 'tamamlandi', 'arsivlendi'));

-- 4. Arşivlenme tarihi kolonu
ALTER TABLE public.projeler
  ADD COLUMN IF NOT EXISTS arsivlendi_tarih timestamptz;
