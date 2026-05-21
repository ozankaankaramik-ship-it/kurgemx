-- ============================================================
-- Migration: Freemium Trigger + Admin Kolonu + Veri Güncelleme
-- ============================================================

-- Eski plan check constraint'i kaldır (v1'de yapılmış olmalı ama güvence için)
alter table public.abonelikler drop constraint if exists abonelikler_plan_check;
alter table public.abonelikler alter column plan set default 'freemium';

-- ============================================================
-- A) kullanicilar: is_admin kolonu
-- ============================================================
alter table public.kullanicilar
  add column if not exists is_admin boolean not null default false;

-- ============================================================
-- B) Yeni kullanıcı trigger'ı
-- ============================================================
create or replace function public.yeni_kullanici_freemium_abonelik()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_freemium_id uuid;
begin
  select id into v_freemium_id
  from public.planlar
  where kod = 'freemium'
  limit 1;

  if v_freemium_id is null then
    return new;
  end if;

  insert into public.abonelikler (
    kullanici_id,
    plan_id,
    plan,
    durum,
    baslangic,
    bitis,
    sayac_sifirlama_tarihi,
    aylik_proje_sayaci,
    aylik_buyuk_proje_sayaci,
    email_dogrulandi
  ) values (
    new.id,
    v_freemium_id,
    'freemium',
    'aktif',
    now(),
    null,
    date_trunc('month', now()) + interval '1 month',
    0,
    0,
    false
  );

  insert into public.abonelik_gecmisi (
    kullanici_id,
    eski_plan_id,
    yeni_plan_id,
    degisiklik_turu
  ) values (
    new.id,
    null,
    v_freemium_id,
    'baslangic'
  );

  return new;
end;
$$;

drop trigger if exists tr_yeni_kullanici_freemium on public.kullanicilar;

create trigger tr_yeni_kullanici_freemium
  after insert on public.kullanicilar
  for each row
  execute function public.yeni_kullanici_freemium_abonelik();

-- ============================================================
-- C) Mevcut kullanıcılar: aboneliği olmayanları freemium yap
-- ============================================================
do $$
declare
  v_freemium_id uuid;
  rec           record;
begin
  select id into v_freemium_id
  from public.planlar
  where kod = 'freemium'
  limit 1;

  for rec in
    select k.id
    from public.kullanicilar k
    where not exists (
      select 1 from public.abonelikler a where a.kullanici_id = k.id
    )
  loop
    insert into public.abonelikler (
      kullanici_id,
      plan_id,
      plan,
      durum,
      baslangic,
      bitis,
      sayac_sifirlama_tarihi,
      aylik_proje_sayaci,
      aylik_buyuk_proje_sayaci,
      email_dogrulandi
    ) values (
      rec.id,
      v_freemium_id,
      'freemium',
      'aktif',
      now(),
      null,
      date_trunc('month', now()) + interval '1 month',
      0,
      0,
      false
    );

    insert into public.abonelik_gecmisi (
      kullanici_id,
      eski_plan_id,
      yeni_plan_id,
      degisiklik_turu
    ) values (
      rec.id,
      null,
      v_freemium_id,
      'baslangic'
    );
  end loop;
end;
$$;

-- ============================================================
-- D) test@kurgemx.com → Analyst
-- ============================================================
do $$
declare
  v_kullanici_id  uuid;
  v_analyst_id    uuid;
  v_eski_plan_id  uuid;
begin
  select id into v_kullanici_id
  from public.kullanicilar
  where email = 'test@kurgemx.com'
  limit 1;

  select id into v_analyst_id
  from public.planlar
  where kod = 'analyst'
  limit 1;

  if v_kullanici_id is null or v_analyst_id is null then
    raise notice 'test@kurgemx.com veya analyst plan bulunamadı, atlanıyor.';
    return;
  end if;

  select plan_id into v_eski_plan_id
  from public.abonelikler
  where kullanici_id = v_kullanici_id and durum = 'aktif'
  limit 1;

  update public.abonelikler
  set
    plan_id = v_analyst_id,
    plan    = 'analyst'
  where kullanici_id = v_kullanici_id and durum = 'aktif';

  insert into public.abonelik_gecmisi (
    kullanici_id,
    eski_plan_id,
    yeni_plan_id,
    degisiklik_turu
  ) values (
    v_kullanici_id,
    v_eski_plan_id,
    v_analyst_id,
    'upgrade'
  );
end;
$$;

-- ============================================================
-- E) ozankaankaramik@gmail.com → Admin + Advanced
-- ============================================================
do $$
declare
  v_kullanici_id  uuid;
  v_advanced_id   uuid;
  v_eski_plan_id  uuid;
begin
  select id into v_kullanici_id
  from public.kullanicilar
  where email = 'ozankaankaramik@gmail.com'
  limit 1;

  select id into v_advanced_id
  from public.planlar
  where kod = 'advanced'
  limit 1;

  if v_kullanici_id is null or v_advanced_id is null then
    raise notice 'ozankaankaramik@gmail.com veya advanced plan bulunamadı, atlanıyor.';
    return;
  end if;

  update public.kullanicilar
  set is_admin = true
  where id = v_kullanici_id;

  select plan_id into v_eski_plan_id
  from public.abonelikler
  where kullanici_id = v_kullanici_id and durum = 'aktif'
  limit 1;

  update public.abonelikler
  set
    plan_id = v_advanced_id,
    plan    = 'advanced'
  where kullanici_id = v_kullanici_id and durum = 'aktif';

  insert into public.abonelik_gecmisi (
    kullanici_id,
    eski_plan_id,
    yeni_plan_id,
    degisiklik_turu
  ) values (
    v_kullanici_id,
    v_eski_plan_id,
    v_advanced_id,
    'upgrade'
  );
end;
$$;
