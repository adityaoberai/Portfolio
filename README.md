# adityaoberai.com

Aditya Oberai's portfolio, live at [adityaoberai.com](https://adityaoberai.com).

The home page is **My room**: a small 3D bedroom you can walk around, where each object opens a part of the site (the desk for work, the notebook for writing, the shelf for the Pokémon collection). **On paper** (`/index`) presents the same content as a conventional page. Deep pages such as `/work`, `/speaking`, and `/writing` work without the room.

## Stack

- SvelteKit 2, Svelte 5, TypeScript, Tailwind CSS 4
- Three.js for the room, loaded only where the room is shown
- `@sveltejs/adapter-node`: `/` serves the welcome dialog or the visitor's saved view from their `mode` cookie. Most other pages are prerendered.
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
| `npm run test:sitemap`          | Check sitemap coverage, XML, robots discovery, and canonical page responses     |
| `npm run sitemap:update`        | Regenerate static/sitemap.xml from the current public routes                    |
| `npm run sitemap:check`         | Fail if the generated sitemap is missing or stale                               |
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

GitHub Actions runs lint, type checking, unit tests, the dependency audit, the production build, sitemap checks, and the browser suite for pull requests and pushes to `main`. Sitemap checks have their own named step; the remaining browser step excludes their `@sitemap` tag so they run once. A dependency finding of any severity fails CI unless it is a documented exception in [docs/maintenance.md](docs/maintenance.md).

## Sitemap

[`/sitemap.xml`](https://adityaoberai.com/sitemap.xml) is generated into `static/sitemap.xml` from the current page routes by `scripts/sitemap.mjs` and advertised in `static/robots.txt`. Every `npm run build` runs the update automatically. After adding or removing a public page, run `npm run sitemap:update` and commit the regenerated file. `npm run sitemap:check` verifies freshness without changing it; CI runs this before the build so a stale committed sitemap cannot pass by being regenerated silently.

CI checks static page routes and reads the project and talk detail links from their listing pages. It compares these with the sitemap and verifies the XML, production hostname, robots declaration, successful HTTP responses, canonical URLs, and indexability. `/404` is excluded with `noindex`. `/world` is a usable alias whose canonical is `/`. Declare new aliases in `src/lib/data/canonical.ts` and add an independent expectation to the browser check. Run `npm run build && npm run test:sitemap` locally to verify a change.

## Search and answer discovery

The welcome dialog includes the introduction and links to `/world` and `/index` in the initial HTML. The index links to the portfolio pages. The longer biography lives in the mirror and on `/about`. Search metadata and crawlable links follow [Google's SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

`/about` uses `ProfilePage` and shares a stable `Person` ID with project, talk, and writing metadata. Edit the career dates, recognition, and public profiles in `src/lib/data/profile.ts`. Each project or talk with a `detail` record in `src/lib/data/projects.ts` or `src/lib/data/talks.ts` gets a prerendered page, a listing link, and a sitemap entry. Keep its slug stable and add sources for claims, outcomes, and co-speaker credits.

[`/llms.txt`](https://adityaoberai.com/llms.txt) is a plain-text Markdown directory and [`/llms-full.txt`](https://adityaoberai.com/llms-full.txt) is a fuller portfolio export. Both are generated from the site data at build time. Pages advertise the directory with `rel="describedby"`. The writing entries link to the original publications. Edit the shared records when facts change.

The discovery browser checks exercise the homepage with JavaScript disabled, verify canonical metadata and authorship, and check the text exports and the notebook's writing links. After deployment, use [Search Console URL Inspection](https://support.google.com/webmasters/answer/9012289) to verify the canonical pages. Review Appwrite Analytics traffic by source and landing page. ChatGPT Search links use `utm_source=chatgpt.com` ([OpenAI publisher FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)). Ask an assistant with web search about a named project or talk and check which source it cites.

## Project layout

```
src/
  routes/          pages; / welcomes new visitors, /world and /index save their preferred view
  lib/data/        content: work, projects, talks, writing, photography, collection, and more
  lib/data/world.ts  everything the room says and shows
  lib/world/       the 3D room: layout, objects, movement, camera, time of day
  lib/components/  shared UI, plus the room's and On paper's own components
  lib/server/      mode preference and the generated plain-text portfolio
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
- [docs/redirects.md](docs/redirects.md): old-domain page and file mappings for the domain setup
- [og/README.md](og/README.md): regenerating the share image
