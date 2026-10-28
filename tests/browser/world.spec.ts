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
	await page.getByRole('button', { name: 'Room menu', exact: true }).click();
	await expect(page.getByRole('navigation', { name: 'In the room' })).toBeVisible();
}

// Spotify's iFrame API, stubbed: a blank player that reports playback changes
// and records what it was asked to do. Nothing reaches Spotify.
async function stubSpotify(page: Page, stallFirstPlayer = false) {
	await page.route('https://open.spotify.com/**', (route) =>
		route.fulfill({
			contentType: 'text/javascript',
			body: `window.__spotify = [];
			let players = 0;
			window.onSpotifyIframeApiReady({
				createController(element, options, created) {
					players++;
					const frame = document.createElement('iframe');
					frame.width = options.width;
					frame.height = options.height;
					element.replaceWith(frame);
					const listeners = {};
					const emit = (name, data) => (listeners[name] || []).forEach((fn) => fn({ data }));
					window.__spotifyPlayback = (paused) =>
						emit('playback_update', { isPaused: paused, isBuffering: false, position: 0, duration: 29713 });
					const say = (call, paused) => () => {
						window.__spotify.push(call);
						window.__spotifyPlayback(paused);
					};
					created({
						addListener: (name, fn) => (listeners[name] ||= []).push(fn),
						play: say('play', false),
						resume: say('resume', false),
						pause: say('pause', true),
						destroy: () => frame.remove()
					});
					if (!${stallFirstPlayer} || players > 1) setTimeout(() => emit('ready'), 50);
				}
			});`
		})
	);
}
const spotifyCalls = (page: Page) =>
	page.evaluate(() => (window as unknown as { __spotify?: string[] }).__spotify ?? []);
const spotifyPlayback = (page: Page, paused: boolean) =>
	page.evaluate(
		(value) =>
			(window as unknown as { __spotifyPlayback: (paused: boolean) => void }).__spotifyPlayback(
				value
			),
		paused
	);

async function openRoom(page: Page) {
	await page.goto('/world?diagnostics=1');
	await expect(page.locator('canvas')).toHaveClass(/\bloaded\b/);
}

