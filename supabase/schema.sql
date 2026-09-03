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
  -- Set when the patient finishes Phase 2 (the self-administration
  -- sequence) — the 8-hour gate before pairing/testing counts elapsed
  -- time from this timestamp. See add-phase2-gate.sql.
  phase2_completed_at timestamptz,
  kit_returned_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One device result per customer, assigned when their test starts and
-- revealed (via completed_at) when it finishes. outcome is a fixed property
-- of which of the four device files got assigned — see
-- src/lib/results/outcomes.ts for the badge/copy configuration, and
-- src/lib/results/file-registry.ts for the file → outcome mapping.
create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references registrations(id) on delete cascade,
  file_name text not null,
  outcome text not null check (outcome in ('clear', 'follow_up', 'invalid', 'error')),
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  run_date timestamptz,
  raw_csv text not null,
  parsed jsonb,
  parse_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shuffle-and-deal state for the 4 device files — see add-results.sql for
-- the full explanation of draw_next_result_file().
create table if not exists result_file_deck (
  id boolean primary key default true check (id),
  file_order text[] not null,
  position int not null default 0
);

create or replace function draw_next_result_file(all_files text[])
returns text as $$
declare
  deck result_file_deck;
  chosen text;
  reshuffled text[];
  attempts int := 0;
begin
  insert into result_file_deck (id, file_order, position)
  values (true, all_files, 0)
  on conflict (id) do nothing;

  select * into deck from result_file_deck where id = true for update;

  if deck.position >= array_length(deck.file_order, 1) then
    loop
      select array_agg(f order by random()) into reshuffled from unnest(all_files) f;
      attempts := attempts + 1;
      exit when array_length(all_files, 1) <= 1
        or reshuffled[1] is distinct from deck.file_order[array_length(deck.file_order, 1)]
        or attempts > 20;
    end loop;
    deck.file_order := reshuffled;
    deck.position := 0;
  end if;

  chosen := deck.file_order[deck.position + 1];

  update result_file_deck
  set file_order = deck.file_order, position = deck.position + 1
  where id = true;

  return chosen;
end;
$$ language plpgsql;

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

drop trigger if exists results_set_updated_at on results;
create trigger results_set_updated_at
  before update on results
  for each row execute function set_updated_at();

alter table physicians enable row level security;
alter table registrations enable row level security;
alter table results enable row level security;

-- Both poseidon-app and poseidon-admin talk to Supabase only from
-- server-side code using the service-role key, which bypasses RLS — so the
-- anon role (the public key shipped in every browser bundle) gets no
-- policies at all here. RLS stays enabled on both tables as defense in
-- depth. See supabase/lockdown.sql for the migration that removed the
-- original anon-open policies from an already-provisioned database.
