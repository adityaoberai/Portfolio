import {
	CAMERA_OFFSET,
	CHARACTER_RADIUS,
	FOOTPRINTS,
	INTERACTION_RADIUS,
	START,
	WALKABLE,
	type Footprint,
	type Point
} from './layout';

export type { Point } from './layout';

export const SPEED = 4.4;

const within = (point: Point) =>
	point.x >= WALKABLE.minX &&
	point.x <= WALKABLE.maxX &&
	point.z >= WALKABLE.minZ &&
	point.z <= WALKABLE.maxZ;

const footprints: Footprint[] = Object.values(FOOTPRINTS);
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.z - b.z);

// A point in a footprint's own frame, and back.
function toLocal(point: Point, f: Footprint): Point {
	const dx = point.x - f.x;
	const dz = point.z - f.z;
	const c = Math.cos(f.angle);
	const s = Math.sin(f.angle);
	return { x: c * dx - s * dz, z: s * dx + c * dz };
}

function toWorld(point: Point, f: Footprint): Point {
	const c = Math.cos(f.angle);
	const s = Math.sin(f.angle);
	return { x: f.x + c * point.x + s * point.z, z: f.z - s * point.x + c * point.z };
}

function inside(point: Point, f: Footprint, pad: number) {
	const p = toLocal(point, f);
	return Math.abs(p.x) < f.halfX + pad && Math.abs(p.z) < f.halfZ + pad;
}

// The closest free spot on growing rings around a point. Only needed when a point
// is wedged where two footprints meet and no single edge is free.
function nearestFree(point: Point): Point {
	for (let r = 0.04; r < 3; r += 0.04)
		for (let i = 0; i < 36; i++) {
			const angle = (i / 36) * Math.PI * 2;
			const p = { x: point.x + Math.cos(angle) * r, z: point.z + Math.sin(angle) * r };
			if (isFree(p)) return p;
		}
	return START;
}

// Moves a point out of furniture to the nearest free edge, so walking into a desk
// or chair slides along it instead of stopping dead. Always the nearest edge: a
// free edge further away would teleport the character across the furniture.
function pushOut(point: Point): Point {
	let result = point;
	for (let pass = 0; pass < 4 && !isFree(result); pass++) {
		for (const f of footprints) {
			if (!inside(result, f, CHARACTER_RADIUS)) continue;
			const p = toLocal(result, f);
			const hx = f.halfX + CHARACTER_RADIUS + 0.001;
			const hz = f.halfZ + CHARACTER_RADIUS + 0.001;
			const from = result;
			const candidates = [
				{ x: -hx, z: p.z },
				{ x: hx, z: p.z },
				{ x: p.x, z: -hz },
				{ x: p.x, z: hz }
			]
				.map((c) => toWorld(c, f))
				.filter(within)
				.sort((a, b) => distance(a, from) - distance(b, from));
			result = candidates[0] ?? result;
		}
	}
	return isFree(result) ? result : nearestFree(point);
}

export function clampPoint(point: Point): Point {
	return pushOut({
		x: Math.max(WALKABLE.minX, Math.min(WALKABLE.maxX, point.x)),
		z: Math.max(WALKABLE.minZ, Math.min(WALKABLE.maxZ, point.z))
	});
}

export function isFree(point: Point): boolean {
	return within(point) && footprints.every((f) => !inside(point, f, CHARACTER_RADIUS));
}

// Whether the segment a-b passes through a footprint grown by `pad` (slab test in
// the footprint's frame). Touching an edge doesn't count.
function crosses(a: Point, b: Point, f: Footprint, pad: number) {
	const p = toLocal(a, f);
	const q = toLocal(b, f);
	let enter = 0;
	let exit = 1;
	for (const [start, delta, half] of [
		[p.x, q.x - p.x, f.halfX + pad],
		[p.z, q.z - p.z, f.halfZ + pad]
	]) {
		if (Math.abs(delta) < 1e-12) {
			if (Math.abs(start) >= half) return false;
			continue;
		}
		const t1 = (-half - start) / delta;
		const t2 = (half - start) / delta;
		enter = Math.max(enter, Math.min(t1, t2));
		exit = Math.min(exit, Math.max(t1, t2));
		if (enter >= exit) return false;
	}
	return true;
}

