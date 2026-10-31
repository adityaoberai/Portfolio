import { test, expect } from '@playwright/test';

const origin = 'https://adityaoberai.com';

test('identity pages serve a connected profile graph before JavaScript runs', async ({
	request,
	page
}) => {
	for (const path of ['/', '/world', '/index', '/about']) {
		const response = await request.get(path);
		expect(response.status(), path).toBe(200);
		const metadata = await page.evaluate(
			(html) => {
				const document = new DOMParser().parseFromString(html, 'text/html');
				return {
					title: document.title,
					data: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
						(script) => JSON.parse(script.textContent ?? '')
					),
					canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
					ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute('content'),
					describedBy: document.querySelector('link[rel="describedby"]')?.getAttribute('href')
				};
			},
			await response.text()
		);
		expect(metadata.data, path).toHaveLength(1);
		expect(metadata.data[0]['@context']).toBe('https://schema.org');
		const graph = metadata.data[0]['@graph'];
		expect(new Set(graph.map((node: Record<string, unknown>) => node['@id'])).size).toBe(
			graph.length
		);
		const person = graph.find((node: Record<string, unknown>) => node['@type'] === 'Person');
		expect(person).toMatchObject({
			'@id': `${origin}/#person`,
			name: 'Aditya Oberai',
			jobTitle: 'Developer Relations Lead',
			worksFor: { name: 'Appwrite' }
		});
		expect(person.sameAs).toEqual(
			expect.arrayContaining([
				'https://appwrite.io/blog/author/aditya-oberai',
				'https://sessionize.com/adityaoberai',
				'https://mvp.microsoft.com/en-US/MVP/profile/4a922093-396f-ed11-81ab-000d3a5600fa'
			])
		);
		const canonical = `${origin}${path === '/world' ? '/' : path}`;
		expect(metadata.canonical, path).toBe(canonical);
		expect(metadata.ogUrl, path).toBe(canonical);
		expect(metadata.describedBy, path).toBe('/llms.txt');
		if (path === '/')
			expect(metadata.title).toBe('Aditya Oberai · Developer Relations Lead at Appwrite');
		const profile = graph.find((node: Record<string, unknown>) =>
			['ProfilePage', 'WebPage'].includes(String(node['@type']))
		);
		expect(profile).toMatchObject({
			'@type': path === '/about' ? 'ProfilePage' : 'WebPage',
			'@id': `${canonical}#webpage`,
			url: canonical,
			mainEntity: { '@id': person['@id'] },
			isPartOf: { '@id': `${origin}/#website` }
		});
	}
});

test('llms.txt is readable text with working local destinations and published writing', async ({
	request
}) => {
	const response = await request.get('/llms.txt');
	const text = await response.text();
	expect(response.status()).toBe(200);
	expect(response.headers()['content-type']).toMatch(/^text\/plain(?:;|$)/i);
	expect(text).toMatch(/^# Aditya Oberai\n\n> Developer Relations Lead at Appwrite/);
	expect(text).toContain('## Selected technical writing');
	expect(text).toContain('https://appwrite.io/blog/post/financial-analysis-mcp-server');
	expect(text).toContain('## Optional');
	expect(text).toContain('Pokémon');
	expect(text).not.toContain('<html');
	const destinations = Array.from(text.matchAll(/\]\((https:\/\/adityaoberai\.com[^)]+)\)/g)).map(
		(match) => new URL(match[1]).pathname
	);
	expect(destinations).toContain('/about');
	expect(destinations).toContain('/writing');
	for (const path of new Set(destinations)) {
		const target = await request.get(path, { maxRedirects: 0 });
		expect(target.status(), path).toBe(200);
	}
});

test('technical writing is available in the page HTML and the notebook reader', async ({
	request,
	page
}) => {
	const response = await request.get('/writing');
	const titles = await page.evaluate(
		(html) => {
			const document = new DOMParser().parseFromString(html, 'text/html');
			return Array.from(document.querySelectorAll('#technical-writing a')).map((link) => ({
				title: link.querySelector('.title')?.textContent,
				href: link.getAttribute('href'),
				target: link.getAttribute('target'),
				id: link.getAttribute('data-content-id')
			}));
		},
		await response.text()
	);
	expect(titles).toHaveLength(4);
	await page.goto('/world#notebook');
	const reader = page.locator('dialog.sheet');
	await expect(reader.getByRole('heading', { name: 'Selected technical writing' })).toBeVisible();
	for (const article of titles) {
		expect(article.title).toBeTruthy();
		expect(article.target).toBe('_blank');
		expect(article.id).toMatch(/^article-/);
		await expect(reader.locator(`[data-content-id="${article.id}"] a`)).toHaveAttribute(
			'href',
			article.href!
		);
	}
});
