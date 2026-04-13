-- ============================================================
-- Tablo: destanlar
-- Not: Her projeye son 2 destan otomatik eklenir ve sabit=true
--      olarak işaretlenir. Bu destanlar silinemez / sıra değiştirilemez.
--      Sabit destanlar:
--        - "Fonksiyonel Olmayan Gereksinimler"
--        - "Geçiş Gereksinimleri"
-- ============================================================
create table if not exists public.destanlar (
  id          uuid primary key default gen_random_uuid(),
  proje_id    uuid not null references public.projeler(id) on delete cascade,
  ad          text not null,
  sira        integer not null,
  sabit       boolean not null default false,
  unique (proje_id, sira)
);

-- RLS (proje sahibi üzerinden kontrol)
alter table public.destanlar enable row level security;

create policy "destanlar_select_own"
  on public.destanlar
  for select
  using (
    exists (
      select 1 from public.projeler p
      where p.id = proje_id
        and p.kullanici_id = auth.uid()
    )
  );

create policy "destanlar_insert_own"
  on public.destanlar
  for insert
  with check (
    exists (
      select 1 from public.projeler p
      where p.id = proje_id
        and p.kullanici_id = auth.uid()
    )
  );

-- Sabit destanlar güncellenemez
create policy "destanlar_update_own"
  on public.destanlar
  for update
  using (
    sabit = false
    and exists (
      select 1 from public.projeler p
      where p.id = proje_id
        and p.kullanici_id = auth.uid()
    )
  );

-- Sabit destanlar silinemez
create policy "destanlar_delete_own"
  on public.destanlar
  for delete
  using (
    sabit = false
    and exists (
      select 1 from public.projeler p
      where p.id = proje_id
        and p.kullanici_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- Yeni proje oluşturulduğunda sabit destanları otomatik ekle
-- -------------------------------------------------------
create or replace function public.ekle_sabit_destanlar()
returns trigger language plpgsql as $$
declare
  max_sira integer;
begin
  select coalesce(max(sira), 0)
    into max_sira
    from public.destanlar
   where proje_id = new.id;

  insert into public.destanlar (proje_id, ad, sira, sabit) values
    (new.id, 'Fonksiyonel Olmayan Gereksinimler', max_sira + 1, true),
    (new.id, 'Geçiş Gereksinimleri',              max_sira + 2, true);

  return new;
end;
$$;

create trigger projeler_sabit_destanlar_ekle
  after insert on public.projeler
  for each row execute function public.ekle_sabit_destanlar();
