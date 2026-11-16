-- Personal plants grow from seedling → growing → mature.
-- Global Zenna stays mature (full care toolkit).

alter table plant_moods
  add column if not exists growth_stage text not null default 'seedling';

update plant_moods
set growth_stage = 'mature'
where id = 'global' and growth_stage <> 'mature';
