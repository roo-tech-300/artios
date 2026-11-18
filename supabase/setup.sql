-- Artios admin: run this once in Supabase (SQL Editor → New query → paste → Run).

-- 1. Who may sign in to /admin. Add one row per staff email.
create table if not exists public.admins (
  email text primary key
);
insert into public.admins (email) values ('matkaltungo@gmail.com') on conflict do nothing;

-- 2. Products. Rows with a "ref" edit a built-in product (a1 hoodie, a2 tote, a3 notepad, a4 thermo flask,
--    a5 matte flask, a6 mug, a7 T-shirt, a8 temp flask). Rows without a ref are new products.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  ref text unique,
  name text,
  price integer,
  category text,
  description text,
  image_url text,
  gallery text[],
  sizes text[],
  material text,
  dimensions text,
  care text,
  badge text,
  featured boolean default false,
  visible boolean default true,
  sort integer default 100,
  created_at timestamptz default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

alter table public.admins enable row level security;
alter table public.products enable row level security;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select to authenticated using (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (true);
drop policy if exists "admins write products" on public.products;
create policy "admins write products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 3. Photo storage (public read, admins upload).
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do nothing;
drop policy if exists "public read images" on storage.objects;
create policy "public read images" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "admins upload images" on storage.objects;
create policy "admins upload images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admins change images" on storage.objects;
create policy "admins change images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admins delete images" on storage.objects;
create policy "admins delete images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
