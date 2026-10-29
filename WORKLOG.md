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

## 29 October 2026 — Consistent room across screen sizes

- Use the desktop room geometry and furniture positions on every screen. Remove the portrait-only 40% floor-depth increase, along with duplicate geometry, inverse model scaling, hitbox remapping, and movement compensation. Keep a portrait-specific camera angle without changing the layout.
- Keep responsive camera fitting around the header, touch controls, music player, and reading sheets. Retarget an active focus animation when the available space changes.
- Fit the narrower shared room more closely on phones so removing the depth stretch does not leave unnecessary space at its sides.
- Add browser coverage comparing room corners, wall height, and furniture landmarks against the same floor plan at each camera angle across desktop, phone portrait, landscape, and rotation back. Resizing must preserve the character's saved position.
- Validation: lint, type checking (0 errors/0 warnings), 33 unit tests, and a clean production build pass. The new browser regression reproduces the original 40% depth stretch and passes after removing it. Visually checked the room and bed views at desktop, 390 × 844, 320 × 740, and 844 × 390 with no page overflow. Full browser validation also runs in PR CI.

## 29 October 2026 — SoundCloud playlist and explicit player visibility

- Replaced Spotify with SoundCloud's hosted player for Aditya's supplied public playlist, `https://soundcloud.com/user-298651421/sets/adis-world`. SoundCloud's oEmbed endpoint confirms the playlist title as "adi's world". No audio files or custom audio player were added.
- Keep the player expanded whenever music is switched on, including on phones. Remove automatic collapse after playback begins and preserve the visitor's visibility choice across room readers and playback changes.
- Replace chevrons with a minus icon and a visible Hide label. Show player uses a player-window icon, and the compact mobile control names the same action. Hiding keeps the existing iframe and playback session mounted.
- Reduce the widget from up to 300px to 166px on phones and touch screens so the open player leaves more of the room visible.
- Preserve lazy loading, retry/fallback behavior, playback-driven record animation, and existing analytics event names. Allow ten seconds for the API and thirty seconds for the playlist, with a loading message. Track-level errors keep SoundCloud's native controls available. Use its documented widget events and encrypted-media permission.
- Replace provider-specific test doubles with a shared SoundCloud fixture and cover the supplied playlist, loading failure recovery, manual hide/show, stopping/restarting, focus, mobile geometry, and analytics deduplication.
- Validation: lint, type checking (0 errors/0 warnings), all 34 unit tests, the production build, and all 66 browser tests pass. Visually checked the expanded and hidden mobile controls at 390px; responsive browser coverage includes portrait and landscape with no horizontal overflow. SoundCloud's real Widget API resolves the 39-track playlist. In a separate signed-out Chrome session, its public embedded player kept the first track playing beyond thirty seconds (the visible progress indicator passed 21% of the 4:20 track). Browser regression tests stub SoundCloud playback; live provider availability is checked separately.
- Compact-height follow-up: lint, type checking, production build, and the two existing desktop/mobile music browser tests pass. Measured a 166px iframe and 228px popup at 320 × 844, 390 × 844, and 844 × 390; the popup stays within the viewport.

## 28 October 2026 — Repository cleanup

- Added Spotify API and player readiness timeouts, retry controls, and cleanup for failed or late loading attempts.
- Aligned asset/performance script defaults with the production server's port 3000; documented `BASE` for other ports.
- Removed seven unused artifact exports. Shared links and saved journeys now follow station visibility in `world.ts`, including stations that are re-enabled later.
- Extracted `RoomMenu.svelte` and `MusicDock.svelte`, preserving the room's focus handling, analytics, and responsive controls.
- Added GitHub Actions for formatting/lint, type checking, unit tests, dependency auditing, production build, and browser tests. Action versions are pinned to commit SHAs; browser failure artifacts are retained for seven days.
- Archived the V3 implementation history and replaced obsolete launch instructions with the current maintenance state.
- Validation: clean `npm ci`, lint, type checking (0 errors/0 warnings), all 34 unit tests, the production build, and all 65 browser tests pass. Browser coverage includes Spotify API/player timeouts and retry, mobile controls, accessibility, analytics, mode persistence, and WebGL fallback. Visually checked the desktop room menu and mobile music fallback at 390px, with no horizontal overflow. The audit threshold passes with seven low-severity affected packages and no moderate/high/critical findings.

## 28 October 2026 — Native contact-window CI coverage

- The failed CI trace shows middle-click and Ctrl-click reaching `/contact`, but the Shift-click window never committing its navigation after the local server returned HTTP 200. CI used Playwright's default headless shell while the earlier local validation used full Chromium.
- Select the `chromium` channel explicitly so CI and local tests use full Chromium's headless mode, including native new-window behavior. Keep every native activation and analytics assertion; additionally require the contact heading to render and the source room to stay unchanged with no panel open.
- The first full-Chromium CI run passed the native-window regression and exposed a second test isolation bug: its late bubbling `preventDefault` ran after SvelteKit had handled the resume link, opening the PDF viewer. Cancel in capture phase without stopping propagation, preserving all analytics assertions.
- Validation: clean dependency installation, lint, type checking, 34 unit tests, and the production build pass. Local browser execution is blocked by the cloud sandbox's socket restrictions; the matching PR CI run must validate the browser suite before this fix is considered verified.

## Outstanding work

- Run the physical iPhone/Android, screen-reader, Safari playback, and sustained GPU/thermal checks in [docs/room.md](docs/room.md#real-phone-test-not-yet-passed), then record device, browser, connection, and results here. Automated Chromium checks do not replace those checks.
- `src/lib/data/now.ts`: Reading and Thinking about need Aditya's input. Keep the manual `now.updated` date in sync with content edits.
- Track the four low-severity dependency advisories and the separate framework migration in [docs/maintenance.md](docs/maintenance.md).

## Historical record

The full V3 implementation log through 28 October 2026 is archived in [docs/archive/v3-worklog-2026-10-28.md](docs/archive/v3-worklog-2026-10-28.md). It records past decisions and validation; it is not the current launch checklist.
