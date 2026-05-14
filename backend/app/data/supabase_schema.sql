create extension if not exists "pgcrypto";

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
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
  pet_id uuid not null references public.pets(id) on delete cascade,
  vet_name text not null,
  vet_location text not null,
  date timestamptz not null,
  status text not null default 'requested',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.vaccinations (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  vaccine_name text not null,
  given_date date not null,
  next_due_date date not null,
  reminder_sent boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  weight_kg numeric not null,
  recorded_date date not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pets(id) on delete set null,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_health_records_pet_id on public.health_records(pet_id);
create index if not exists idx_appointments_pet_id on public.appointments(pet_id);
create index if not exists idx_vaccinations_pet_id on public.vaccinations(pet_id);
create index if not exists idx_weight_logs_pet_id on public.weight_logs(pet_id);
create index if not exists idx_chat_history_pet_id on public.chat_history(pet_id);
