import { test, expect, type Page } from '@playwright/test';

const site = 'https://adityaoberai.com';
test.use({ baseURL: site, reducedMotion: 'reduce' });

type AnalyticsEvent = {
	name: string;
	url: string;
	props?: string[];
	scrollDepth?: number;
	engagementTime?: number;
};

async function captureEvents(page: Page) {
	const events: AnalyticsEvent[] = [];
	// Serve the built app under its production hostname without publishing it.
	await page.route(`${site}/**`, async (route) => {
		const url = new URL(route.request().url());
		const response = await route.fetch({
			url: `http://127.0.0.1:4173${url.pathname}${url.search}`
		});
		await route.fulfill({ response });
	});
	// Exercise the real SDK without sending test traffic to the portfolio property.
	await page.route('https://sgp.cloud.appwrite.io/v1/analytics/properties/*/events', (route) => {
		const request = route.request();
		expect(request.url()).toContain('/properties/6ae0a115002177037121/events');
		if (request.method() === 'POST') {
			expect(request.headers()['x-appwrite-project']).toBe('6adf4e1e00316521b4f6');
			events.push(request.postDataJSON());
		}
		return route.fulfill({
			status: request.method() === 'OPTIONS' ? 204 : 202,
			contentType: 'application/json',
			body: request.method() === 'OPTIONS' ? undefined : '{}',
			headers: {
				'access-control-allow-origin': site,
				'access-control-allow-credentials': 'true',
				'access-control-allow-methods': 'POST, OPTIONS',
				'access-control-allow-headers': request.headers()['access-control-request-headers'] ?? '*'
			}
		});
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
	await page.locator('.room-invitation').click();
	await expect(page.locator('canvas.loaded')).toBeVisible();
	await expect.poll(() => events.filter((event) => event.name === 'mode_switched').length).toBe(3);
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
		'speaking',
		'section',
		'contact_page'
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
	// The legacy DOCX route must report the format it actually serves.
	await page
		.getByRole('link', { name: /Resume \(PDF\)/ })
		.evaluate((anchor) => anchor.setAttribute('href', '/resume/docx'));
	await page.getByRole('link', { name: /Resume \(PDF\)/ }).click();
	await expect.poll(() => events.filter((event) => event.name === 'file_download').length).toBe(3);
	expect(events.filter((event) => event.name === 'file_download').at(-1)?.props).toContain('docx');
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
	await page.goto('/contact');
	await page
		.locator('main a[href^="mailto:"]')
		.first()
		.evaluate((anchor) => {
			anchor.addEventListener('click', (event) => event.preventDefault());
		});
	await page.locator('main a[href^="mailto:"]').first().click();
	expect(events).toEqual([]);
});

test('contact views and channel clicks identify the contact page and footer', async ({ page }) => {
	const events = await captureEvents(page);
	await page.goto('/contact');
	await expect
		.poll(() => events.filter((event) => event.name === 'contact_section_viewed').length)
		.toBe(1);
	expect(events.find((event) => event.name === 'contact_section_viewed')?.props).toEqual([
		'section',
		'contact_page'
	]);
	await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault()));
	await page.locator('main a[href^="mailto:"]').first().click();
	await page.locator('main a[href^="https://www.linkedin.com/"]').click();
	await page.locator('footer a[href^="https://www.linkedin.com/"]').click();
	await expect
		.poll(() => events.filter((event) => event.name === 'contact_clicked').length)
		.toBe(3);
	expect(
		events.filter((event) => event.name === 'contact_clicked').map((event) => event.props)
	).toEqual([
		['method', 'email', 'purpose', 'general', 'section', 'contact_page'],
		['method', 'linkedin', 'purpose', 'general', 'section', 'contact_page'],
		['method', 'linkedin', 'purpose', 'general', 'section', 'footer']
	]);
	// The existing meeting shortcut is recognized without changing its redirect.
	await page
		.locator('main a[href="/resume"]')
		.evaluate((anchor) => anchor.setAttribute('href', '/meet'));
	await page.locator('main a[href="/meet"]').click();
	await expect
		.poll(() => events.filter((event) => event.name === 'contact_clicked').length)
		.toBe(4);
	expect(events.filter((event) => event.name === 'contact_clicked').at(-1)?.props).toEqual([
		'method',
		'meeting',
		'purpose',
		'general',
		'section',
		'contact_page'
	]);
});

test('mobile contact preview counts a view only when its reader opens', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const events = await captureEvents(page);
	await page.goto('/world');
	await expect(page.locator('canvas.loaded')).toBeVisible();
	await page.getByRole('button', { name: 'Room menu', exact: true }).click();
	await page
		.getByRole('navigation', { name: 'In the room', exact: true })
		.getByRole('link', { name: 'Elsewhere & contact', exact: true })
		.click();
	await expect(
		page.getByRole('button', { name: 'Open Elsewhere & contact', exact: true })
	).toBeVisible();
	expect(events.filter((event) => event.name === 'contact_section_viewed')).toHaveLength(0);
	expect(events.find((event) => event.name === 'contact_clicked')?.props).toEqual([
		'method',
		'contact_panel',
		'purpose',
		'general',
		'section',
		'room_menu'
	]);
	await page.getByRole('button', { name: 'Open Elsewhere & contact', exact: true }).click();
	await expect
		.poll(() => events.filter((event) => event.name === 'contact_section_viewed').length)
		.toBe(1);
	expect(events.find((event) => event.name === 'contact_section_viewed')?.props).toEqual([
		'section',
		'room'
	]);
	const email = page.getByRole('dialog').locator('a[href^="mailto:"]');
	await email.evaluate((anchor) =>
		anchor.addEventListener('click', (event) => event.preventDefault())
	);
	await email.click();
	await expect
		.poll(() => events.filter((event) => event.name === 'contact_clicked').length)
		.toBe(2);
	expect(events.filter((event) => event.name === 'contact_clicked').at(-1)?.props).toEqual([
		'method',
		'email',
		'purpose',
		'general',
		'section',
		'room'
	]);
	await page.getByRole('button', { name: 'See room', exact: false }).click();
	await page.getByRole('button', { name: 'Open Elsewhere & contact', exact: true }).click();
	await expect(page.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
	expect(events.filter((event) => event.name === 'contact_section_viewed')).toHaveLength(1);
});

test('local and preview hosts do not emit production analytics', async ({ page }) => {
	const requests: string[] = [];
	await page.route('https://sgp.cloud.appwrite.io/**', async (route) => {
		requests.push(route.request().url());
		await route.abort();
	});
	await page.goto('http://127.0.0.1:4173/index');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('bring people together');
	await page.route('https://world.oberai.dev/**', async (route) => {
		const url = new URL(route.request().url());
		const response = await route.fetch({
			url: `http://127.0.0.1:4173${url.pathname}${url.search}`
		});
		await route.fulfill({ response });
	});
	await page.goto('https://world.oberai.dev/work');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('The work');
	expect(requests).toEqual([]);
});
