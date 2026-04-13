-- ============================================================
-- Tablo: hikayeler
-- ============================================================
create table if not exists public.hikayeler (
  id               uuid primary key default gen_random_uuid(),
  proje_id         uuid not null references public.projeler(id) on delete cascade,
  destan_id        uuid not null references public.destanlar(id) on delete restrict,
  hikaye_no        text not null,           -- örn: "H-001"
  ad               text not null,
  release          text not null default 'R1'
                     check (release in ('R1', 'R2', 'R3')),
  sprint_no        integer,
  sprint_suresi    integer,                 -- gün cinsinden
  durum            text not null default 'backlog'
                     check (durum in ('backlog', 'devam', 'tamamlandi', 'iptal')),
  olusturma_tarihi timestamptz not null default now(),
  unique (proje_id, hikaye_no)
);

-- RLS
alter table public.hikayeler enable row level security;

create policy "hikayeler_select_own"
  on public.hikayeler
  for select
  using (
    exists (
      select 1 from public.projeler p
      where p.id = proje_id
        and p.kullanici_id = auth.uid()
    )
  );

create policy "hikayeler_insert_own"
  on public.hikayeler
  for insert
  with check (
    exists (
      select 1 from public.projeler p
      where p.id = proje_id
        and p.kullanici_id = auth.uid()
    )
  );

create policy "hikayeler_update_own"
  on public.hikayeler
  for update
  using (
    exists (
      select 1 from public.projeler p
      where p.id = proje_id
        and p.kullanici_id = auth.uid()
    )
  );

create policy "hikayeler_delete_own"
  on public.hikayeler
  for delete
  using (
    exists (
      select 1 from public.projeler p
      where p.id = proje_id
        and p.kullanici_id = auth.uid()
    )
  );
