-- ============================================================
-- Tablo: test_senaryolari
-- ============================================================
create table if not exists public.test_senaryolari (
  id              uuid primary key default gen_random_uuid(),
  hikaye_id       uuid not null references public.hikayeler(id) on delete cascade,
  tip             text not null
                    check (tip in ('olumlu', 'olumsuz', 'performans', 'guvenlik')),
  baslik          text not null,
  adimlar         text,                   -- adım adım açıklama (serbest metin veya JSON string)
  beklenen_sonuc  text
);

-- RLS (hikaye → proje → kullanıcı zinciri)
alter table public.test_senaryolari enable row level security;

create policy "test_senaryolari_select_own"
  on public.test_senaryolari
  for select
  using (
    exists (
      select 1
        from public.hikayeler h
        join public.projeler p on p.id = h.proje_id
       where h.id = hikaye_id
         and p.kullanici_id = auth.uid()
    )
  );

create policy "test_senaryolari_insert_own"
  on public.test_senaryolari
  for insert
  with check (
    exists (
      select 1
        from public.hikayeler h
        join public.projeler p on p.id = h.proje_id
       where h.id = hikaye_id
         and p.kullanici_id = auth.uid()
    )
  );

create policy "test_senaryolari_update_own"
  on public.test_senaryolari
  for update
  using (
    exists (
      select 1
        from public.hikayeler h
        join public.projeler p on p.id = h.proje_id
       where h.id = hikaye_id
         and p.kullanici_id = auth.uid()
    )
  );

create policy "test_senaryolari_delete_own"
  on public.test_senaryolari
  for delete
  using (
    exists (
      select 1
        from public.hikayeler h
        join public.projeler p on p.id = h.proje_id
       where h.id = hikaye_id
         and p.kullanici_id = auth.uid()
    )
  );
