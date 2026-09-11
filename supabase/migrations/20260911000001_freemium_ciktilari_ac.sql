-- ============================================================
-- Migration: Freemium çıktı kapsamını genişlet
-- Freemium artık prototip, test_senaryosu ve export'a da erişebilir.
-- Kısıtlama artık yalnızca proje sayısı (aylik_proje_limiti) ve
-- proje boyutu (kucuk_proje/orta_proje/buyuk_proje) üzerinden yapılıyor.
-- Filigran koşulu (src/lib/watermark.ts) ayrıca plan koduna (freemium)
-- bakarak uygulanmaya devam ediyor.
-- ============================================================

update public.planlar
set
  prototip       = true,
  test_senaryosu = true,
  export         = true
where kod = 'freemium';
