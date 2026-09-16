-- ===========================================================================
-- Resume Builder — Supabase schema
--
-- Apply once: Supabase dashboard → SQL Editor → paste → Run.
-- Safe to re-run (everything is IF NOT EXISTS / CREATE OR REPLACE).
--
-- Two tables:
--   site_config  — the single published template the public site reads
--   usage_events — anonymous usage counters for /admin
--
-- PRIVACY: usage_events stores NO resume content, names, emails, or IPs.
-- session_id is a random per-tab UUID that cannot identify a person.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. Published template (exactly one row, id = 1)
-- ---------------------------------------------------------------------------
create table if not exists public.site_config (
  id         int primary key default 1,
  config     jsonb not null,
  updated_at timestamptz not null default now(),
  constraint site_config_singleton check (id = 1)
);


-- ---------------------------------------------------------------------------
-- 2. Anonymous usage events
-- ---------------------------------------------------------------------------
create table if not exists public.usage_events (
  id         bigint generated always as identity primary key,
  event      text        not null,
  session_id uuid        not null,
  device     text,
  embedded   boolean     not null default false,
  meta       jsonb       not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  -- Whitelist event names so an open insert policy can't be used to
  -- dump arbitrary text into the table.
  constraint usage_events_known_event check (event in (
    'page_view', 'export_pdf', 'export_docx', 'import_pdf',
    'example_loaded', 'reset_data', 'section_opened',
    'over_page_limit', 'template_published'
  )),
  constraint usage_events_device_enum check (device in ('mobile','desktop','unknown')),
  -- Cap payload size as a second line of defence against abuse.
  constraint usage_events_meta_small check (pg_column_size(meta) < 2048)
);

create index if not exists usage_events_created_idx on public.usage_events (created_at desc);
create index if not exists usage_events_event_idx   on public.usage_events (event, created_at desc);
create index if not exists usage_events_session_idx on public.usage_events (session_id);


-- ---------------------------------------------------------------------------
-- 3. Pre-aggregated daily rollup (keeps the dashboard fast and cheap)
-- ---------------------------------------------------------------------------
create or replace view public.usage_daily as
select
  (created_at at time zone 'UTC')::date as day,
  event,
  device,
  embedded,
  count(*)                    as events,
  count(distinct session_id)  as sessions
from public.usage_events
group by 1, 2, 3, 4;


-- ---------------------------------------------------------------------------
-- 4. Row-Level Security
--
--    >>> CURRENT MODE: OPEN (no admin login), as requested. <<<
--
--    This means ANYONE who finds /admin can publish a new template.
--    The whitelist/size constraints above limit damage, but they do not
--    stop template edits.
--
--    To lock it down later: delete the two "open" write policies below,
--    uncomment the LOCKED block in section 5, and turn on Supabase Auth.
-- ---------------------------------------------------------------------------
alter table public.site_config  enable row level security;
alter table public.usage_events enable row level security;

-- Everyone may READ the published template (the public site needs this).
drop policy if exists site_config_read on public.site_config;
create policy site_config_read
  on public.site_config for select
  using (true);

-- OPEN WRITE — replace with the LOCKED policies when auth is added.
drop policy if exists site_config_open_insert on public.site_config;
create policy site_config_open_insert
  on public.site_config for insert
  with check (true);

drop policy if exists site_config_open_update on public.site_config;
create policy site_config_open_update
  on public.site_config for update
  using (true) with check (true);

-- Anonymous visitors may only APPEND events; they can never
-- update or delete them.
drop policy if exists usage_events_insert on public.usage_events;
create policy usage_events_insert
  on public.usage_events for insert
  with check (true);

-- The dashboard needs to read counts. Events contain no personal data.
drop policy if exists usage_events_read on public.usage_events;
create policy usage_events_read
  on public.usage_events for select
  using (true);


-- ---------------------------------------------------------------------------
-- 5. LOCKED MODE (uncomment when you add admin login)
--
--     drop policy if exists site_config_open_insert on public.site_config;
--     drop policy if exists site_config_open_update on public.site_config;
--
--     create table if not exists public.admins (
--       user_id uuid primary key references auth.users(id) on delete cascade,
--       email   text not null
--     );
--     alter table public.admins enable row level security;
--
--     create policy site_config_admin_write on public.site_config
--       for all
--       using     (exists (select 1 from public.admins a where a.user_id = auth.uid()))
--       with check(exists (select 1 from public.admins a where a.user_id = auth.uid()));
--
--     -- Also restrict analytics reads to admins:
--     drop policy if exists usage_events_read on public.usage_events;
--     create policy usage_events_admin_read on public.usage_events
--       for select
--       using (exists (select 1 from public.admins a where a.user_id = auth.uid()));
-- ---------------------------------------------------------------------------


-- ---------------------------------------------------------------------------
-- 6. Seed the config row (no-op if it already exists)
--    The app publishes the real template from /admin; this just creates the row.
-- ---------------------------------------------------------------------------
insert into public.site_config (id, config)
values (1, '{"schemaVersion": 1}'::jsonb)
on conflict (id) do nothing;


-- ---------------------------------------------------------------------------
-- 7. Retention (optional but recommended)
--    Run periodically, or schedule with pg_cron, to keep only 12 months.
--
--    delete from public.usage_events where created_at < now() - interval '12 months';
-- ---------------------------------------------------------------------------
