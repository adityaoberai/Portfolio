import { test, expect } from '@playwright/test';

test('an object is addressable, Back dismisses it, and Forward restores it', async ({ page }) => {
	await page.goto('/index');
	await page.getByRole('navigation', { name: 'Explore another way' }).getByRole('link').click();
	await expect(page.locator('canvas')).toHaveClass(/loaded/);
	await page.getByRole('button', { name: 'Room menu', exact: true }).click();
	await page
		.getByRole('navigation', { name: 'In the room', exact: true })
		.getByRole('link', { name: 'Pokémon', exact: true })
		.click();
	await expect(page.locator('dialog.sheet:not(.poem)')).toBeVisible();
	await expect(page).toHaveURL(/\/world#shelf$/);
	await page.goBack();
	await expect(page).toHaveURL(/\/world$/);
	await expect(page.locator('dialog.sheet:not(.poem)')).not.toBeVisible();
	await page.goForward();
	await expect(page.getByRole('heading', { name: 'Blastoise gets the top shelf.' })).toBeVisible();
	await page.reload();
	await expect(page.getByRole('heading', { name: 'Blastoise gets the top shelf.' })).toBeVisible();
});

test('a cold shared link closes within the room', async ({ page }) => {
	await page.goto('/world#camera');
	await expect(page.getByRole('heading', { name: 'Fujifilm X-T30 II', exact: true })).toBeVisible();
	await expect(page.getByText('Fujifilm X-T30 II', { exact: true })).toHaveCount(1);
	await expect(page.locator('.exif')).toHaveCount(0);
	await page.getByRole('button', { name: 'Close and return to the room' }).click();
	await expect(page).toHaveURL(/\/world$/);
	await expect(page.locator('canvas')).toHaveClass(/loaded/);
});

for (const width of [320, 390, 430]) {
	test(`mobile object cards and reading sheets at ${width}px`, async ({ browser }) => {
		const context = await browser.newContext({
			viewport: { width, height: 844 },
			isMobile: true,
			hasTouch: true
		});
		const page = await context.newPage();
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(e.message));
		await page.goto('/world?diagnostics=1');
		await expect(page.locator('canvas')).toHaveClass(/loaded/);
		await expect(page.locator('.destinations')).toHaveCount(0);
		await expect(page.locator('.welcome p')).toBeHidden();
		await expect(page.locator('.welcome')).toBeHidden();
		const menuButton = page.getByRole('button', { name: 'Room menu', exact: true });
		const buttonBox = (await menuButton.boundingBox())!;
		expect(buttonBox.y).toBeGreaterThan(844 * 0.75);
		expect(buttonBox.x).toBeGreaterThan(width / 2);
		expect(buttonBox.height).toBeGreaterThanOrEqual(44);
		const stickBox = (await page.getByRole('button', { name: 'Movement joystick' }).boundingBox())!;
		expect(stickBox.x).toBeLessThan(width / 2);
		expect(stickBox.y).toBeGreaterThan(844 * 0.75);
		const enterBox = (await page.locator('.enter-button').boundingBox())!;
		expect(enterBox.x).toBeCloseTo(buttonBox.x, 0);
		expect(enterBox.y + enterBox.height).toBeLessThan(buttonBox.y);
		await menuButton.tap();
		const menu = page.locator('#room-menu');
		await expect(menu).toBeVisible();
		expect((await menu.boundingBox())!.height).toBeCloseTo(844, 0);
		await expect(menu.getByRole('link', { name: 'See it on paper', exact: true })).toBeVisible();
		const destinations = menu.getByRole('navigation', { name: 'In the room', exact: true });
		await expect(destinations.getByRole('link')).toHaveCount(8);
		for (const link of await destinations.getByRole('link').all())
			expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
		await menu.evaluate((element) => (element.scrollTop = element.scrollHeight));
		await expect(menu.getByRole('button', { name: 'Close the menu' })).toBeInViewport();
		await destinations.getByRole('link', { name: 'Photography', exact: true }).tap();
		const sheet = page.locator('dialog.sheet:not(.poem)');
		await expect(sheet).toBeVisible();
		await expect(page).toHaveURL(/#camera$/);
		await expect(sheet.getByRole('heading', { name: 'Photography', exact: true })).toBeVisible();
		await expect(sheet.locator('.object-summary')).toContainText('Street, travel');
		expect(await sheet.evaluate((e) => e.matches(':modal'))).toBe(false);
		expect((await sheet.boundingBox())!.height).toBeLessThan(844 * 0.3);
		await expect(menuButton).toBeVisible();
		await expect
			.poll(async () => {
				const anchors = await page.evaluate(() => {
					const room = (
						window as unknown as {
							__room: { anchor(id: string): { x: number; y: number } };
						}
					).__room;
					return ['desk', 'camera', 'shelf', 'mirror', 'door'].map((id) => room.anchor(id));
				});
				const box = (await sheet.boundingBox())!;
				return anchors.every(
					(anchor) => anchor.y > 110 && anchor.y < box.y && anchor.x > 0 && anchor.x < width
				);
			})
			.toBe(true);
		await sheet.getByRole('button', { name: 'Open Photography', exact: true }).tap();
		expect(await sheet.evaluate((e) => e.matches(':modal'))).toBe(true);
		await expect.poll(async () => (await sheet.boundingBox())!.height).toBeCloseTo(844 * 0.75, 0);
		await expect(
			sheet.getByRole('heading', { name: 'Fujifilm X-T30 II', exact: true })
		).toBeVisible();
		await expect(sheet.getByRole('link', { name: /^View photo:/ })).toHaveCount(6);
		await sheet.evaluate((e) => e.scrollTo({ top: e.scrollHeight, behavior: 'instant' }));
		await expect(
			sheet.getByRole('button', { name: 'Close and return to the room' })
		).toBeInViewport();
		await page.setViewportSize({ width: 844, height: 390 });
		await expect(
			sheet.getByRole('button', { name: 'Close and return to the room' })
		).toBeInViewport();
		await page.setViewportSize({ width, height: 844 });
		await sheet.getByRole('button', { name: 'See room' }).tap();
		await expect(
			sheet.getByRole('button', { name: 'Open Photography', exact: true })
		).toBeVisible();
		// A card leaves the room interactive; another object replaces it without stacking sheets.
		let previousFrames = '';
		await expect
			.poll(
				async () => {
					const frames = (await page.locator('canvas').getAttribute('data-frames')) ?? '';
					const settled = frames === previousFrames;
					previousFrames = frames;
					return settled;
				},
				{ intervals: [150] }
			)
			.toBe(true);
		const desk = await page.evaluate(() =>
			(
				window as unknown as {
					__room: { project(point: number[]): { x: number; y: number } };
				}
			).__room.project([-3.0, 1.35, -2.2])
		);
		await page.touchscreen.tap(desk.x, desk.y);
		await expect(
			sheet.getByRole('button', { name: 'Open Work & build', exact: true })
		).toBeEnabled();
		await expect(page).toHaveURL(/#desk$/);
		await sheet.getByRole('button', { name: 'Open Work & build', exact: true }).tap();
		await expect.poll(async () => (await sheet.boundingBox())!.height).toBeCloseTo(844 * 0.75, 0);
		const launchDescription = sheet.locator('.entries li').first().locator('p');
		await expect(launchDescription).toContainText(
			"Leading Appwrite's public-facing product releases end to end"
		);
		await expect(launchDescription).toBeInViewport({ ratio: 0.25 });
		await expect(
			sheet.getByRole('heading', { name: 'Documentation and website ownership', exact: true })
		).toBeVisible();
		const project = sheet.getByRole('heading', { name: 'Relief ATL', exact: true });
		await project.scrollIntoViewIfNeeded();
		const scroll = await sheet.evaluate((e) => e.scrollTop);
		expect(scroll).toBeGreaterThan(100);
		await sheet.getByRole('button', { name: 'See room' }).tap();
		await expect(
			sheet.getByRole('button', { name: 'Open Work & build', exact: true })
		).toBeVisible();
		expect(await sheet.evaluate((e) => e.matches(':modal'))).toBe(false);
		await sheet.getByRole('button', { name: 'Open Work & build', exact: true }).tap();
		await expect.poll(() => sheet.evaluate((e) => e.scrollTop)).toBeCloseTo(scroll, 0);
		await expect(project).toBeInViewport();
		await sheet.getByRole('button', { name: 'Close and return to the room' }).tap();
		await expect(sheet).not.toBeVisible();
		await page.goForward();
		await expect(
			sheet.getByRole('button', { name: 'Open Work & build', exact: true })
		).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(sheet).not.toBeVisible();
		await menuButton.tap();
		await page.keyboard.press('Escape');
		await expect(menu).not.toBeVisible();
		await expect(page.locator('canvas')).toBeFocused();
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
		).toBeLessThanOrEqual(0);
		expect(errors).toEqual([]);
		await context.close();
	});
}

test('mobile Now shows Bengaluru time and refreshes it without reopening the card', async ({
	browser
}) => {
	const context = await browser.newContext({
		viewport: { width: 390, height: 844 },
		isMobile: true,
		hasTouch: true,
		reducedMotion: 'reduce'
	});
	const page = await context.newPage();
	await page.clock.install({ time: new Date('2026-10-23T09:00:00Z') });
	await page.goto('/world#window');
	const sheet = page.locator('dialog.object-card');
	await expect(sheet.getByRole('heading', { name: 'Now', exact: true })).toBeVisible();
	const time = sheet.locator('time');
	await expect(time).toHaveText('2:30 pm');
	await page.clock.fastForward('01:00');
	await expect(time).toHaveText('2:31 pm');
	const heading = (await sheet.getByRole('heading').boundingBox())!;
	expect(Math.abs((await time.boundingBox())!.y - heading.y)).toBeLessThan(16);
	await page.getByRole('button', { name: 'Room menu', exact: true }).tap();
	await expect(
		page.locator('#room-menu').getByRole('link', { name: 'Now', exact: true }).locator('time')
	).toHaveText('2:31 pm');
	await context.close();
});

test('On paper and the room preserve a panel and its reading position', async ({ page }) => {
	await page.goto('/world#desk');
	const sheet = page.locator('dialog.sheet:not(.poem)');
	await expect(sheet).toBeVisible();
	const scroll = await sheet.evaluate((element) => {
		element.scrollTop = element.scrollHeight;
		return element.scrollTop;
	});
	expect(scroll).toBeGreaterThan(100);
	// Browser navigation can leave a panel open; its reading position still restores.
	await page.goto('/index#work');
	await expect(page).toHaveURL(/\/index#work$/);
	await expect(page.locator('#work')).toBeFocused();
	await page.getByRole('navigation', { name: 'Explore another way' }).getByRole('link').click();
	await expect(page).toHaveURL(/\/world#desk$/);
	await expect(sheet).toBeVisible();
	await expect.poll(() => sheet.evaluate((element) => element.scrollTop)).toBeCloseTo(scroll, 0);
});

test('the photo reader has keyboard controls and its own Back entry', async ({ page }) => {
	await page.goto('/photography');
	await page
		.getByRole('link', { name: /^View photo:/ })
		.first()
		.click();
	const viewer = page.getByRole('dialog');
	await expect(viewer).toBeVisible();
	const title = await viewer.getByRole('heading').textContent();
	await page.keyboard.press('ArrowRight');
	await expect(viewer.getByRole('heading')).not.toHaveText(title!);
	await page.goBack();
	await expect(viewer).not.toBeVisible();
	await expect(page).toHaveURL(/\/photography$/);
});

test('mobile On paper keeps the portrait, labels, and typography usable with larger text', async ({
	browser
}) => {
	const context = await browser.newContext({ viewport: { width: 360, height: 780 } });
	const page = await context.newPage();
	await page.goto('/index');
	const portrait = page.getByRole('img', { name: 'Aditya Oberai', exact: true });
	await expect(portrait).toBeVisible();
	await expect(portrait).toHaveCSS('border-radius', '0px');
	const imageBox = (await portrait.boundingBox())!;
	const headingBox = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
	const ledeBox = (await page.locator('.intro .lede').boundingBox())!;
	expect(imageBox.width).toBeCloseTo(imageBox.height, 0);
	expect(imageBox.y).toBeGreaterThan(headingBox.y + headingBox.height);
	expect(ledeBox.y).toBeGreaterThan(imageBox.y + imageBox.height);
	await expect(page.getByText('The index · a few ways to know me', { exact: true })).toHaveCount(0);
	await expect(
		page.getByRole('navigation', { name: 'Find your way' }).getByRole('link', { name: /^Now/ })
	).toHaveCount(0);
	await page.addStyleTag({
		content:
			'html { font-size: 200% !important; } * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }'
	});
	expect(
		await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
	).toBeLessThanOrEqual(0);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await context.close();
});
