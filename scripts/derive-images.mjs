// Derives the site's images from the originals in assets/, using Playwright's
// Chromium to resize and encode:
//   static/cards/<id>.webp   400 px wide, for the shelf panel and /collection
//   static/cards/shelf.webp  one row of small faces for the room's shelf slabs
//   static/room/flag.webp    the flag on the room's back wall: red field and the
//                            crest from assets/flag/manutd-crest.png
// Card ids and their order come from src/lib/data/collection.ts; the flag's
// size from src/lib/world/layout.ts.
// Usage: npm run images (then rebuild; `npm run assets` re-captures the room).
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import {
	CARD_IMAGE_HEIGHT,
	CARD_IMAGE_WIDTH,
	favouriteCards,
	SHELF_CELL,
	shelfCards
} from '../src/lib/data/collection.ts';
import { FLAG } from '../src/lib/world/layout.ts';

const png = (path) => `data:image/png;base64,${readFileSync(path).toString('base64')}`;
const source = (card) => png(`assets/cards/${card.id}.png`);

mkdirSync('static/cards', { recursive: true });
mkdirSync('static/room', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();

// Draws images into cells of one canvas (cover-fit, or contain-fit over a
// background colour) and returns it as WebP.
const render = (cells, width, height, quality, background) =>
	page.evaluate(
		async ({ cells, width, height, quality, background }) => {
			const canvas = Object.assign(document.createElement('canvas'), { width, height });
			const context = canvas.getContext('2d');
			context.imageSmoothingQuality = 'high';
			if (background) {
				context.fillStyle = background;
				context.fillRect(0, 0, width, height);
			}
			for (const cell of cells) {
				const image = new Image();
				image.src = cell.src;
				await image.decode();
				const fit = cell.contain ? Math.min : Math.max;
				const scale = fit(cell.w / image.naturalWidth, cell.h / image.naturalHeight);
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
		{ cells, width, height, quality, background }
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

// The flag: the crest centred on the club's red, filling most of the height.
const flag = FLAG.pixels;
const crest = Math.round(flag.height * 0.8);
write(
	'static/room/flag.webp',
	await render(
		[
			{
				src: png('assets/flag/manutd-crest.png'),
				x: (flag.width - crest) / 2,
				y: (flag.height - crest) / 2,
				w: crest,
				h: crest,
				contain: true
			}
		],
		flag.width,
		flag.height,
		0.9,
		'#c8102e'
	)
);
await browser.close();
