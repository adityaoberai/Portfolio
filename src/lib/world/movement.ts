import {
	CAMERA_OFFSET,
	CHARACTER_RADIUS,
	FOOTPRINTS,
	INTERACTION_RADIUS,
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

function inside(point: Point, f: Footprint, pad: number) {
	return (
		point.x > f.minX - pad &&
		point.x < f.maxX + pad &&
		point.z > f.minZ - pad &&
		point.z < f.maxZ + pad
	);
}

// Nudges a point out of furniture to the nearest free edge. Never blocks movement,
// so the character slides around a bed or desk instead of stopping against it.
function pushOut(point: Point): Point {
	let result = point;
	for (let pass = 0; pass < 2; pass++) {
		for (const f of Object.values(FOOTPRINTS)) {
			if (!inside(result, f, CHARACTER_RADIUS)) continue;
			const pad = CHARACTER_RADIUS + 0.001;
			const candidates = [
				{ x: f.minX - pad, z: result.z },
				{ x: f.maxX + pad, z: result.z },
				{ x: result.x, z: f.minZ - pad },
				{ x: result.x, z: f.maxZ + pad }
			].filter(within);
			const from = result;
			candidates.sort(
				(a, b) => Math.hypot(a.x - from.x, a.z - from.z) - Math.hypot(b.x - from.x, b.z - from.z)
			);
			if (candidates[0]) result = candidates[0];
		}
	}
	return result;
}

export function clampPoint(point: Point): Point {
	return pushOut({
		x: Math.max(WALKABLE.minX, Math.min(WALKABLE.maxX, point.x)),
		z: Math.max(WALKABLE.minZ, Math.min(WALKABLE.maxZ, point.z))
	});
}

export function isFree(point: Point): boolean {
	return (
		within(point) && Object.values(FOOTPRINTS).every((f) => !inside(point, f, CHARACTER_RADIUS))
	);
}

export function stepToward(from: Point, to: Point, delta: number): Point {
	const distance = Math.hypot(to.x - from.x, to.z - from.z);
	const step = SPEED * Math.max(0, Math.min(delta, 0.05));
	if (distance <= step) return { ...to };
	return {
		x: from.x + ((to.x - from.x) * step) / distance,
		z: from.z + ((to.z - from.z) * step) / distance
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
		const distance = Math.hypot(point.x - item.approach.x, point.z - item.approach.z);
		if (distance <= bestDistance) {
			best = item;
			bestDistance = distance;
		}
	}
	return best;
}
