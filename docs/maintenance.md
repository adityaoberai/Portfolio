# Dependency maintenance

Last reviewed: 28 October 2026, using a clean install of `package-lock.json`.

`npm audit` reports seven affected packages, all low severity, from four underlying advisories. There are no moderate, high, or critical findings. CI uses `npm audit --audit-level=moderate` so the known low findings remain visible while more severe findings fail the check.

| Advisory                                                                 | Dependency                                                                     | Exposure in this repository                                                                                                                    | Follow-up                                                                                                      |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [GHSA-pfhg-q3qv-9q6r](https://github.com/advisories/GHSA-pfhg-q3qv-9q6r) | SvelteKit 2                                                                    | The affected enhanced form actions are not used.                                                                                               | Upgrade to SvelteKit 3 in a dedicated framework migration.                                                     |
| [GHSA-27mw-82g8-phjj](https://github.com/advisories/GHSA-27mw-82g8-phjj) | SvelteKit 2                                                                    | The site does not prerender untrusted cache-control headers. Its only explicit cache-control value is fixed, on the server-rendered home page. | Include in the SvelteKit 3 migration.                                                                          |
| [GHSA-pxg6-pf52-xh8x](https://github.com/advisories/GHSA-pxg6-pf52-xh8x) | `cookie` 0.6, via SvelteKit                                                    | The mode cookie has a fixed name and path; its options do not come from visitor input.                                                         | Include in the SvelteKit 3 migration.                                                                          |
| [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) | `deepmerge` 4.3.1, via the Svelte Vite plugin and Rollup's node-resolve plugin | Used by build tooling. This repository does not pass visitor-supplied objects to these merge operations.                                       | No patched version is currently published. Recheck upstream and the tooling dependency chain before upgrading. |

The seven package entries include transitive effects on the adapter and Vite plugins; they are not seven distinct advisories. The exposure notes describe the current code and should be revisited when adding form actions, dynamic headers, cookies, or build plugins.

## Framework migration

Prepare and validate SvelteKit 3 with compatible versions of Vite, the Svelte Vite plugin, adapter-node, and TypeScript as one change. Rerun the complete CI suite, then check the Appwrite Sites preview, mode-cookie behavior, redirect status codes, WebGL fallback, and the physical-device checks in [room.md](room.md). Reassess `deepmerge` after resolving that dependency tree; a framework upgrade alone is not proof that its advisory is gone.

Do not run `npm audit fix --force` as a cleanup shortcut: it proposes major framework changes that need deployment and browser validation.
