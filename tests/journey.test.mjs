import test from 'node:test';
import assert from 'node:assert/strict';
import { parseJourney, stationId } from '../src/lib/world/journey.ts';
import { focusViewport } from '../src/lib/world/viewport.ts';

test('visit data survives a round trip without allowing hidden or invalid station IDs', () => {
	const saved = {
		position: { x: 1.2, z: -0.8, heading: 0.5 },
		station: 'camera',
		panel: 'camera',
		expanded: true,
		scroll: 320
	};
	assert.deepEqual(parseJourney(JSON.stringify(saved)), saved);
	assert.equal(stationId('lanyards'), null);
	assert.equal(stationId('__proto__'), null);
});
test('unavailable or corrupt session data never prevents a visit', () => {
	for (const value of [null, '', '{', 'null', 'false', '42'])
		assert.equal(parseJourney(value), null);
	const parsed = parseJourney(
		JSON.stringify({
			position: { x: 1000, z: 0, heading: 0 },
			station: 'fake',
			panel: 'fake',
			scroll: -100
		})
	);
	assert.equal(parsed.position, undefined);
	assert.equal(parsed.panel, null);
	assert.equal(parsed.scroll, 0);
});
test('a mobile preview leaves the selected subject above the actual sheet', () => {
	for (const width of [320, 360, 390, 430]) {
		const sheet = { left: 0, top: 844 * 0.56, width, height: 844 * 0.44 };
		const area = focusViewport(width, 844, 88, sheet);
		assert.equal(area.usable, true);
		assert.ok(area.x >= 20 && area.x <= width - 20);
		assert.ok(area.y > 88 && area.y < sheet.top - 16);
	}
});
test('desktop focus stays clear of a right panel and short reading states need no camera move', () => {
	const area = focusViewport(1440, 900, 80, { left: 920, top: 0, width: 520, height: 900 });
	assert.equal(area.usable, true);
	assert.ok(area.x < 900);
	assert.equal(
		focusViewport(390, 844, 80, { left: 0, top: 67, width: 390, height: 777 }).usable,
		false
	);
});
