# V3 work log

## Working agreement

- Work exclusively on `v3-world`; do not modify `main`.
- Update this file after every implementation or configuration change.
- Start with Phase 0: audit, renderer/deployment decisions, and a small playable spike. Real-phone testing is required before expanding the room.
- Source brief: user attachment, adityaoberai.com V3 (2026-09-30).
- Full requirements and execution decisions live in root `v3.md`.

## Current state (verified 2026-10-02)

- Branch: `v3-world`, based on `12cbe80`. One commit per phase: Phase 0 `f85cdaf`, Phase 1 `2e6ceee`, Phase 2 `298269e`, Phase 3 `e71d7cc`, Phase 4 `9b8afb4`, Phase 5 `4b772bd`, full-page World `1b0e26b`, focus/size/E `2db0f96` + `9797ce7`, configurable room content `b8ed4c3`, solid furniture and the open doorway `99f5277`, rename to `WORKLOG.md` `6e97548`, favourite cards, Squirtle plush, and new Blastoise `75dfc72`, cowl, DeLorean, flag, and shelf rows `39017a7`, desk/shelf swap and laptop `1418900`, bed/armchair and mirror/cabinet swaps `f3fd237`, plant removed and walls rearranged `c57e6c1`, camera cabinet right of the shelf `d63c09e`, the sofa, the combined board, seats, books, and the window move `0dcd437`, then the mirror reflection (this state). `main` is untouched. Each change set is pushed to `origin/v3-world`.
- Stack: SvelteKit 2.70, Svelte 5.57, TypeScript, Tailwind 4, **adapter-node 5.5.7** (replaced adapter-static), Three.js 0.186.1.
- `/world` has all nine stations from the brief (desk & computer, notebook & fountain pen, Fujifilm X-T30 II, Pokémon shelf, corkboard, conference wall, mirror, window, door) and six curiosities (Squirtle plush, Batman cowl, LEGO DeLorean, Manchester United flag, suitcase, football), plus decoration (reading corner, prints, lamps, a Blastoise figure on top of the shelf, books). Left wall, back to front: the desk with the laptop and the United flag above it, the sofa on a small rug under one board (corkboard and lanyards), the door. The suitcase and football sit at the foot of the bed. Opening the desk or the board sits the character down (chair, sofa). Back wall: the window (between the desk and the shelf), the shelf (cards, cowl and DeLorean, Aditya's six books), the camera cabinet with prints above, the mirror in the corner (it reflects the character). The bed runs along the right edge. The shelf holds, top to bottom: Blastoise, the four favourite cards, the cowl and the DeLorean, books, binders and sealed boxes. `/collection` shows the cards too. The window follows Bengaluru time. `/now` exists. `/index` is SSR and never loads the scene.
- `/` renders World or Index on the server from the `mode` cookie (default World). `/world` and `/index` set it.
- World is the whole page: full-viewport room, floating header (WORLD / INDEX), and an "In the room" menu button bottom right that opens the station list, curiosities, and settings.
- Every page is V3 now: one header (WORLD / INDEX switch everywhere, section nav on deep pages), one footer, one container width. Deep pages: `/work`, `/projects`, `/speaking`, `/writing`, `/community`, `/photography`, `/collection`, `/about`, `/contact`, `/now`; `/resume` stays a PDF redirect. All V2 components are gone.
- Validation: `npm run check` 0/0, `npm test` 22/22, `npm run test:e2e` 24/24 (including axe WCAG 2.2 AA audits) against the built Node server, `npm run lint` passes. 11–13 draw calls (4 more while the character shows in the mirror), ~11.7k triangles, two textures (54 KB card atlas, 14.5 KB flag). Launch checklist and measured performance proxy: `v3.md`, "Launch checklist".
- Hosting: Appwrite Sites, the existing "My Portfolio" site (project `688230070011fbf10e1a`, Frankfurt). It already builds `v3-world` with SvelteKit SSR + adapter-node (deployment `6abd89d5091931398edf` at `b8ed4c3`, ready); production domains still serve V2 from `main`.
- Blocked on the user: a physical mid-range phone test (see the gate in `v3.md`), analytics decision, copy review, and the go-live steps below.

## Open review items (not yet fixed)

- Copy written by Claude, not Aditya, needs his review before launch: the four curiosity lines in `src/lib/data/world.ts` (the suitcase line names Yokohama, London, Toronto, Atlanta, inferred from talks and photos; the football line is invented flavour), and the station summaries. Also: the Squirtle plush, Batman cowl, LEGO DeLorean, and flag lines, the football line's "Premier League ball", the shelf panel's lead and its "Other favourites" lines, the combined board's summary and lanyards line ("A few other favourites share the shelf…"), and the card details and alt text in `src/lib/data/collection.ts`, which Claude read off the card images (set names, numbers, illustrators).
- `src/lib/data/now.ts`: "Reading" and "Thinking about" are left out because there is no source for them; Aditya should supply them. `now.updated` is a manual date and must change whenever the page changes.
- `npm audit`: 3 low findings in the SvelteKit/cookie chain; only `--force` resolves them.
- Google Analytics (existing V2 tag in `src/routes/+layout.svelte`) is 160 KB of third-party JavaScript on every page, more than all first-party JavaScript on Index. Keep, defer, or replace: Aditya's call.

## Next steps

1. User: run the real-phone gate in `v3.md` and record results here.
2. User: check the branch preview while signed in to the Appwrite Console (preview URLs return 401 to anonymous visitors).
3. User: review the Claude-written copy (open items above) and supply Now's Reading / Thinking about.
4. User: decide on analytics.
5. Go live on Appwrite Sites: add `ORIGIN=https://adityaoberai.com` (site Settings → Environment variables), merge `v3-world` into `main` via a PR, add `adityaoberai.com` and `www.adityaoberai.com` as Active-deployment domains (the apex needs NS delegation from GoDaddy; copy its MX/TXT records first), keep oberai.dev on Active deployment until path-preserving redirects exist (Appwrite domain redirects drop paths). Rollback: reactivate V2 deployment `6aa7d3f0dc0c05bdc438`.

## Change log

### 2026-09-30 — Branch and work log

- Created `v3-world` before changing project files.
- Added this persistent handover, including the requirement to update it with every change.
- No V3 implementation yet. Audit and renderer research underway.

### 2026-09-30 — Audit, architecture record, and baseline fix

- Added `v3.md` (originally docs/v3-spike.md, consolidated below): route inventory, renderer comparison with primary sources, static deployment decision, budgets, and physical-phone gate.
- Baseline `npm run check` failed because a missing optional Pexels API key was imported as a required named export. Changed the build-time loader to read the optional namespace property, preserving secret-free fallback and static rendering.
- Existing URLs/domain remain in place; SSR cookies and the default World homepage are explicitly deferred to Phase 2, not silently approximated.

### 2026-09-30 — Dependency setup

- Started `npm ci` from the existing lockfile because node_modules was absent. No package versions changed.
- Confirmed the repository has no AGENTS.md instructions and no existing Sites hosting configuration.
- V2 remains the default homepage during this Phase 0 spike; root mode selection and cookie SSR are Phase 2 work.

### 2026-09-30 — Renderer selected and installed

- Added exact Three.js 0.186.1 plus TypeScript definitions for a client-only, on-demand room renderer.
- Evaluated Threlte 8.6.1 (Svelte >=5 / Three >=0.172 compatible) and CSS/SVG 2.5D. Direct Three is selected for this small spike: explicit zero-idle animation scheduling and no additional interactivity layer; Svelte owns semantic UI.
- No physics, postprocessing, asset loaders, textures, or continuous decorative animation will be added to the spike.
- `npm ci` completed; existing dependency audit reported 18 vulnerabilities. Broad dependency upgrades are not part of the spike; record details during validation.

### 2026-09-30 — Consolidate the plan (user request)

- Removed `DEV_SPEC.md` and `DESIGN_SPEC.md`.
- Added root `v3.md` containing the complete supplied V3 brief, all phases/acceptance criteria, plus audit, architecture decisions, budgets, and phone-test plan.
- Consolidated `docs/v3-spike.md` into `v3.md` and removed the duplicate plan file. `HANDOVER.md` remains the running change log.

### 2026-09-30 — Index and shared shell

- Added a fresh `/index` using existing work, projects, talks, writing, community, and portrait sources; collection links to the user-supplied Collectr showcase.
- Added the artifact contract and first desk artifact derived from existing work data.
- Added a persistent visible World/Index navigation control to V2 pages and a shared V3 header; isolated the new pages from the V2 header/footer layout.
- Index has no dependency on Three.js or World. Full content migration and preference cookies remain later-phase work.

### 2026-09-30 — Playable room spike

- Added a lazy Three.js scene with a fixed orthographic camera, warm primitive bedroom, desk/computer/notebook, plants, bed, and stylized character.
- Added screen-relative WASD/arrows, tap/click floor movement, generous desk hitbox and auto-approach, keyboard E/Enter interaction, reset, reduced-motion and low-power controls.
- Added semantic desk button and native work dialog using the same artifact as Index; focus/keyboard controls stay scoped to the room.
- Added SSR loading/failure content and Index escape. Scene frames stop at rest/background/blur; resize, lifecycle cleanup and WebGL context-loss paths implemented.
- Added optional `?diagnostics=1` display for draw calls, triangle count, DPR and frame counter. Physical-device gate remains pending.

### 2026-09-30 — First compile and formatting

- `npm run check` passes with 0 errors and 0 warnings, including the secret-free Pexels fix.
- Applied repository Prettier formatting to new/modified source and plan files.
- Started Vite at `http://localhost:5173/world` (LAN: `http://10.170.56.83:5173/world`); HTTP preview responds 200.
- Attempted the browser handoff; no browser is connected to the available CUA tool. Automated validation and a user-accessible URL remain available; physical phone testing is still pending.

### 2026-09-30 — Prerender link correction

- First production build caught a new Index link to an anchor absent from the existing Projects page. Corrected it to `/projects`; existing community and work anchors are present.
- Measured lazy scene chunk at 134.10 KB gzip (531.02 KB minified), within the provisional 200 KB transfer budget. Vite's 500 KB raw-chunk advisory remains visible; the scene is already dynamically imported.

### 2026-09-30 — Dependency security maintenance

- Applied npm's non-force, in-range audit fixes after the baseline audit revealed known dev-server file-read issues relevant to a LAN phone preview.
- Kept the declared Svelte/SvelteKit/Vite major versions and existing adapter; refreshed lockfile patches/minor versions only. Revalidation required after this maintenance.

### 2026-09-30 — Regression test tooling

- Added Playwright as a development-only dependency for repeatable headless checks of movement, touch input, dialog focus, reduced motion, failure states, and scene-free Index loading.
- These checks do not establish physical-phone GPU/thermal performance or replace the phone gate.

### 2026-09-30 — Regression coverage and loading-state fix

- Added movement tests for bounded floor movement, screen-relative controls, diagonal speed, lag clamping, and under-two-second traversal.
- Added headless browser regression tests for Index isolation, keyboard/idle behavior, dialog/focus, mobile controls, reduced motion, low-power DPR, WebGL failure, and no-JavaScript output.
- Fixed a review finding: selecting Low power before the lazy renderer loads now applies the selected DPR at initialization.
- Ignored generated test output. Tests run against a production build using `npm run test:e2e`.

### 2026-09-30 — Test source formatting

- Formatted regression tests, test configuration, and the low-power initialization fix using the repository's Prettier configuration.

### 2026-09-30 — Static Index path and updated compiler diagnostics

- New SvelteKit validation exposed the static `/index` filename collision with the homepage's `index.html`. Gave only Index a trailing slash so its static output is `index/index.html`; `/index` remains accessible via canonical slash normalization.
- Normalized mode-switch/layout pathname checks for this slash form.
- Fixed an explicit `this` type in the WebGL test stub and two existing component initialization warnings surfaced by the updated Svelte compiler: derived error heading and explicitly untracked initial photo selection.
- In-range security updates reduced the npm audit from 18 findings (11 high) to 3 low findings in the existing SvelteKit/cookie chain; no force downgrade applied.

### 2026-09-30 — Explicit static Index entry

- Trailing slash alone was insufficient: the prerender crawler skips `/index` when the root `index.html` has already been generated. Added `/index/` before wildcard prerender entries and made the switch link canonical.
- `npm run check` now reports 0 errors/0 warnings; 5 movement tests pass. Whole-repository Prettier check flags 47 untouched legacy files; avoid an unrelated repo-wide formatting rewrite.

### 2026-09-30 — Runtime decision revised from browser evidence

- Browser tests proved `/index` is served as the old homepage by generic static preview because `/index.html` wins before directory normalization. The static workaround built successfully but did not satisfy the route contract.
- Installed adapter-node 5.5.7 and removed adapter-static. A portable Node runtime is the Phase 0 deployment target; no provider has been selected or deployed.
- This intentionally supersedes the earlier static-spike decision. Runtime output is not a drop-in static upload; document the start command and host implications in v3.md.

### 2026-09-30 — Hybrid runtime and browser-test corrections

- Configured adapter-node; World and Index SSR, while existing homepage/deep pages retain prerendering. Removed the ineffective static workaround.
- Preview/start and browser tests now run the actual built Node handler, which routes `/index` distinctly from `/`.
- Updated the complete deployment decision in `v3.md`, including build/start/environment requirements and provider-specific follow-up.
- Fixed class assertions to allow Svelte's scoped CSS class; no-JavaScript test now verifies usable SSR navigation all the way to the real Index.
- Screenshot review found desktop wall-top clipping; increased camera framing and vertical aim so the whole room fits.

### 2026-09-30 — Runtime checks and additional input coverage

- Actual Node output passes direct Index isolation, keyboard movement/idle/focus, and mobile settings tests; no-JavaScript test found two valid escape links and was narrowed to the loading/failure region.
- Added floor-click, direct mobile floor/desk tap, and WebGL context-loss regression checks.
- Verified screenshot diagnostics: 88 draw calls and 1,640 triangles at rest. Desktop view now contains the full wall top.
- Automatic approval review rejected the LAN production-server start with only `blocked by policy`; no firewall or security settings changed. Use localhost for agent preview. User may start a LAN preview manually for the required physical-phone test.

### 2026-09-30 — Takeover review and fixes

- Took over from the previous session. Re-ran every check against the built Node server rather than trusting earlier entries.
- `tests/browser/world.spec.ts`: the "WebGL failure and disabled JavaScript" test failed on every run. Playwright leaves `<noscript>` out of text matching, so the assertion always saw an empty string; the SSR output was correct. The test now asserts the `.no-script` paragraph inside it. Suite: 5/5.
- `src/routes/{pic,meet,resume,resume/docx}/+page.server.ts`: added `prerender = false`. They inherited `prerender = true` and returned 200 meta-refresh pages, contradicting the 301/302 contract in `v3.md`. Now real 301/302 responses (verified with curl). Appwrite Sites also expects path redirects from the framework, so this carries over if Sites is chosen.
- `src/routes/index/+page.svelte`: `<h3>`/`<p>` were wrapped in `<span>` (invalid HTML content model); changed to `<div>`. No visual change.
- `src/routes/world/+page.svelte`: fixed a missing space in the desktop instructions ("to walk ·Tap").
- `package.json`, `package-lock.json`: bumped `@types/three` 0.185.0 → 0.186.0 (exact) to match the Three.js 0.186.1 runtime. The earlier entry said the definitions matched; they lagged one release.
- `v3.md`: audit now states the redirect routes opt out of prerendering and why; deployment decision now records that Appwrite Sites supports SvelteKit SSR with framework-level redirects, that its expected adapter must be confirmed with a preview deployment, and adds the Appwrite docs reference.
- `HANDOVER.md`: rewrote "Current state", moved next steps out of the middle of the change log into their own section, added "Open review items", and added this entry.
- Ran Prettier on `HANDOVER.md`, `v3.md`, and the edited source/test files. The 11 unformatted route files Prettier still reports are untouched V2 files.
- No other files changed. Build output, `test-results/`, and local preview servers (localhost only, now stopped) are not project changes.

### 2026-09-30 — Phase 0 commit (user request)

- User asked to commit Phase 0, then continue through every later phase with one commit per phase and a HANDOVER.md entry for every change.
- `HANDOVER.md`: "Current state" and "Next steps" updated for the commit and the instruction to continue past the unpassed phone gate.
- Committed all Phase 0 work listed above on `v3-world`. Not pushed.

### 2026-09-30 — Phase 1: vertical slice

- `src/lib/world/layout.ts` (new): room bounds, walkable area, camera offset/target, furniture footprints, station approach points/hitboxes/focus points, curiosity hitboxes. No Three.js import, so it is unit-tested. Room grew from 6.3×5.25 to 7×6.2 to make space for all nine stations.
- `src/lib/world/movement.ts`: rewritten. Keyboard directions now follow the exact camera azimuth (Phase 0 used a 45° approximation of a 37° camera). Points are pushed out of furniture footprints to the nearest free edge, so the character slides around furniture instead of walking through it. Added `isFree` and `nearest`. Removed the desk-only constants.
- `src/lib/world/build.ts` (new): `Batch` merges primitives with per-vertex colour into one geometry. Builders for the shell, desk (monitor, lamp, open notebook and fountain pen, chair), photography corner (cabinet, Fujifilm X-T30 II, strand of prints), Pokémon shelf (slabs, binders, sealed boxes, Blastoise figure on top), bed with Blastoise plush, plant, character.
- `src/lib/world/scene.ts`: rewritten around stations. Static room is two merged meshes (88 → 7 draw calls). Generic hitboxes with priority (notebook wins over desk), hover label and pointer cursor for mice, curiosity clicks, nearest-station ring, monitor wakes near the desk, 480 ms camera push-in toward an open station (instant under reduced motion), stalled-path detection, `project`/`anchor` helpers for diagnostics and tests. The monitor now has its own material (closes the shared-material review item).
- `src/lib/data/room.ts` (new): station meaning (number, object, area, world, summary, deep link) and curiosity lines.
- `src/lib/data/photography.ts` (new): photographs derived from `pexels-photos.json`; titles from the Pexels slug, places detected from the title, CDN image URLs that need no API key. Camera body from the brief.
- `src/lib/data/collection.ts` (new): favourite (Blastoise) and Collectr showcase URL from the brief. No card inventory is claimed.
- `src/lib/data/artifacts.ts`: added one representative artifact per Phase 1 area (desk, notebook, camera, shelf); `collectionUrl` now comes from `collection.ts`.
- `src/lib/components/world/WorldView.svelte` (new): the World experience, extracted from the route for reuse at `/` in Phase 2. Room hint card, hover label, curiosity note, "In the room" guide (button + deep link per station, SSR'd), side sheet on wide screens and bottom sheet on phones. Guide buttons scroll the room into view first. Focus returns to whatever opened the sheet (closes the focus-return review item). `?diagnostics=1` also exposes the controller as `window.__room` for tests.
- `src/lib/components/world/StationPanel.svelte` (new): content for each station, built from `work.ts`, `projects.ts`, `writing.ts`, `photography.ts`, `collection.ts`.
- `src/lib/components/world/Slab.svelte` (new): CSS graded-card slab for Blastoise with pointer tilt and sheen; no official artwork; tilt off under reduced motion.
- `src/routes/world/+page.svelte`: now just metadata plus `WorldView`.
- `tests/ts-hooks.mjs` (new) and `package.json` `test` script: Node resolve hook so unit tests import extensionless TypeScript modules.
- `tests/movement.test.mjs`: 8 tests, including furniture push-out, camera-aligned "up", every approach point free and nearest to its own station.
- `tests/browser/world.spec.ts`: 7 tests, adding E-to-inspect, direct object clicks, curiosity note, guide buttons without WebGL, SSR guide links without JavaScript, focus return to the guide button, and a `settle` helper that waits for camera easing.
- `v3.md`: status line and the performance/input contract updated (merged geometry, push-in, footprints, guide buttons, focus return).
- Ran Prettier on every file above.

### 2026-09-30 — Phase 2: Index, mode persistence, shared content

- `src/lib/server/mode.ts` (new): `readMode` (default World) and `rememberMode` (one-year `mode` cookie, `SameSite=Lax`, `HttpOnly`, `Secure` only over HTTPS so plain-HTTP previews still work).
- `src/routes/+page.server.ts`: replaced the V2 Pexels build-time loader with the SSR mode read; sets `Vary: Cookie` and `Cache-Control: private, no-cache`; `prerender = false`. `PEXELS_API_KEY` is no longer used anywhere.
- `src/routes/+page.svelte`: replaced the V2 homepage with World or Index, chosen by the server.
- `src/routes/world/+page.server.ts`, `src/routes/index/+page.server.ts` (new): set the preference on visit. Removed `src/routes/world/+page.ts` and `src/routes/index/+page.ts` (their `prerender = false` moved into the server files).
- `src/lib/components/index/IndexView.svelte` (new): Index extracted for reuse at `/`, rebuilt on shared data: intro, "At a glance" proof points (`highlights.ts`), all ten sections with live counts, one featured artifact per type, contact footer.
- `src/routes/index/+page.svelte`: now metadata plus `IndexView`.
- `src/lib/data/sections.ts` (new): single list of section destinations and summaries (counts computed from data). Writing, Photography, and Collection still point off-site until Phase 4 adds their pages.
- `src/lib/data/artifacts.ts`: full artifact model derived from `work`, `projects`, `talks`, `podcasts`, `writing`, `photography`, `community`, `collection` (86 artifacts: 17 work, 7 projects, 12 talks, 18 podcasts, 5 essays, 21 photos, 5 community, 1 collectible). Only world tags are new; multi-world tags follow the brief's examples (Writers' Room → gather + write + photograph; RenderATL → speak + build + write). Added `context` field, `worldLabels`, `inWorld`, `ofType`, `featured`, `artifactById`.
- `src/lib/components/world/StationPanel.svelte`: reads artifacts instead of raw data files.
- `src/lib/data/room.ts`: station links now come from `sections.ts`.
- `src/lib/data/photography.ts`: added `withWidth` to request other CDN sizes.
- `src/lib/components/ModeSwitch.svelte`: at `/`, marks the mode the server chose.
- `src/routes/+layout.svelte`: `/` uses the V3 shell (no V2 header/footer).
- `src/routes/sitemap.xml/+server.ts`: added `/world` and `/index` (closes that review item).
- Removed the V2 homepage-only pieces: `src/lib/components/PhotoGallery.svelte`, `src/lib/data/photos.ts`, `static/photos/placeholder-{1..4}.svg`.
- `tests/browser/mode.spec.ts` (new): first visit gets World with `Vary: Cookie`; `/index` then `/` renders Index without the scene bundle; the switch's client-side navigation updates the cookie; no-JavaScript SSR honours the cookie.
- `v3.md`: deployment section now records the implemented mode selection and the shared content model.
- Ran Prettier on the files above. It also reformatted untouched V2 files under `src/lib`; I reverted those so this commit only holds Phase 2 changes.
- `tests/content.test.mjs` (new): one artifact per source record with unique ids (confirms the 86), known worlds and a link for every artifact, photo titles, and every station has layout, meaning, and a section. `package.json` `test` script runs it.
- `tests/ts-hooks.mjs`: also resolves JSON imports that have no import attribute (Vite allows them; Node does not).
- `src/lib/data/photography.ts`: proper-noun casing now works on phrases, fixing "CN tower" → "CN Tower" (found by the new test).

### 2026-09-30 — Phase 3: complete environmental storytelling

- `src/lib/world/layout.ts`: five new stations (corkboard, lanyards/conference wall, mirror, window, door) with approach points, hitboxes, and focus points; three new curiosities (mug, suitcase, football); footprints for the armchair, plant, and suitcase; door hinge and opening angle.
- `src/lib/world/build.ts`: builders for the window (frame, Bengaluru skyline, gulmohar trees, purple Namma Metro line, sill plant), city lights, conference wall (five lanyards with badges, a talk poster), leaning mirror (stylised glass, no real reflection, per the brief), corkboard (photos, tickets, notes, poster, badge, pins), door frame with doormat and football scarf, hinge-local door slab, and decor (Superman mug, cables, armchair with headphones, book stack, floor lamp, tripod, suitcase with stickers, football). Rewrote the part of `buildDecor` that a truncated shell heredoc cut off.
- `src/lib/world/time.ts` (new): Bengaluru hour (Asia/Kolkata) and a five-phase sky palette. The window sky, city lights, and room light intensity are set on load and when the tab becomes visible again; nothing animates continuously.
- `src/lib/world/scene.ts`: builds the new objects into the merged meshes; separate meshes for the sky pane, city lights, and door (10 draw calls, 7,736 triangles); the door swings open as part of the station push-in tween and closes on release; `applySky` on load and visibility return.
- `src/lib/data/about.ts` (new): the About page's own words, shared by the mirror now and `/about` in Phase 4.
- `src/lib/data/now.ts` (new): "Right now" items derived from existing records (work, latest essay, 2026 talks, photo subjects, collection, Bengaluru) and `bengaluruTime()`. Reading and Thinking about are omitted (no source).
- `src/lib/data/sections.ts`: added the Now section (`/now`).
- `src/lib/data/room.ts`: five new stations (numbered 05–09) and three curiosity lines. The conference wall summary names events rather than cities, since DevRelCon Tokyo 2021 may have been online.
- `src/lib/components/world/StationPanel.svelte`: corkboard (community initiatives plus community programs from work, people-first: what and who, not numbers), conference wall (featured talks as badges, invite link), mirror (headline, portrait, intro, what I care about), window (current Bengaluru time and the Now list), door (email, socials, newsletter, Pexels, Collectr, sponsors).
- `src/lib/components/world/WorldView.svelte`: "Little things in the room" disclosure, so curiosities work by keyboard and without JavaScript.
- `src/routes/now/+page.svelte` (new): prerendered Now page; the Bengaluru time is filled in on the client.
- `src/routes/+layout.svelte`: V3 routes are now a named list and include `/now`.
- `src/routes/sitemap.xml/+server.ts`: added `/now`.
- `tests/movement.test.mjs`: time-of-day test (13 unit tests total).
- `tests/browser/world.spec.ts`: guide link count 4 → 9; every station opens from the guide; curiosity mug and the little-things list; `/now` renders and fills the time (13 browser tests total).
- `v3.md`: contract notes the time-of-day window and the door swing.
- Ran Prettier on the files above.

### 2026-09-30 — Phase 4: deep pages

- `src/app.css`: palette retokened to V3 (paper `#f8f5ed`, ink `#1f2620`, forest-green accent `#304e42` instead of V2's madder red), so any remaining utility classes (404/error pages) match. Added `--container` (1280px) and `--gutter`, plus `.v3-page` and `.v3-section` for deep pages.
- `src/app.html`: `theme-color` updated to the V3 paper colour.
- `src/routes/+layout.svelte`: rewritten. Every page gets `V3Header` (section nav everywhere except World and Index) and `V3Footer`; the V2 header/footer and page-enter animation are gone.
- `src/lib/components/V3Header.svelte`: identity links to `/` (preferred mode); optional section nav with `aria-current`; shared container width.
- `src/lib/components/V3Footer.svelte` (new): name and role, "two ways in" (room or Index), email, socials, newsletter, Now, Résumé.
- `src/lib/components/PageIntro.svelte` (new): eyebrow, h1, lede, and an "In the room: the …" link to `/world#<station>`.
- `src/lib/components/Row.svelte` (new): V3 list row (replaces V2 `IndexRow`).
- `src/lib/components/world/WorldView.svelte`: opens `/world#<station>` once the room is ready (or directly if WebGL failed); no longer renders its own header; uses the shared container.
- `src/lib/components/index/IndexView.svelte`, `src/routes/now/+page.svelte`: no longer render their own header; shared container.
- Rebuilt in V3 style, reusing Aditya's existing copy: `src/routes/work/+page.svelte` (themes with anchors and a table of contents), `projects` (anchors per project, why/outcome/built-with), `community` (people first: what, why, who, then impact; plus Appwrite community programs), `speaking` (badges, copyable bio with a live-region confirmation, full archive, `#podcasts`), `about` (from `about.ts`, including new "Beyond work"), `contact` (email, speaking invite, Elsewhere rows).
- New pages: `src/routes/writing/+page.svelte` (essays plus professional writing), `src/routes/photography/+page.svelte` (all 21 photos from the Pexels CDN with `srcset`, lazy below the fold), `src/routes/collection/+page.svelte` (Blastoise slab, Collectr showcase; no invented cards).
- Copy checked against sources: removed a line implying every photo was shot on the X-T30 II, a Claude-written joke in the Writing lede, an overclaim about what Collectr contains, a "Book a call" label on `/meet` (it is a meeting-room link, not a booking page), and a portrait caption asserting a location.
- `src/lib/data/sections.ts`: Writing, Photography, Collection now point on-site, so the room guide, stations, Index, and Now follow.
- `src/lib/data/about.ts`: added "Beyond work".
- `src/lib/data/site.ts`: removed `NavItem`/`primaryNav` (only the V2 header used them).
- `src/routes/sitemap.xml/+server.ts`: added `/writing`, `/photography`, `/collection`.
- Removed V2 components: `SiteHeader`, `SiteFooter`, `SectionHeader`, `IndexRow`, `ProjectCard`, `TalkCard`, `CommunityCard`, `ContactCTA`, `ExternalLink`.
- `/resume` intentionally stays a 302 to the PDF: it is an existing short link people share, and an HTML résumé would duplicate the PDF. Recorded in `v3.md`.
- `tests/browser/pages.spec.ts` (new): every deep page (status, h1, nav state, mode switch, no scene bundle), phone width, artifact anchors, "In the room" deep link, redirects with real status codes, sitemap coverage. 19 browser tests total.
- Ran Prettier on the files above; reverted its incidental changes to untouched files (`PageMeta`, `NotFound`, `+error`, `404`, `+layout.ts`).

### 2026-10-01 — Phase 5: launch readiness

- `.prettierrc`: `endOfLine: auto`. The long-standing `npm run lint` failure (47, later 22 files) was only CRLF line endings from `core.autocrlf=true` on Windows; with this, `npm run lint` (Prettier + ESLint) passes. No files were reformatted.
- `package.json`: added `@axe-core/playwright` 4.13.0 (dev, exact); scripts `assets` and `perf`. `package-lock.json` updated accordingly.
- `tests/browser/a11y.spec.ts` (new): axe WCAG 2.2 AA audits of every content page and the 404, the room, all nine station sheets (after the sheet's fade-in, which otherwise produces a false contrast failure), and the no-WebGL fallback. No violations.
- `scripts/derive-assets.mjs` (new): captures `static/room-still.jpg` (52 KB) and `og/room.jpg` (154 KB) from the running site with the Bengaluru clock pinned to daytime, and derives `static/aditya-480.webp` (9.5 KB) and `.jpg` (16.6 KB) from the 3280×3280, 1.26 MB portrait.
- `og/og.html`: redesigned for V3 (palette, adityaoberai.com, "Come spend a minute in my world.", WORLD / INDEX, the room). `static/og.png` re-rendered with `npm run og`. `og/README.md` documents the new steps.
- `src/lib/components/Portrait.svelte` (new): `<picture>` with the small WebP and JPEG fallback. Used by `IndexView`, `/about`, and the mirror panel. `/aditya.jpg` stays full size for `/pic`.
- `src/lib/components/world/WorldView.svelte`: the loading and failure states show the room still behind the message, so World never shows an empty box.
- `src/lib/data/site.ts`: canonical `url` and `ogImage` now use `https://adityaoberai.com`; added `portraitSmall`. Email unchanged.
- `src/lib/components/PageMeta.svelte`: OG image width/height/alt, `og:locale`, `twitter:site`, `og:type=profile` on `/about`, Person JSON-LD (escaped) on `/`, `/index`, `/about`.
- `static/robots.txt`: sitemap URL on the new domain.
- `vite.config.js`: `chunkSizeWarningLimit: 600` with a comment; the only chunk over 500 KB raw is the lazy scene, whose budget is tracked in `v3.md`.
- `scripts/perf.mjs` (new): performance proxy (phone viewport, 4× CPU throttle, software WebGL). Results recorded in `v3.md`; clearly not the real-phone gate.
- `v3.md`: new "Launch checklist" with what is done, the measured proxy, and what still needs Aditya or the host.
- Ran Prettier on the files above.

### 2026-10-01 — Full-page World with a floating menu (user request)

- User asked for the game to take the whole page, with the room's contents in a floating hamburger menu at the bottom right. Kept the WORLD / INDEX switch visible (brief requirement) and gave the button a label ("☰ In the room") so the list is discoverable.
- `src/lib/components/world/WorldView.svelte`: rewritten as a fixed, full-viewport stage. Canvas fills the screen (`touch-action: none`, since the page no longer scrolls). Floating transparent header, title, optional diagnostics; hint card bottom left; menu button bottom right. The station guide, little things, instructions, and settings (reset, low power, less motion) moved into a native `popover` menu, which works without JavaScript and stays in the SSR HTML. The menu is capped so it never covers the header switch. Picking a station closes the menu and returns focus to the menu button afterwards. Fallback and loading states are full-page with the room still behind a message card. Removed the scroll-into-view logic (nothing scrolls now).
- `src/lib/world/scene.ts`: `setInsets({ top, bottom })`; the frustum is sized and shifted so the room fits the space left by the overlays. WorldView measures the insets (title on top; hint and button at the bottom on narrow screens) with a ResizeObserver.
- `src/lib/components/V3Header.svelte`: `overlay` variant (transparent, full width).
- `src/routes/+layout.svelte`: World (`/world`, or `/` in world mode) is immersive, so the layout skips its own header and footer there.
- `tests/browser/world.spec.ts`: an `openMenu` helper; floor clicks use projected points instead of raw canvas fractions; focus now returns to the menu button; the no-JavaScript test opens the popover menu (declarative, no JS) before counting links; the phone test also asserts no vertical scroll. `tests/browser/a11y.spec.ts`: audits the open menu and opens it before each station.
- `scripts/derive-assets.mjs`: hides the new overlays when capturing. Regenerated `static/room-still.jpg` (69 KB, full-page framing), `og/room.jpg`, and the portrait copies (byte-identical). `og/og.html`: zooms the full-page capture so the room still fills the card; `static/og.png` re-rendered.
- `v3.md`: input contract and launch checklist describe the full-page layout and the menu.
- Re-ran `npm run perf` on the full-page room: FCP 312 ms, room ready 1.74 s (was 1.47 s with the smaller canvas), walking p50/p95 16.7 ms with one 100 ms spike, zero idle frames. `v3.md` numbers updated.
- Ran Prettier on the files above.

### 2026-10-01 — Focus on arrival, larger desktop room, E closes stations (user requests)

- User asked to "automatically enforce focus when someone joins": implemented as keyboard play working immediately. `src/lib/components/world/WorldView.svelte` focuses the canvas once the room is ready (`focusVisible: false`, `preventScroll`), unless something is already focused or a deep link opened a station. A window-level listener routes movement keys and E to the room when focus is on the page itself (not when a control is focused, the menu is open, or a station is open). Tab still leaves the room. Not applied to Index or deep pages.
- The room hint now names the controls for the device: keys on desktop ("WASD or arrows to walk", "Press E to look closer"), taps on touch screens.
- User asked for a much larger room on desktop: on wide screens WorldView reserves half the title height (the title sits left of the room's top) and `src/lib/world/scene.ts` fits 8.6 vertical units instead of 9.4 (`setInsets` gained a `units` field). On 1440×900 the room grew from ~540px to ~730px tall; checked at 1024×768, 1280×720, 1440×900, and 1920×1080 for title, hint, and menu-button clearance. Phone framing unchanged.
- User asked for E to close the station sheets as well: `closeOnE` on the dialog closes on E (ignores key repeat so holding E after opening doesn't close it; stops propagation so the closing E can't reach the room and reopen the station). The sheet shows "E or Esc to close" on keyboard devices.
- `tests/browser/world.spec.ts`: the E test now holds E (no instant close), closes with E, checks it does not reopen, and reopens with E; new tests for focus on arrival (keys work without a click, keys routed after focus drifts to the page, focused links keep focus) and for not stealing focus from a deep-linked station or on `/index`. 24 browser tests total.
- Regenerated `static/room-still.jpg` and `og/room.jpg` for the larger framing; `og/og.html` zoom lowered from 1.3 to 1.04 to match; `static/og.png` re-rendered.
- `v3.md`: input contract covers focus on arrival, key routing, E to close, and the desktop framing.
- Ran Prettier on the files above.

### 2026-10-01 — Lint fix after the focus commit

- `2db0f96` was committed with `npm run lint` failing: ESLint's `no-undef` rejected the `as FocusOptions` cast in `src/lib/components/world/WorldView.svelte` (I had read a blank `tail` line as a pass). Replaced the cast with a plain options object. Lint, type check, and the full test suite rerun below.

### 2026-10-01 — Configurable room content (user requests)

- User asked for all content in the world to be easily configurable, then for more customization of what each station shows. Everything World says and shows now comes from one typed file.
- `src/lib/data/world.ts` (new): page copy, stations (order = menu order and numbering; `hidden` switch), each station's panel as `title`, `lead`, stacked `blocks`, and `links`, plus curiosity notes. Blocks: `items` (styles list, pages, pins, badges, photos; ids and/or queries with `type`, `world`, `context`, `featured`, `offset`, `limit`; per-item `show`, `linkLabel`, `linkTo`, `heading`), `feature` (card or aside), `slab`, `profile`, `text`, `tags`, `list`, `facts`, `contact`, `links`. The header comment documents every option. Current content reproduces the previous panels (verified in the browser; the one difference is that the conference wall now shows all four talks marked featured in `talks.ts`, not a single one).
- `src/lib/data/room.ts`: rewritten as the resolver and validator. Numbers visible stations, resolves links (no `href` = section), picks artifacts, applies per-style defaults for `show` and `linkTo`, and throws with the station and block on unknown ids, empty queries, a `photos` block without images, unknown or duplicate stations, stations in the room with no content, or curiosities with no note. `stationById`/`panels` omit hidden stations, so deep-page "In the room" links and `/world#…` ignore them.
- `src/lib/components/world/StationPanel.svelte`: rewritten to render any panel from blocks; no copy left in it.
- `src/lib/components/world/WorldView.svelte`: all page copy (eyebrow, title, hints, menu title, footer, Index link, loading/failure) from the config; passes the visible station ids to the scene.
- `src/lib/world/scene.ts`: `stations` option; only visible stations are clickable, approachable (near ring, E), or openable.
- `src/lib/components/world/Slab.svelte`: optional `caption`.
- `src/routes/world/+page.svelte`: meta description from the config.
- `src/lib/data/artifacts.ts`: talk artifacts mirror `talks.ts` `featured` (four talks; the Index still starts with RenderATL) and carry `externalLabel` ("Watch the recording" / "See the slides").
- `scripts/content.mjs` (new) and `package.json` script `content`: lists artifact ids with titles, contexts, featured flags, worlds, and each station's blocks.
- `tests/content.test.mjs`: every visible station resolves to non-empty blocks with 01…n numbering; picks resolve ids and queries (offset, limit, dedupe, featured) and bad ids or empty queries throw with the station named. 15 unit tests.
- Verified by hand: a mistyped id makes `npm run build` fail with `src/lib/data/world.ts, station "desk", block 2 (feature): no artifact with id "…"`; temporarily hiding the mirror removed it from the menu (renumbered 01–08), made it unclickable, and removed the `/about` room link. Both edits were reverted.
- `v3.md`: new "Editing the room" section.
- Ran Prettier on the files above.

### 2026-10-01 — Appwrite Sites review (user question; read-only, nothing changed)

- User asked what it takes to go live on Appwrite Sites. Checked the existing "My Portfolio" site (`6882302f001b435a9646`) through the Appwrite MCP: SvelteKit, SSR, node-22, `npm install` / `npm run build`, output `./build`, production branch `main`, every branch deploys. `v3-world` already builds there (deployment `6abd89d5091931398edf` at `b8ed4c3`, ready, 35 s). The branch preview URL returns 401 to anonymous requests (org members only). Domains `oberai.dev`, `www.oberai.dev`, and the `*.appwrite.network` names serve V2 deployment `6aa7d3f0dc0c05bdc438`; `adityaoberai.com` is on GoDaddy DNS and not attached yet.
- Go-live steps recorded under Next steps. No Appwrite settings, domains, or DNS were changed.
- Found in the same project: the "Write My App" site (`6a109b4f00081ca682df`) stores `OPENAI_API_KEY` as a non-secret variable. Told the user to mark it Secret and rotate the key. Not this repo's code.

### 2026-10-01 — Solid furniture and an open doorway (user reports)

- User could walk through the chair and the lamp; the open door showed a wall behind it and swung into the character's head.
- `src/lib/world/layout.ts`: footprints are now rectangles with a centre, half sizes, and an `angle` (the model's Y rotation), so the angled desk chair and armchair are matched exactly. Added footprints for the desk chair, the tripod, the mirror's foot, the football, the book stack, and the floor lamp; the armchair's was smaller than the model and now matches it. Desk approach moved to `x 0.7` and notebook to `x 1.85` so both stand clear of the chair; door approach moved to `(-2.65, 2.4)` so the open door clears the head. The football moved next to the door, under the scarf (its note already said "by the door"; where it was, its footprint would have closed off the walk to the door). Its hit box moved with it.
- `src/lib/world/movement.ts`: footprint tests run in each footprint's own frame. Walking into furniture slides along the nearest edge; when a point is wedged where two footprints meet, it goes to the nearest free spot (a ring search). It never takes a free edge that is further away: that version teleported the character from the desk–chair gap to the far side of the desk, caught by the new no-jump test. New `isClear(a, b)` (segment vs footprint) and `route(from, to)`: a straight walk when clear, otherwise the shortest path via footprint corners (Dijkstra over ~50 points, about 0.1 ms per click).
- `src/lib/world/scene.ts`: click-to-walk follows `route` waypoints; keyboard, Escape, and reduced motion behave as before.
- `src/lib/world/build.ts`: the desk chair, armchair, book stack, floor lamp, tripod, and football are placed from their footprints. The left wall and its baseboard are split around a doorway the size of the door slab, with a threshold; behind it, a hallway (floor, runner, far wall with skirting and a framed print). The camera looks along -(9, 10, 12), so the hallway sits towards the back (-z) and its floor steps in at three depths; nothing pokes out past the front end of the wall. Verified in screenshots at 1440 and 820 px: door open shows the hallway and clears the head; door closed shows nothing through it.
- `tests/movement.test.mjs`: every footprint is solid and pushes out to a free spot; walking in 24 directions from the start and from every station never ends inside furniture or jumps more than a step; click-to-walk routes between every pair of stations are clear segment by segment, and the desk chair blocks the straight desk-to-notebook line. 18 unit tests.
- Regenerated `static/room-still.jpg`, `og/room.jpg`, and `static/og.png` (the football moved); portrait copies unchanged.
- `v3.md`: movement and layout notes updated (solid furniture, routing, the hallway).
- Validation: `npm run check` 0/0, `npm test` 18/18, `npm run test:e2e` 24/24, `npm run lint` exit 0.

### 2026-10-01 — HANDOVER.md renamed to WORKLOG.md (user request)

- The file is a status page plus a running change log, so "handover" undersold it. Renamed with `git mv` (history follows the file) and retitled "V3 work log".
- Updated the live references: `v3.md` (Phase 0 status, scope note, copy-review checklist item), and the comments in `src/lib/data/now.ts` and `src/lib/data/world.ts`. Earlier entries in this log still say `HANDOVER.md`; they describe what happened at the time and are left as written.
- Claude's saved working note now points to `WORKLOG.md`.

### 2026-10-01 — Favourite cards, a Squirtle plush, and a new Blastoise (user requests)

- User shared images of four favourite cards for the shelf, asked to replace the bed's plush with a Squirtle like their own (photo shared), and to improve the Blastoise on top of the shelf (photo of their Blastoise plush shared).
- Cards, identified from the images: Blastoise, Celebrations: Classic Collection 2/102; Squirtle (ゼニガメ) and Pikachu (ピカチュウ), Japanese Pokémon Card 151, 170/165 AR and 173/165 AR; Mew, Wizards Black Star Promos No. 9. The artwork is the Pokémon Company's; shown as Aditya's own collection.
- `assets/cards/*.png` (new): the four originals as supplied (400 to 600 px wide, 3 MB in total), kept so the images can be regenerated.
- `src/lib/data/collection.ts`: new `Card` type and `favouriteCards` (order = shelf order), `cardImage`, image size constants, `SHELF_SLOTS` (7), `shelfCards`, `SHELF_ATLAS`, `SHELF_CELL`. The old comment that the site "does not claim specific cards" is gone, since Aditya chose these.
- `scripts/derive-cards.mjs` (new) and `package.json` script `cards`: Playwright's Chromium canvas resizes and encodes `static/cards/<id>.webp` (400×559, 37 to 71 KB) and `static/cards/shelf.webp` (one row of 160×224 faces, 54 KB).
- `src/lib/data/artifacts.ts`: collectibles come from `favouriteCards` (ids `collectible-<card id>`, so `collectible-blastoise` is unchanged), with set and number as context, the image, and new `imageAlt`; they link to `/collection#<id>`.
- `src/lib/data/world.ts` / `room.ts`: new item style `cards` (images with name and set; defaults: context shown, no link) and its image check. The shelf panel shows the Blastoise slab with the real card and "Also on the shelf" with the other three; its lead mentions them.
- `src/lib/components/world/Slab.svelte`: shows the card image when given (with alt text); the CSS face remains for collectibles without one. Case widened to 200px. `StationPanel.svelte`: passes image, alt, and set/number caption to the slab; renders the `cards` style.
- `src/routes/collection/+page.svelte`: the slab shows the real Blastoise; new "A few favourites" section with every card (name, printed Japanese name marked `lang="ja"`, set and number, language, illustrator), each with an anchor.
- 3D: `Batch.picture` (new, `build.ts`) draws a plane mapped to one atlas cell. `buildCollection` takes a second batch for card faces; slabs are filled best-seen first (easel, its neighbour, the middle shelf, then the two slabs the shelf's side panel hides). `scene.ts` loads the atlas with `TextureLoader` after the room is up (sRGB, anisotropy up to 4) and shows the faces when it arrives; until then the slabs show plain card faces. One extra draw call; the texture is disposed with the room.
- `squirtle()` (new, `build.ts`): sky-blue plush with a big head, red eyes, a seamed cream belly plate, and a brown shell with a cream rim; replaces the Blastoise plush on the bed. Curiosity note now "Squirtle plush" (copy for review); the e2e test follows.
- `blastoise()` rebuilt after the plush photo: stocky sky-blue body, cream belly with a seam, black collar, wide head with an open red-and-pink mouth, slanted eyes, black ears, brown shell with a pale rim, splayed grey cannons with dark muzzles, white claws. Now only the shelf figure.
- `tests/content.test.mjs`: artifact count follows the card list; every card has its original, its WebP, and real alt text; the atlas is exactly one 160×224 cell per shelf card (catches a missed `npm run cards`). 19 unit tests.
- Regenerated `static/room-still.jpg`, `og/room.jpg`, `static/og.png`.
- `v3.md`: card editing notes, `cards` style, asset and perf numbers (12 draw calls, ~10.6k triangles, one 54 KB texture; room ready 2.0 to 2.4 s in the proxy, was 1.74 s; frame p95 16.8 ms).
- Verified in screenshots: panel and `/collection` at 1280 and 390 px, card textures on the shelf, the plush and figure close up. Validation: `npm run check` 0/0, `npm test` 19/19, `npm run test:e2e` 24/24, `npm run lint` exit 0.

### 2026-10-01 — Batman cowl, LEGO DeLorean, United flag, Premier League ball, shelf rows (user requests)

- User reported the Superman mug overlapping the keyboard and asked for a LEGO DeLorean instead (no mug), said Batman is the favourite DC character (shared a photo of their cowl), and asked for a Manchester United flag on a wall, then for the flag to use the club crest (image shared), the football to match a photo (Nike Premier League ball), the cowl to be big enough for a head, more detail on the DeLorean, and finally both moved to the shelf: the four cards in one row, the cowl and DeLorean in the next, books (list to come) in the one below.
- `src/lib/world/build.ts`:
  - Mug removed. `batmanCowl()` (new): gunmetal cowl with tall ears, white eye slits, cheek guards, on a foam display head with the lower face open; at scale 2.5 on the shelf, roughly a real head for the room's scale.
  - `legoDelorean()` (new): set 77256 as a low light-grey wedge with the black side stripe, black wheel arches and skirts, dark windscreen and windows, door seams, mirrors, hood studs, louvred nose with headlights and a trans-blue bar, the engine deck with louvres, black reactor with a glowing top and Mr. Fusion, roof lights, rear vents and exhausts, trans-blue time-circuit coils arching over the rear wheels and along the sills, grey-hubbed wheels, and the antenna with its ball.
  - `manUtdFlag()` (new): a red backing (shown until the texture loads), a textured picture of the flag, two pins; on the back wall above the right of the desk.
  - `premierLeagueBall()` (new): white ball with pixel-block bands in navy, blue, orange, and light blue, a navy panel, and a swoosh, placed on the side the camera sees. Replaces the black-patched football.
  - The scarf by the door is now United red, white, and black.
  - `buildCollection()` rebuilt by rows (boards moved to 0.05 / 0.45 / 0.93 / 1.70 / 2.28 so the cowl fits): four card slabs in a row (left to right in card order, set forward so the board above doesn't hide them; the easel is gone), the cowl at the back of the next row and the DeLorean in front (the camera looks from +z, so the tall cowl stands behind the low car), eleven placeholder book spines (`BOOKS`) below, binders and sealed boxes at the bottom. The yellow box from the old binder row was dropped.
- `src/lib/world/layout.ts`: `SHELF` (board centres; cowl and DeLorean placement) and `FLAG` (position, size, texture path and pixel size); curiosity ids are now plush, cowl, delorean, flag, suitcase, football, with hit boxes derived from `SHELF` and `FLAG`.
- `src/lib/world/scene.ts`: a `pictures(batch, url)` helper loads each texture after the room is up (card atlas and flag), shown when it arrives, disposed with the room. Curiosity picking now takes the nearest hit, not the first in the list (the DeLorean was reporting the cowl's note).
- `src/lib/data/collection.ts`: `SHELF_SLOTS` 7 → 4; comments point to `npm run images`.
- `scripts/derive-cards.mjs` → `scripts/derive-images.mjs`, npm script `cards` → `images`: also renders `static/room/flag.webp` (400×248, 14.5 KB): the crest from `assets/flag/manutd-crest.png` contain-fit at 80% height on the club's red. The crest was recovered from the session's own transcript (the chat attachment was not saved to disk) and saved as supplied (296×300 PNG with transparency). The crest is the club's; shown as Aditya's own flag. Card images regenerated byte-identical.
- `src/lib/data/world.ts`: curiosity notes for the cowl, DeLorean, and flag (copy for review); the football line now says "Premier League ball".
- Tests: `tests/content.test.mjs` checks the crest original and that the flag texture matches `FLAG.pixels` (20 unit tests). `tests/browser/world.spec.ts`: the little-things test clicks the cowl and checks the cowl and flag notes in the menu.
- Regenerated `static/room-still.jpg`, `og/room.jpg`, `static/og.png`.
- Verified in screenshots (shelf rows, cowl and DeLorean, flag, ball, scarf) and by clicking each new curiosity. Validation: `npm run check` 0/0, `npm test` 20/20, `npm run test:e2e` 24/24, `npm run lint` exit 0.

### 2026-10-01 — Desk and shelf swapped; a laptop instead of the monitor (user requests)

- User asked to rethink the room's layout, then specifically to swap the desk and the shelf, and to replace the monitor and keyboard with their laptop (Asus ROG Zephyrus G15).
- `src/lib/world/layout.ts`: new `DESK` (back-left corner against the left wall, facing the room; 1.6 × 0.8) and `LAPTOP` (size, base, lid, tilt, in the desk's frame). `SHELF` now places the whole shelf (back wall between the lanyards and the flag, x 0.75, turned to face the room) and puts the cowl and DeLorean in its own frame; new `onShelf()` maps shelf coordinates into the room, used for their hit boxes. The tall cowl now stands left of the car because the camera looks from the +x side. Footprints for the desk, chair, and shelf follow them; the mirror moved 0.1 towards the bed (its frame overlapped the new desk) and its station with it. Approaches: desk behind the chair `(-1.8, -2.1)`, notebook at the desk's front end `(-2.2, -1.15)`, window off to its right `(-1.45, -2.3)` (the chair blocked the old spot), shelf `(0.75, -1.95)`, mirror `(-2.75, -0.85)`.
- `src/lib/world/build.ts`: `zephyrusG15()` (new): Eclipse Gray chassis, black keyboard with white backlit rows, touchpad, the vent strip along the hinge, the lid leaning back with panels on its screen. `buildDesk()` rewritten in the desk's frame: the laptop in the middle with its charger cable, the lamp at the back end leaning over it, the notebook (scaled 0.85) at the front end, drawers underneath; the chair stays in the room's frame. Monitor, keyboard, and the old cables are gone. `buildCollection()` is drawn in the shelf's frame inside one transform; the four slabs are spaced to fit inside the side panels (they overlapped the far panel before).
- `src/lib/world/scene.ts`: the waking screen is now the laptop's display, placed through the same desk → laptop → lid transforms.
- Tests: `tests/movement.test.mjs` no longer assumes which two stations have furniture between them; it checks that every blocked straight line is routed around, and that the room has at least one. `tests/browser/world.spec.ts`: the walk-up test clicks the floor in front of the shelf's new spot. 20 unit tests, 24 e2e.
- Regenerated `static/room-still.jpg`, `og/room.jpg`, `static/og.png`. Verified in screenshots and by visiting every moved station (each stops at its approach and opens).

### 2026-10-01 — Bed and armchair swapped, mirror and camera cabinet swapped, tripod removed (user requests)

- `src/lib/world/layout.ts`: new `CABINET` (left wall beside the desk, facing the room), `MIRROR` (back wall, right corner, facing the room), and `BED` (right edge of the room, headboard at the back). Footprints follow: cabinet turned with it, mirror `edges(2.64, 3.46, -3, -2.62)`, bed `x 2.1 to 3.5`; the reading corner moved under the corkboard where the bed was (armchair `(-2.75, 1.0)` turned 0.55 to face the room, floor lamp `(-3.1, 0.3)` clear of the corkboard, book stack `(-2.0, 1.6)` clear of the corkboard's approach and the walk to the door). Tripod footprint removed. Stations: camera approach `(-2.5, -0.8)` with its hit box and focus on the cabinet; mirror approach `(3.05, -2.2)`. The plush's hit box follows the bed.
- `src/lib/world/build.ts`: `buildPhotography()` draws the old corner (cabinet, Fujifilm, strand of prints) as before and moves it as one piece onto the left wall, so the prints now hang above the cabinet there. `buildMirror()` uses `MIRROR` (leans back against the back wall). The bed and Squirtle use `BED.x`. The tripod is gone.
- Verified in screenshots and by visiting the camera, mirror, corkboard, door, and notebook stations (each stops at its approach and opens). Regenerated `static/room-still.jpg`, `og/room.jpg`, `static/og.png`. Validation: `npm run check` 0/0, `npm test` 20/20, `npm run test:e2e` 24/24, `npm run lint` exit 0.

### 2026-10-01 — Plant removed; camera cabinet, lanyards, and flag moved (user requests)

- User asked to remove the plant, move the camera cabinet to the left of the shelf and remove the "certificate" there (the talk poster under the lanyards), combine the lanyards with the corkboard, and put the Manchester United flag above the desk.
- `src/lib/world/layout.ts`: `CABINET` now `(-0.55, -2.7)` on the back wall, unturned; new `LANYARDS` (left wall, centred at z -0.575 just behind the corkboard, dropped 0.12 so its hooks meet the shared rail); `FLAG` gains `z` and `angle` and moves to the left wall above the desk `(-3.5, 2.3, -2.1)`, facing the room. Footprints: cabinet follows; `plant` removed. Stations: camera approach `(-0.55, -1.95)` with hit and focus on the cabinet; lanyards approach `(-2.6, -0.6)` with hit and focus on the wall beside the corkboard. The flag's hit box turns with it.
- `src/lib/world/build.ts`: `buildLanyards()` draws one rail along the top of the lanyards and the corkboard (z -1.28 to 1.68), and the lanyards as before, moved as one piece onto the left wall; the talk poster and the lanyards' own rail are gone. `manUtdFlag()` draws in a frame whose +z points out of the wall, so it can hang on any wall. The plant is gone. The photography corner keeps its prints above the cabinet on the back wall.
- Verified in screenshots and by visiting the camera, lanyards, corkboard, window, and desk stations. Regenerated `static/room-still.jpg`, `og/room.jpg`, `static/og.png`. Validation: `npm run check` 0/0, `npm test` 20/20, `npm run test:e2e` 24/24, `npm run lint` exit 0.

### 2026-10-01 — Camera cabinet moved to the right of the shelf (user request)

- `src/lib/world/layout.ts`: `CABINET` x -0.55 → 1.95, on the back wall between the shelf and the mirror (where the flag hung before); its prints move with it. The camera station's approach, hit box, and focus now derive from `CABINET.x`, so they follow it.
- Verified in screenshots and by visiting the camera, shelf, mirror, and window stations. Regenerated `static/room-still.jpg`, `og/room.jpg`, `static/og.png`. Validation: `npm run check` 0/0, `npm test` 20/20, `npm run test:e2e` 24/24, `npm run lint` exit 0.

### 2026-10-01 — Sofa and one board; suitcase and ball by the bed; the shelf's books and interests; seats; the window moved (user requests)

- User asked to: move the suitcase and football in front of the bed; replace the armchair with a sofa on a small rug against the wall under the corkboard and remove the floor lamp for now; widen the shelf panel to other interests; add six books to the shelf (The Godfather, Around the World in 80 Days, The Da Vinci Code, Animal Farm, The Myth of Sisyphus, The Killing Joke); explain the orange thing on the desk (the desk lamp) and drop the "stand" behind the laptop (the charger cable); combine the corkboard and conference wall; move the sofa away from the door, then leave a one-person gap from the desk; make the board reachable from the sofa and sit the character on the sofa when it opens; take the books off the floor; explain the dark thing on the sofa (headphones); move the window between the desk and the shelf; and sit the character on the chair when the laptop opens.
- `src/lib/world/layout.ts`:
  - Footprints: `sofa` (two-seater along the left wall, z -0.7 to 0.8, a one-person gap from the desk's front end at -1.3); `suitcase` `(2.45, 2.6)` turned -0.25 and `football` `(3.05, 2.3)` at the foot of the bed; `armchair`, `floorLamp`, and `books` removed. Curiosity hit boxes for the suitcase and ball derive from their footprints.
  - `BOARD` (new): one corkboard 2.5 wide centred over the sofa; `LANYARDS` re-centred on its half nearer the desk and brought forward of the cork.
  - `StationLayout.seat` (new, `Seat`): where the character sits while a station is open (floor point, facing, lift). The desk's seat is on the chair facing the laptop; the corkboard's on the sofa cushion nearer the room, facing out. Corkboard approach moved to the front of the sofa `(-2.3, 0.05)`; its hit box and focus span the whole board. The lanyards station keeps a free approach `(-2.1, -0.75)` but is hidden (below).
  - Window station: centre x -2.2 → -1.25 (between the desk corner and the shelf); approach `(-1.25, -2.3)`.
- `src/lib/world/build.ts`:
  - `twoSeatSofa()` (new): terracotta frame, cream seat cushions, tilted back cushions, a green throw cushion. A small sage-and-cream rug under it. The armchair, its headphones, the floor lamp, and the floor book stack are gone.
  - The suitcase is drawn in its own frame at its footprint.
  - Shelf row 3: Aditya's six books from `src/lib/data/books.ts` (new: title, author, spine and band colours after well-known covers, height, thickness), centred between two bookends; the placeholder spines are gone.
  - Desk lamp rebuilt as an angled-arm lamp (dark base, two-part arm, shade opening downwards, warm bulb); the charger cable behind the laptop is gone.
  - `buildCorkboard()`: one wide board from `BOARD`; its pinned notes and photos keep their arrangement on the half nearer the door. The rail spans the board; the lanyards hang on the half nearer the desk.
  - The window art (frame, skyline, trees, metro line, sill and its plant) and the city lights are drawn where they were and moved as one piece to `WINDOW.x` -1.25.
- `src/lib/world/scene.ts`: `sit()`, `standUp()`, `pose()`. Inspecting a station with a seat seats the character (lifted, turned, legs straight out like a minifigure, shadow hidden); closing it, resetting, walking, or clicking to walk stands it up at the approach. The per-frame leg animation keeps the seated pose.
- `src/lib/data/world.ts`:
  - Shelf station renamed "Shelf of favourites" (short "shelf"); summary and lead name Pokémon cards, Batman, Back to the Future, and the books; blocks: the Blastoise slab, "More favourite cards", "Other favourites" (Batman, Back to the Future, Manchester United), and "Books on the shelf" (titles with authors, from `books.ts`).
  - Corkboard station: area "Community & speaking"; the panel adds the talk count, the featured lanyards ("Lanyards from the road"), and the speaking links. The lanyards station is `hidden: true` (it stays in the room as part of the board). The football's note says "at the foot of the bed".
- `src/routes/speaking/+page.svelte`: its "In the room" link goes to the corkboard.
- Tests: `tests/content.test.mjs` compares configured (not just visible) stations with the layout; `tests/movement.test.mjs` checks seats are on furniture and standing up lands somewhere free (21 unit tests). E2E: the station lists and the no-WebGL link count (8) follow the hidden lanyards station and the shelf's new short name; the Speaking link test opens `/world#corkboard`.
- Verified in screenshots (sofa, board, books, lamp, foot of the bed, both seated poses, window) and by visiting each changed station. Regenerated `static/room-still.jpg`, `og/room.jpg`, `static/og.png`. Validation: `npm run check` 0/0, `npm test` 21/21, `npm run test:e2e` 24/24, `npm run lint` exit 0.

### 2026-10-02 — The character's reflection in the mirror (user request)

- User asked for a simple reflection of the person in the mirror.
- `src/lib/world/layout.ts`: `MIRROR` gains `lean` and `glass` (the pane in the mirror's frame: front surface, centre height, size), shared by the model and the reflection. The mirror's approach moves from `(3.05, -2.2)` to `(2.5, -2.05)`: the camera looks at the glass from the right, so from the old spot the reflection fell off the glass's right edge; from the new one it is centred, and the spot stays clear of the camera cabinet.
- `src/lib/world/build.ts`: `buildMirror()` draws the glass from `MIRROR.glass` and leans by `MIRROR.lean` (same look as before).
- `src/lib/world/scene.ts`: the reflection.
  - The character's body and legs and the two lights also sit on layer 1.
  - A second orthographic camera looks along the room camera's view direction reflected in the glass. It never moves, because the room camera never turns. Its frustum is fitted to the glass, and where the glass corners fall in it are the overlay's texture coordinates.
  - On frames where some of the character could show in the glass, it renders layer 1 (only the character) into a multisampled texture 512 px tall, cleared to transparent. A plane just in front of the glass, under the glare streaks, shows the texture with premultiplied blending, at 82% with a slightly cool tint. On other frames the pass is skipped and the plane hidden.
  - The room itself isn't reflected. The render target is disposed with the room.
- Tests: `tests/movement.test.mjs` checks that, standing at the mirror, the feet, the top of the hair, and both sides of the body are reflected inside the glass (22 unit tests). It fails with the old approach point.
- Verified in screenshots:
  - At the mirror (sheet open and closed), the reflection shows the character's face, glasses, and front, while the real character has its back to the camera.
  - Walking sideways, it turns to a profile, slides, and is cut cleanly at the glass edge.
  - Walking away, it disappears and leaves nothing on the glass.
  - No console errors.
- The room still and OG images are unchanged, because the character isn't in the mirror from the start point. Not re-measured: `npm run perf` walks away from the mirror, where the extra pass doesn't run.
- Validation: `npm run check` 0/0, `npm test` 22/22, `npm run test:e2e` 24/24, `npm run lint` exit 0.