test('Index is meaningful HTML and does not request the scene bundle', async ({ page }) => {
	const scripts: string[] = [];
	page.on('response', async (response) => {
		if (response.request().resourceType() === 'script')
			scripts.push(await response.text().catch(() => '')); // A later navigation can discard a response body.
	});
	await page.goto('/index');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('bring people together');
	await expect(
		page
			.getByRole('navigation', { name: 'Explore another way' })
			.getByRole('link', { name: /Step into my room/ })
	).toBeVisible();
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
	await page.getByRole('link', { name: 'Work & build', exact: true }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await expect(
		page.getByRole('heading', { name: 'Developer Relations Lead at Appwrite' })
	).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).not.toBeVisible();
	// The menu closed when the station opened, so the keyboard goes back to the room.
	await expect(page.locator('canvas')).toBeFocused();
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

test('trying to sleep on the bed turns the character away, and Frost’s poem pops up', async ({
	page
}) => {
	await openRoom(page);
	await settle(page);
	const canvas = page.locator('canvas');
	const poem = page.getByRole('dialog', { name: 'Stopping by Woods on a Snowy Evening' });
	// Walking up beside the bed offers it; E walks round to its side and tries to sleep.
	// A floor spot a step from the bed that neither the bed nor the suitcase covers on
	// screen; from there, a short walk to the right ends against the bed's side.
	const near = await floor(page, 1.25, 1.7);
	await page.mouse.click(near.x, near.y);
	await expect(canvas).toHaveAttribute('data-x', '1.250');
	await expect(page.locator('.room-hint')).not.toContainText('Press E to sleep');
	await page.keyboard.down('d');
	await expect(page.locator('.room-hint')).toContainText('Press E to sleep');
	await page.keyboard.up('d');
	await page.keyboard.press('e');
	// The whole poem, with its last two lines in bold.
	await expect(poem).toBeVisible();
	await expect(poem).toContainText('Whose woods these are I think I know.');
	await expect(poem).toContainText('Robert Frost');
	await expect(poem.locator('strong')).toHaveText([
		'And miles to go before I sleep,',
		'And miles to go before I sleep.'
	]);
	// E closes it, and the room has the keyboard again.
	await page.keyboard.press('e');
	await expect(poem).not.toBeVisible();
	await expect(page.getByRole('button', { name: 'Room menu', exact: true })).toBeVisible();
	await expect(canvas).toBeFocused();
	const x = await canvas.getAttribute('data-x');
	await page.keyboard.down('a');
	await expect(canvas).not.toHaveAttribute('data-x', x!);
	await page.keyboard.up('a');
	// Clicking the bed from across the room walks over to it first.
	await openRoom(page);
	await settle(page);
	// The room remembers the previous position, so explicitly walk away first.
	const across = await floor(page, 0, 0);
	await page.mouse.click(across.x, across.y);
	await expect.poll(async () => Number(await canvas.getAttribute('data-x'))).toBeCloseTo(0, 3);
	await expect.poll(async () => Number(await canvas.getAttribute('data-z'))).toBeCloseTo(0, 3);
	// The blanket near the foot: the plush sits over the middle of the bed on screen.
	const bed = await page.evaluate(() =>
		(window as unknown as { __room: { project: (p: number[]) => Anchor } }).__room.project([
			2.8, 0.7, 1.4
		])
	);
	await page.mouse.click(bed.x, bed.y);
	await expect(poem).toBeVisible();
	await expect(canvas).toHaveAttribute('data-x', '1.600');
	await expect(canvas).toHaveAttribute('data-z', '1.850');
	await page.getByRole('button', { name: 'Back to the room' }).click();
	await expect(canvas).toBeFocused();
});

for (const width of [320, 390, 430]) {
	test(`the mobile bed offers a preview before reading the poem at ${width}px`, async ({
		browser
	}) => {
		const context = await browser.newContext({
			viewport: { width, height: 844 },
			isMobile: true,
			hasTouch: true,
			reducedMotion: 'reduce'
		});
		const page = await context.newPage();
		await openRoom(page);
		const bed = await page.evaluate(() =>
			(window as unknown as { __room: { project: (p: number[]) => Anchor } }).__room.project([
				2.8, 0.7, 1.4
			])
		);
		await page.touchscreen.tap(bed.x, bed.y);
		const sheet = page.locator('dialog.poem');
		const read = sheet.getByRole('button', { name: 'Read poem', exact: true });
		const menu = page.getByRole('button', { name: 'Room menu', exact: true });
		await expect(sheet.getByRole('heading', { name: 'Bed', exact: true })).toBeVisible();
		expect(await sheet.evaluate((element) => element.matches(':modal'))).toBe(false);
		await expect(sheet.locator('.verse')).toHaveCount(0);
		await expect(read).toBeVisible();
		await expect(page.getByRole('button', { name: 'Movement joystick' })).toHaveCount(0);
		await expect(menu).toBeHidden();
		const box = (await sheet.boundingBox())!;
		expect(box.x).toBeCloseTo(16, 0);
		expect(box.width).toBeCloseTo(width - 32, 0);
		expect(box.y + box.height).toBeCloseTo(824, 0);
		await read.tap();
		await expect(
			sheet.getByRole('heading', { name: 'Stopping by Woods on a Snowy Evening' })
		).toBeVisible();
		expect(await sheet.evaluate((element) => element.matches(':modal'))).toBe(true);
		expect((await sheet.boundingBox())!.height).toBeCloseTo(844 * 0.75, 0);
		await expect(sheet).toContainText('Whose woods these are I think I know.');
		const scroll = await sheet.evaluate((element) => {
			element.scrollTop = 130;
			return element.scrollTop;
		});
		await sheet.getByRole('button', { name: 'See room', exact: true }).tap();
		await expect(read).toBeFocused();
		await expect(sheet.locator('.verse')).toHaveCount(0);
		await read.tap();
		await expect.poll(() => sheet.evaluate((element) => element.scrollTop)).toBe(scroll);
		await sheet.getByRole('button', { name: 'See room', exact: true }).tap();
		await page.setViewportSize({ width: 844, height: 390 });
		await expect(sheet.locator('.verse')).toBeVisible();
		await page.setViewportSize({ width, height: 844 });
		await expect(read).toBeVisible();
		expect(await sheet.evaluate((element) => element.matches(':modal'))).toBe(false);
		await page.keyboard.press('Escape');
		await expect(sheet).not.toBeVisible();
		await expect(page.getByRole('button', { name: 'Movement joystick' })).toBeVisible();
		await expect(menu).toBeVisible();
		await page.locator('.enter-button').tap();
		await expect(read).toBeVisible();
		await expect(sheet.locator('.verse')).toHaveCount(0);
		if (width === 390) {
			// Switching objects keeps exactly one preview; returning to the bed still waits for Read.
			await page.evaluate(() =>
				(window as unknown as { __room: { visit(id: string): void } }).__room.visit('camera')
			);
			await expect(
				page.getByRole('button', { name: 'Open Photography', exact: true })
			).toBeVisible();
			await expect(sheet).not.toBeVisible();
			const bedAgain = await page.evaluate(() =>
				(window as unknown as { __room: { project: (p: number[]) => Anchor } }).__room.project([
					2.8, 0.7, 1.4
				])
			);
			await page.touchscreen.tap(bedAgain.x, bedAgain.y);
			await expect(read).toBeVisible();
			await expect(page.locator('dialog[open]')).toHaveCount(1);
			await expect(page).toHaveURL(/\/world\?diagnostics=1$/);
		}
		await sheet.getByRole('button', { name: 'Close and return to the room' }).tap();
		await expect(page.locator('canvas')).toBeFocused();
		expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
		await context.close();
	});
}

for (const stalledStage of ['api', 'player']) {
	test(`a stalled Spotify ${stalledStage} shows a fallback and can be retried`, async ({
		page
	}) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await stubSpotify(page, stalledStage === 'player');
		// Only the first attempt stalls. Retrying exercises the normal player above.
		if (stalledStage === 'api')
			await page.route(
				'https://open.spotify.com/embed/iframe-api/v1',
				(route) => route.fulfill({ contentType: 'text/javascript', body: '' }),
				{ times: 1 }
			);
		await openRoom(page);
		await page.clock.install();
		await openMenu(page);
		await page.locator('summary').filter({ hasText: 'Little things in the room' }).click();
		const response = page.waitForResponse('https://open.spotify.com/embed/iframe-api/v1');
		await page.getByRole('button', { name: 'Put the record on', exact: true }).click();
		await (await response).finished();
		const dock = page.getByRole('region', { name: 'Gramophone' });
		if (stalledStage === 'player') await expect(dock.locator('iframe')).toHaveCount(1);
		await page.clock.fastForward(10001);
		await expect(dock).toContainText('Spotify’s player didn’t load here.');
		await expect(dock.getByRole('link', { name: /Listen on Spotify/ })).toBeVisible();
		await expect(dock.locator('iframe')).toHaveCount(0);
		if (stalledStage === 'api') {
			await dock.getByRole('button', { name: 'Stop', exact: true }).click();
			await openMenu(page);
			await page.getByRole('button', { name: 'Put the record on', exact: true }).click();
		} else {
			await dock.getByRole('button', { name: 'Retry player', exact: true }).click();
		}
		await expect(dock.locator('iframe')).toHaveAttribute('title', 'Spotify player');
		await expect.poll(() => spotifyCalls(page)).toEqual(['play']);
		expect(errors).toEqual([]);
	});
}

test('the gramophone plays the playlist, with Spotify’s player over the hint card', async ({
	page
}) => {
	await stubSpotify(page);
	await openRoom(page);
	await settle(page);
	const canvas = page.locator('canvas');
	const dock = page.getByRole('region', { name: 'Gramophone' });
	const hint = page.locator('.room-hint');
	await expect(dock).toBeHidden();
	// Clicking it walks over and puts the record on: Spotify's player shows over the hint card,
	// and the room keeps the keyboard.
	const gramophone = await anchor(page, 'gramophone');
	await page.mouse.click(gramophone.x, gramophone.y);
	await expect(dock).toBeVisible();
	await expect(canvas).toHaveAttribute('data-x', '-2.400');
	await expect(canvas).toHaveAttribute('data-z', '1.350');
	await expect(dock.locator('iframe')).toHaveAttribute('title', 'Spotify player');
	await expect.poll(() => spotifyCalls(page)).toEqual(['play']);
	const dockBox = (await dock.boundingBox())!;
	expect(dockBox.y + dockBox.height).toBeLessThanOrEqual((await hint.boundingBox())!.y);
	await expect(canvas).toBeFocused();
	// The record turns while it plays.
	const frames = Number(await canvas.getAttribute('data-frames'));
	await expect
		.poll(async () => Number(await canvas.getAttribute('data-frames')))
		.toBeGreaterThan(frames + 5);
	// Spotify's compact player: just the song that's playing.
	expect((await dock.locator('iframe').boundingBox())!.height).toBe(80);
	// Hiding and reopening a paused player does not change playback.
	await spotifyPlayback(page, true);
	await dock.getByRole('button', { name: 'Hide player', exact: true }).focus();
	await page.keyboard.press('Enter');
	await expect(dock.locator('iframe')).toBeHidden();
	await expect(dock.getByRole('button', { name: 'Open player', exact: true })).toHaveAttribute(
		'aria-expanded',
		'false'
	);
	await page.keyboard.press('Enter');
	await expect(dock.locator('iframe')).toBeVisible();
	await expect(dock.getByRole('button', { name: 'Hide player', exact: true })).toHaveAttribute(
		'aria-expanded',
		'true'
	);
	await expect.poll(() => spotifyCalls(page)).toEqual(['play']);
	await spotifyPlayback(page, false);
	// A click in the player keeps the keyboard there; moving over the room gives it back.
	await dock.locator('iframe').click();
	await expect(canvas).not.toBeFocused();
	await page.mouse.move(dockBox.x + dockBox.width + 120, dockBox.y - 120);
	await expect(canvas).toBeFocused();
	// Beside it, E lifts the needle: the music stops, and so does the room.
	await expect(hint).toContainText('Press E to stop');
	await page.keyboard.press('e');
	await expect(dock).toBeHidden();
	await expect.poll(() => spotifyCalls(page)).toEqual(['play', 'pause']);
	await settle(page);
	// E again puts it back on, where it stopped.
	await expect(hint).toContainText('Press E to play');
	await page.keyboard.press('e');
	await expect(dock).toBeVisible();
	await expect.poll(() => spotifyCalls(page)).toEqual(['play', 'pause', 'resume']);
	// Stop takes it off, and the room has the keyboard.
	await dock.getByRole('button', { name: 'Stop' }).click();
	await expect(dock).toBeHidden();
	await expect(canvas).toBeFocused();
	await expect.poll(() => spotifyCalls(page)).toEqual(['play', 'pause', 'resume', 'pause']);
	// Standing on the corkboard's spot still opens the corkboard.
	await page.evaluate(() =>
		(window as unknown as { __room: { visit: (id: string) => void } }).__room.visit('corkboard')
	);
	await expect(page.getByRole('heading', { name: 'Pinned to the corkboard' })).toBeVisible();
});

test('mobile music controls stay compact and return after reading a panel', async ({ browser }) => {
	const context = await browser.newContext({
		viewport: { width: 320, height: 844 },
		isMobile: true,
		hasTouch: true
	});
	const page = await context.newPage();
	await stubSpotify(page);
	await openRoom(page);
	await settle(page);
	const gramophone = await anchor(page, 'gramophone');
	await page.touchscreen.tap(gramophone.x, gramophone.y);
	const dock = page.getByRole('region', { name: 'Gramophone' });
	const hint = page.locator('.room-hint');
	await expect(dock.getByRole('button', { name: 'Open player', exact: true })).toBeVisible();
	const fitsBetweenControls = async () => {
		const playerBox = (await dock.boundingBox())!;
		const stickBox = (await page.getByRole('button', { name: 'Movement joystick' }).boundingBox())!;
		const enterBox = (await page.locator('.enter-button').boundingBox())!;
		const menuBox = (await page
			.getByRole('button', { name: 'Room menu', exact: true })
			.boundingBox())!;
		expect(playerBox.x).toBeGreaterThanOrEqual(stickBox.x + stickBox.width + 8);
		expect(playerBox.x + playerBox.width).toBeLessThanOrEqual(enterBox.x - 8);
		expect(playerBox.y).toBeCloseTo(enterBox.y, 0);
		expect(playerBox.y + playerBox.height).toBeCloseTo(menuBox.y + menuBox.height, 0);
	};
	await fitsBetweenControls();
	const musicButton = dock.getByRole('button', { name: 'Open player', exact: true });
	await expect(musicButton).toHaveText('Gramophone');
	const buttonBox = (await musicButton.boundingBox())!;
	expect(buttonBox.height).toBe(108);
	expect(buttonBox.y).toBeCloseTo((await page.locator('.enter-button').boundingBox())!.y, 0);
	await expect(dock.getByRole('button', { name: 'Stop', exact: true })).toHaveCount(0);
	await expect(hint).toContainText('Lift the needle?');
	await expect(hint).toBeHidden();
	await expect(dock.locator('iframe')).not.toBeVisible();
	await dock.getByRole('button', { name: 'Open player', exact: true }).tap();
	await expect(dock.locator('iframe')).toBeVisible();
	const expandedBox = (await dock.boundingBox())!;
	expect(expandedBox.x).toBeGreaterThanOrEqual(16);
	expect(expandedBox.x + expandedBox.width).toBeLessThanOrEqual(304);
	expect(expandedBox.width).toBeCloseTo(288, 0);
	expect(expandedBox.y + expandedBox.height).toBeCloseTo(824, 0);
	await expect(page.getByRole('button', { name: 'Movement joystick' })).toHaveCount(0);
	await expect(page.locator('.enter-button')).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Room menu', exact: true })).toBeHidden();
	await expect(hint).toBeHidden();
	const playerFrame = dock.locator('iframe');
	await playerFrame.evaluate((element) =>
		element.setAttribute('data-playback-session', 'retained')
	);
	await dock.getByRole('button', { name: 'Hide player', exact: true }).tap();
	await fitsBetweenControls();
	await expect(musicButton).toBeFocused();
	await expect(playerFrame).toHaveAttribute('data-playback-session', 'retained');
	await expect.poll(() => spotifyCalls(page)).toEqual(['play']);
	await musicButton.tap();
	const canvas = page.locator('canvas');
	const position = await canvas.getAttribute('data-x');
	await canvas.focus();
	await page.keyboard.down('ArrowRight');
	await page.waitForTimeout(150);
	await page.keyboard.up('ArrowRight');
	await expect(canvas).toHaveAttribute('data-x', position!);
	await page.keyboard.press('Escape');
	await fitsBetweenControls();
	await expect(musicButton).toBeFocused();
	await expect(playerFrame).toHaveAttribute('data-playback-session', 'retained');
	await page.setViewportSize({ width: 844, height: 390 });
	await expect(hint).toBeHidden();
	await page.setViewportSize({ width: 320, height: 844 });
	await musicButton.tap();
	await dock.getByRole('button', { name: 'Stop', exact: true }).tap();
	await expect(hint).toBeVisible();
	await expect(hint).toContainText('Put a record on?');
	await page.locator('.enter-button').tap();
	await expect(dock.getByRole('button', { name: 'Open player', exact: true })).toBeVisible();
	await expect(hint).toBeHidden();
	await page.getByRole('button', { name: 'Room menu', exact: true }).tap();
	await page
		.getByRole('navigation', { name: 'In the room', exact: true })
		.getByRole('link', { name: 'Writing', exact: true })
		.tap();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.getByRole('button', { name: 'Close and return to the room' }).tap();
	await expect(musicButton).toBeInViewport();
	await fitsBetweenControls();
	await expect(hint).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
	await musicButton.tap();
	await dock.getByRole('button', { name: 'Stop', exact: true }).tap();
	await expect(dock).not.toBeVisible();
	await openMenu(page);
	await page.getByText('Little things in the room', { exact: true }).click();
	// Start walking and choose music in the same frame, before the station can arrive.
	await page.evaluate(() => {
		(window as unknown as { __room: { visit(id: string): void } }).__room.visit('camera');
		const action = [...document.querySelectorAll<HTMLButtonElement>('.little-things button')].find(
			(button) => button.textContent?.trim() === 'Put the record on'
		);
		action!.click();
	});
	await expect(musicButton).toBeEnabled();
	await expect(page).toHaveURL(/\/world\?diagnostics=1$/);
	await expect(hint).not.toContainText('Heading to');
	await musicButton.tap();
	await expect(dock.locator('iframe')).toBeVisible();
	await dock.getByRole('button', { name: 'Hide player', exact: true }).tap();
	await fitsBetweenControls();
	await context.close();
});

test('closing the menu gives the keyboard back to the room', async ({ page }) => {
	await openRoom(page);
	await settle(page);
	const canvas = page.locator('canvas');
	const menuButton = page.getByRole('button', { name: 'Room menu', exact: true });
	// Right, left, right: never far enough to reach a wall, however fast the frames come.
	for (const [close, key] of [
		[() => page.keyboard.press('Escape'), 'd'],
		[() => page.getByRole('button', { name: 'Close the menu' }).click(), 'a'],
		[() => menuButton.click(), 'd']
	] as const) {
		await openMenu(page);
		await close();
		await expect(page.getByRole('navigation', { name: 'In the room' })).not.toBeVisible();
		await expect(canvas).toBeFocused();
		const x = await canvas.getAttribute('data-x');
		await page.keyboard.down(key);
		await page.waitForTimeout(250);
		await page.keyboard.up(key);
		await expect(canvas).not.toHaveAttribute('data-x', x!);
		await settle(page);
	}
});

test('an open station scrolls with the keys and the wheel, and Space doesn’t close it', async ({
	page
}) => {
	await openRoom(page);
	await page.evaluate(() =>
		(window as unknown as { __room: { visit: (id: string) => void } }).__room.visit('shelf')
	);
	const sheet = page.getByRole('dialog');
	await expect(sheet).toBeVisible();
	await page.keyboard.press('Escape');
	await settle(page);
	await page.keyboard.press('e');
	await expect(sheet).toBeFocused();
	const top = () => sheet.evaluate((element) => element.scrollTop);
	// Back to the top once any smooth scroll has finished (it would carry on otherwise).
	const toTop = async () => {
		let last = -1;
		await expect
			.poll(async () => {
				const now = await top();
				const still = now === last;
				last = now;
				return still;
			})
			.toBe(true);
		await sheet.evaluate((element) => element.scrollTo({ top: 0, behavior: 'instant' }));
		await expect.poll(top).toBe(0);
	};
	// Each key from the top, so one big jump can't reach the bottom before the next key.
	for (const key of ['Space', 's', 'ArrowDown']) {
		await toTop();
		await page.keyboard.press(key);
		await expect.poll(top).toBeGreaterThan(0);
		await expect(sheet).toBeVisible();
	}
	await toTop();
	// The wheel over the room beside the sheet scrolls the sheet too.
	await page.mouse.move(300, 450);
	await page.mouse.wheel(0, 400);
	await expect.poll(top).toBeGreaterThan(0);
});

test('portrait touch input, sharp rendering, reduced motion, and low-power DPR', async ({
	browser
}) => {
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
	const rendering = () =>
		canvas.evaluate((element) => {
			const canvas = element as HTMLCanvasElement;
			return {
				width: canvas.width,
				height: canvas.height,
				antialias: canvas.getContext('webgl2')?.getContextAttributes()?.antialias
			};
		});
	// A 3× phone gets its real pixel density and smooth edges, even with touch input.
	await expect.poll(rendering).toEqual({ width: 1170, height: 2532, antialias: true });
	// Settings live in the menu; the OS preference is reflected there.
	await page.getByRole('button', { name: 'Room menu', exact: true }).tap();
	await page.getByText('Room settings', { exact: true }).click();
	await expect(page.getByRole('checkbox', { name: 'Less motion' })).toBeChecked();
	await page.keyboard.press('Escape');
	const start = await canvas.getAttribute('data-x');
	const spot = await floor(page, 0.5, 2.2);
	await page.touchscreen.tap(spot.x, spot.y);
	await expect(canvas).not.toHaveAttribute('data-x', start!);
	const desk = await anchor(page, 'desk');
	await page.touchscreen.tap(desk.x, desk.y);
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.getByRole('button', { name: 'Close and return to the room' }).tap();
	await page.getByRole('button', { name: 'Room menu', exact: true }).tap();
	await page.getByRole('checkbox', { name: 'Low power' }).check();
	await expect(page.locator('output')).toContainText('DPR 1 ·');
	await expect.poll(rendering).toEqual({ width: 390, height: 844, antialias: true });
	await page.getByRole('checkbox', { name: 'Low power' }).uncheck();
	await expect.poll(rendering).toEqual({ width: 1170, height: 2532, antialias: true });
	const size = await page.evaluate(() => ({
		scroll: document.documentElement.scrollWidth,
		width: window.innerWidth
	}));
	expect(size.scroll).toBeLessThanOrEqual(size.width);
	// The room is the page: nothing scrolls vertically either.
	expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBe(0);
	await page.getByRole('link', { name: 'Collectibles', exact: true }).tap();
	await expect(page.getByRole('navigation', { name: 'In the room' })).not.toBeVisible();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.getByRole('button', { name: 'Close and return to the room' }).tap();
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await page.screenshot({ path: 'test-results/world-mobile.png', fullPage: true });
	await context.close();
});

test('mobile joystick stops on release, cancellation, blur and menus; Enter opens a nearby object', async ({
	browser
}) => {
	const context = await browser.newContext({
		viewport: { width: 390, height: 844 },
		isMobile: true,
		hasTouch: true,
		reducedMotion: 'reduce'
	});
	const page = await context.newPage();
	await openRoom(page);
	const canvas = page.locator('canvas');
	const stick = page.getByRole('button', { name: 'Movement joystick' });
	const input = await context.newCDPSession(page);
	const snapshot = () =>
		page.evaluate(() =>
			(window as unknown as { __room: { snapshot(): { x: number; z: number } } }).__room.snapshot()
		);
	const drag = async (dx: number, dy: number) => {
		const box = (await stick.boundingBox())!;
		const x = box.x + box.width / 2;
		const y = box.y + box.height / 2;
		await input.send('Input.dispatchTouchEvent', {
			type: 'touchStart',
			touchPoints: [{ x, y, id: 1 }]
		});
		await input.send('Input.dispatchTouchEvent', {
			type: 'touchMove',
			touchPoints: [{ x: x + dx, y: y + dy, id: 1 }]
		});
	};
	const stopped = async () => {
		await expect(stick).not.toHaveClass(/active/);
		await settle(page);
		const at = await snapshot();
		await page.waitForTimeout(150);
		expect(await snapshot()).toEqual(at);
		return at;
	};
	await expect(stick).toBeVisible();
	const start = await snapshot();
	await drag(60, 0);
	await expect.poll(async () => (await snapshot()).x).toBeGreaterThan(start.x + 0.1);
	await input.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
	const released = await stopped();
	await drag(-60, 0);
	await expect.poll(async () => (await snapshot()).x).toBeLessThan(released.x - 0.1);
	await input.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
	await stopped();
	await drag(22, 0);
	await expect(stick).toHaveClass(/active/);
	await page.evaluate(() => window.dispatchEvent(new Event('blur')));
	await input.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
	await stopped();
	await drag(22, 0);
	await page.getByRole('button', { name: 'Room menu', exact: true }).click();
	await expect(page.locator('#room-menu')).toBeVisible();
	await expect(stick).toBeDisabled();
	await input.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
	await stopped();
	await page.keyboard.press('Escape');
	await expect(stick).toBeEnabled();
	await stick.focus();
	const beforeKeys = await snapshot();
	await page.keyboard.down('ArrowRight');
	await expect.poll(async () => (await snapshot()).x).toBeGreaterThan(beforeKeys.x + 0.05);
	await page.keyboard.up('ArrowRight');
	await stopped();
	await page.getByRole('button', { name: 'Room menu', exact: true }).tap();
	await page
		.getByRole('navigation', { name: 'In the room', exact: true })
		.getByRole('link', { name: 'Work & build', exact: true })
		.tap();
	await expect(page.getByRole('dialog')).toBeVisible();
	await expect(stick).toHaveCount(0);
	await page.getByRole('button', { name: 'Close and return to the room' }).tap();
	await expect(
		page.getByRole('button', { name: 'Explore Work & build', exact: true })
	).toBeEnabled();
	await page.getByRole('button', { name: 'Explore Work & build', exact: true }).tap();
	await page.getByRole('button', { name: 'Open Work & build', exact: true }).tap();
	await expect(stick).toHaveCount(0);
	await expect(page.locator('.menu-button')).toBeHidden();
	await page.getByRole('button', { name: 'Close and return to the room' }).tap();
	await expect(stick).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
	await expect(canvas).toHaveClass(/loaded/);
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
	await page.getByRole('link', { name: 'Photography', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Fujifilm X-T30 II' })).toBeVisible();
	await page.keyboard.press('Escape');
	await page.getByRole('status').getByRole('link', { name: 'See it on paper' }).click();
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
	await staticPage.getByRole('button', { name: 'Room menu', exact: true }).click();
	// One link per visible station (the lanyards are part of the corkboard).
	await expect(
		staticPage.getByRole('navigation', { name: 'In the room' }).getByRole('link')
	).toHaveCount(8);
	await staticPage.keyboard.press('Escape');
	await staticPage.getByRole('status').getByRole('link', { name: 'See it on paper' }).click();
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
		.getByRole('navigation', { name: 'Explore another way' })
		.getByRole('link', { name: 'See it on paper' })
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
		['shelf', 'Blastoise gets the top shelf.'],
		['corkboard', 'Pinned to the corkboard'],
		['mirror', 'Making complicated things make sense.'],
		['window', 'Right now'],
		['door', 'Elsewhere']
	]) {
		await openMenu(page);
		await page
			.getByRole('navigation', { name: 'In the room', exact: true })
			.getByRole('link', {
				name: (
					{
						desk: 'Work & build',
						notebook: 'Writing',
						camera: 'Photography',
						shelf: 'Collectibles',
						corkboard: 'Community & speaking',
						mirror: 'About',
						window: 'Now',
						door: 'Elsewhere & contact'
					} as Record<string, string>
				)[name],
				exact: true
			})
			.click();
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
	await page.getByRole('link', { name: 'See it on paper', exact: false }).focus();
	await page.keyboard.press('d');
	await expect(page.getByRole('link', { name: 'See it on paper', exact: false })).toBeFocused();
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
