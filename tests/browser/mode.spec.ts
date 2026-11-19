import { test, expect, type BrowserContext } from '@playwright/test';

const modeCookie = async (context: BrowserContext) =>
	(await context.cookies()).find((cookie) => cookie.name === 'mode')?.value;

test('the first visit shows the welcome and loads the scene only after entry', async ({
	page,
	context
}) => {
	const scripts: Promise<string>[] = [];
	page.on('response', (response) => {
		if (response.request().resourceType() === 'script')
			scripts.push(response.text().catch(() => ''));
	});
	const hasRenderer = async () =>
		(await Promise.all(scripts)).some((script) => script.includes('WebGLRenderer'));
	const response = await page.goto('/');
	expect(response?.headers()['vary']).toContain('Cookie');
	const welcome = page.getByRole('dialog', { name: 'Come spend a minute in my world.' });
	const enter = welcome.getByRole('link', { name: 'Enter the room' });
	await expect(page.locator('dialog:modal')).toHaveCount(1);
	await expect(enter).toBeFocused();
	await enter.hover();
	await page.waitForLoadState('networkidle');
	expect(await modeCookie(context)).toBeUndefined();
	expect(await hasRenderer()).toBe(false);
	await expect(page.locator('canvas')).toHaveCount(0);

	await enter.click();
	await expect(page).toHaveURL(/\/world$/);
	await expect(page.locator('canvas')).toHaveClass(/\bloaded\b/);
	expect(await hasRenderer()).toBe(true);
	await expect(welcome).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Room menu', exact: true })).toBeVisible();
	expect(await modeCookie(context)).toBe('world');
	await page.goto('/');
	await expect(page.locator('canvas')).toHaveClass(/\bloaded\b/);
	await expect(welcome).toHaveCount(0);
});

test('the welcome index link and the room switch set the preferred view', async ({
	page,
	context
}) => {
	const scripts: string[] = [];
	page.on('response', async (response) => {
		if (response.request().resourceType() === 'script')
			scripts.push(await response.text().catch(() => '')); // A later navigation can discard a response body.
	});
	await page.goto('/');
	await page.getByRole('dialog').getByRole('link', { name: 'See it on paper' }).click();
	await expect(page).toHaveURL(/\/index$/);
	expect(await modeCookie(context)).toBe('index');
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('bring people together');
	await expect(
		page
			.getByRole('navigation', { name: 'Explore another way' })
			.getByRole('link', { name: 'Step into my room' })
	).toBeVisible();
	await page.waitForLoadState('networkidle');
	expect(scripts.some((script) => script.includes('WebGLRenderer'))).toBe(false);

	// Client-side navigation through the switch also updates the preference.
	await page
		.getByRole('navigation', { name: 'Explore another way' })
		.getByRole('link', { name: 'Step into my room' })
		.click();
	await expect(page).toHaveURL(/\/world$/);
	await expect.poll(() => modeCookie(context)).toBe('world');
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Aditya Oberai’s room');
	await expect(page.getByRole('dialog', { name: /Come spend a minute/ })).toHaveCount(0);
});

test('Escape closes the welcome and saves the room preference', async ({ page, context }) => {
	await page.goto('/');
	await expect(page.locator('dialog:modal')).toHaveCount(1);
	await page.keyboard.press('Escape');
	await expect(page).toHaveURL(/\/world$/);
	await expect(page.getByRole('dialog', { name: /Come spend a minute/ })).toHaveCount(0);
	expect(await modeCookie(context)).toBe('world');
});

for (const mode of ['unset', 'index', 'world'] as const) {
	test(`a legacy station link opens the camera and preserves the ${mode} preference`, async ({
		page,
		context
	}) => {
		if (mode !== 'unset') await page.goto(`/${mode}`);
		await page.goto('/#camera');
		await expect(page).toHaveURL(mode === 'world' ? /\/#camera$/ : /\/world\?keep-mode=1#camera$/);
		await expect(
			page.getByRole('heading', { name: 'Fujifilm X-T30 II', exact: true })
		).toBeVisible();
		expect(await modeCookie(context)).toBe(mode === 'unset' ? undefined : mode);

		if (mode !== 'world') {
			await page.goto('/');
			await expect(page.getByRole('heading', { level: 1 })).toContainText(
				mode === 'unset' ? 'Come spend a minute' : 'bring people together'
			);
		}
	});
}
