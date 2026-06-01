-- ============================================================
-- Migration: PayTR Entegrasyonu
-- - abonelikler ve abonelik_gecmisi: odeme_platformu constraint güncelle
-- - abonelikler: paytr_kart_token ve sonraki_odeme_tarihi sütunları ekle
-- - odemeler tablosunu oluştur (RLS dahil)
-- ============================================================

-- ============================================================
-- 1. ABONELİKLER: odeme_platformu constraint güncelle
-- ============================================================
do $$
declare
  v_constraint text;
begin
  select conname into v_constraint
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  join pg_attribute a on a.attrelid = t.oid and a.attnum = any(c.conkey)
  where n.nspname = 'public'
    and t.relname  = 'abonelikler'
    and c.contype  = 'c'
    and a.attname  = 'odeme_platformu'
  limit 1;

  if v_constraint is not null then
    execute format('alter table public.abonelikler drop constraint %I', v_constraint);
  end if;
end$$;

alter table public.abonelikler
  add constraint abonelikler_odeme_platformu_check
  check (odeme_platformu = any (array['iyzico', 'paddle', 'paytr']));

-- ============================================================
-- 2. ABONELİKLER: yeni sütunlar
-- ============================================================
alter table public.abonelikler
  add column if not exists paytr_kart_token     text,
  add column if not exists sonraki_odeme_tarihi timestamptz;

-- ============================================================
-- 3. ABONELİK GEÇMİŞİ: odeme_platformu constraint güncelle
-- ============================================================
do $$
declare
  v_constraint text;
begin
  select conname into v_constraint
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  join pg_attribute a on a.attrelid = t.oid and a.attnum = any(c.conkey)
  where n.nspname = 'public'
    and t.relname  = 'abonelik_gecmisi'
    and c.contype  = 'c'
    and a.attname  = 'odeme_platformu'
  limit 1;

  if v_constraint is not null then
    execute format('alter table public.abonelik_gecmisi drop constraint %I', v_constraint);
  end if;
end$$;

alter table public.abonelik_gecmisi
  add constraint abonelik_gecmisi_odeme_platformu_check
  check (odeme_platformu = any (array['iyzico', 'paddle', 'paytr']));

-- ============================================================
-- 4. ÖDEMELER TABLOSU
-- ============================================================
create table if not exists public.odemeler (
  id                  uuid        not null default gen_random_uuid() primary key,
  kullanici_id        uuid        not null references public.kullanicilar(id),
  abonelik_id         uuid        not null references public.abonelikler(id),
  tutar               numeric     not null,
  para_birimi         text        not null default 'TRY',
  paytr_merchant_oid  text        unique,
  paytr_odeme_turu    text,
  durum               text        not null default 'bekliyor'
                        check (durum = any (array['bekliyor', 'basarili', 'basarisiz', 'iade'])),
  hata_mesaji         text,
  odeme_tarihi        timestamptz,
  olusturma_tarihi    timestamptz not null default now()
);

-- ============================================================
-- 5. ÖDEMELER: İNDEKSLER
-- ============================================================
create index if not exists idx_odemeler_kullanici_id
  on public.odemeler (kullanici_id, olusturma_tarihi desc);

create index if not exists idx_odemeler_abonelik_id
  on public.odemeler (abonelik_id);

create index if not exists idx_odemeler_durum
  on public.odemeler (durum);

-- ============================================================
-- 6. ÖDEMELER: RLS
-- ============================================================
alter table public.odemeler enable row level security;

-- Kullanıcı kendi ödemelerini okuyabilir
drop policy if exists "odemeler_select_own" on public.odemeler;
create policy "odemeler_select_own"
  on public.odemeler
  for select
  using (kullanici_id = auth.uid());

-- Admin tüm ödemeleri okuyabilir
drop policy if exists "odemeler_select_admin" on public.odemeler;
create policy "odemeler_select_admin"
  on public.odemeler
  for select
  using (
    exists (
      select 1 from public.kullanicilar
      where id = auth.uid() and is_admin = true
    )
  );

-- INSERT sadece service role (anon/authenticated politikası yok → service role geçer)
-- UPDATE sadece service role
-- (Politika eklenmediğinde RLS tüm authenticated/anon erişimi reddeder;
--  service_role RLS'yi bypass eder — bu davranış kasıtlıdır.)
