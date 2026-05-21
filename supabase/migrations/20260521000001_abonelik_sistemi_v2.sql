-- ============================================================
-- Migration: Abonelik Sistemi v2
-- Yeni: planlar tablosu, abonelik_gecmisi tablosu
-- Güncelleme: abonelikler tablosuna yeni alanlar
-- ============================================================

-- ============================================================
-- 1. PLANLAR TABLOSU
-- ============================================================
create table if not exists public.planlar (
  id                    uuid        primary key default gen_random_uuid(),
  kod                   text        not null unique
                          check (kod in ('freemium', 'analyst', 'advanced', 'enterprise')),
  ad                    text        not null,
  fiyat_usd             numeric,
  aylik_proje_limiti    int,
  proje_basi_max_hikaye int,
  kucuk_proje           bool        not null default true,
  orta_proje            bool        not null default false,
  buyuk_proje           bool        not null default false,
  max_buyuk_proje       int,
  prototip              bool        not null default false,
  test_senaryosu        bool        not null default false,
  export                bool        not null default false,
  kullanici_yonetimi    bool        not null default false,
  sso                   bool        not null default false,
  aktif                 bool        not null default true,
  olusturma_tarihi      timestamptz not null default now()
);

-- RLS: planlar herkese açık (public read)
alter table public.planlar enable row level security;

create policy "planlar_select_public"
  on public.planlar
  for select
  using (true);

-- ============================================================
-- 2. PLANLAR: BAŞLANGIÇ VERİLERİ
-- ============================================================
insert into public.planlar
  (kod, ad, fiyat_usd, aylik_proje_limiti, proje_basi_max_hikaye,
   kucuk_proje, orta_proje, buyuk_proje, max_buyuk_proje,
   prototip, test_senaryosu, export,
   kullanici_yonetimi, sso)
values
  -- Freemium
  ('freemium',   'Freemium',    0,    1,    5,  true, false, false, null, false, false, false, false, false),
  -- Analyst
  ('analyst',    'Analyst',     9,    3,   15,  true, true,  false, null, true,  true,  true,  false, false),
  -- Advanced
  ('advanced',   'Advanced',   29,   10,   40,  true, true,  true,  5,    true,  true,  true,  false, false),
  -- Enterprise
  ('enterprise', 'Enterprise', null, null, null, true, true,  true,  null, true,  true,  true,  true,  true)
on conflict (kod) do nothing;

-- ============================================================
-- 3. ABONELİKLER: YENİ ALANLAR
-- ============================================================

-- plan_id FK (başta nullable; mevcut verileri aşağıda migrate edeceğiz)
alter table public.abonelikler
  add column if not exists plan_id                  uuid        references public.planlar(id),
  add column if not exists odeme_platformu          text
    check (odeme_platformu in ('iyzico', 'paddle')),
  add column if not exists odeme_referans_no        text,
  add column if not exists aylik_proje_sayaci       int         not null default 0,
  add column if not exists aylik_buyuk_proje_sayaci int         not null default 0,
  add column if not exists sayac_sifirlama_tarihi   timestamptz,
  add column if not exists email_dogrulandi         bool        not null default false,
  add column if not exists iptal_tarihi             timestamptz,
  add column if not exists iptal_nedeni             text;

-- Mevcut verileri yeni plan_id'ye taşı
-- eski plan değerleri: 'ucretsiz' → freemium | 'pro' → analyst | 'kurumsal' → enterprise
update public.abonelikler a
set
  plan_id = p.id,
  sayac_sifirlama_tarihi = date_trunc('month', now()) + interval '1 month'
from public.planlar p
where
  (a.plan = 'ucretsiz'  and p.kod = 'freemium')
  or (a.plan = 'pro'    and p.kod = 'analyst')
  or (a.plan = 'kurumsal' and p.kod = 'enterprise');

-- Eşleşemeyen kayıtları freemium'a al (güvenli varsayılan)
update public.abonelikler
set
  plan_id = (select id from public.planlar where kod = 'freemium'),
  sayac_sifirlama_tarihi = date_trunc('month', now()) + interval '1 month'
where plan_id is null;

-- Artık plan_id zorunlu
alter table public.abonelikler
  alter column plan_id set not null;

-- eski plan sütununu koru (geriye dönük uyumluluk; ileride kaldırılabilir)
-- alter table public.abonelikler drop column plan;

-- ============================================================
-- 4. ABONELİK GEÇMİŞİ TABLOSU
-- ============================================================
create table if not exists public.abonelik_gecmisi (
  id                uuid        primary key default gen_random_uuid(),
  kullanici_id      uuid        not null references public.kullanicilar(id) on delete cascade,
  eski_plan_id      uuid        references public.planlar(id),
  yeni_plan_id      uuid        not null references public.planlar(id),
  degisiklik_tarihi timestamptz not null default now(),
  degisiklik_turu   text        not null
                      check (degisiklik_turu in ('upgrade', 'downgrade', 'iptal', 'yenileme', 'baslangic')),
  odeme_platformu   text
                      check (odeme_platformu in ('iyzico', 'paddle')),
  notlar            text
);

-- RLS: kullanıcı yalnızca kendi geçmişini görebilir
alter table public.abonelik_gecmisi enable row level security;

create policy "abonelik_gecmisi_select_own"
  on public.abonelik_gecmisi
  for select
  using (kullanici_id = auth.uid());

create policy "abonelik_gecmisi_insert_own"
  on public.abonelik_gecmisi
  for insert
  with check (kullanici_id = auth.uid());

-- Geçmişe yazıldıktan sonra değiştirme/silme yasak
-- (update/delete policy eklenmedi — kasıtlı)

-- ============================================================
-- 5. ABONELİKLER: EKSİK RLS POLİTİKALARI
-- ============================================================

-- Mevcut insert/update politikaları zaten var (migration 0007).
-- Aşağıdaki, güvenli şekilde tekrar eklemeye çalışır; çakışırsa hata vermez.

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'abonelikler'
      and policyname = 'abonelikler_select_own'
  ) then
    execute $p$
      create policy "abonelikler_select_own"
        on public.abonelikler
        for select
        using (kullanici_id = auth.uid())
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'abonelikler'
      and policyname = 'abonelikler_insert_own'
  ) then
    execute $p$
      create policy "abonelikler_insert_own"
        on public.abonelikler
        for insert
        with check (kullanici_id = auth.uid())
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'abonelikler'
      and policyname = 'abonelikler_update_own'
  ) then
    execute $p$
      create policy "abonelikler_update_own"
        on public.abonelikler
        for update
        using (kullanici_id = auth.uid())
    $p$;
  end if;
end$$;

-- ============================================================
-- 6. İNDEKSLER
-- ============================================================
create index if not exists idx_abonelikler_plan_id
  on public.abonelikler (plan_id);

create index if not exists idx_abonelikler_sayac_sifirlama
  on public.abonelikler (sayac_sifirlama_tarihi);

create index if not exists idx_abonelik_gecmisi_kullanici
  on public.abonelik_gecmisi (kullanici_id, degisiklik_tarihi desc);

create index if not exists idx_abonelik_gecmisi_yeni_plan
  on public.abonelik_gecmisi (yeni_plan_id);
