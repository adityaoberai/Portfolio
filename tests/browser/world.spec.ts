import { test, expect, type Page } from '@playwright/test';

type Anchor = { x: number; y: number };
const anchor = (page: Page, id: string) =>
	page.evaluate(
		(key) =>
			(window as unknown as { __room: { anchor: (id: string) => Anchor } }).__room.anchor(key),
		id
	);
const floor = (page: Page, x: number, z: number) =>
	page.evaluate(
		([px, pz]) =>
			(window as unknown as { __room: { project: (p: number[]) => Anchor } }).__room.project([
				px,
				0,
				pz
			]),
		[x, z]
	);

// Waits until the renderer has stopped drawing (movement and camera easing finished).
async function settle(page: Page) {
	const canvas = page.locator('canvas');
	let previous = '';
	for (let i = 0; i < 40; i++) {
		const frames = (await canvas.getAttribute('data-frames')) ?? '';
		if (frames === previous) return;
		previous = frames;
		await page.waitForTimeout(150);
	}
	throw new Error('room never settled');
}

// Every station is listed in the floating "In the room" menu.
async function openMenu(page: Page) {
	await page.getByRole('button', { name: 'In the room', exact: true }).click();
	await expect(page.getByRole('navigation', { name: 'In the room' })).toBeVisible();
}

async function openRoom(page: Page) {
	await page.goto('/world?diagnostics=1');
	await expect(page.locator('canvas')).toHaveClass(/\bloaded\b/);
}

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

test('keyboard and floor movement stop at rest; the desk opens and focus returns', async ({
	page
}) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await openRoom(page);
	const canvas = page.locator('canvas');
	const initial = await canvas.getAttribute('data-x');
	const spot = await floor(page, 0.5, 2.2);
	await page.mouse.click(spot.x, spot.y);
	await expect(canvas).not.toHaveAttribute('data-x', initial!);
	await canvas.focus();
	const start = await canvas.getAttribute('data-x');
	await page.keyboard.down('d');
	await page.waitForTimeout(400);
	await page.keyboard.up('d');
	await expect(canvas).not.toHaveAttribute('data-x', start!);
	await page.waitForTimeout(150);
	const frames = await canvas.getAttribute('data-frames');
	await page.waitForTimeout(300);
	await expect(canvas).toHaveAttribute('data-frames', frames!);

	await openMenu(page);
	await page.getByRole('button', { name: 'Inspect the desk' }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await expect(
		page.getByRole('heading', { name: 'Developer Relations Lead at Appwrite' })
	).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).not.toBeVisible();
	// The menu closed when the station opened, so focus returns to the menu button.
	await expect(page.getByRole('button', { name: 'In the room', exact: true })).toBeFocused();
	await page.screenshot({ path: 'test-results/world-desktop.png' });
	expect(errors).toEqual([]);
});

test('walking up to a station and pressing E inspects it', async ({ page }) => {
	await openRoom(page);
	const target = await floor(page, 0.75, -1.95);
	await page.mouse.click(target.x, target.y);
	const canvas = page.locator('canvas');
	await expect(canvas).toHaveAttribute('data-near', 'shelf');
	// Holding E opens the station once; the key repeat must not close it again.
	await page.keyboard.down('e');
	await expect(page.getByRole('heading', { name: 'Blastoise gets the top shelf.' })).toBeVisible();
	await page.keyboard.down('e');
	await page.keyboard.up('e');
	await expect(page.getByRole('dialog')).toBeVisible();
	// E closes what E opened, returns to the room, and does not reopen it.
	await page.keyboard.press('e');
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await expect(canvas).toBeFocused();
	await page.waitForTimeout(300);
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await page.keyboard.press('e');
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.getByRole('button', { name: 'Back to the room' }).click();
	await expect(canvas).toBeFocused();
});

test('clicking objects in the room opens them; curiosities leave a note', async ({ page }) => {
	await openRoom(page);
	await settle(page);
	for (const [id, heading] of [
		['camera', 'Fujifilm X-T30 II'],
		['notebook', 'Pages from the notebook']
	]) {
		const point = await anchor(page, id);
		await page.mouse.click(point.x, point.y);
		await expect(page.getByRole('heading', { name: heading })).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).not.toBeVisible();
		await settle(page);
	}
	const plush = await anchor(page, 'plush');
	await page.mouse.click(plush.x, plush.y);
	await expect(page.locator('.note')).toContainText('Squirtle plush');
	await expect(page.getByRole('dialog')).not.toBeVisible();
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
	await openRoom(page);
	const canvas = page.locator('canvas');
	// Settings live in the menu; the OS preference is reflected there.
	await page.getByRole('button', { name: 'In the room', exact: true }).tap();
	await expect(page.getByRole('checkbox', { name: 'Less motion' })).toBeChecked();
	await page.keyboard.press('Escape');
	const start = await canvas.getAttribute('data-x');
	const spot = await floor(page, 0.5, 2.2);
	await page.touchscreen.tap(spot.x, spot.y);
	await expect(canvas).not.toHaveAttribute('data-x', start!);
	const desk = await anchor(page, 'desk');
	await page.touchscreen.tap(desk.x, desk.y);
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.getByRole('button', { name: 'Back to the room' }).tap();
	await page.getByRole('button', { name: 'In the room', exact: true }).tap();
	await page.getByRole('checkbox', { name: 'Low power' }).check();
	await expect(page.locator('output')).toContainText('DPR 1 ·');
	const size = await page.evaluate(() => ({
		scroll: document.documentElement.scrollWidth,
		width: window.innerWidth
	}));
	expect(size.scroll).toBeLessThanOrEqual(size.width);
	// The room is the page: nothing scrolls vertically either.
	expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBe(0);
	await page.getByRole('button', { name: 'Inspect the Pokémon shelf' }).tap();
	await expect(page.getByRole('navigation', { name: 'In the room' })).not.toBeVisible();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.getByRole('button', { name: 'Back to the room' }).tap();
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await page.screenshot({ path: 'test-results/world-mobile.png', fullPage: true });
	await context.close();
});

