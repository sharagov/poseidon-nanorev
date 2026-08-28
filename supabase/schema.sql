-- Poseidon NanoRev test kit — database schema
-- Run this once in the Supabase project's SQL Editor (Dashboard → SQL Editor → New query).

create extension if not exists "pgcrypto";

create table if not exists physicians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  practice text not null
);

insert into physicians (name, practice)
select * from (values
  ('Dr. Sarah Chen', 'Bayview Family Medicine'),
  ('Dr. Michael Rodriguez', 'Lakeside Internal Medicine'),
  ('Dr. Emily Park', 'Sunrise Health Partners'),
  ('Dr. James Wilson', 'Harborview Primary Care')
) as seed(name, practice)
where not exists (select 1 from physicians);

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  date_of_birth date,
  email text,
  phone text,
  physician_id uuid references physicians(id),
  current_step text not null default 'welcome',
  unboxed_items jsonb not null default '[]',
  unboxed_at timestamptz,
  device_paired_at timestamptz,
  device_initialized_at timestamptz,
  sample_collected_at timestamptz,
  tube_filled_at timestamptz,
  test_started_at timestamptz,
  test_completed_at timestamptz,
  results_sent_at timestamptz,
  kit_returned_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists registrations_set_updated_at on registrations;
create trigger registrations_set_updated_at
  before update on registrations
  for each row execute function set_updated_at();

alter table physicians enable row level security;
alter table registrations enable row level security;

-- Both poseidon-app and poseidon-admin talk to Supabase only from
-- server-side code using the service-role key, which bypasses RLS — so the
-- anon role (the public key shipped in every browser bundle) gets no
-- policies at all here. RLS stays enabled on both tables as defense in
-- depth. See supabase/lockdown.sql for the migration that removed the
-- original anon-open policies from an already-provisioned database.
