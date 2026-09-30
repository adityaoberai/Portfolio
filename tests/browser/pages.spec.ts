import { test, expect } from '@playwright/test';

const deepPages: [string, string, string][] = [
	['/work', 'The work, by theme.', 'Work'],
	['/projects', "Things I've built.", 'Projects'],
	['/speaking', 'Talks, stages, and the occasional microphone.', 'Speaking'],
	['/writing', 'Writing things down.', 'Writing'],
	['/community', 'Bringing people together.', 'Community'],
	['/photography', 'Hallways, cities, people mid-laugh.', 'Photography'],
	['/collection', 'Blastoise gets the top shelf.', 'Collection'],
	['/about', 'Making complicated things make sense.', 'About'],
	['/contact', 'Say hello.', 'Contact']
];

test('every deep page is readable, marked in the nav, and never loads the scene', async ({
	page
}) => {
	const scripts: string[] = [];
	page.on('response', async (response) => {
		if (response.request().resourceType() === 'script') scripts.push(await response.text());
	});
	for (const [path, heading, label] of deepPages) {
		const response = await page.goto(path);
		expect(response?.status(), path).toBe(200);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
		await expect(
			page.getByRole('navigation', { name: 'Sections' }).getByRole('link', { name: label })
		).toHaveAttribute('aria-current', 'page');
		await expect(page.getByRole('navigation', { name: 'Website mode' })).toBeVisible();
	}
	await page.waitForLoadState('networkidle');
	expect(scripts.some((script) => script.includes('WebGLRenderer'))).toBe(false);
});

test('deep pages fit a phone without sideways scrolling', async ({ browser }) => {
	const context = await browser.newContext({ viewport: { width: 360, height: 780 } });
	const page = await context.newPage();
	for (const [path] of deepPages) {
		await page.goto(path);
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - window.innerWidth
		);
		expect(overflow, path).toBeLessThanOrEqual(0);
	}
	await context.close();
});

test('artifact anchors exist where the room and Index link to them', async ({ page }) => {
	for (const [path, id] of [
		['/work', 'developer-relations'],
		['/projects', 'relief-atl'],
		['/community', 'writers-room'],
		['/speaking', 'podcasts']
	]) {
		await page.goto(`${path}#${id}`);
		await expect(page.locator(`#${id}`)).toBeVisible();
	}
});

test('"In the room" links open the matching station in World', async ({ browser }) => {
	const context = await browser.newContext({ reducedMotion: 'reduce' });
	const page = await context.newPage();
	await page.goto('/speaking');
	await page.getByRole('link', { name: /In the room: the conference wall/ }).click();
	await expect(page).toHaveURL(/\/world#lanyards$/);
	await expect(page.getByRole('heading', { name: 'Lanyards from the road' })).toBeVisible();
	await context.close();
});

test('short links still redirect with real status codes', async ({ request }) => {
	for (const [path, status, location] of [
		['/pic', 301, '/aditya.jpg'],
		['/resume', 302, '/resume.pdf'],
		['/resume/docx', 302, '/resume.docx']
	] as const) {
		const response = await request.get(path, { maxRedirects: 0 });
		expect(response.status(), path).toBe(status);
		expect(response.headers()['location']).toContain(location);
	}
});

test('the sitemap lists every page', async ({ request }) => {
	const body = await (await request.get('/sitemap.xml')).text();
	for (const path of ['/world', '/index', '/now', ...deepPages.map(([p]) => p)])
		expect(body, path).toContain(`${path}</loc>`);
});
