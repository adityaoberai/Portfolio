// Performance proxy for the room. NOT a substitute for the real-phone gate in v3.md:
// headless Chromium renders WebGL in software, so GPU cost and thermals are not measured.
// It does measure JavaScript transfer, load milestones, main-thread frame pacing under a
// 4x CPU throttle at phone size, and whether the renderer truly idles.
// Usage: npm run build && npm start (in another terminal), then npm run perf.
import { chromium } from 'playwright';

const base = process.env.BASE ?? 'http://127.0.0.1:4173';
const browser = await chromium.launch();

async function transfer(path) {
	const page = await browser.newPage();
	const kb = { ownJs: 0, thirdPartyJs: 0, total: 0 };
	page.on('response', async (response) => {
		// Compressed bytes on the wire when the server sends a content-length.
		const size = Number(response.headers()['content-length'] ?? (await response.body()).length);
		kb.total += size;
		if (response.request().resourceType() !== 'script') return;
		if (response.url().startsWith(base)) kb.ownJs += size;
		else kb.thirdPartyJs += size;
	});
	await page.goto(base + path, { waitUntil: 'networkidle' });
	await page.close();
	const round = (n) => +(n / 1024).toFixed(1);
	return {
		path,
		ownJsKB: round(kb.ownJs),
		thirdPartyJsKB: round(kb.thirdPartyJs),
		totalKB: round(kb.total)
	};
}

const context = await browser.newContext({
	viewport: { width: 390, height: 844 },
	deviceScaleFactor: 3,
	isMobile: true,
	hasTouch: true
});
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
const start = Date.now();
await page.goto(`${base}/world?diagnostics=1`);
const fcp = await page.evaluate(
	() => performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null
);
await page.locator('canvas.loaded').waitFor({ timeout: 60000 });
const roomReady = Date.now() - start;

// Walk across the room and record requestAnimationFrame intervals while moving.
const frames = await page.evaluate(async () => {
	const room = window.__room;
	const deltas = [];
	let last = performance.now();
	let running = true;
	const tick = (now) => {
		deltas.push(now - last);
		last = now;
		if (running) requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
	room.visit('door');
	await new Promise((r) => setTimeout(r, 2500));
	room.visit('camera');
	await new Promise((r) => setTimeout(r, 2500));
	running = false;
	return deltas.slice(5);
});
frames.sort((a, b) => a - b);
const pct = (p) => +frames[Math.min(frames.length - 1, Math.floor(frames.length * p))].toFixed(1);

await page.keyboard.press('Escape').catch(() => {});
await page.waitForTimeout(1500);
const before = Number(await page.locator('canvas').getAttribute('data-frames'));
await page.waitForTimeout(3000);
const after = Number(await page.locator('canvas').getAttribute('data-frames'));
const diagnostics = await page.locator('output').textContent();

console.log(
	JSON.stringify(
		{
			note: 'Headless Chromium, software WebGL, 390x844 @3x, 4x CPU throttle. Proxy only.',
			firstContentfulPaintMs: fcp && Math.round(fcp),
			roomReadyMs: roomReady,
			frameMsWhileMoving: { p50: pct(0.5), p95: pct(0.95), max: pct(1) },
			idleFramesOver3s: after - before,
			diagnostics: diagnostics?.replace(/\s+/g, ' ').trim(),
			transfer: [await transfer('/world'), await transfer('/index'), await transfer('/work')]
		},
		null,
		2
	)
);
await browser.close();
