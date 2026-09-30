# V3 handover

## Working agreement

- Work exclusively on `v3-world`; do not modify `main`.
- Update this file after every implementation or configuration change.
- Start with Phase 0: audit, renderer/deployment decisions, and a small playable spike. Real-phone testing is required before expanding the room.
- Source brief: user attachment, adityaoberai.com V3 (2026-09-30).
- Full requirements and execution decisions live in root `v3.md`.

## Current state (verified 2026-09-30)

- Branch: `v3-world`, based on `12cbe80`. One commit per phase: Phase 0 `f85cdaf`, Phase 1 (this state). `main` is untouched. Nothing is pushed to the remote.
- Stack: SvelteKit 2.70, Svelte 5.57, TypeScript, Tailwind 4, **adapter-node 5.5.7** (replaced adapter-static), Three.js 0.186.1.
- Phase 1 vertical slice: `/world` has four inspectable stations (desk & computer, notebook & fountain pen, Fujifilm X-T30 II, Pokémon shelf) and one curiosity (Blastoise plush). Camera pushes in toward an open station. `/index` is SSR and never loads the scene.
- `/` is still the V2 homepage. Cookie-based mode selection is Phase 2.
- Validation: `npm run check` 0/0, `npm test` 8/8, `npm run test:e2e` 7/7 against the built Node server. Scene chunk 137 KB gzip (545 KB raw); 7 draw calls, 3,132 triangles at rest.
- Blocked on the user: deployment host choice and a physical mid-range phone test (see the gate in `v3.md`).

## Open review items (not yet fixed)

- `/world` and `/index` are not in `sitemap.xml`. Add them when `/` switches modes (Phase 2).
- Curiosity copy ("A Blastoise plush. The one on the shelf has competition.") is written by Claude, not Aditya. Review all curiosity lines in `src/lib/data/room.ts` before launch.
- `npm run lint` fails on 47 untouched legacy files (Prettier). Not V3 work; don't reformat the repo as part of a feature change.
- `npm audit`: 3 low findings in the SvelteKit/cookie chain; only `--force` resolves them.

## Next steps

1. User: run the real-phone gate in `v3.md` and record results here.
2. User: choose a host. If Appwrite Sites, confirm with a preview deployment that its SvelteKit SSR build works with adapter-node, or switch to the adapter it expects.
3. Phase 2: cookie mode selection at `/`, shared artifact model across World and Index. The user directed work to continue through Phases 1–5 before the phone gate; the gate still blocks milestone #10.

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
