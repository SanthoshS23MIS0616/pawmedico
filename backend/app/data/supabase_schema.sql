create extension if not exists "pgcrypto";

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  species text not null,
  breed text not null,
  dob date,
  weight numeric,
  photo_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  date date not null,
  symptoms jsonb not null default '[]'::jsonb,
  diagnosis text not null,
  severity text not null default 'moderate',
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  vet_name text not null,
  vet_location text not null,
  date timestamptz not null,
  status text not null default 'requested',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.vaccinations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  vaccine_name text not null,
  given_date date not null,
  next_due_date date not null,
  reminder_sent boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  weight_kg numeric not null,
  recorded_date date not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete set null,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_pets_owner_id on public.pets(owner_id);
create index if not exists idx_health_records_pet_id on public.health_records(pet_id);
create index if not exists idx_health_records_owner_id on public.health_records(owner_id);
create index if not exists idx_appointments_pet_id on public.appointments(pet_id);
create index if not exists idx_appointments_owner_id on public.appointments(owner_id);
create index if not exists idx_vaccinations_pet_id on public.vaccinations(pet_id);
create index if not exists idx_vaccinations_owner_id on public.vaccinations(owner_id);
create index if not exists idx_weight_logs_pet_id on public.weight_logs(pet_id);
create index if not exists idx_weight_logs_owner_id on public.weight_logs(owner_id);
create index if not exists idx_chat_history_pet_id on public.chat_history(pet_id);
create index if not exists idx_chat_history_owner_id on public.chat_history(owner_id);

alter table public.pets enable row level security;
alter table public.health_records enable row level security;
alter table public.appointments enable row level security;
alter table public.vaccinations enable row level security;
alter table public.weight_logs enable row level security;
alter table public.chat_history enable row level security;

create policy "pets_select_own" on public.pets
  for select using (owner_id = auth.uid());
create policy "pets_insert_own" on public.pets
  for insert with check (owner_id = auth.uid());
create policy "pets_update_own" on public.pets
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "health_records_select_own" on public.health_records
  for select using (owner_id = auth.uid());
create policy "health_records_insert_own" on public.health_records
  for insert with check (owner_id = auth.uid());
create policy "health_records_update_own" on public.health_records
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "appointments_select_own" on public.appointments
  for select using (owner_id = auth.uid());
create policy "appointments_insert_own" on public.appointments
  for insert with check (owner_id = auth.uid());
create policy "appointments_update_own" on public.appointments
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "vaccinations_select_own" on public.vaccinations
  for select using (owner_id = auth.uid());
create policy "vaccinations_insert_own" on public.vaccinations
  for insert with check (owner_id = auth.uid());
create policy "vaccinations_update_own" on public.vaccinations
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "weight_logs_select_own" on public.weight_logs
  for select using (owner_id = auth.uid());
create policy "weight_logs_insert_own" on public.weight_logs
  for insert with check (owner_id = auth.uid());
create policy "weight_logs_update_own" on public.weight_logs
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "chat_history_select_own" on public.chat_history
  for select using (owner_id = auth.uid());
create policy "chat_history_insert_own" on public.chat_history
  for insert with check (owner_id = auth.uid());

-- Supabase Storage notes:
-- 1. Create a public bucket named `pet-photos`.
-- 2. Add RLS policies so authenticated users can upload/read objects inside folders prefixed with `auth.uid()`.
-- 3. Use the anon key + user session on the frontend for uploads so storage RLS is enforced.
