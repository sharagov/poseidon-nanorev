# Poseidon NanoRev Prototype — Session Handoff

You're picking up an in-progress project. The user (dmytro@smallteam.co) is **non-technical** — walk them through any external-service steps (GitHub, Vercel, Supabase) with exact click-by-click instructions, no jargon. Auto mode is on: make reasonable calls yourself rather than asking permission for routine dev work, but confirm before anything destructive or before pushing/deploying.

## What this is

A pixel-accurate prototype of a 10-step medical test-kit wizard ("Poseidon NanoRev test"), built from a Figma file, implemented as a real Next.js app with a Supabase-backed database (not just a clickable mockup — form data actually persists at every step).

- **Local path**: `/Users/admin/Claude/Poseidon/poseidon-app`
- **Stack**: Next.js 16 (App Router, Turbopack) + shadcn/ui (Radix base, "Nova" preset) + Tailwind v4 + Supabase (Postgres)
- **Figma source**: https://www.figma.com/design/3yQ4uVwgRZrfPEcmBh7Kmt/-01--Poseidon---Shadcn-ui-kit-for-Figma--BASIC----July-2026 — the `get_design_context`/`get_screenshot` Figma MCP tools have been flaky (frequent timeouts) all session; `get_metadata` works reliably for exact positions/sizes. Real photo assets were exported by the user into `public/images/`.

## Accounts already set up (all free tier)

- **GitHub repo**: `https://github.com/sharagov/poseidon-nanorev` (empty git remote already added locally as `origin`)
- **Supabase project**: URL `https://trtjqhztnsawlbxzclng.supabase.co`, already has the schema applied (see `supabase/schema.sql`) and seeded physicians. Anon key is in `.env.local` (gitignored) — safe to re-share if needed, it's a public/RLS-protected key, not a secret credential.
- **Vercel**: deployed once already at `https://poseidon-nanorev.vercel.app` — but this is **STALE**, built before this session's animation/layout fixes. Needs a fresh push + redeploy.

## Current git state (uncommitted!)

Last commit (`aa9bd2c`) is the *original* build. Everything since — all the animation fixes, layout fixes, dev panel, timer changes — is **uncommitted** in the working tree. Run `git status` to see the modified/new files before doing anything else.

**Next concrete step**: commit these changes and push. Pushing needs a fresh GitHub Personal Access Token from the user (the old one is likely expired/revoked) — walk them through: github.com/settings/tokens?type=beta → generate new fine-grained token → repo `poseidon-nanorev` → Contents: Read and write. Push with `git push https://<token>@github.com/sharagov/poseidon-nanorev.git main` (don't store the token in git config). Vercel auto-redeploys on push to `main`.

## Local dev

```bash
cd /Users/admin/Claude/Poseidon/poseidon-app
npm run dev
```
`.claude/launch.json` has a `poseidon-dev` config for the Browser-pane `preview_start` tool (port 3000). A **dev-only testing panel** (bottom-right "DEV" pill, only renders when `NODE_ENV !== "production"`) has: jump-to-any-step, fill-form-with-sample-data, skip-current-timer, restart-flow. Never shows in production builds.

## Important gotchas learned this session (don't re-discover these)

1. **This automation's Browser pane tab is *permanently* `document.hidden = true`**, even in brand-new tabs, even after `tabs_select`. This throttles/pauses `setTimeout`, `requestAnimationFrame`, and CSS transitions/animations unpredictably. Screenshots taken immediately after navigation are often blank/stale — retry once. **Don't trust live animation-timing checks in this tool** — verify mechanism correctness instead via: forcing state with JS (e.g. patch `requestAnimationFrame` to a no-op, or directly toggle classes) and reading `getComputedStyle` values, or sampling `<canvas>`-drawn pixel data from the real decoded image (bypasses the compositor). For real animation/timing verification, ask the user to check in their own browser and ideally send a screen recording.
2. **User screen recordings are the most reliable QA signal.** Extract frames with `ffmpeg` (already installed via brew) into a tiled contact sheet (`ffmpeg -i video.mp4 -vf "fps=1,scale=320:-1,tile=6xN" sheet.png`) for a fast overview, then dense-sample (0.1–0.2s steps) around any suspicious transition. This caught two real bugs this session that live-browser testing missed entirely.
3. **CSS Grid `0fr → 1fr` height-transition trick needs `min-height: 0` on the grid item**, or it silently floors at the item's content height instead of collapsing to 0 (grid items default to `min-height: auto` = min-content, which overrides `0fr` track sizing). This was a real, shipped bug — found via video, not live testing.
4. **`ease-in` is the wrong choice for reveal/entrance animations** — it's back-loaded (barely visible motion for the first ~60-70% of duration, then a rush), which reads as "stuck then snaps" even though it's technically interpolating the whole time. Use `ease-out` for anything appearing/growing on screen; reserve `ease-in` for things leaving.
5. **shadcn's new CLI defaults to "Nova" preset with smaller control sizes** (36px buttons, 32px inputs) than classic shadcn — had to override in `button.tsx`/`input.tsx`/`select.tsx` to match the 56px/44px Figma spec. Also found `buttonVariants` used `inline-flex`, which put buttons in an inline formatting context and added invisible line-box spacing below them — changed to `flex`.
6. **Structural padding bug**: don't apply the same horizontal padding to both an outer flex/grid wrapper *and* its child — it was double-stacking (32px + 56px instead of just 56px), shrinking the card 64px narrower than the Figma-specified 584px. Watch for this pattern generally.
7. Background photos are shared across some steps (e.g. `welcome` and `register` use the same image) — the background is a single persistent `<img>` at the `Wizard` level (`wizard-background.tsx`), not remounted per-step, specifically so `object-position` can transition smoothly when the same photo needs a different crop for a different step.
8. **Timers**: the two design-accurate countdowns (fill-tube: 6s, testing-prep: 90s) display their real numbers but tick faster than real-time for demo purposes — see the `*_SECONDS` / `*_DEMO_DURATION_MS` constants clearly marked at the top of `wizard.tsx`. Restore to real-time by setting `durationMs = seconds * 1000`. The `testing-progress` step intentionally has **no visible timer** (per Figma, it just says "about 3 minutes" — an approximation) — it auto-advances via `WaitingStep`, a plain timeout with no countdown UI.

## Known cosmetic gaps (disclosed to user, not yet fixed)

- Background images are a single portrait-oriented export used at all viewport aspect ratios via `object-cover` — at extreme/unusual aspect ratios the crop can occasionally be imperfect (no per-breakpoint art-directed crops like the original Figma file has).

## Style notes for this user

- Wants things pushed to real infrastructure (GitHub/Vercel/Supabase), not just localhost — but reminders are needed since they don't have dev background.
- Reacts well to being shown *exact* verification evidence (computed styles, measured pixel positions, video frame timestamps) rather than "I fixed it, trust me" — this user has caught several claimed-fixed issues that weren't actually fixed, so verify thoroughly before declaring something done.
- Prefers I proceed autonomously on implementation details but check in before destructive/external actions (git push, deploy, account creation).
