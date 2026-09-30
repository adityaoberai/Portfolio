import test from 'node:test';
import assert from 'node:assert/strict';
import {
	clampPoint,
	isFree,
	keyboardDirection,
	nearest,
	SPEED,
	stepToward
} from '../src/lib/world/movement.ts';
import { CAMERA_OFFSET, CURIOSITIES, START, STATIONS, WALKABLE } from '../src/lib/world/layout.ts';

test('large inputs stay on the floor and out of furniture', () => {
	for (const point of [
		{ x: 999, z: -999 },
		{ x: -999, z: 999 },
		{ x: -999, z: -999 },
		{ x: 1.1, z: -2.5 },
		{ x: -2.8, z: 0.8 }
	]) {
		const result = clampPoint(point);
		assert.ok(isFree(result), `${JSON.stringify(point)} -> ${JSON.stringify(result)}`);
	}
});

test('diagonal keys do not accelerate movement and opposing keys cancel', () => {
	for (const keys of [['w'], ['w', 'd'], ['arrowup', 'arrowright']]) {
		const direction = keyboardDirection(new Set(keys));
		assert.ok(Math.abs(Math.hypot(direction.x, direction.z) - 1) < 1e-12);
	}
	assert.deepEqual(keyboardDirection(new Set(['w', 's', 'a', 'd'])), { x: 0, z: 0 });
});

test('arrow and letter controls map to the same screen-relative direction', () => {
	for (const [letter, arrow] of [
		['w', 'arrowup'],
		['a', 'arrowleft'],
		['s', 'arrowdown'],
		['d', 'arrowright']
	]) {
		assert.deepEqual(keyboardDirection(new Set([letter])), keyboardDirection(new Set([arrow])));
	}
});

test('"up" walks directly away from the camera', () => {
	const up = keyboardDirection(new Set(['w']));
	const length = Math.hypot(CAMERA_OFFSET[0], CAMERA_OFFSET[2]);
	assert.ok(Math.abs(up.x + CAMERA_OFFSET[0] / length) < 1e-12);
	assert.ok(Math.abs(up.z + CAMERA_OFFSET[2] / length) < 1e-12);
});

test('a long frame does not teleport across the room', () => {
	const result = stepToward({ x: 0, z: 0 }, { x: 2, z: 2 }, 20);
	assert.ok(Math.hypot(result.x, result.z) <= SPEED * 0.05 + 1e-6);
});

test('far corners are reachable in about two seconds without overshooting', () => {
	let point = { x: WALKABLE.minX, z: WALKABLE.minZ };
	const destination = { x: WALKABLE.maxX, z: WALKABLE.maxZ };
	for (let i = 0; i < 120; i++) point = stepToward(point, destination, 1 / 60);
	assert.deepEqual(point, destination);
	assert.deepEqual(stepToward(point, destination, 1 / 60), destination);
});

test('every station can be reached and is the nearest at its own approach point', () => {
	assert.ok(isFree(START));
	for (const station of STATIONS) {
		assert.ok(isFree(station.approach), `${station.id} approach is inside furniture`);
		assert.equal(nearest(station.approach, STATIONS)?.id, station.id);
	}
	assert.ok(CURIOSITIES.length >= 1);
});

test('nothing is near in the middle of the room', () => {
	assert.equal(nearest({ x: 0.5, z: 1.8 }, STATIONS), undefined);
});
