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
	await page.context().route(`${site}/**`, async (route) => {
		const url = new URL(route.request().url());
		const response = await route.fetch({
			url: `http://127.0.0.1:4173${url.pathname}${url.search}`
		});
		await route.fulfill({ response });
	});
	// Exercise the real SDK without sending test traffic to the portfolio property.
	await page
		.context()
		.route('https://sgp.cloud.appwrite.io/v1/analytics/properties/*/events', (route) => {
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
	expect(
		events.filter((event) => event.name === 'resume_clicked').map((event) => event.props)
	).toEqual([
		['format', 'pdf', 'section', 'contact_page'],
		['format', 'pdf', 'section', 'contact_page'],
		['format', 'docx', 'section', 'contact_page']
	]);
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
	expect(events.filter((event) => event.name === 'room_station_viewed')).toHaveLength(0);
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
	expect(events.filter((event) => event.name === 'room_station_viewed')).toHaveLength(1);
});

test('content links identify the item and entry page, including keyboard and middle clicks', async ({
	page
}) => {
	const events = await captureEvents(page);
	const cases = [
		{
			path: '/projects',
			selector: 'main li[data-content-id="project-relief-atl"] a',
			type: 'project',
			id: 'project-relief-atl',
			action: 'devpost',
			section: 'projects_page'
		},
		{
			path: '/writing',
			selector: 'main a[data-content-type="essay"]',
			type: 'essay',
			section: 'writing_page'
		},
		{ path: '/speaking', selector: 'main .badges a', type: 'talk', section: 'speaking_page' },
		{ path: '/speaking', selector: '#podcasts a', type: 'podcast', section: 'speaking_page' },
		{
			path: '/community',
			selector: 'main .initiative a',
			type: 'community',
			section: 'community_page'
		},
		{ path: '/work', selector: 'main .items a', type: 'work', section: 'work_page' },
		{
			path: '/collection',
			selector: 'main .cta a',
			type: 'collectible',
			id: 'collection',
			action: 'showcase',
			section: 'collection_page'
		}
	];
	for (const [index, item] of cases.entries()) {
		await page.goto(item.path);
		await page.evaluate(() => {
			document.addEventListener('click', (event) => event.preventDefault());
			document.addEventListener('auxclick', (event) => event.preventDefault());
		});
		const link = page.locator(item.selector).first();
		if (index === 1) await link.press('Enter');
		else if (index === 3) await link.click({ button: 'middle' });
		else await link.click();
		await expect
			.poll(() => events.filter((event) => event.name === 'content_clicked').length)
			.toBe(index + 1);
		const props = events.filter((event) => event.name === 'content_clicked').at(-1)?.props ?? [];
		expect(props).toContain(item.type);
		expect(props).toContain(item.section);
		if (item.id) expect(props).toContain(item.id);
		if (item.action) expect(props).toContain(item.action);
	}
	// A context menu is not a content visit.
	await page.locator('main .cta a').click({ button: 'right' });
	expect(events.filter((event) => event.name === 'content_clicked')).toHaveLength(cases.length);
});

