import { test, expect, type BrowserContext } from '@playwright/test';

const modeCookie = async (context: BrowserContext) =>
	(await context.cookies()).find((cookie) => cookie.name === 'mode')?.value;

test('first visit to / opens World and varies on the cookie', async ({ page }) => {
	const response = await page.goto('/');
	expect(response?.headers()['vary']).toContain('Cookie');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Come spend a minute');
	await expect(
		page.getByRole('navigation', { name: 'Website mode' }).getByRole('link', { name: 'World' })
	).toHaveAttribute('aria-current', 'page');
});

test('/index and /world set the preference that / then renders', async ({ page, context }) => {
	const scripts: string[] = [];
	page.on('response', async (response) => {
		if (response.request().resourceType() === 'script') scripts.push(await response.text());
	});
	await page.goto('/index');
	expect(await modeCookie(context)).toBe('index');
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('bring people together');
	await expect(
		page.getByRole('navigation', { name: 'Website mode' }).getByRole('link', { name: 'Index' })
	).toHaveAttribute('aria-current', 'page');
	await page.waitForLoadState('networkidle');
	expect(scripts.some((script) => script.includes('WebGLRenderer'))).toBe(false);

	// Client-side navigation through the switch also updates the preference.
	await page
		.getByRole('navigation', { name: 'Website mode' })
		.getByRole('link', { name: 'World' })
		.click();
	await expect(page).toHaveURL(/\/world$/);
	await expect.poll(() => modeCookie(context)).toBe('world');
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Come spend a minute');
});

test('the server renders the saved mode, so there is no flash without JavaScript', async ({
	browser
}) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Come spend a minute');
	await context.addCookies([{ name: 'mode', value: 'index', url: 'http://127.0.0.1:4173/' }]);
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('bring people together');
	await context.close();
});
