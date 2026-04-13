-- ============================================================
-- Tablo: projeler
-- ============================================================
create table if not exists public.projeler (
  id                uuid primary key default gen_random_uuid(),
  kullanici_id      uuid not null references public.kullanicilar(id) on delete cascade,
  ad                text not null,
  aciklama          text,
  durum             text not null default 'aktif'
                      check (durum in ('aktif', 'pasif', 'arsiv')),
  olusturma_tarihi  timestamptz not null default now(),
  guncelleme_tarihi timestamptz not null default now()
);

-- Otomatik guncelleme_tarihi
create or replace function public.set_guncelleme_tarihi()
returns trigger language plpgsql as $$
begin
  new.guncelleme_tarihi = now();
  return new;
end;
$$;

create trigger projeler_guncelleme_tarihi
  before update on public.projeler
  for each row execute function public.set_guncelleme_tarihi();

-- RLS
alter table public.projeler enable row level security;

create policy "projeler_select_own"
  on public.projeler
  for select
  using (kullanici_id = auth.uid());

create policy "projeler_insert_own"
  on public.projeler
  for insert
  with check (kullanici_id = auth.uid());

create policy "projeler_update_own"
  on public.projeler
  for update
  using (kullanici_id = auth.uid());

create policy "projeler_delete_own"
  on public.projeler
  for delete
  using (kullanici_id = auth.uid());
