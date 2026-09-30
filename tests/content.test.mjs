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

test('every source record becomes exactly one artifact with a unique id', () => {
	const sources =
		workThemes.reduce((n, theme) => n + theme.items.length, 0) +
		projects.length +
		talks.length +
		podcasts.length +
		writingSamples.length +
		photographs.length +
		communityInitiatives.length +
		1; // Blastoise
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
