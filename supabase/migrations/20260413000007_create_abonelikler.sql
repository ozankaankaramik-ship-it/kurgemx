-- ============================================================
-- Tablo: abonelikler
-- ============================================================
create table if not exists public.abonelikler (
  id           uuid primary key default gen_random_uuid(),
  kullanici_id uuid not null references public.kullanicilar(id) on delete cascade,
  plan         text not null default 'ucretsiz'
                 check (plan in ('ucretsiz', 'pro', 'kurumsal')),
  baslangic    timestamptz not null default now(),
  bitis        timestamptz,
  durum        text not null default 'aktif'
                 check (durum in ('aktif', 'pasif', 'iptal')),
  unique (kullanici_id, baslangic)   -- aynı kullanıcıya aynı anda tek aktif abonelik
);

-- RLS
alter table public.abonelikler enable row level security;

create policy "abonelikler_select_own"
  on public.abonelikler
  for select
  using (kullanici_id = auth.uid());

create policy "abonelikler_insert_own"
  on public.abonelikler
  for insert
  with check (kullanici_id = auth.uid());

create policy "abonelikler_update_own"
  on public.abonelikler
  for update
  using (kullanici_id = auth.uid());

-- Abonelik silme yetkisi yok (soft delete: durum = 'iptal')
