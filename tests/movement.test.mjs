import test from 'node:test';
import assert from 'node:assert/strict';
import {
	clampPoint,
	isClear,
	isFree,
	keyboardDirection,
	screenDirection,
	nearest,
	reach,
	route,
	SPEED,
	stepToward
} from '../src/lib/world/movement.ts';
import {
	CAMERA_OFFSET,
	PORTRAIT_CAMERA_OFFSET,
	PORTRAIT_ROOM_DEPTH,
	BED,
	CHARACTER_RADIUS,
	CURIOSITIES,
	FOOTPRINTS,
	GRAMOPHONE,
	MIRROR,
	SIDE_TABLE,
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

const walkUps = CURIOSITIES.filter((item) => item.approach);
const spots = [START, ...STATIONS.map((s) => s.approach), ...walkUps.map((c) => c.approach)];

test('walking into furniture slides along it: never inside, never a jump', () => {
	const step = SPEED / 60;
	for (const start of spots)
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
	let detours = 0;
	for (const from of spots)
		for (const station of [...STATIONS, ...walkUps]) {
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

test('joystick input follows the screen, supports slow movement, and caps diagonal speed', () => {
	for (const [camera, depth] of [
		[CAMERA_OFFSET, 1],
		[PORTRAIT_CAMERA_OFFSET, PORTRAIT_ROOM_DEPTH]
	]) {
		assert.deepEqual(screenDirection(0, 0, camera, depth), { x: 0, z: 0 });
		assert.deepEqual(
			screenDirection(0, -1, camera, depth),
			keyboardDirection(new Set(['w']), camera, depth)
		);
		assert.deepEqual(
			screenDirection(1, 0, camera, depth),
			keyboardDirection(new Set(['d']), camera, depth)
		);
		const slow = screenDirection(0.3, -0.4, camera, depth);
		assert.ok(Math.abs(Math.hypot(slow.x, slow.z * depth) - 0.5) < 1e-12);
		const diagonal = screenDirection(1, -1, camera, depth);
		assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.z * depth) - 1) < 1e-12);
	}
});

test('"up" walks directly away from the camera', () => {
	for (const [camera, depth] of [
		[CAMERA_OFFSET, 1],
		[PORTRAIT_CAMERA_OFFSET, PORTRAIT_ROOM_DEPTH]
	]) {
		const up = keyboardDirection(new Set(['w']), camera, depth);
		const length = Math.hypot(camera[0], camera[2]);
		assert.ok(Math.abs(up.x + camera[0] / length) < 1e-12);
		assert.ok(Math.abs(up.z * depth + camera[2] / length) < 1e-12);
	}
});

test('portrait floor depth preserves furniture proportions and moves its anchor', async () => {
	const { Batch, buildBedroom } = await import('../src/lib/world/build.ts');
	const { Matrix4, Vector3 } = await import('three');
	const bounds = (depth) => {
		const batch = new Batch();
		batch.preserveDepth(depth, BED.z, () => buildBedroom(batch));
		const geometry = batch.build();
		geometry.applyMatrix4(new Matrix4().makeScale(1, 1, depth));
		geometry.computeBoundingBox();
		const size = geometry.boundingBox.getSize(new Vector3());
		const centre = geometry.boundingBox.getCenter(new Vector3());
		geometry.dispose();
		return { size, centre };
	};
	const desktop = bounds(1);
	const portrait = bounds(PORTRAIT_ROOM_DEPTH);
	assert.ok(desktop.size.distanceTo(portrait.size) < 1e-6, 'bed or plush has been stretched');
	assert.ok(
		Math.abs(portrait.centre.z - desktop.centre.z - BED.z * (PORTRAIT_ROOM_DEPTH - 1)) < 1e-6
	);
});

test('keyboard and click-to-walk retain the same physical speed in the longer room', () => {
	for (const depth of [1, PORTRAIT_ROOM_DEPTH]) {
		const direction = keyboardDirection(new Set(['w', 'd']), PORTRAIT_CAMERA_OFFSET, depth);
		assert.ok(Math.abs(Math.hypot(direction.x, direction.z * depth) - 1) < 1e-12);
		const next = stepToward({ x: 0, z: 0 }, { x: 3, z: 3 }, 1 / 60, depth);
		assert.ok(Math.abs(Math.hypot(next.x, next.z * depth) - SPEED / 60) < 1e-12);
	}
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

test('trying to sleep: the bed can be walked up to, and the character turns its back on it', () => {
	const bed = CURIOSITIES.find((item) => item.id === 'bed');
	assert.ok(isFree(bed.approach), 'beside the bed is inside furniture');
	// No station is near there, so E tries the bed; and the room doesn't start beside it.
	assert.equal(nearest(bed.approach, STATIONS), undefined);
	assert.equal(reach(bed.approach, STATIONS, walkUps).thing, bed);
	assert.equal(reach(START, STATIONS, walkUps).thing, undefined);
	const facing = { x: Math.sin(bed.facing), z: Math.cos(bed.facing) };
	const toBed = { x: FOOTPRINTS.bed.x - bed.approach.x, z: FOOTPRINTS.bed.z - bed.approach.z };
	assert.ok(facing.x * toBed.x + facing.z * toBed.z < 0, 'the character faces the bed');
});

test('putting a record on: E reaches the gramophone beside it, and the stations nearby still open', () => {
	const gramophone = CURIOSITIES.find((item) => item.id === 'gramophone');
	assert.ok(isFree(gramophone.approach), 'in front of the gramophone is inside furniture');
	// The corkboard and the door are in reach from there too, but the gramophone is nearer.
	assert.ok(nearest(gramophone.approach, STATIONS));
	assert.deepEqual(reach(gramophone.approach, STATIONS, walkUps), { thing: gramophone });
	for (const station of STATIONS)
		assert.equal(reach(station.approach, STATIONS, walkUps).station?.id, station.id);
	const bed = CURIOSITIES.find((item) => item.id === 'bed');
	assert.deepEqual(reach(bed.approach, STATIONS, walkUps), { thing: bed });
	assert.equal(reach(START, STATIONS, walkUps).thing, undefined);
});

test('anywhere beside the bed or the gramophone’s table, E reaches it', () => {
	const step = CHARACTER_RADIUS + 0.1;
	for (const item of walkUps) {
		const f = item.beside;
		let checked = 0;
		// Points a step out from each edge, all the way round; the free ones are beside it.
		for (let i = 0; i <= 40; i++) {
			const t = i / 40;
			for (const local of [
				{ x: -f.halfX + 2 * f.halfX * t, z: -f.halfZ - step },
				{ x: -f.halfX + 2 * f.halfX * t, z: f.halfZ + step },
				{ x: -f.halfX - step, z: -f.halfZ + 2 * f.halfZ * t },
				{ x: f.halfX + step, z: -f.halfZ + 2 * f.halfZ * t }
			]) {
				const c = Math.cos(f.angle);
				const s = Math.sin(f.angle);
				const point = { x: f.x + c * local.x + s * local.z, z: f.z - s * local.x + c * local.z };
				if (!isFree(point)) continue;
				checked++;
				assert.equal(
					reach(point, STATIONS, walkUps).thing,
					item,
					`${item.id} at ${JSON.stringify(point)}`
				);
			}
		}
		assert.ok(checked > 10, `${item.id}: hardly anywhere to stand beside it`);
	}
});

test('the gramophone stands on its table, and its arm sets down on the record only to play', () => {
	const { arm, record } = GRAMOPHONE;
	// The case (0.35 square, plinth included) stays on the table top, whichever way it turns.
	assert.ok(Math.hypot(0.175, 0.175) < SIDE_TABLE.radius);
	const needle = (angle) => {
		const x = arm.x + Math.sin(angle) * arm.length - record.x;
		const z = arm.z + Math.cos(angle) * arm.length - record.z;
		return Math.hypot(x, z);
	};
	// Playing: in the grooves, between the label and the edge. At rest: clear of the record.
	assert.ok(needle(arm.play) > 0.05 && needle(arm.play) < record.radius - 0.01);
	assert.ok(needle(arm.rest) > record.radius + 0.02);
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
