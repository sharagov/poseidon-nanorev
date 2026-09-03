-- Migration for the already-provisioned database — adds the `results`
-- table and the file-assignment deck. Run once in the Supabase SQL Editor.
-- See schema.sql for the full up-to-date schema (this migration keeps it
-- in sync).

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

drop trigger if exists results_set_updated_at on results;
create trigger results_set_updated_at
  before update on results
  for each row execute function set_updated_at();

alter table results enable row level security;
-- No anon policies — server-side code only, via the service-role key,
-- matching registrations/physicians (see lockdown.sql).

-- Shuffle-and-deal state for the 4 device files: a shuffled order plus a
-- cursor. draw_next_result_file() deals the next filename, reshuffling
-- (with no repeat across the boundary) once the deck is exhausted. A
-- singleton row (id is always true) plus `for update` gives atomicity
-- across concurrent test-starts without a separate advisory lock.
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
