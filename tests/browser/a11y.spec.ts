import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// An audit takes a few seconds, and the page and room tests run a dozen each (30-40 s here).
test.describe.configure({ timeout: 90_000 });

async function audit(page: Page, label: string) {
	const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze();
	const summary = violations.map(
		(v) => `${label}: ${v.id} (${v.impact}) ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
	);
	expect(summary, summary.join('\n')).toEqual([]);
}

const pages = [
	'/index',
	'/work',
	'/projects',
	'/speaking',
	'/writing',
	'/community',
	'/photography',
	'/collection',
	'/about',
	'/contact',
	'/now',
	'/this-page-does-not-exist'
];

test('content pages meet WCAG 2.2 AA (automated checks)', async ({ page }) => {
	for (const path of pages) {
		await page.goto(path);
		await audit(page, path);
	}
});

test('the room, its guide, and every station meet WCAG 2.2 AA (automated checks)', async ({
	page
}) => {
	await page.goto('/world');
	await expect(page.locator('canvas')).toHaveClass(/\bloaded\b/);
	await audit(page, '/world');
	const menuButton = page.getByRole('button', { name: 'Room menu', exact: true });
	await menuButton.click();
	await expect(page.getByRole('navigation', { name: 'In the room' })).toBeVisible();
	await audit(page, '/world (menu open)');
	await page.keyboard.press('Escape');
	for (const name of [
		'desk',
		'notebook',
		'camera',
		'shelf',
		'corkboard',
		'mirror',
		'window',
		'door'
	]) {
		await menuButton.click();
		await page
			.getByRole('navigation', { name: 'In the room', exact: true })
			.getByRole('link', {
				name: (
					{
						desk: 'Work & build',
						notebook: 'Writing',
						camera: 'Photography',
						shelf: 'Pokemon',
						corkboard: 'Community & speaking',
						mirror: 'About',
						window: 'Now',
						door: 'Elsewhere & contact'
					} as Record<string, string>
				)[name],
				exact: true
			})
			.click();
		await expect(page.getByRole('dialog')).toBeVisible();
		// Measure contrast after the sheet's fade-in, not halfway through it.
		await page
			.locator('dialog[open]')
			.evaluate((dialog) => Promise.all(dialog.getAnimations().map((a) => a.finished)));
		await audit(page, `/world (${name} open)`);
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).not.toBeVisible();
	}
	// The bed's poem, opened from the menu's list of little things.
	await menuButton.click();
	await page.getByText('Little things in the room').click();
	await page.getByRole('button', { name: /^Read “Stopping by Woods/ }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page
		.locator('dialog.poem')
		.evaluate((dialog) => Promise.all(dialog.getAnimations().map((a) => a.finished)));
	await audit(page, '/world (poem open)');
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('mobile object cards and readers meet WCAG 2.2 AA (automated checks)', async ({ browser }) => {
	const context = await browser.newContext({
		viewport: { width: 390, height: 844 },
		isMobile: true,
		hasTouch: true,
		reducedMotion: 'reduce'
	});
	const page = await context.newPage();
	await page.goto('/world#desk');
	await expect(page.getByRole('button', { name: 'Open Work & build', exact: true })).toBeVisible();
	await audit(page, '/world (mobile object card)');
	await page.getByRole('button', { name: 'Open Work & build', exact: true }).tap();
	await expect(
		page.getByRole('heading', { name: 'Developer Relations Lead at Appwrite' })
	).toBeVisible();
	await audit(page, '/world (mobile reading sheet)');
	await page.getByRole('button', { name: 'See room' }).tap();
	await expect(page.getByRole('button', { name: 'Open Work & build', exact: true })).toBeFocused();
	await context.close();
});

test('the gramophone’s player card meets WCAG 2.2 AA (automated checks)', async ({ page }) => {
	// Spotify's player is stubbed out: its contents aren't this site's to audit.
	await page.route('https://open.spotify.com/**', (route) =>
		route.fulfill({
			contentType: 'text/javascript',
			body: `window.onSpotifyIframeApiReady({ createController(element, options, created) {
				const frame = document.createElement('iframe');
				frame.width = options.width;
				frame.height = options.height;
				element.replaceWith(frame);
				created({ addListener() {}, play() {}, resume() {}, pause() {}, destroy() {} });
			} });`
		})
	);
	await page.goto('/world');
	await expect(page.locator('canvas')).toHaveClass(/\bloaded\b/);
	await page.getByRole('button', { name: 'Room menu', exact: true }).click();
	await page.getByText('Little things in the room').click();
	await page.getByRole('button', { name: 'Put the record on' }).click();
	const dock = page.getByRole('region', { name: 'Gramophone' });
	await expect(dock).toBeVisible();
	await dock.evaluate((card) => Promise.all(card.getAnimations().map((a) => a.finished)));
	await audit(page, '/world (music on)');
	await dock.getByRole('button', { name: 'Hide player', exact: true }).click();
	await expect(dock.getByRole('button', { name: 'Open player', exact: true })).toBeVisible();
	await audit(page, '/world (music player collapsed)');
});

test('the room fallback meets WCAG 2.2 AA without WebGL', async ({ browser }) => {
	const context = await browser.newContext();
	await context.addInitScript(() => {
		HTMLCanvasElement.prototype.getContext = () => null;
	});
	const page = await context.newPage();
	await page.goto('/world');
	await expect(page.getByRole('heading', { name: 'The room couldn’t open here.' })).toBeVisible();
	await audit(page, '/world (no WebGL)');
	await context.close();
});
