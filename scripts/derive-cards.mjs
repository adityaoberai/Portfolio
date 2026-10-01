// Derives the card images from the originals in assets/cards/<id>.png, using
// Playwright's Chromium to resize and encode:
//   static/cards/<id>.webp   400 px wide, for the shelf panel and /collection
//   static/cards/shelf.webp  one row of small faces for the room's shelf slabs
// Card ids and their order come from src/lib/data/collection.ts.
// Usage: npm run cards (then rebuild; `npm run assets` re-captures the room).
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import {
	CARD_IMAGE_HEIGHT,
	CARD_IMAGE_WIDTH,
	favouriteCards,
	SHELF_CELL,
	shelfCards
} from '../src/lib/data/collection.ts';

const source = (card) => {
	const path = `assets/cards/${card.id}.png`;
	return `data:image/png;base64,${readFileSync(path).toString('base64')}`;
};

mkdirSync('static/cards', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();

// Draws images cover-fit into cells of one canvas and returns it as WebP.
const render = (cells, width, height, quality) =>
	page.evaluate(
		async ({ cells, width, height, quality }) => {
			const canvas = Object.assign(document.createElement('canvas'), { width, height });
			const context = canvas.getContext('2d');
			context.imageSmoothingQuality = 'high';
			for (const cell of cells) {
				const image = new Image();
				image.src = cell.src;
				await image.decode();
				const scale = Math.max(cell.w / image.naturalWidth, cell.h / image.naturalHeight);
				const w = image.naturalWidth * scale;
				const h = image.naturalHeight * scale;
				context.save();
				context.beginPath();
				context.rect(cell.x, cell.y, cell.w, cell.h);
				context.clip();
				context.drawImage(image, cell.x + (cell.w - w) / 2, cell.y + (cell.h - h) / 2, w, h);
				context.restore();
			}
			return canvas.toDataURL('image/webp', quality);
		},
		{ cells, width, height, quality }
	);

const write = (path, dataUrl) => {
	writeFileSync(path, Buffer.from(dataUrl.split(',')[1], 'base64'));
	console.log(`Wrote ${path} (${(statSync(path).size / 1024).toFixed(1)} KB)`);
};

for (const card of favouriteCards) {
	const cell = { src: source(card), x: 0, y: 0, w: CARD_IMAGE_WIDTH, h: CARD_IMAGE_HEIGHT };
	write(
		`static/cards/${card.id}.webp`,
		await render([cell], CARD_IMAGE_WIDTH, CARD_IMAGE_HEIGHT, 0.82)
	);
}

const { width, height } = SHELF_CELL;
const cells = shelfCards.map((card, i) => ({
	src: source(card),
	x: i * width,
	y: 0,
	w: width,
	h: height
}));
write('static/cards/shelf.webp', await render(cells, width * cells.length, height, 0.86));
await browser.close();
