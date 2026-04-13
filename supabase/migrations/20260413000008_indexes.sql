-- ============================================================
-- Performans indeksleri
-- ============================================================

-- projeler
create index if not exists idx_projeler_kullanici_id
  on public.projeler(kullanici_id);

-- destanlar
create index if not exists idx_destanlar_proje_id
  on public.destanlar(proje_id);

-- hikayeler
create index if not exists idx_hikayeler_proje_id
  on public.hikayeler(proje_id);

create index if not exists idx_hikayeler_destan_id
  on public.hikayeler(destan_id);

-- analiz_dokumanlari
create index if not exists idx_analiz_dokumanlari_hikaye_id
  on public.analiz_dokumanlari(hikaye_id);

create index if not exists idx_analiz_dokumanlari_proje_id
  on public.analiz_dokumanlari(proje_id);

-- test_senaryolari
create index if not exists idx_test_senaryolari_hikaye_id
  on public.test_senaryolari(hikaye_id);

-- abonelikler
create index if not exists idx_abonelikler_kullanici_id
  on public.abonelikler(kullanici_id);
