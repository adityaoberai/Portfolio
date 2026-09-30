import test from 'node:test';
import assert from 'node:assert/strict';
import { clampPoint, keyboardDirection, stepToward } from '../src/lib/world/movement.ts';

test('large inputs stay on the floor', () => {
	assert.deepEqual(clampPoint({ x: 999, z: -999 }), { x: 2.65, z: -1.85 });
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

test('a long frame does not teleport across the room', () => {
	const result = stepToward({ x: 0, z: 0 }, { x: 2, z: 2 }, 20);
	assert.ok(Math.hypot(result.x, result.z) <= 0.220001);
});

test('far corners are reachable in under two seconds without overshooting', () => {
	let point = { x: -2.65, z: -1.85 };
	const destination = { x: 2.65, z: 2.15 };
	for (let i = 0; i < 120; i++) point = stepToward(point, destination, 1 / 60);
	assert.deepEqual(point, destination);
	assert.deepEqual(stepToward(point, destination, 1 / 60), destination);
});