test('WebGL failure and disabled JavaScript preserve the content and Index escape', async ({
	browser
}) => {
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
	// The room's contents still open without WebGL, from the menu.
	await openMenu(page);
	await page.getByRole('button', { name: 'Inspect the camera' }).click();
	await expect(page.getByRole('heading', { name: 'Fujifilm X-T30 II' })).toBeVisible();
	await page.keyboard.press('Escape');
	await page.getByRole('status').getByRole('link', { name: 'Explore the Index' }).click();
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
	// The menu is a native popover, so it opens without JavaScript too.
	await staticPage.getByRole('button', { name: 'In the room', exact: true }).click();
	await expect(
		staticPage.getByRole('navigation', { name: 'In the room' }).getByRole('link')
	).toHaveCount(9);
	await staticPage.keyboard.press('Escape');
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

test('every station in the room opens from the guide', async ({ browser }) => {
	const context = await browser.newContext({ reducedMotion: 'reduce' });
	const page = await context.newPage();
	await openRoom(page);
	for (const [name, heading] of [
		['desk', 'Developer Relations Lead at Appwrite'],
		['notebook', 'Pages from the notebook'],
		['camera', 'Fujifilm X-T30 II'],
		['Pokémon shelf', 'Blastoise gets the top shelf.'],
		['corkboard', 'Pinned to the corkboard'],
		['conference wall', 'Lanyards from the road'],
		['mirror', 'Making complicated things make sense.'],
		['window', 'Right now'],
		['door', 'Elsewhere']
	]) {
		await openMenu(page);
		await page.getByRole('button', { name: `Inspect the ${name}`, exact: true }).click();
		await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).not.toBeVisible();
	}
	await context.close();
});

test('the little things are listed for keyboards and screen readers', async ({ page }) => {
	await openRoom(page);
	await settle(page);
	const cowl = await anchor(page, 'cowl');
	await page.mouse.click(cowl.x, cowl.y);
	await expect(page.locator('.note')).toContainText('Batman');
	await openMenu(page);
	await page.getByText('Little things in the room').click();
	await expect(page.getByText('My Batman cowl.', { exact: false }).last()).toBeVisible();
	await expect(page.getByText('Manchester United, always.', { exact: false }).last()).toBeVisible();
});

test('/now is a readable page that fills in the Bengaluru time', async ({ page }) => {
	await page.goto('/now');
	await expect(page.getByRole('heading', { level: 1, name: 'Right now' })).toBeVisible();
	await expect(page.getByText('Working on')).toBeVisible();
	await expect(page.locator('.lede')).toContainText('here');
});

test('arriving focuses the room, so the keyboard works without a click', async ({ page }) => {
	await openRoom(page);
	const canvas = page.locator('canvas');
	await expect(canvas).toBeFocused();
	const start = await canvas.getAttribute('data-x');
	await page.keyboard.down('d');
	await page.waitForTimeout(300);
	await page.keyboard.up('d');
	await expect(canvas).not.toHaveAttribute('data-x', start!);
	// If focus drifts to the page itself, movement keys still reach the room.
	await page.evaluate(() => (document.activeElement as HTMLElement).blur());
	const next = await canvas.getAttribute('data-x');
	await page.keyboard.down('a');
	await page.waitForTimeout(300);
	await page.keyboard.up('a');
	await expect(canvas).toBeFocused();
	await expect(canvas).not.toHaveAttribute('data-x', next!);
	// Focused controls keep focus; Tab still leaves the room.
	await page.getByRole('link', { name: 'Index', exact: true }).focus();
	await page.keyboard.press('d');
	await expect(page.getByRole('link', { name: 'Index', exact: true })).toBeFocused();
});

test('arrival never steals focus from a deep-linked station or other pages', async ({
	browser
}) => {
	const context = await browser.newContext({ reducedMotion: 'reduce' });
	const page = await context.newPage();
	await page.goto('/world#door');
	await expect(page.getByRole('heading', { name: 'Elsewhere' })).toBeVisible();
	expect(await page.evaluate(() => Boolean(document.activeElement?.closest('dialog')))).toBe(true);
	await page.goto('/index');
	await page.waitForLoadState('networkidle');
	expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
	await context.close();
});
