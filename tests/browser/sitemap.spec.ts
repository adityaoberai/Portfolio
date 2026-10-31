import { readdirSync } from 'node:fs';
import { sep } from 'node:path';
import { test, expect } from '@playwright/test';
import { site } from '../../src/lib/data/site';

const namespace = 'http://www.sitemaps.org/schemas/sitemap/0.9';
// Keep expectations independent of the generator and its canonical policy.
// Exclusions must be noindex pages or declare a healthy, listed canonical target.
const noindex = ['/404'];
const aliases: Record<string, string> = { '/world': '/' };
const excluded = [...noindex, ...Object.keys(aliases)];

test(
	'sitemap matches public routes and links to healthy canonical pages',
	{
		tag: '@sitemap'
	},
	async ({ page, request }) => {
		// Discover routes independently of the generated sitemap and its update script.
		const paths = readdirSync(new URL('../../src/routes/', import.meta.url), {
			recursive: true,
			encoding: 'utf8'
		})
			.map((file) => file.split(sep).join('/'))
			.filter((file) => file === '+page.svelte' || file.endsWith('/+page.svelte'))
			.map((file) => {
				const segments = file
					.split('/')
					.slice(0, -1)
					.filter((part) => !/^\(.*\)$/.test(part));
				if (segments.some((part) => part.includes('[')))
					throw new Error(`Add concrete sitemap URL coverage for the parameterized route ${file}`);
				return `/${segments.join('/')}`;
			});
		for (const path of excluded) expect(paths, `Stale sitemap exclusion: ${path}`).toContain(path);
		const expected = paths
			.filter((path) => !excluded.includes(path))
			.map((path) => `${site.url}${path}`);

		const response = await request.get('/sitemap.xml', { maxRedirects: 0 });
		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toMatch(/^(application|text)\/xml(?:;|$)/i);
		const parsed = await page.evaluate(
			({ xml, namespace }) => {
				const document = new DOMParser().parseFromString(xml, 'application/xml');
				return {
					error: document.querySelector('parsererror')?.textContent ?? null,
					root: document.documentElement.localName,
					namespace: document.documentElement.namespaceURI,
					entries: Array.from(document.documentElement.children).map((entry) => ({
						name: entry.localName,
						namespace: entry.namespaceURI,
						locations: Array.from(entry.children)
							.filter((node) => node.localName === 'loc' && node.namespaceURI === namespace)
							.map((node) => node.textContent?.trim() ?? '')
					}))
				};
			},
			{ xml: await response.text(), namespace }
		);
		expect(parsed.error, 'Sitemap must be well-formed XML').toBeNull();
		expect(parsed.root).toBe('urlset');
		expect(parsed.namespace).toBe(namespace);
		for (const entry of parsed.entries) {
			expect(entry.name).toBe('url');
			expect(entry.namespace).toBe(namespace);
			expect(entry.locations).toHaveLength(1);
		}
		const locations = parsed.entries.flatMap((entry) => entry.locations);
		expect(locations.sort(), 'Update sitemap.xml when public routes are added or removed').toEqual(
			expected.sort()
		);

		const robots = await request.get('/robots.txt', { maxRedirects: 0 });
		expect(robots.status()).toBe(200);
		const advertised = (await robots.text())
			.split(/\r?\n/)
			.filter((line) => /^sitemap\s*:/i.test(line))
			.map((line) => line.replace(/^sitemap\s*:\s*/i, '').trim());
		expect(advertised).toContain(`${site.url}/sitemap.xml`);

		for (const url of [...locations, ...excluded.map((path) => `${site.url}${path}`)]) {
			const target = await request.get(new URL(url).pathname, { maxRedirects: 0 });
			expect(target.status(), url).toBe(200);
			expect(target.headers()['content-type'], url).toMatch(/^text\/html(?:;|$)/i);
			const metadata = await page.evaluate(
				(html) => {
					const document = new DOMParser().parseFromString(html, 'text/html');
					return {
						canonicals: Array.from(document.querySelectorAll('link[rel~="canonical" i]')).map(
							(link) => link.getAttribute('href')
						),
						robots: Array.from(
							document.querySelectorAll('meta[name="robots" i], meta[name="googlebot" i]')
						)
							.map((meta) => meta.getAttribute('content'))
							.join(',')
					};
				},
				await target.text()
			);
			const directives = `${target.headers()['x-robots-tag'] ?? ''},${metadata.robots}`;
			const path = new URL(url).pathname;
			if (noindex.includes(path)) {
				expect(directives, `${url} must justify its sitemap exclusion with noindex`).toMatch(
					/\b(noindex|none)\b/i
				);
			} else {
				const canonical = aliases[path] ? `${site.url}${aliases[path]}` : url;
				expect(metadata.canonicals, url).toEqual([canonical]);
				expect(locations, `${url} must resolve to a listed canonical page`).toContain(canonical);
				expect(directives, url).not.toMatch(/\b(noindex|none)\b/i);
			}
		}
	}
);
