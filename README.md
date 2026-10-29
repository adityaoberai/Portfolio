# adityaoberai.com

Aditya Oberai's portfolio, live at [adityaoberai.com](https://adityaoberai.com).

The home page is **My room**: a small 3D bedroom you can walk around, where each object opens a part of the site (the desk for work, the notebook for writing, the shelf for the Pokémon collection). **On paper** (`/index`) presents the same content as a conventional page. Deep pages such as `/work`, `/speaking`, and `/writing` work without the room.

## Stack

- SvelteKit 2, Svelte 5, TypeScript, Tailwind CSS 4
- Three.js for the room, loaded only where the room is shown
- `@sveltejs/adapter-node`: `/` is rendered on the server from the visitor's `mode` cookie, so it opens in the mode they last chose. Most other pages are prerendered.
- Hosted on Appwrite Sites, with Appwrite Analytics for events

## Getting started

Use Node.js 24, as recorded in `.node-version` and used by CI. The package requires Node 22.18 or later so the unit tests can import TypeScript directly.

```bash
npm install
npm run dev
```

Open http://localhost:5173. Local development doesn't need any environment variables.

## Scripts

| Command                         | What it does                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`                   | Start the development server                                                    |
| `npm run build`                 | Build for production into `build/`                                              |
| `npm start` / `npm run preview` | Serve the production build with Node                                            |
| `npm run check`                 | Type-check with svelte-check                                                    |
| `npm run lint`                  | Check formatting with Prettier and run ESLint                                   |
| `npm run format`                | Format everything with Prettier                                                 |
| `npm test`                      | Run the unit tests (movement, content, journey)                                 |
| `npm run test:e2e`              | Run the Playwright browser tests against the production build                   |
| `npm run audit`                 | Fail on any dependency advisory not documented in `docs/maintenance.md`         |
| `npm run content`               | List every artifact id and each room station's blocks                           |
| `npm run images`                | Derive card images, the shelf atlas, and the flag texture from `assets/`        |
| `npm run assets`                | Capture the room still, share-image photo, and resized portrait from the server |
| `npm run og`                    | Render the share image (see [og/README.md](og/README.md))                       |
| `npm run perf`                  | Measure a performance proxy for the room (no substitute for a real-phone test)  |

`npm run assets` and `npm run perf` need the production server running in another terminal (`npm run build && npm start`). Both use the server's default URL, `http://127.0.0.1:3000`. If you set a different `PORT`, pass its URL as `BASE` when running either script, for example `BASE=http://127.0.0.1:4173 npm run perf`.

## Tests

The browser tests start the built server on `127.0.0.1:4173`, so build first:

```bash
npx playwright install chromium   # once
npm run build
npm run test:e2e
```

They cover movement, panels, mobile layouts, music, mode switching, analytics events, and axe accessibility scans using the WCAG 2.2 AA tags. To use a different Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE`; it then renders WebGL in software.

GitHub Actions runs lint, type checking, unit tests, the dependency audit, the production build, and the browser suite for pull requests and pushes to `main`. A dependency finding of any severity fails CI unless it is a documented exception in [docs/maintenance.md](docs/maintenance.md).

## Project layout

```
src/
  routes/          pages; / chooses My room or On paper, /world and /index set the choice
  lib/data/        content: work, projects, talks, writing, photography, collection, and more
  lib/data/world.ts  everything the room says and shows
  lib/world/       the 3D room: layout, objects, movement, camera, time of day
  lib/components/  shared UI, plus the room's and On paper's own components
  lib/server/      the mode cookie
assets/            originals for derived images (cards, flag)
static/            served as-is, including derived images and the share image
og/                share image source
scripts/           content and asset tooling
tests/             unit tests; tests/browser/ holds the Playwright suite
```

## Editing content

Facts live in their own files under `src/lib/data/`. The room and On paper both read from them, so a change shows up in both. `src/lib/data/world.ts` only selects and frames that content for the room: station panels, hints, menu labels, and the curiosities' lines. The header of `world.ts` documents every option, and [docs/room.md](docs/room.md) covers cards and textures.

Run `npm run content` to see the ids you can reference. Unknown ids, empty queries, and missing stations fail `npm run build` and `npm test`, so a broken reference can't ship as an empty panel.

## Deployment

Appwrite Sites builds this repository with SvelteKit SSR. On any other Node host, run `npm run build`, then `npm start` with `HOST`, `PORT`, and `ORIGIN` set (for example, `ORIGIN=https://adityaoberai.com`). The output needs a Node runtime and the production dependencies; it can't be uploaded to a static host.

## Further reading

- [docs/room.md](docs/room.md): how the room is built, its rendering budget, input rules, and the real-phone test
- [WORKLOG.md](WORKLOG.md): current maintenance notes and open items
- [docs/maintenance.md](docs/maintenance.md): dependency findings and upgrade follow-up
- [docs/analytics.md](docs/analytics.md): analytics events and how to add more
- [og/README.md](og/README.md): regenerating the share image
