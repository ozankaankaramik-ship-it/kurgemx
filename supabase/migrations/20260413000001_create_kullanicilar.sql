-- ============================================================
-- Tablo: kullanicilar
-- ============================================================
create table if not exists public.kullanicilar (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  ad          text not null,
  soyad       text not null,
  kvkk_onay   boolean not null default false,
  kvkk_tarih  timestamptz,
  olusturma_tarihi timestamptz not null default now()
);

-- RLS
alter table public.kullanicilar enable row level security;

-- Kullanıcı yalnızca kendi kaydını okuyabilir
create policy "kullanicilar_select_own"
  on public.kullanicilar
  for select
  using (id = auth.uid());

-- Kullanıcı kendi kaydını güncelleyebilir
create policy "kullanicilar_update_own"
  on public.kullanicilar
  for update
  using (id = auth.uid());

-- Yeni kayıt: yalnızca auth.uid() ile eşleşen id'ye izin ver
create policy "kullanicilar_insert_own"
  on public.kullanicilar
  for insert
  with check (id = auth.uid());
