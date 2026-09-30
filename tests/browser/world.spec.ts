import { test, expect } from '@playwright/test';

test('Index is meaningful HTML and does not request the scene bundle', async ({ page }) => {
	const scripts: string[] = [];
	page.on('response', async (response) => {
		if (response.request().resourceType() === 'script') scripts.push(await response.text());
	});
	await page.goto('/index');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('bring people together');
	await expect(page.getByRole('link', { name: /Visit my room/ })).toBeVisible();
	await page.waitForLoadState('networkidle');
	expect(scripts.some((script) => script.includes('WebGLRenderer'))).toBe(false);
});

test('keyboard movement stops at rest, desk dialog closes and restores focus', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/world?diagnostics=1');
	const canvas = page.locator('canvas');
	await expect(canvas).toHaveClass(/\bloaded\b/);
	const rect = await canvas.boundingBox();
	const initial = await canvas.getAttribute('data-x');
	await page.mouse.click(rect!.x + rect!.width * 0.5, rect!.y + rect!.height * 0.7);
	await expect(canvas).not.toHaveAttribute('data-x', initial!);
	await canvas.focus();
	const start = await canvas.getAttribute('data-x');
	await page.keyboard.down('d');
	await page.waitForTimeout(400);
	await page.keyboard.up('d');
	await expect(canvas).not.toHaveAttribute('data-x', start!);
	await page.waitForTimeout(100);
	const frames = await canvas.getAttribute('data-frames');
	await page.waitForTimeout(250);
	await expect(canvas).toHaveAttribute('data-frames', frames!);
	await page.getByRole('button', { name: 'Inspect the desk' }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Product launches' })).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await expect(canvas).toBeFocused();
	await page.screenshot({ path: 'test-results/world-desktop.png', fullPage: true });
	expect(errors).toEqual([]);
});

test('portrait touch input, reduced motion, and low-power DPR', async ({ browser }) => {
	const context = await browser.newContext({
		viewport: { width: 390, height: 844 },
		isMobile: true,
		hasTouch: true,
		deviceScaleFactor: 3,
		reducedMotion: 'reduce'
	});
	const page = await context.newPage();
	await page.goto('/world?diagnostics=1');
	const canvas = page.locator('canvas');
	await expect(canvas).toHaveClass(/\bloaded\b/);
	await expect(page.getByRole('checkbox', { name: 'Less motion' })).toBeChecked();
	const rect = await canvas.boundingBox();
	const start = await canvas.getAttribute('data-x');
	await page.touchscreen.tap(rect!.x + rect!.width * 0.53, rect!.y + rect!.height * 0.75);
	await expect(canvas).not.toHaveAttribute('data-x', start!);
	await page.touchscreen.tap(rect!.x + rect!.width * 0.68, rect!.y + rect!.height * 0.49);
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.getByRole('button', { name: 'Back to the room' }).tap();
	await page.getByRole('checkbox', { name: 'Low power' }).check();
	await expect(page.locator('output')).toContainText('DPR 1 ·');
	const size = await page.evaluate(() => ({
		scroll: document.documentElement.scrollWidth,
		width: window.innerWidth
	}));
	expect(size.scroll).toBeLessThanOrEqual(size.width);
	await page.getByRole('button', { name: 'Inspect the desk' }).tap();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.getByRole('button', { name: 'Back to the room' }).tap();
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await page.screenshot({ path: 'test-results/world-mobile.png', fullPage: true });
	await context.close();
});

test('WebGL failure and disabled JavaScript preserve the Index escape', async ({ browser }) => {
	const context = await browser.newContext();
	await context.addInitScript(() => {
		const getContext = HTMLCanvasElement.prototype.getContext;
		HTMLCanvasElement.prototype.getContext = function (
			this: HTMLCanvasElement,
			...args: Parameters<typeof getContext>
		) {
			if (String(args[0]).includes('webgl')) return null;
			return getContext.apply(this, args);
		} as typeof getContext;
	});
	const page = await context.newPage();
	await page.goto('/world');
	await expect(page.getByRole('heading', { name: 'The room couldn’t open here.' })).toBeVisible();
	await page.getByRole('link', { name: 'Explore the Index' }).click();
	await expect(page).toHaveURL(/\/index\/?$/);
	await context.close();
	const noJs = await browser.newContext({ javaScriptEnabled: false });
	const staticPage = await noJs.newPage();
	await staticPage.goto('/index');
	await expect(staticPage.getByRole('heading', { level: 1 })).toContainText(
		'bring people together'
	);
	await staticPage.goto('/world');
	// Playwright excludes <noscript> itself from text matching; assert its rendered paragraph.
	await expect(staticPage.locator('noscript .no-script')).toContainText(
		'The interactive room needs JavaScript.'
	);
	await expect(
		staticPage.getByRole('status').getByRole('link', { name: 'Explore the Index' })
	).toBeVisible();
	await staticPage.getByRole('status').getByRole('link', { name: 'Explore the Index' }).click();
	await expect(staticPage.getByRole('heading', { level: 1 })).toContainText(
		'bring people together'
	);
	await noJs.close();
});

test('context loss exposes the fallback without losing the Index switch', async ({ page }) => {
	await page.goto('/world');
	await expect(page.locator('canvas')).toHaveClass(/\bloaded\b/);
	await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
		canvas.getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext();
	});
	await expect(page.getByRole('heading', { name: 'The room couldn’t open here.' })).toBeVisible();
	await page
		.getByRole('navigation', { name: 'Website mode' })
		.getByRole('link', { name: 'Index' })
		.click();
	await expect(page.getByRole('heading', { level: 1 })).toContainText('bring people together');
});
