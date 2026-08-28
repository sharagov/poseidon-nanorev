-- Security lockdown — run this once in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query) after both apps have been switched
-- to use the service-role key server-side.
--
-- Why: the anon key is public (it ships inside every browser's JS bundle).
-- The original policies let anyone holding that key read and write the
-- `registrations` table directly against Supabase's REST API, bypassing the
-- app entirely — a real way to dump every customer's PII. Both apps now
-- talk to Supabase only from server-side code using the service-role key,
-- which bypasses RLS, so the anon role no longer needs any direct access.
--
-- RLS stays enabled on both tables (defense in depth) — these policies are
-- simply removed rather than replaced, leaving anon with zero access.

drop policy if exists "physicians are publicly readable" on physicians;
drop policy if exists "anyone can create a registration" on registrations;
drop policy if exists "anyone can read a registration" on registrations;
drop policy if exists "anyone can update a registration" on registrations;
