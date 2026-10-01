import test from 'node:test';
import assert from 'node:assert/strict';
import {
	clampPoint,
	isClear,
	isFree,
	keyboardDirection,
	nearest,
	route,
	SPEED,
	stepToward
} from '../src/lib/world/movement.ts';
import {
	CAMERA_OFFSET,
	CURIOSITIES,
	FOOTPRINTS,
	MIRROR,
	START,
	STATIONS,
	WALKABLE
} from '../src/lib/world/layout.ts';

test('every piece of furniture is solid, including the chairs and the floor lamp', () => {
	for (const [name, f] of Object.entries(FOOTPRINTS)) {
		const centre = { x: f.x, z: f.z };
		assert.equal(isFree(centre), false, `${name} can be walked through`);
		assert.ok(isFree(clampPoint(centre)), `${name}: pushed out into other furniture`);
	}
});

test('walking into furniture slides along it: never inside, never a jump', () => {
	const step = SPEED / 60;
	for (const start of [START, ...STATIONS.map((s) => s.approach)])
		for (let i = 0; i < 24; i++) {
			const angle = (i / 24) * Math.PI * 2;
			let point = start;
			for (let frame = 0; frame < 120; frame++) {
				const next = clampPoint({
					x: point.x + Math.cos(angle) * step,
					z: point.z + Math.sin(angle) * step
				});
				const where = `from ${JSON.stringify(start)}, direction ${i}, frame ${frame}`;
				assert.ok(isFree(next), `${where}: inside furniture at ${JSON.stringify(next)}`);
				assert.ok(Math.hypot(next.x - point.x, next.z - point.z) < step * 2, `${where}: jumped`);
				point = next;
			}
		}
});

test('click-to-walk goes around furniture instead of through it', () => {
	const starts = [START, ...STATIONS.map((s) => s.approach)];
	let detours = 0;
	for (const from of starts)
		for (const station of STATIONS) {
			const path = route(from, station.approach);
			assert.deepEqual(path.at(-1), station.approach);
			// Where furniture is in the way, the walk turns at least once.
			if (!isClear(from, station.approach)) {
				assert.ok(path.length > 1, `${JSON.stringify(from)} -> ${station.id} walks straight`);
				detours++;
			}
			let at = from;
			for (const waypoint of path) {
				assert.ok(isClear(at, waypoint), `${JSON.stringify(from)} -> ${station.id}`);
				at = waypoint;
			}
		}
	// The room has furniture between some stations, so routing is exercised.
	assert.ok(detours > 0);
});

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

test('seats are on furniture, and standing up lands somewhere free', () => {
	const seated = STATIONS.filter((s) => s.seat);
	assert.deepEqual(seated.map((s) => s.id).sort(), ['corkboard', 'desk']);
	for (const station of seated) {
		assert.equal(isFree(station.seat), false, `${station.id} seat is not on furniture`);
		assert.ok(isFree(station.approach), `${station.id} stands up inside furniture`);
	}
});

test('standing at the mirror, the character shows in the glass', async () => {
	const { Euler, Matrix4, Quaternion, Vector3 } = await import('three');
	const { glass } = MIRROR;
	const frame = new Matrix4().compose(
		new Vector3(MIRROR.x, 0, MIRROR.z),
		new Quaternion().setFromEuler(new Euler(0, MIRROR.angle, MIRROR.lean)),
		new Vector3(1, 1, 1)
	);
	const toFrame = frame.clone().invert();
	const normal = new Vector3(1, 0, 0).transformDirection(frame);
	const centre = new Vector3(glass.front, glass.y, 0).applyMatrix4(frame);
	const view = new Vector3(...CAMERA_OFFSET).negate().normalize();
	const reflected = view.clone().addScaledVector(normal, -2 * view.dot(normal));
	const { approach } = STATIONS.find((s) => s.id === 'mirror');
	// Feet, the top of the hair, and both sides of the body: where the camera sees
	// each of them in the glass (back along the reflected view to the glass plane).
	for (const [dx, y] of [
		[0, 0.05],
		[0, 1.2],
		[-0.2, 0.55],
		[0.2, 0.55]
	]) {
		const point = new Vector3(approach.x + dx, y, approach.z);
		const back = point.clone().sub(centre).dot(normal) / reflected.dot(normal);
		const seen = point.addScaledVector(reflected, -back).applyMatrix4(toFrame);
		assert.ok(
			Math.abs(seen.z) < glass.width / 2 && Math.abs(seen.y - glass.y) < glass.height / 2,
			`(${dx}, ${y}) is reflected outside the glass, at ${seen.z.toFixed(2)}, ${seen.y.toFixed(2)}`
		);
	}
});

test('nothing is near in the middle of the room', () => {
	assert.equal(nearest({ x: 0.5, z: 1.8 }, STATIONS), undefined);
});

test('the window follows the time in Bengaluru', async () => {
	const { bengaluruHour, skyAt } = await import('../src/lib/world/time.ts');
	// 2026-09-30T14:30:00Z is 8:00 pm in Bengaluru (UTC+5:30).
	assert.equal(bengaluruHour(new Date('2026-09-30T14:30:00Z')), 20);
	assert.equal(skyAt(20).phase, 'night');
	assert.equal(skyAt(9).phase, 'day');
	assert.equal(skyAt(6).phase, 'dawn');
	assert.equal(skyAt(17.5).phase, 'golden');
	assert.equal(skyAt(19).phase, 'dusk');
	assert.equal(skyAt(2).phase, 'night');
	assert.equal(skyAt(9).lights, null);
});
