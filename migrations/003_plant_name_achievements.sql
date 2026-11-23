-- Personal plant names + durable achievement unlocks

alter table plant_moods
  add column if not exists plant_name text;

create table if not exists user_achievements (
  user_id text not null references users (id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create index if not exists user_achievements_user_idx
  on user_achievements (user_id, unlocked_at desc);
