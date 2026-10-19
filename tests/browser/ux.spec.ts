import { test, expect } from '@playwright/test';

test('an object is addressable, Back dismisses it, and Forward restores it', async ({ page }) => {
	await page.goto('/index');
	await page.getByRole('navigation', { name: 'Explore another way' }).getByRole('link').click();
	await expect(page.locator('canvas')).toHaveClass(/loaded/);
	await page.getByRole('button', { name: 'Room menu', exact: true }).click();
	await page
		.getByRole('navigation', { name: 'In the room', exact: true })
		.getByRole('link', { name: 'Collection', exact: true })
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
	test(`mobile menu and measured previews at ${width}px`, async ({ browser }) => {
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
		const menuButton = page.getByRole('button', { name: 'Room menu', exact: true });
		const buttonBox = (await menuButton.boundingBox())!;
		expect(buttonBox.y).toBeLessThan(100);
		expect(buttonBox.height).toBeGreaterThanOrEqual(44);
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
		await expect(sheet.getByRole('button', { name: 'Keep reading' })).toBeVisible();
		expect((await sheet.boundingBox())!.height).toBeLessThan(844 * 0.5);
		await expect
			.poll(async () => {
				const anchor = await page.evaluate(() =>
					(
						window as unknown as { __room: { anchor(id: string): { x: number; y: number } } }
					).__room.anchor('camera')
				);
				const box = (await sheet.boundingBox())!;
				return anchor.y > 80 && anchor.y < box.y && anchor.x > 0 && anchor.x < width;
			})
			.toBe(true);
		await sheet.getByRole('button', { name: 'Keep reading' }).tap();
		await expect.poll(async () => (await sheet.boundingBox())!.height).toBeGreaterThan(844 * 0.85);
		await sheet.evaluate((e) => e.scrollTo({ top: e.scrollHeight, behavior: 'instant' }));
		await expect(
			sheet.getByRole('button', { name: 'Close and return to the room' })
		).toBeInViewport();
		await page.setViewportSize({ width: 844, height: 390 });
		await expect(
			sheet.getByRole('button', { name: 'Close and return to the room' })
		).toBeInViewport();
		await page.setViewportSize({ width, height: 844 });
		await sheet.getByRole('button', { name: 'Close and return to the room' }).tap();
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
	await expect(page.getByRole('img', { name: 'Aditya Oberai', exact: true })).toBeVisible();
	await expect(page.getByText('The index · a few ways to know me', { exact: true })).toHaveCount(0);
	await expect(
		page.getByRole('navigation', { name: 'Find your way' }).getByRole('link', { name: /^Now/ })
	).toBeVisible();
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
