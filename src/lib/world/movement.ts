export interface Point {
	x: number;
	z: number;
}

export const SPEED = 4.4;
export const DESK_APPROACH: Point = { x: 0.15, z: -0.5 };
export const INTERACTION_RADIUS = 1.7;

export function clampPoint(point: Point): Point {
	return {
		x: Math.max(-2.65, Math.min(2.65, point.x)),
		z: Math.max(-1.85, Math.min(2.15, point.z))
	};
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

// Orthographic camera sits at +x/+z. Controls follow the screen, not a world axis.
export function keyboardDirection(keys: Set<string>): Point {
	const horizontal =
		Number(keys.has('d') || keys.has('arrowright')) -
		Number(keys.has('a') || keys.has('arrowleft'));
	const vertical =
		Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
	const x = horizontal + vertical;
	const z = vertical - horizontal;
	const length = Math.hypot(x, z) || 1;
	return { x: x / length, z: z / length };
}
