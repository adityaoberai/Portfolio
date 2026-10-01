import test from 'node:test';
import assert from 'node:assert/strict';
import { artifacts, worldLabels } from '../src/lib/data/artifacts.ts';
import { sections } from '../src/lib/data/sections.ts';
import { stations } from '../src/lib/data/room.ts';
import { STATIONS } from '../src/lib/world/layout.ts';
import { workThemes } from '../src/lib/data/work.ts';
import { projects } from '../src/lib/data/projects.ts';
import { talks } from '../src/lib/data/talks.ts';
import { podcasts } from '../src/lib/data/podcasts.ts';
import { writingSamples } from '../src/lib/data/writing.ts';
import { photographs } from '../src/lib/data/photography.ts';
import { communityInitiatives } from '../src/lib/data/community.ts';
import { existsSync, readFileSync } from 'node:fs';
import {
	cardImage,
	favouriteCards,
	SHELF_ATLAS,
	SHELF_CELL,
	SHELF_SLOTS,
	shelfCards
} from '../src/lib/data/collection.ts';

// Width and height of a WebP file (lossy VP8 or extended VP8X).
function webpSize(path) {
	const b = readFileSync(path);
	const chunk = b.toString('ascii', 12, 16);
	if (chunk === 'VP8 ')
		return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
	if (chunk === 'VP8X') return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
	throw new Error(`${path}: unexpected WebP chunk ${chunk}`);
}

test('every favourite card has its images; the shelf texture matches the card list', () => {
	for (const card of favouriteCards) {
		assert.ok(existsSync(`assets/cards/${card.id}.png`), `${card.id}: original missing`);
		assert.ok(existsSync(`static${cardImage(card)}`), `${card.id}: run npm run cards`);
		assert.ok(card.alt.length > 20, `${card.id}: describe the artwork`);
	}
	assert.equal(new Set(favouriteCards.map((c) => c.id)).size, favouriteCards.length);
	assert.ok(shelfCards.length > 0 && shelfCards.length <= SHELF_SLOTS);
	// One cell per shelf card, in order; a stale texture means `npm run cards` wasn't run.
	assert.deepEqual(webpSize(`static${SHELF_ATLAS}`), {
		width: SHELF_CELL.width * shelfCards.length,
		height: SHELF_CELL.height
	});
});

test('every source record becomes exactly one artifact with a unique id', () => {
	const sources =
		workThemes.reduce((n, theme) => n + theme.items.length, 0) +
		projects.length +
		talks.length +
		podcasts.length +
		writingSamples.length +
		photographs.length +
		communityInitiatives.length +
		favouriteCards.length;
	assert.equal(artifacts.length, sources);
	assert.equal(new Set(artifacts.map((a) => a.id)).size, artifacts.length);
});

test('artifacts belong to known worlds and link somewhere', () => {
	for (const artifact of artifacts) {
		assert.ok(artifact.worlds.length > 0, artifact.id);
		for (const world of artifact.worlds)
			assert.ok(world in worldLabels, `${artifact.id}: ${world}`);
		assert.ok(artifact.href || artifact.externalUrl, `${artifact.id} has no link`);
	}
});

test('photo titles come from real Pexels slugs', () => {
	assert.equal(photographs.length, 21);
	assert.equal(photographs[0].title, 'Modern skyscrapers in Bengaluru India');
	assert.ok(photographs.some((photo) => photo.title.includes('CN Tower')));
});

test('every room station has layout, meaning, and a section', () => {
	const ids = new Set(sections.map((s) => s.id));
	assert.deepEqual(stations.map((s) => s.id).sort(), STATIONS.map((s) => s.id).sort());
	for (const station of stations) assert.ok(ids.has(station.section), station.id);
});

test('world.ts: every visible station resolves to a panel with real content', async () => {
	const { panels, stations } = await import('../src/lib/data/room.ts');
	const { world } = await import('../src/lib/data/world.ts');
	assert.equal(stations.length, world.stations.filter((s) => !s.hidden).length);
	for (const station of stations) {
		const panel = panels[station.id];
		assert.ok(panel, `${station.id} has no panel`);
		assert.ok(panel.title && panel.blocks.length, `${station.id} panel is empty`);
		for (const block of panel.blocks)
			if ('artifacts' in block) assert.ok(block.artifacts.length, `${station.id} block is empty`);
	}
	// Numbering follows menu order.
	assert.deepEqual(
		stations.map((s) => s.number),
		stations.map((_, i) => String(i + 1).padStart(2, '0'))
	);
});

test('world.ts: picks resolve ids and queries, and mistakes name the station', async () => {
	const { pick } = await import('../src/lib/data/room.ts');
	const where = 'station "desk", block 1 (items)';
	assert.throws(() => pick(['project-nope'], where), /station "desk", block 1.*"project-nope"/);
	assert.throws(() => pick([{ type: 'photo', context: 'Atlantis' }], where), /matches nothing/);
	const photos = pick([{ type: 'photo', offset: 2, limit: 3 }], where);
	assert.equal(photos.length, 3);
	const all = pick([{ type: 'photo' }], where);
	assert.equal(photos[0].id, all[2].id);
	// Duplicates across ids and queries collapse to one.
	const mixed = pick(['project-relief-atl', { type: 'project', limit: 2 }], where);
	assert.deepEqual(
		mixed.map((a) => a.id),
		['project-relief-atl', 'project-ai-crystal-ball']
	);
	assert.equal(pick([{ type: 'talk', featured: true }], where).length, 4);
});
