import { test, expect, type Page } from '@playwright/test';

type AnalyticsEvent = {
	name: string;
	url: string;
	props?: string[];
	scrollDepth?: number;
	engagementTime?: number;
};

async function captureEvents(page: Page) {
	const events: AnalyticsEvent[] = [];
	// Exercise the real SDK without sending test traffic to the portfolio property.
	await page.route('https://sgp.cloud.appwrite.io/v1/analytics/properties/*/events', (route) => {
		const request = route.request();
		expect(request.url()).toContain('/properties/6ae0a115002177037121/events');
		expect(request.headers()['x-appwrite-project']).toBe('6adf4e1e00316521b4f6');
		events.push(request.postDataJSON());
		return route.fulfill({ status: 202, contentType: 'application/json', body: '{}' });
	});
	return events;
}

test('initial, client navigation, and Back each produce one pageview', async ({ page }) => {
	const events = await captureEvents(page);
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/about');
	await expect.poll(() => events.filter((event) => event.name === 'pageview').length).toBe(1);
	await page
		.getByRole('navigation', { name: 'Sections', exact: true })
		.getByRole('link', { name: 'Work', exact: true })
		.click();
	await expect(page).toHaveURL(/\/work$/);
	await expect.poll(() => events.filter((event) => event.name === 'pageview').length).toBe(2);
	await page.goBack();
	await expect(page).toHaveURL(/\/about$/);
	await expect.poll(() => events.filter((event) => event.name === 'pageview').length).toBe(3);
	expect(
		events.filter((event) => event.name === 'pageview').map((event) => new URL(event.url).pathname)
	).toEqual(['/about', '/work', '/about']);
	expect(errors).toEqual([]);
});

test('scroll depth and active engagement flush on client navigation', async ({ page }) => {
	const events = await captureEvents(page);
	await page.goto('/writing');
	await expect.poll(() => events.length).toBeGreaterThan(0);
	await page.mouse.wheel(0, 600);
	await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
	await page.waitForTimeout(1100);
	await page
		.getByRole('navigation', { name: 'Sections', exact: true })
		.getByRole('link', { name: 'Work', exact: true })
		.click();
	await expect(page).toHaveURL(/\/work$/);
	await expect.poll(() => events.filter((event) => event.name === 'scroll_depth').length).toBe(1);
	await expect
		.poll(() => events.filter((event) => event.name === 'engagement_time').length)
		.toBe(1);
	expect(events.find((event) => event.name === 'scroll_depth')?.scrollDepth).toBeGreaterThan(0);
	expect(events.find((event) => event.name === 'engagement_time')?.engagementTime).toBeGreaterThan(
		0
	);
});

test('room stations and both mode switches send portfolio events', async ({ page }) => {
	const events = await captureEvents(page);
	await page.goto('/index');
	await expect.poll(() => events.length).toBeGreaterThan(0);
	await page.getByRole('navigation', { name: 'Explore another way' }).getByRole('link').click();
	await expect(page.locator('canvas')).toHaveClass(/loaded/);
	await expect.poll(() => events.filter((event) => event.name === 'mode_switched').length).toBe(1);
	await page.getByRole('button', { name: 'Room menu', exact: true }).click();
	await page
		.getByRole('navigation', { name: 'In the room', exact: true })
		.getByRole('link', { name: 'Collectibles', exact: true })
		.click();
	await expect(page.locator('dialog.sheet:not(.poem)')).toBeVisible();
	await expect
		.poll(() => events.filter((event) => event.name === 'room_station_opened').length)
		.toBe(1);
	expect(events.find((event) => event.name === 'room_station_opened')?.props).toEqual([
		'station',
		'shelf'
	]);
	await page.getByRole('button', { name: 'Close and return to the room', exact: true }).click();
	await page.getByRole('navigation', { name: 'Explore another way' }).getByRole('link').click();
	await expect(page).toHaveURL(/\/index/);
	await expect.poll(() => events.filter((event) => event.name === 'mode_switched').length).toBe(2);
	expect(
		events.filter((event) => event.name === 'mode_switched').map((event) => event.props)
	).toEqual([
		['from', 'index', 'to', 'world'],
		['from', 'world', 'to', 'index']
	]);
});

test('photo viewer records each visible photo once without a shallow-state pageview', async ({
	page
}) => {
	const events = await captureEvents(page);
	await page.goto('/photography');
	await expect.poll(() => events.length).toBeGreaterThan(0);
	await page
		.getByRole('link', { name: /^View photo:/ })
		.first()
		.click();
	await expect(page.locator('dialog.photo-viewer')).toBeVisible();
	await expect.poll(() => events.filter((event) => event.name === 'photo_viewed').length).toBe(1);
	await page.getByRole('button', { name: /Next photo/ }).click();
	await expect.poll(() => events.filter((event) => event.name === 'photo_viewed').length).toBe(2);
	const views = events.filter((event) => event.name === 'photo_viewed');
	expect(views[0].props).not.toEqual(views[1].props);
	expect(views.every((event) => event.props?.includes('photography'))).toBe(true);
	expect(events.filter((event) => event.name === 'pageview')).toHaveLength(1);
});

test('contact, outbound links, and resume redirect downloads are tracked', async ({ page }) => {
	const events = await captureEvents(page);
	await page.goto('/contact');
	await expect.poll(() => events.length).toBeGreaterThan(0);
	// Avoid launching a mail client or navigating away while exercising actual link clicks.
	await page.evaluate(() =>
		document.addEventListener('click', (event) => {
			if (event.target instanceof Element && event.target.closest('a[href]'))
				event.preventDefault();
		})
	);
	await page.getByRole('link', { name: /Speaking invitation/ }).click();
	await expect
		.poll(() => events.filter((event) => event.name === 'contact_clicked').length)
		.toBe(1);
	expect(events.find((event) => event.name === 'contact_clicked')?.props).toEqual([
		'method',
		'email',
		'purpose',
		'speaking'
	]);
	await page.getByRole('link', { name: /Resume \(PDF\)/ }).click();
	await expect.poll(() => events.filter((event) => event.name === 'file_download').length).toBe(1);
	expect(events.find((event) => event.name === 'file_download')?.props).toContain('resume.pdf');
	await page.locator('main a[href="https://oberai.blog"]').click();
	await expect.poll(() => events.filter((event) => event.name === 'outbound_link').length).toBe(1);
	expect(events.find((event) => event.name === 'outbound_link')?.props).toContain('oberai.blog');
	// The auto-download handler also covers direct file links, without the alias fallback.
	await page
		.getByRole('link', { name: /Resume \(PDF\)/ })
		.evaluate((anchor) => anchor.setAttribute('href', '/resume.pdf'));
	await page.getByRole('link', { name: /Resume \(PDF\)/ }).click();
	await expect.poll(() => events.filter((event) => event.name === 'file_download').length).toBe(2);
});

test('Do Not Track suppresses automatic and custom events', async ({ page }) => {
	const events = await captureEvents(page);
	await page.addInitScript(() =>
		Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' })
	);
	await page.goto('/photography');
	await page
		.getByRole('link', { name: /^View photo:/ })
		.first()
		.click();
	await expect(page.locator('dialog.photo-viewer')).toBeVisible();
	await page.getByRole('button', { name: /Next photo/ }).click();
	await page.getByRole('button', { name: 'Close photo' }).click();
	await page
		.getByRole('navigation', { name: 'Sections', exact: true })
		.getByRole('link', { name: 'Work', exact: true })
		.click();
	await expect(page).toHaveURL(/\/work$/);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	expect(events).toEqual([]);
});
