alter table public.projeler
  add column if not exists proje_buyuklugu text
    check (proje_buyuklugu in ('Küçük', 'Orta', 'Büyük'));
