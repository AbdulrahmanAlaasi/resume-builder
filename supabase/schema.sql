-- ===========================================================================
-- Resume Builder — Supabase schema (AUTHENTICATED / LOCKED MODE)
--
-- Apply once: Supabase dashboard → SQL Editor → paste → Run.
-- Safe to re-run (everything is IF NOT EXISTS / CREATE OR REPLACE).
--
-- Tables:
--   site_config  — the single published template the public site reads
--   usage_events — anonymous usage counters
--   admins       — who is allowed to publish and read analytics
--
-- SECURITY MODEL
--   • Anyone may READ site_config      (the public builder needs the template)
--   • Anyone may INSERT usage_events   (anonymous visitors record counters)
--   • ONLY admins may WRITE site_config or READ usage_events
--   Enforced by Row-Level Security in the database — not by the UI. Even with
--   the anon key (which is public by design), a non-admin cannot publish.
--
-- PRIVACY: usage_events stores NO resume content, names, emails, or IPs.
-- session_id is a random per-tab UUID that cannot identify a person.
--
-- >>> AFTER RUNNING THIS, DO THE BOOTSTRAP IN SECTION 7 <<<
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

  -- Whitelist event names so the open insert policy can't be used to
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
-- 3. Admins — the allowlist. A row here = may publish + see analytics.
--
--    Keyed by EMAIL, not user id, so a person can be authorised *before*
--    they have ever signed in. Supabase verifies the address during the
--    magic-link flow, so the email claim in the JWT is trustworthy.
-- ---------------------------------------------------------------------------
drop table if exists public.admins cascade;
create table public.admins (
  email    text primary key,
  note     text,
  added_at timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- 4. Daily rollup (keeps the dashboard fast and cheap)
--    security_invoker = the caller's RLS applies, so this view cannot be
--    used to read analytics without being an admin.
-- ---------------------------------------------------------------------------
create or replace view public.usage_daily
with (security_invoker = true) as
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
-- 5. Row-Level Security
-- ---------------------------------------------------------------------------
alter table public.site_config  enable row level security;
alter table public.usage_events enable row level security;
alter table public.admins       enable row level security;

-- Helper: is the current caller an admin?
-- Matches the verified email claim in the caller's JWT against the allowlist.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---- site_config ----------------------------------------------------------
-- Public read: the student-facing builder must load the template.
drop policy if exists site_config_read          on public.site_config;
drop policy if exists site_config_open_insert   on public.site_config;
drop policy if exists site_config_open_update   on public.site_config;
drop policy if exists site_config_admin_insert  on public.site_config;
drop policy if exists site_config_admin_update  on public.site_config;

create policy site_config_read
  on public.site_config for select
  using (true);

-- Only admins may publish.
create policy site_config_admin_insert
  on public.site_config for insert
  with check (public.is_admin());

create policy site_config_admin_update
  on public.site_config for update
  using (public.is_admin()) with check (public.is_admin());

-- ---- usage_events ---------------------------------------------------------
drop policy if exists usage_events_insert     on public.usage_events;
drop policy if exists usage_events_read       on public.usage_events;
drop policy if exists usage_events_admin_read on public.usage_events;

-- Anonymous visitors may only APPEND events.
create policy usage_events_insert
  on public.usage_events for insert
  with check (true);

-- Only admins may read them.
create policy usage_events_admin_read
  on public.usage_events for select
  using (public.is_admin());

-- ---- admins ---------------------------------------------------------------
-- A signed-in user may check whether *they* are an admin, and nothing else.
-- Adding/removing admins is done from the SQL editor (section 7).
drop policy if exists admins_self_read on public.admins;
create policy admins_self_read
  on public.admins for select
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));


-- ---------------------------------------------------------------------------
-- 6. Seed the config row (no-op if it already exists)
-- ---------------------------------------------------------------------------
insert into public.site_config (id, config)
values (1, '{"schemaVersion": 1}'::jsonb)
on conflict (id) do nothing;


-- ---------------------------------------------------------------------------
-- 7. The admin allowlist
--
--    Because this is keyed by email, people can be authorised before they
--    have ever signed in — they simply get access on first magic-link login.
--
--    Add someone:
--      insert into public.admins (email, note)
--      values ('colleague@yu.edu.sa', 'Career Center')
--      on conflict (email) do nothing;
--
--    Remove someone:
--      delete from public.admins where lower(email) = lower('colleague@yu.edu.sa');
--
--    List:
--      select email, note, added_at from public.admins order by added_at;
--
--    Supabase dashboard settings this depends on:
--      Authentication → Providers → Email: enabled
--      Authentication → URL Configuration:
--        Site URL:      https://resu.alaasi.dev
--        Redirect URLs: https://resu.alaasi.dev/admin
--                       http://localhost:3000/admin
-- ---------------------------------------------------------------------------
insert into public.admins (email, note)
values ('calmdownthemango@gmail.com', 'Owner')
on conflict (email) do nothing;


-- ---------------------------------------------------------------------------
-- 8. Retention (optional but recommended)
--    Run periodically, or schedule with pg_cron, to keep only 12 months.
--
--    delete from public.usage_events where created_at < now() - interval '12 months';
-- ---------------------------------------------------------------------------
