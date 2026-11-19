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
	expect(destinations).toContain('/llms-full.txt');
	expect(destinations).toContain('/projects/relief-atl');
	expect(destinations).toContain(
		'/speaking/why-agents-make-different-decisions-with-the-same-tools'
	);
	for (const path of new Set(destinations)) {
		const target = await request.get(path, { maxRedirects: 0 });
		expect(target.status(), path).toBe(200);
	}
});

test('the welcome introduces the portfolio and leads to the index without JavaScript', async ({
	browser
}) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	try {
		const page = await context.newPage();
		await page.goto('/');
		const welcome = page.getByRole('dialog');
		await expect(welcome).toContainText('Developer Relations Lead at Appwrite');
		await expect(welcome).not.toHaveAttribute('aria-modal', 'true');
		await expect(welcome.getByRole('link', { name: 'Enter the room' })).toHaveAttribute(
			'href',
			'/world'
		);
		await welcome.getByRole('link', { name: 'See it on paper' }).click();
		await expect(page).toHaveURL(/\/index$/);
		await expect(page.locator('main a[href="/about"]')).toBeVisible();
		await page.goto('/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('bring people together');
		await expect(page.locator('dialog[aria-labelledby="welcome-title"]')).toHaveCount(0);
	} finally {
		await context.close();
	}
});

test('project and talk detail pages connect public evidence to the same person', async ({
	page,
	request
}) => {
	const cases = [
		{
			hub: '/projects',
			path: '/projects/relief-atl',
			name: 'Relief ATL',
			citation: 'https://doi.org/10.1371/journal.pwat.0000574',
			excerpt: '55.3% of the 262 potential restroom locations',
			key: 'contributor'
		},
		{
			hub: '/speaking',
			path: '/speaking/why-agents-make-different-decisions-with-the-same-tools',
			name: 'Why Agents Make Different Decisions With the Same Tools',
			citation: 'https://www.youtube.com/watch?v=lSjakfdOUqc',
			excerpt: 'with Jyoti Bisht and Animesh Pathak',
			key: 'creator'
		}
	];
	for (const item of cases) {
		await page.goto(item.hub);
		await page.locator(`main a[href="${item.path}"]`).first().click();
		await expect(page.getByRole('heading', { level: 1, name: item.name })).toBeVisible();
		await expect(page.locator('main article')).toContainText(item.excerpt);
		await expect(page.locator(`main a[href="${item.citation}"]`)).toHaveAttribute(
			'target',
			'_blank'
		);
		const graph = JSON.parse(
			(await page.locator('script[type="application/ld+json"]').textContent()) ?? ''
		)['@graph'];
		const webPage = graph.find((node: { '@type': string }) => node['@type'] === 'WebPage');
		const entity = graph.find(
			(node: { '@id': string }) => node['@id'] === webPage.mainEntity['@id']
		);
		expect(webPage.url).toBe(`${origin}${item.path}`);
		expect(entity.name).toBe(item.name);
		expect(entity.citation).toContain(item.citation);
		const credits = Array.isArray(entity[item.key]) ? entity[item.key] : [entity[item.key]];
		expect(credits).toContainEqual({ '@id': `${origin}/#person` });
	}
	expect((await request.get('/projects/no-such-project')).status()).toBe(404);
	expect((await request.get('/speaking/no-such-talk')).status()).toBe(404);
});

test('the full text export includes sourced work, speaking, and the latest essay', async ({
	request
}) => {
	const response = await request.get('/llms-full.txt');
	expect(response.status()).toBe(200);
	expect(response.headers()['content-type']).toMatch(/^text\/plain(?:;|$)/i);
	const body = await response.text();
	expect(body).toMatch(/^# Aditya Oberai\n\n> Developer Relations Lead at Appwrite/);
	expect(body).toContain('December 2025');
	expect(body).toContain('55.3% of the 262 potential restroom locations');
	expect(body).toContain('https://doi.org/10.1371/journal.pwat.0000574');
	expect(body).toContain('Jyoti Bisht, Animesh Pathak');
	expect(body).toContain('https://www.oberai.blog/p/the-unsubtly-intrusive-art-of-street');
	expect(body).not.toContain('<html');
});

test('technical writing is available in the page HTML and the notebook reader', async ({
	request,
	page
}) => {
	const response = await request.get('/writing');
	const html = await response.text();
	const graph = await page.evaluate((html) => {
		const document = new DOMParser().parseFromString(html, 'text/html');
		return JSON.parse(
			document.querySelector('script[type="application/ld+json"]')?.textContent ?? ''
		)['@graph'];
	}, html);
	const articles = graph.filter((node: { '@type': string }) => node['@type'] === 'BlogPosting');
	const titles = await page.evaluate((html) => {
		const document = new DOMParser().parseFromString(html, 'text/html');
		return Array.from(document.querySelectorAll('#technical-writing a')).map((link) => ({
			title: link.querySelector('.title')?.textContent,
			href: link.getAttribute('href'),
			target: link.getAttribute('target'),
			id: link.getAttribute('data-content-id')
		}));
	}, html);
	expect(titles).toHaveLength(4);
	expect(articles.map((node: { url: string }) => node.url)).toEqual(
		titles.map((article) => article.href)
	);
	for (const article of articles) expect(article.author).toEqual({ '@id': `${origin}/#person` });
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
