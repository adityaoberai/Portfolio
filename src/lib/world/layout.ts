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
	bed: { minX: -3.5, maxX: -2.1, minZ: -0.25, maxZ: 1.9 },
	armchair: { minX: 2.2, maxX: 3.1, minZ: 0.8, maxZ: 1.65 },
	plant: { minX: 2.72, maxX: 3.28, minZ: 2.27, maxZ: 2.83 },
	suitcase: { minX: -2.15, maxX: -1.65, minZ: 2.72, maxZ: 2.98 }
};

export type StationId =
	| 'desk'
	| 'notebook'
	| 'camera'
	| 'shelf'
	| 'corkboard'
	| 'lanyards'
	| 'mirror'
	| 'window'
	| 'door';

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
	},
	{
		id: 'corkboard',
		approach: { x: -1.75, z: 0.9 },
		hit: { center: [-3.42, 1.85, 0.9], size: [0.4, 1.25, 1.7] },
		focus: [-3.4, 1.8, 0.9],
		priority: 0
	},
	{
		id: 'lanyards',
		approach: { x: -0.65, z: -2.25 },
		hit: { center: [-0.65, 1.8, -2.92], size: [1.4, 1.9, 0.45] },
		focus: [-0.65, 1.8, -2.95],
		priority: 0
	},
	{
		id: 'mirror',
		approach: { x: -2.75, z: -0.95 },
		hit: { center: [-3.3, 1.0, -0.95], size: [0.55, 2.0, 0.95] },
		focus: [-3.35, 1.1, -0.95],
		priority: 0
	},
	{
		id: 'window',
		approach: { x: -1.95, z: -2.3 },
		hit: { center: [-2.2, 1.95, -2.92], size: [1.5, 1.5, 0.45] },
		focus: [-2.2, 1.9, -2.95],
		priority: 0
	},
	{
		id: 'door',
		approach: { x: -2.85, z: 2.45 },
		hit: { center: [-3.42, 1.1, 2.5], size: [0.45, 2.3, 1.05] },
		focus: [-3.4, 1.2, 2.5],
		priority: 0
	}
];

export type CuriosityId = 'plush' | 'mug' | 'suitcase' | 'football';

export interface CuriosityLayout {
	id: CuriosityId;
	hit: Box;
}

// Environmental details: a one-line note, not a navigation destination.
export const CURIOSITIES: CuriosityLayout[] = [
	{ id: 'plush', hit: { center: [-2.72, 0.85, 0.15], size: [0.65, 0.6, 0.6] } },
	{ id: 'mug', hit: { center: [0.4, 1.15, -2.25], size: [0.32, 0.32, 0.32] } },
	{ id: 'suitcase', hit: { center: [-1.9, 0.38, 2.85], size: [0.62, 0.8, 0.45] } },
	{ id: 'football', hit: { center: [-2.35, 0.14, 2.15], size: [0.42, 0.42, 0.42] } }
];

// The door swings open while its station is focused.
export const DOOR_HINGE: Vec3 = [-3.47, 0, 2.1];
export const DOOR_OPEN = 0.6;

// Generous: the character only needs to be roughly in front of an object.
export const INTERACTION_RADIUS = 1.35;
