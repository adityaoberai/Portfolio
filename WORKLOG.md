# Portfolio maintenance log

## Working agreement

- Make changes on a topic branch and open a pull request into `main`.
- Update this log with implementation changes, verification results, and outstanding work.
- Keep the room's architecture and physical-device checks in [docs/room.md](docs/room.md), analytics conventions in [docs/analytics.md](docs/analytics.md), and dependency follow-up in [docs/maintenance.md](docs/maintenance.md).

## Current state

- The portfolio on `main` uses SvelteKit 2, Svelte 5, Three.js, and adapter-node, hosted on Appwrite Sites. `/` chooses My room or On paper from the server-side mode cookie; `/world` and `/index` set that preference. Other content pages remain available directly.
- Content lives under `src/lib/data/`. Room state, history, and dialogs belong to `WorldView.svelte`; the room menu and music controls have their own components. The scene loads only when the room is mounted.
- Appwrite Analytics replaces Google Analytics and runs only on the two production hostnames, respecting Do Not Track.
- Node 24 is the development and CI default. The minimum supported version is 22.18.

## 28 October 2026 — Repository cleanup

- Added Spotify API and player readiness timeouts, retry controls, and cleanup for failed or late loading attempts.
- Aligned asset/performance script defaults with the production server's port 3000; documented `BASE` for other ports.
- Removed seven unused artifact exports. Shared links and saved journeys now follow station visibility in `world.ts`, including stations that are re-enabled later.
- Extracted `RoomMenu.svelte` and `MusicDock.svelte`, preserving the room's focus handling, analytics, and responsive controls.
- Added GitHub Actions for formatting/lint, type checking, unit tests, dependency auditing, production build, and browser tests. Action versions are pinned to commit SHAs; browser failure artifacts are retained for seven days.
- Archived the V3 implementation history and replaced obsolete launch instructions with the current maintenance state.
- Validation: clean `npm ci`, lint, type checking (0 errors/0 warnings), all 34 unit tests, the production build, and all 65 browser tests pass. Browser coverage includes Spotify API/player timeouts and retry, mobile controls, accessibility, analytics, mode persistence, and WebGL fallback. Visually checked the desktop room menu and mobile music fallback at 390px, with no horizontal overflow. The audit threshold passes with seven low-severity affected packages and no moderate/high/critical findings.

## Outstanding work

- Run the physical iPhone/Android, screen-reader, Safari playback, and sustained GPU/thermal checks in [docs/room.md](docs/room.md#real-phone-test-not-yet-passed), then record device, browser, connection, and results here. Automated Chromium checks do not replace those checks.
- `src/lib/data/now.ts`: Reading and Thinking about need Aditya's input. Keep the manual `now.updated` date in sync with content edits.
- Track the four low-severity dependency advisories and the separate framework migration in [docs/maintenance.md](docs/maintenance.md).

## Historical record

The full V3 implementation log through 28 October 2026 is archived in [docs/archive/v3-worklog-2026-10-28.md](docs/archive/v3-worklog-2026-10-28.md). It records past decisions and validation; it is not the current launch checklist.
