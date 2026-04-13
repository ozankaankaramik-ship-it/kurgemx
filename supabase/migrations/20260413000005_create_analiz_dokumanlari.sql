-- ============================================================
-- Tablo: analiz_dokumanlari
-- ============================================================
create table if not exists public.analiz_dokumanlari (
  id                uuid primary key default gen_random_uuid(),
  hikaye_id         uuid not null references public.hikayeler(id) on delete cascade,
  proje_id          uuid not null references public.projeler(id) on delete cascade,
  icerik            text,
  versiyon          integer not null default 1,
  olusturma_tarihi  timestamptz not null default now(),
  guncelleme_tarihi timestamptz not null default now()
);

-- Otomatik guncelleme_tarihi
create trigger analiz_dokumanlari_guncelleme_tarihi
  before update on public.analiz_dokumanlari
  for each row execute function public.set_guncelleme_tarihi();

-- RLS
alter table public.analiz_dokumanlari enable row level security;

create policy "analiz_dokumanlari_select_own"
  on public.analiz_dokumanlari
  for select
  using (
    exists (
      select 1 from public.projeler p
      where p.id = proje_id
        and p.kullanici_id = auth.uid()
    )
  );

create policy "analiz_dokumanlari_insert_own"
  on public.analiz_dokumanlari
  for insert
  with check (
    exists (
      select 1 from public.projeler p
      where p.id = proje_id
        and p.kullanici_id = auth.uid()
    )
  );

create policy "analiz_dokumanlari_update_own"
  on public.analiz_dokumanlari
  for update
  using (
    exists (
      select 1 from public.projeler p
      where p.id = proje_id
        and p.kullanici_id = auth.uid()
    )
  );

create policy "analiz_dokumanlari_delete_own"
  on public.analiz_dokumanlari
  for delete
  using (
    exists (
      select 1 from public.projeler p
      where p.id = proje_id
        and p.kullanici_id = auth.uid()
    )
  );
