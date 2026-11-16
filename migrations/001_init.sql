-- Zenna v2 schema — additive only
-- gen_random_uuid() is available in Postgres and PGlite without pgcrypto.

create table if not exists users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists plant_moods (
  id text primary key,
  scope text not null check (scope in ('global', 'personal')),
  user_id text references users (id) on delete cascade,
  hydration real not null default 55,
  neatness real not null default 60,
  light real not null default 50,
  joy real not null default 45,
  total_care integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint plant_moods_scope_user check (
    (scope = 'global' and user_id is null and id = 'global')
    or (scope = 'personal' and user_id is not null and id = user_id)
  )
);

create unique index if not exists plant_moods_personal_user_uidx
  on plant_moods (user_id)
  where scope = 'personal';

create table if not exists care_events (
  id text primary key,
  user_id text references users (id) on delete set null,
  plant_scope text not null check (plant_scope in ('global', 'personal')),
  plant_id text not null,
  action text not null check (
    action in ('water', 'prune', 'sunlight', 'sing', 'deadhead')
  ),
  client_key text,
  created_at timestamptz not null default now()
);

create index if not exists care_events_created_idx on care_events (created_at desc);
create index if not exists care_events_scope_idx on care_events (plant_scope, created_at desc);
create index if not exists care_events_user_idx on care_events (user_id, created_at desc);

create table if not exists rate_limits (
  bucket text primary key,
  hits integer not null default 0,
  window_start timestamptz not null default now()
);

insert into plant_moods (id, scope, hydration, neatness, light, joy, total_care)
values ('global', 'global', 55, 60, 50, 45, 0)
on conflict (id) do nothing;
