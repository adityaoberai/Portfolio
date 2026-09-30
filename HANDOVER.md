# V3 handover

## Working agreement

- Work exclusively on `v3-world`; do not modify `main`.
- Update this file after every implementation or configuration change.
- Start with Phase 0: audit, renderer/deployment decisions, and a small playable spike. Real-phone testing is required before expanding the room.
- Source brief: user attachment, adityaoberai.com V3 (2026-09-30).
- Full requirements and execution decisions live in root `v3.md`.

## Current state (verified 2026-10-01)

- Branch: `v3-world`, based on `12cbe80`. One commit per phase: Phase 0 `f85cdaf`, Phase 1 `2e6ceee`, Phase 2 `298269e`, Phase 3 `e71d7cc`, Phase 4 `9b8afb4`, Phase 5 `4b772bd`, then a full-page World follow-up (this state). `main` is untouched. Nothing is pushed to the remote.
- Stack: SvelteKit 2.70, Svelte 5.57, TypeScript, Tailwind 4, **adapter-node 5.5.7** (replaced adapter-static), Three.js 0.186.1.
- `/world` has all nine stations from the brief (desk & computer, notebook & fountain pen, Fujifilm X-T30 II, Pokémon shelf, corkboard, conference wall, mirror, window, door) and four curiosities (Blastoise plush, Superman mug, suitcase, football), plus decoration (reading corner, tripod, prints, lamp). The window follows Bengaluru time. `/now` exists. `/index` is SSR and never loads the scene.
- `/` renders World or Index on the server from the `mode` cookie (default World). `/world` and `/index` set it.
- World is the whole page: full-viewport room, floating header (WORLD / INDEX), and an "In the room" menu button bottom right that opens the station list, curiosities, and settings.
- Every page is V3 now: one header (WORLD / INDEX switch everywhere, section nav on deep pages), one footer, one container width. Deep pages: `/work`, `/projects`, `/speaking`, `/writing`, `/community`, `/photography`, `/collection`, `/about`, `/contact`, `/now`; `/resume` stays a PDF redirect. All V2 components are gone.
- Validation: `npm run check` 0/0, `npm test` 13/13, `npm run test:e2e` 22/22 (including axe WCAG 2.2 AA audits) against the built Node server, `npm run lint` passes. 10–11 draw calls, ~7.8k triangles. Launch checklist and measured performance proxy: `v3.md`, "Launch checklist".
- Blocked on the user: deployment host choice, a physical mid-range phone test (see the gate in `v3.md`), analytics decision, and copy review.

## Open review items (not yet fixed)

- Copy written by Claude, not Aditya, needs his review before launch: the four curiosity lines in `src/lib/data/room.ts` (the suitcase line names Yokohama, London, Toronto, Atlanta, inferred from talks and photos; the football line is invented flavour), and the station summaries.
- `src/lib/data/now.ts`: "Reading" and "Thinking about" are left out because there is no source for them; Aditya should supply them. `now.updated` is a manual date and must change whenever the page changes.
- `npm audit`: 3 low findings in the SvelteKit/cookie chain; only `--force` resolves them.
- Google Analytics (existing V2 tag in `src/routes/+layout.svelte`) is 160 KB of third-party JavaScript on every page, more than all first-party JavaScript on Index. Keep, defer, or replace: Aditya's call.

## Next steps

1. User: run the real-phone gate in `v3.md` and record results here.
2. User: choose a host. If Appwrite Sites, confirm with a preview deployment that its SvelteKit SSR build works with adapter-node, or switch to the adapter it expects.
3. User: review the Claude-written copy (open items above) and supply Now's Reading / Thinking about.
4. User: decide on analytics.
5. When a host is chosen: deploy with `ORIGIN=https://adityaoberai.com`, then plan the oberai.dev redirect (see `v3.md`; Appwrite domain redirects drop paths).

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
