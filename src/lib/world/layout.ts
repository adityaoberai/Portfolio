// Room layout shared by the renderer, movement, and tests. No Three.js imports:
// this module must stay cheap enough for unit tests and the DOM shell.

export interface Point {
	x: number;
	z: number;
}

export type Vec3 = [number, number, number];

export interface Box {
	center: Vec3;
	size: Vec3;
}

// Floor extents. The back wall sits at z = ROOM.minZ, the left wall at x = ROOM.minX.
export const ROOM = { minX: -3.5, maxX: 3.5, minZ: -3, maxZ: 3.2, wallHeight: 3.1 };

// The character may walk anywhere inside these bounds, minus furniture footprints.
export const WALKABLE = { minX: -3.05, maxX: 3.15, minZ: -2.35, maxZ: 2.85 };

export const CHARACTER_RADIUS = 0.24;
export const START: Point = { x: 0.6, z: 1.4 };

// The orthographic camera sits at +x/+z looking at the back-left corner.
export const CAMERA_OFFSET: Vec3 = [9, 10, 12];
export const CAMERA_TARGET: Vec3 = [0, 1.05, 0.1];

// Furniture footprints (x/z rectangles). Movement slides around them; nothing blocks.
export interface Footprint {
	minX: number;
	maxX: number;
	minZ: number;
	maxZ: number;
}

export const FOOTPRINTS: Record<string, Footprint> = {
	desk: { minX: -0.1, maxX: 2.3, minZ: -3, maxZ: -2 },
	cabinet: { minX: 2.6, maxX: 3.5, minZ: -3, maxZ: -2.4 },
	shelf: { minX: -3.5, maxX: -2.95, minZ: -2.8, maxZ: -1.6 },
	bed: { minX: -3.5, maxX: -2.1, minZ: -0.25, maxZ: 1.9 }
};

export type StationId = 'desk' | 'notebook' | 'camera' | 'shelf';

export interface StationLayout {
	id: StationId;
	// Where the character stops before inspecting.
	approach: Point;
	// Raycast volume for clicks and taps. Deliberately larger than the object.
	hit: Box;
	// Point the camera pushes toward while the station is open.
	focus: Vec3;
	// Smaller objects sitting on larger ones win the raycast.
	priority: number;
}

export const STATIONS: StationLayout[] = [
	{
		id: 'desk',
		approach: { x: 0.85, z: -1.5 },
		hit: { center: [1.1, 0.95, -2.5], size: [2.55, 1.95, 1.15] },
		focus: [1.05, 1.2, -2.4],
		priority: 0
	},
	{
		id: 'notebook',
		approach: { x: 1.8, z: -1.5 },
		hit: { center: [1.8, 1.12, -2.28], size: [0.8, 0.5, 0.72] },
		focus: [1.8, 1.05, -2.3],
		priority: 1
	},
	{
		id: 'camera',
		approach: { x: 2.95, z: -1.85 },
		hit: { center: [3.02, 1.25, -2.72], size: [1.05, 2.5, 0.85] },
		focus: [3.0, 1.2, -2.7],
		priority: 0
	},
	{
		id: 'shelf',
		approach: { x: -2.4, z: -1.9 },
		hit: { center: [-3.2, 1.25, -2.2], size: [0.75, 2.6, 1.4] },
		focus: [-3.15, 1.35, -2.2],
		priority: 0
	}
];

export type CuriosityId = 'plush';

export interface CuriosityLayout {
	id: CuriosityId;
	hit: Box;
}

// Environmental details: a one-line note, not a navigation destination.
export const CURIOSITIES: CuriosityLayout[] = [
	{ id: 'plush', hit: { center: [-2.72, 0.85, 0.15], size: [0.65, 0.6, 0.6] } }
];

// Generous: the character only needs to be roughly in front of an object.
export const INTERACTION_RADIUS = 1.35;
