-- ============================================================
-- Migration: Aylık Proje Sayacı Trigger
-- projeler INSERT → abonelikler.aylik_proje_sayaci += 1
-- ============================================================

create or replace function public.aylik_proje_sayaci_artir()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.abonelikler
  set aylik_proje_sayaci = aylik_proje_sayaci + 1
  where kullanici_id = new.kullanici_id
    and durum = 'aktif';
  return new;
end;
$$;

drop trigger if exists tr_aylik_proje_sayaci on public.projeler;

create trigger tr_aylik_proje_sayaci
  after insert on public.projeler
  for each row
  execute function public.aylik_proje_sayaci_artir();
