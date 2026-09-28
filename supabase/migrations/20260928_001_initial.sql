create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  birth_date date,
  birth_time time,
  birth_place text,
  timezone text not null default 'Asia/Tokyo',
  default_level smallint not null default 2 check (default_level between 1 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_destiny (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  engine_version text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  unique(user_id, local_date, engine_version)
);

create table if not exists public.action_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_destiny_id uuid not null references public.daily_destiny(id) on delete cascade,
  action_text text not null,
  level smallint not null check (level between 1 and 3),
  status text not null default 'NOT_STARTED' check (status in ('NOT_STARTED','DONE','SKIPPED','IMPOSSIBLE')),
  feedback text,
  note text,
  generation_meta jsonb not null default '{}'::jsonb,
  safety_check_result text not null default 'UNKNOWN',
  created_at timestamptz not null default now(),
  unique(daily_destiny_id)
);

create table if not exists public.oracle_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_destiny_id uuid not null references public.daily_destiny(id) on delete cascade,
  theme text not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  unique(daily_destiny_id, theme)
);

alter table public.profiles enable row level security;
alter table public.daily_destiny enable row level security;
alter table public.action_history enable row level security;
alter table public.oracle_results enable row level security;

create policy "profiles own rows" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "daily destiny own rows" on public.daily_destiny for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "action history own rows" on public.action_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "oracle own rows" on public.oracle_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Forward-compatible upgrades for existing databases
alter table public.action_history add column if not exists generation_meta jsonb not null default '{}'::jsonb;
alter table public.action_history add column if not exists safety_check_result text not null default 'UNKNOWN';
