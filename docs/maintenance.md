# Dependency maintenance

Last reviewed: 29 October 2026, using a clean install of `package-lock.json`.

## Audit policy

CI runs `npm run audit` at the strictest level: a finding of any severity fails the check, including low and informational ones, unless its advisory is one of the exceptions below. [`scripts/audit.mjs`](../scripts/audit.mjs) holds the same list and enforces it:

- An exception holds only at the severity it was triaged at. If GitHub re-scores the advisory, CI fails until it is triaged again.
- CI also fails when `npm audit` no longer reports an exception. Remove it from the script and from this page in the change that fixes it.
- Fix a finding when a compatible patch exists, with an `overrides` entry if a dependency has not adopted the patch yet. Add an exception only when there is no fix, together with an exposure note.

## Exceptions

`npm audit` reports six affected packages, all low severity, from three advisories. The other packages are flagged because they depend on one of these; they are not separate advisories.

| Advisory                                                                 | Dependency                                                                                            | Exposure in this repository                                                                                          | Follow-up                                                                                                                                                                     |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GHSA-pfhg-q3qv-9q6r](https://github.com/advisories/GHSA-pfhg-q3qv-9q6r) | SvelteKit 2                                                                                           | The site has no form actions and does not use `use:enhance`.                                                         | Fixed in SvelteKit 3; see [Framework migration](#framework-migration).                                                                                                        |
| [GHSA-27mw-82g8-phjj](https://github.com/advisories/GHSA-27mw-82g8-phjj) | SvelteKit 2                                                                                           | No prerendered page sets a cache-control header. The only explicit value is fixed, on the server-rendered home page. | Fixed in SvelteKit 3.                                                                                                                                                         |
| [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) | `deepmerge` 4.3.1, via the Svelte Vite plugin and Rollup's node-resolve plugin (used by adapter-node) | Build tooling only: it merges this repository's own configuration and is not in the server bundle.                   | No patched release exists; 4.3.1 (March 2023) is the latest. The latest Svelte Vite plugin, 7.3.1, still depends on it, so SvelteKit 3 will not clear this. Recheck upstream. |

The exposure notes describe the current code. Revisit them when adding form actions, dynamic headers, cookies, or build plugins.

## Fixed with an override

[GHSA-pxg6-pf52-xh8x](https://github.com/advisories/GHSA-pxg6-pf52-xh8x) affects `cookie` before 0.7.0. SvelteKit 2 still requests `cookie` 0.6, so `package.json` overrides `cookie@<0.7.0` to 0.7.2. That release adds the advisory's name, path, and domain validation and keeps the `parse` and `serialize` API SvelteKit uses; the mode cookie (`mode`, path `/`, no domain) passes the new validation. The override only matches `cookie` below 0.7, so it has no effect on SvelteKit 3, which uses `cookie` 2. Remove it during that migration.

## Framework migration

SvelteKit 3 fixes both SvelteKit advisories. Version 3.1.0 needs Vite 8, TypeScript 6, the Svelte Vite plugin 7, and Svelte 5.57.1 or later; adapter-node 6 is the matching adapter. The repository's Node 22.18 minimum already meets its requirement. Prepare and validate these as one change. Rerun the complete CI suite, then check the Appwrite Sites preview, mode-cookie behavior, redirect status codes, WebGL fallback, and the physical-device checks in [room.md](room.md). Afterwards, remove the two SvelteKit exceptions and the `cookie` override, and reassess `deepmerge` against the resolved dependency tree.

Do not run `npm audit fix --force` as a cleanup shortcut: it proposes major framework changes that need deployment and browser validation. Despite what it reports, it would not resolve `deepmerge` either.
