-- odemeler: callback handler'ın hangi plana geçeceğini bilmesi için
alter table public.odemeler
  add column if not exists hedef_plan_id uuid references public.planlar(id);
