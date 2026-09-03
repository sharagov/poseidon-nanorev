-- Migration for the already-provisioned database — adds the timestamp
-- backing the Phase 2 -> Phase 3 wait gate ("come back in 8 hours").
-- Run once in the Supabase SQL Editor. See schema.sql for the full
-- up-to-date schema (this migration keeps it in sync).

alter table registrations
  add column if not exists phase2_completed_at timestamptz;
