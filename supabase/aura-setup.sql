-- AURA: run once in Supabase Dashboard → SQL Editor. Safe to re-run; never drops data.

-- ===== profiles =====
create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade);
alter table public.profiles add column if not exists display_name text default 'Asemay';
alter table public.profiles add column if not exists status text default 'Разработчик будущего ✨';
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- ===== clothing_items =====
create table if not exists public.clothing_items (id uuid primary key default gen_random_uuid());
alter table public.clothing_items add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.clothing_items add column if not exists name text;
alter table public.clothing_items add column if not exists category text;
alter table public.clothing_items add column if not exists brand text;
alter table public.clothing_items add column if not exists color_hex text;
alter table public.clothing_items add column if not exists season text;
alter table public.clothing_items add column if not exists image_url text;
alter table public.clothing_items add column if not exists image_path text;
alter table public.clothing_items add column if not exists notes text;
alter table public.clothing_items add column if not exists created_at timestamptz default now();
alter table public.clothing_items add column if not exists updated_at timestamptz default now();
create index if not exists clothing_items_user_idx on public.clothing_items(user_id);

-- ===== outfits =====
create table if not exists public.outfits (id uuid primary key default gen_random_uuid());
alter table public.outfits add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.outfits add column if not exists title text;
alter table public.outfits add column if not exists description text;
alter table public.outfits add column if not exists style text;
alter table public.outfits add column if not exists season text;
alter table public.outfits add column if not exists occasion text;
alter table public.outfits add column if not exists created_at timestamptz default now();
alter table public.outfits add column if not exists updated_at timestamptz default now();
create index if not exists outfits_user_idx on public.outfits(user_id);

-- ===== outfit_items =====
create table if not exists public.outfit_items (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  clothing_item_id uuid not null references public.clothing_items(id) on delete cascade,
  position int default 0,
  unique (outfit_id, clothing_item_id)
);

-- ===== user_preferences / user_settings / favorites =====
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  favorite_styles text[] default '{}',
  favorite_colors text[] default '{}',
  priorities text[] default '{}',
  updated_at timestamptz default now()
);
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  notifications_enabled boolean default true,
  daily_outfits_enabled boolean default false,
  private_profile boolean default false,
  updated_at timestamptz default now()
);
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  target_type text not null check (target_type in ('outfit','item')),
  target_id uuid not null,
  created_at timestamptz default now(),
  unique (user_id, target_type, target_id)
);

-- ===== grants =====
grant select, insert, update, delete on public.profiles, public.clothing_items, public.outfits, public.outfit_items,
  public.user_preferences, public.user_settings, public.favorites to authenticated;
grant all on public.profiles, public.clothing_items, public.outfits, public.outfit_items,
  public.user_preferences, public.user_settings, public.favorites to service_role;

-- ===== RLS: owner-only =====
alter table public.profiles enable row level security;
alter table public.clothing_items enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_settings enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "aura own profile" on public.profiles;
create policy "aura own profile" on public.profiles for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "aura own items" on public.clothing_items;
create policy "aura own items" on public.clothing_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "aura own outfits" on public.outfits;
create policy "aura own outfits" on public.outfits for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "aura own outfit items" on public.outfit_items;
create policy "aura own outfit items" on public.outfit_items for all to authenticated
  using (exists (select 1 from public.outfits o where o.id = outfit_id and o.user_id = auth.uid()))
  with check (
    exists (select 1 from public.outfits o where o.id = outfit_id and o.user_id = auth.uid())
    and exists (select 1 from public.clothing_items c where c.id = clothing_item_id and c.user_id = auth.uid())
  );
drop policy if exists "aura own prefs" on public.user_preferences;
create policy "aura own prefs" on public.user_preferences for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "aura own settings" on public.user_settings;
create policy "aura own settings" on public.user_settings for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "aura own favorites" on public.favorites;
create policy "aura own favorites" on public.favorites for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== auto-create profile on signup (never overwrites existing) =====
create or replace function public.aura_handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'name', ''), 'Asemay'))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists aura_on_auth_user_created on auth.users;
create trigger aura_on_auth_user_created after insert on auth.users for each row execute function public.aura_handle_new_user();

-- ===== private photo storage: each user only touches the folder named by their id =====
insert into storage.buckets (id, name, public) values ('wardrobe', 'wardrobe', false) on conflict (id) do nothing;
drop policy if exists "aura own photos read" on storage.objects;
create policy "aura own photos read" on storage.objects for select to authenticated using (bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "aura own photos write" on storage.objects;
create policy "aura own photos write" on storage.objects for insert to authenticated with check (bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "aura own photos update" on storage.objects;
create policy "aura own photos update" on storage.objects for update to authenticated using (bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "aura own photos delete" on storage.objects;
create policy "aura own photos delete" on storage.objects for delete to authenticated using (bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text);

notify pgrst, 'reload schema';
