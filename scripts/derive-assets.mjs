// Derives static assets from the running site with Playwright's Chromium:
//   static/room-still.jpg   daytime still of the room (loading/fallback image)
//   og/room.jpg             high-resolution room capture for og/og.html
//   static/aditya-480.webp  resized portrait (+ .jpg fallback); /aditya.jpg stays full size
// Usage: npm run build && npm start (in another terminal), then npm run assets.
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const base = process.env.BASE ?? 'http://127.0.0.1:4173';
// 11:00 in Bengaluru, so the window shows a daytime sky.
const daytime = new Date('2026-10-01T05:30:00Z');
const browser = await chromium.launch();

async function captureRoom(scale, path, quality) {
	const page = await browser.newPage({
		viewport: { width: 1440, height: 1000 },
		deviceScaleFactor: scale
	});
	await page.clock.setFixedTime(daytime);
	await page.goto(`${base}/world`);
	await page.locator('canvas.loaded').waitFor();
	await page.addStyleTag({
		content: '.room-caption, .room-hint, .note, .hover-label { visibility: hidden !important; }'
	});
	await page.waitForTimeout(300);
	await page.locator('canvas').screenshot({ path, type: 'jpeg', quality });
	await page.close();
	console.log(`Wrote ${path}`);
}

await captureRoom(1, 'static/room-still.jpg', 80);
await captureRoom(2, 'og/room.jpg', 88);

const page = await browser.newPage();
await page.goto(`${base}/now`);
const portrait = await page.evaluate(async () => {
	const image = new Image();
	image.src = '/aditya.jpg';
	await image.decode();
	const width = 480;
	const height = Math.round((image.naturalHeight / image.naturalWidth) * width);
	const canvas = Object.assign(document.createElement('canvas'), { width, height });
	const context = canvas.getContext('2d');
	context.imageSmoothingQuality = 'high';
	context.drawImage(image, 0, 0, width, height);
	return {
		source: [image.naturalWidth, image.naturalHeight],
		size: [width, height],
		webp: canvas.toDataURL('image/webp', 0.8),
		jpeg: canvas.toDataURL('image/jpeg', 0.82)
	};
});
for (const [ext, url] of [
	['webp', portrait.webp],
	['jpg', portrait.jpeg]
]) {
	writeFileSync(`static/aditya-480.${ext}`, Buffer.from(url.split(',')[1], 'base64'));
	console.log(`Wrote static/aditya-480.${ext}`);
}
console.log(`Portrait ${portrait.source.join('x')} -> ${portrait.size.join('x')}`);
await browser.close();