test('speaker bio counts successful copies, and headshot and speaking contact keep their entry point', async ({
	page
}) => {
	const events = await captureEvents(page);
	await page.addInitScript(() => {
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { writeText: async () => {} }
		});
	});
	await page.goto('/speaking');
	await page.getByRole('button', { name: 'Copy bio', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Copied!', exact: true })).toBeVisible();
	await expect
		.poll(() => events.filter((event) => event.name === 'speaker_bio_copied').length)
		.toBe(1);
	await page.evaluate(() => {
		// Cancel resource navigation before SvelteKit handles the click at the document root.
		document.addEventListener(
			'click',
			(event) => {
				if (event.target instanceof Element && event.target.closest('a')) event.preventDefault();
			},
			{ capture: true }
		);
		Object.defineProperty(navigator, 'clipboard', {
			value: {
				writeText: async () => {
					throw new Error('Denied');
				}
			}
		});
	});
	await page.getByRole('button', { name: 'Copied!', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Copy bio', exact: true })).toBeVisible();
	expect(events.filter((event) => event.name === 'speaker_bio_copied')).toHaveLength(1);
	await page.getByRole('link', { name: 'Headshot', exact: true }).click();
	await expect
		.poll(() => events.filter((event) => event.name === 'speaker_asset_clicked').length)
		.toBe(1);
	expect(events.find((event) => event.name === 'speaker_asset_clicked')?.props).toEqual([
		'asset',
		'headshot',
		'section',
		'speaking_page'
	]);
	await page.getByRole('link', { name: /Invite me to speak/ }).click();
	await expect
		.poll(() => events.filter((event) => event.name === 'contact_clicked').length)
		.toBe(1);
	expect(events.find((event) => event.name === 'contact_clicked')?.props).toEqual([
		'method',
		'email',
		'purpose',
		'speaking',
		'section',
		'speaking_page'
	]);
});

test('contact views reflect visibility, deduplicate scrolling, and reset the footer on navigation', async ({
	page
}) => {
	const events = await captureEvents(page);
	await page.goto('/projects');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	expect(events.filter((event) => event.name === 'contact_section_viewed')).toHaveLength(0);
	await page.locator('footer nav').scrollIntoViewIfNeeded();
	await expect
		.poll(() => events.filter((event) => event.name === 'contact_section_viewed').length)
		.toBe(1);
	expect(events.find((event) => event.name === 'contact_section_viewed')?.props).toEqual([
		'section',
		'footer'
	]);
	await page.evaluate(() => scrollTo(0, 0));
	await page.locator('footer nav').scrollIntoViewIfNeeded();
	await page.waitForTimeout(100);
	expect(events.filter((event) => event.name === 'contact_section_viewed')).toHaveLength(1);
	await page.locator('footer a[href="/index"]').click();
	await expect(page).toHaveURL(/\/index$/);
	await expect
		.poll(
			() =>
				events.filter(
					(event) => event.name === 'contact_section_viewed' && event.props?.includes('index')
				).length
		)
		.toBe(1);
	await page.locator('footer nav').scrollIntoViewIfNeeded();
	await expect
		.poll(
			() =>
				events.filter(
					(event) => event.name === 'contact_section_viewed' && event.props?.includes('footer')
				).length
		)
		.toBe(2);
});

test('room readers, artifacts, curiosities and settings send deliberate engagement events', async ({
	page
}) => {
	const events = await captureEvents(page);
	await page.goto('/world#notebook');
	await expect(page.locator('dialog.sheet:not(.poem)')).toBeVisible();
	await expect
		.poll(() => events.filter((event) => event.name === 'room_station_viewed').length)
		.toBe(1);
	const essay = page.locator('dialog.sheet [data-content-type="essay"] a').first();
	await essay.evaluate((anchor) =>
		anchor.addEventListener('click', (event) => event.preventDefault())
	);
	await essay.click();
	await expect
		.poll(() => events.filter((event) => event.name === 'content_clicked').length)
		.toBe(1);
	expect(events.find((event) => event.name === 'content_clicked')?.props).toContain(
		'room_notebook'
	);
	await page.getByRole('button', { name: 'Close and return to the room', exact: true }).click();
	await page.getByRole('button', { name: 'Room menu', exact: true }).click();
	await page.getByText('Little things in the room', { exact: true }).click();
	await page.getByRole('button', { name: /^Read “/ }).click();
	await expect
		.poll(() => events.filter((event) => event.name === 'room_poem_viewed').length)
		.toBe(1);
	await expect
		.poll(() => events.filter((event) => event.name === 'room_curiosity_opened').length)
		.toBe(1);
	await page.getByRole('button', { name: 'Close and return to the room', exact: true }).click();
	await page.getByRole('button', { name: 'Room menu', exact: true }).click();
	await page.getByText('Room settings', { exact: true }).click();
	await page.getByLabel('Low power', { exact: true }).check();
	await expect
		.poll(() => events.filter((event) => event.name === 'room_setting_changed').length)
		.toBe(1);
	expect(events.find((event) => event.name === 'room_setting_changed')?.props).toEqual([
		'setting',
		'low_power',
		'value',
		'true'
	]);
	expect(events.filter((event) => event.name === 'room_menu_opened')).toHaveLength(2);
});

test('hidden contact controls count a view only after the tab becomes visible', async ({
	page
}) => {
	const events = await captureEvents(page);
	await page.addInitScript(() => {
		Object.defineProperty(document, 'visibilityState', {
			configurable: true,
			get: () => Reflect.get(window, '__testVisibility') ?? 'hidden'
		});
	});
	await page.goto('/contact');
	await expect(page.locator('main .mail')).toBeVisible();
	await page.waitForTimeout(200);
	expect(events.filter((event) => event.name === 'contact_section_viewed')).toHaveLength(0);
	await page.evaluate(() => {
		Reflect.set(window, '__testVisibility', 'visible');
		document.dispatchEvent(new Event('visibilitychange'));
	});
	await expect
		.poll(() => events.filter((event) => event.name === 'contact_section_viewed').length)
		.toBe(1);
});

test('music intent and actual playback transitions are counted separately without duplicate updates', async ({
	page
}) => {
	const events = await captureEvents(page);
	await page.route('https://open.spotify.com/**', (route) =>
		route.fulfill({
			contentType: 'text/javascript',
			body: `window.onSpotifyIframeApiReady({ createController(element, options, created) {
			const listeners = {};
			const report = (paused) => listeners.playback_update?.({ data: { isPaused: paused } });
			window.__testPlayback = report;
			created({
				addListener(name, fn) { listeners[name] = fn; if (name === 'ready') setTimeout(fn, 0); },
				play() { report(false); }, resume() { report(false); }, pause() { report(true); }, destroy() {}
			});
		} });`
		})
	);
	await page.goto('/world');
	await expect(page.locator('canvas.loaded')).toBeVisible();
	await page.getByRole('button', { name: 'Room menu', exact: true }).click();
	await page.getByText('Little things in the room', { exact: true }).click();
	await page.getByRole('button', { name: 'Put the record on', exact: true }).click();
	await expect
		.poll(() => events.filter((event) => event.name === 'music_playback_changed').length)
		.toBe(1);
	await page.evaluate(() => {
		const report = Reflect.get(window, '__testPlayback');
		report(false);
		report(false);
		report(true);
		report(true);
	});
	await expect
		.poll(() => events.filter((event) => event.name === 'music_playback_changed').length)
		.toBe(2);
	await page.getByRole('button', { name: 'Stop', exact: true }).click();
	await expect.poll(() => events.filter((event) => event.name === 'music_toggled').length).toBe(2);
	expect(
		events.filter((event) => event.name === 'music_toggled').map((event) => event.props)
	).toEqual([
		['state', 'on'],
		['state', 'off']
	]);
	expect(
		events.filter((event) => event.name === 'music_playback_changed').map((event) => event.props)
	).toEqual([
		['state', 'playing'],
		['state', 'paused']
	]);
});

test('external contact links open a separate tab and retain contact and outbound tracking', async ({
	page,
	context
}) => {
	const events = await captureEvents(page);
	await context.route('https://www.linkedin.com/**', (route) =>
		route.fulfill({
			contentType: 'text/html',
			body: '<!doctype html><title>LinkedIn test destination</title>'
		})
	);
	await page.goto('/contact');
	const profile = page.locator('main a[href^="https://www.linkedin.com/"]');
	const popupPromise = page.waitForEvent('popup');
	await profile.click();
	const popup = await popupPromise;
	await popup.waitForLoadState('domcontentloaded');
	await expect(popup).toHaveURL('https://www.linkedin.com/in/adityaoberai1/');
	expect(await popup.evaluate(() => window.opener === null)).toBe(true);
	await expect(page).toHaveURL(`${site}/contact`);
	await expect
		.poll(() => events.filter((event) => event.name === 'contact_clicked').length)
		.toBe(1);
	await expect.poll(() => events.filter((event) => event.name === 'outbound_link').length).toBe(1);
	expect(events.find((event) => event.name === 'contact_clicked')?.props).toEqual([
		'method',
		'linkedin',
		'purpose',
		'general',
		'section',
		'contact_page'
	]);
	await popup.close();
	await page
		.getByRole('navigation', { name: 'Sections', exact: true })
		.getByRole('link', { name: 'Work', exact: true })
		.click();
	await expect(page).toHaveURL(`${site}/work`);
	expect(context.pages()).toHaveLength(1);
});

test('modified contact-menu activations identify page navigation and primary clicks identify the panel', async ({
	page
}) => {
	const events = await captureEvents(page);
	await page.goto('/world');
	await expect(page.locator('canvas.loaded')).toBeVisible();
	const menu = page.getByRole('navigation', { name: 'In the room', exact: true });
	const contact = menu.getByRole('link', { name: 'Elsewhere & contact', exact: true });
	const openMenu = async () => {
		if (!(await menu.isVisible()))
			await page.getByRole('button', { name: 'Room menu', exact: true }).click();
	};
	const actions: { button?: 'middle'; modifiers?: ('Control' | 'Shift')[] }[] = [
		{ button: 'middle' },
		{ modifiers: ['Control'] },
		{ modifiers: ['Shift'] }
	];
	for (const action of actions) {
		await openMenu();
		// Native modifier/middle-click tabs are context pages, not always opener popups.
		const popupPromise = page.context().waitForEvent('page');
		await contact.click(action);
		const popup = await popupPromise;
		await expect(popup).toHaveURL(`${site}/contact`);
		await popup.close();
		await page.bringToFront();
	}
	// Exercise Cmd and Alt as well, cancelling their platform-dependent native navigation.
	for (const modifier of ['metaKey', 'altKey']) {
		await openMenu();
		await contact.evaluate((anchor) =>
			anchor.addEventListener('click', (event) => event.preventDefault(), { once: true })
		);
		await contact.dispatchEvent('click', { button: 0, [modifier]: true });
	}
	await expect
		.poll(() => events.filter((event) => event.name === 'contact_clicked').length)
		.toBe(5);
	expect(
		events
			.filter((event) => event.name === 'contact_clicked')
			.every(
				(event) =>
					JSON.stringify(event.props) ===
					JSON.stringify(['method', 'contact_page', 'purpose', 'general', 'section', 'room_menu'])
			)
	).toBe(true);
	await openMenu();
	await contact.click();
	await expect(page.locator('dialog.sheet:not(.poem)')).toBeVisible();
	await expect
		.poll(() => events.filter((event) => event.name === 'contact_clicked').length)
		.toBe(6);
	expect(events.filter((event) => event.name === 'contact_clicked').at(-1)?.props).toEqual([
		'method',
		'contact_panel',
		'purpose',
		'general',
		'section',
		'room_menu'
	]);
	await expect(page).toHaveURL(/\/world#door$/);
});

test('room section links identify their destinations separately from the source station', async ({
	page
}) => {
	const events = await captureEvents(page);
	const destinations = [
		{ station: 'desk', href: '/work#developer-relations' },
		{ station: 'desk', href: '/projects' },
		{ station: 'corkboard', href: '/speaking' }
	];
	for (const [index, destination] of destinations.entries()) {
		await page.goto(`/world#${destination.station}`);
		const link = page.locator(`dialog.sheet a[href="${destination.href}"]`);
		await link.evaluate((anchor) =>
			anchor.addEventListener('click', (event) => event.preventDefault())
		);
		await link.click();
		await expect
			.poll(() => events.filter((event) => event.name === 'content_clicked').length)
			.toBe(index + 1);
		expect(events.filter((event) => event.name === 'content_clicked').at(-1)?.props).toEqual([
			'type',
			'section',
			'content_id',
			destination.href,
			'action',
			'open_section',
			'section',
			`room_${destination.station}`
		]);
	}
	const invite = page.locator('dialog.sheet a[href^="mailto:"]');
	await invite.evaluate((anchor) =>
		anchor.addEventListener('click', (event) => event.preventDefault())
	);
	await invite.click();
	await expect
		.poll(() => events.filter((event) => event.name === 'contact_clicked').length)
		.toBe(1);
	expect(events.filter((event) => event.name === 'content_clicked')).toHaveLength(3);
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