// Whether the character can walk straight from a to b without touching furniture.
export function isClear(a: Point, b: Point): boolean {
	return footprints.every((f) => !crosses(a, b, f, CHARACTER_RADIUS));
}

// Just outside each corner of each footprint: the turning points of a walk around it.
const corners: Point[] = footprints
	.flatMap((f) => {
		const hx = f.halfX + CHARACTER_RADIUS + 0.02;
		const hz = f.halfZ + CHARACTER_RADIUS + 0.02;
		return [
			{ x: -hx, z: -hz },
			{ x: hx, z: -hz },
			{ x: hx, z: hz },
			{ x: -hx, z: hz }
		].map((c) => toWorld(c, f));
	})
	.filter(isFree);

// The waypoints of the shortest walk from `from` to `to` around the furniture:
// just `to` when the way is clear, otherwise via footprint corners (Dijkstra over
// a few dozen points, once per click). With no route it walks straight and
// slides along whatever is in the way.
export function route(from: Point, to: Point): Point[] {
	if (isClear(from, to)) return [to];
	const nodes = [from, ...corners, to];
	const goal = nodes.length - 1;
	const cost = nodes.map(() => Infinity);
	const previous = nodes.map(() => -1);
	const done = nodes.map(() => false);
	cost[0] = 0;
	for (;;) {
		let u = -1;
		for (let i = 0; i < nodes.length; i++)
			if (!done[i] && cost[i] < Infinity && (u < 0 || cost[i] < cost[u])) u = i;
		if (u < 0 || u === goal) break;
		done[u] = true;
		for (let v = 0; v < nodes.length; v++) {
			if (done[v]) continue;
			const next = cost[u] + distance(nodes[u], nodes[v]);
			if (next < cost[v] && isClear(nodes[u], nodes[v])) {
				cost[v] = next;
				previous[v] = u;
			}
		}
	}
	if (previous[goal] < 0) return [to];
	const path: Point[] = [];
	for (let i = goal; i > 0; i = previous[i]) path.unshift(nodes[i]);
	return path;
}

export function stepToward(from: Point, to: Point, delta: number): Point {
	const remaining = distance(from, to);
	const step = SPEED * Math.max(0, Math.min(delta, 0.05));
	if (remaining <= step) return { ...to };
	return {
		x: from.x + ((to.x - from.x) * step) / remaining,
		z: from.z + ((to.z - from.z) * step) / remaining
	};
}

// Screen-relative controls: "up" walks away from the camera, "right" walks screen-right.
const length = Math.hypot(CAMERA_OFFSET[0], CAMERA_OFFSET[2]);
const forward = { x: -CAMERA_OFFSET[0] / length, z: -CAMERA_OFFSET[2] / length };
const right = { x: -forward.z, z: forward.x };

export function keyboardDirection(keys: Set<string>): Point {
	const horizontal =
		Number(keys.has('d') || keys.has('arrowright')) -
		Number(keys.has('a') || keys.has('arrowleft'));
	const vertical =
		Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
	const x = right.x * horizontal - forward.x * vertical;
	const z = right.z * horizontal - forward.z * vertical;
	const magnitude = Math.hypot(x, z);
	if (magnitude < 1e-9) return { x: 0, z: 0 };
	return { x: x / magnitude, z: z / magnitude };
}

export function nearest<T extends { approach: Point }>(
	point: Point,
	items: T[],
	radius = INTERACTION_RADIUS
): T | undefined {
	let best: T | undefined;
	let bestDistance = radius;
	for (const item of items) {
		const d = distance(point, item.approach);
		if (d <= bestDistance) {
			best = item;
			bestDistance = d;
		}
	}
	return best;
}
