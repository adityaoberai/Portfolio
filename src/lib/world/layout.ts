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

// Everything standing on the floor has a footprint: a rectangle centred on (x, z),
// turned by `angle` (the same Y rotation the model gets in build.ts). The
// character can't enter one; walking into it slides along its edge, and clicking
// past it walks around it (see movement.ts).
export interface Footprint {
	x: number;
	z: number;
	halfX: number;
	halfZ: number;
	angle: number;
}

// An unturned footprint from its edges.
const edges = (minX: number, maxX: number, minZ: number, maxZ: number): Footprint => ({
	x: (minX + maxX) / 2,
	z: (minZ + maxZ) / 2,
	halfX: (maxX - minX) / 2,
	halfZ: (maxZ - minZ) / 2,
	angle: 0
});

// build.ts places the turned and free-standing pieces from these, so a model and
// its footprint can't drift apart.
// The desk stands in the back-left corner against the left wall, facing the room
// (+x). In its own frame x runs along it (+x towards the back wall) and +z points
// out into the room; `height` is the desktop.
export const DESK = { x: -3.1, z: -2.1, angle: Math.PI / 2, length: 1.6, depth: 0.8, height: 1.06 };

// The laptop on it (Asus ROG Zephyrus G15), in the desk's frame. The lid hinges
// at the back edge of the base and leans back by `tilt`; its screen is a separate
// mesh (scene.ts) so it can wake.
export const LAPTOP = {
	x: 0.08,
	z: 0.04,
	width: 0.52,
	depth: 0.36,
	base: 0.024,
	lid: 0.34,
	tilt: 0.3
};

// The Pokémon shelf stands against the back wall, between the lanyards and the
// flag, its front (its own +x) turned to face the room. Top to bottom: Blastoise
// on top, the favourite cards in a row, the Batman cowl and LEGO DeLorean, books,
// then binders and sealed boxes. `boards` are the centres of the five boards
// (0.05 thick); each row stands on the board below it. The cowl and DeLorean are
// placed in the shelf's own frame (+z is screen-left once it stands there).
export const SHELF = {
	x: 0.75,
	z: -2.725,
	angle: -Math.PI / 2,
	boards: [0.05, 0.45, 0.93, 1.7, 2.28],
	// The camera looks from the +x side, so the tall cowl stands left of the low car.
	cowl: { x: 0.025, z: 0.3, angle: Math.PI / 2 + 0.15, scale: 2.5 },
	delorean: { x: 0.075, z: -0.22, angle: Math.PI / 2 - 0.3, scale: 1.2 }
};

// A point in the shelf's frame, in the room.
export function onShelf(x: number, z: number): Point {
	const c = Math.cos(SHELF.angle);
	const s = Math.sin(SHELF.angle);
	return { x: SHELF.x + c * x + s * z, z: SHELF.z - s * x + c * z };
}

// The camera cabinet stands against the left wall beside the desk, facing the
// room, with a strand of prints above it; the mirror leans against the back wall
// in the right corner. Both are drawn in their own frames (build.ts).
export const CABINET = { x: -3.2, z: -0.8, angle: Math.PI / 2 };
export const MIRROR = { x: 3.05, z: -2.88, angle: -Math.PI / 2 };

// The bed runs along the right edge of the room, headboard at the back.
export const BED = { x: 2.8 };

export const FOOTPRINTS = {
	desk: { x: DESK.x, z: DESK.z, halfX: DESK.length / 2, halfZ: DESK.depth / 2, angle: DESK.angle },
	deskChair: { x: -2.4, z: -2.15, halfX: 0.26, halfZ: 0.25, angle: Math.PI / 2 - 0.3 },
	cabinet: { x: CABINET.x, z: CABINET.z, halfX: 0.45, halfZ: 0.3, angle: CABINET.angle },
	shelf: { x: SHELF.x, z: SHELF.z, halfX: 0.275, halfZ: 0.6, angle: SHELF.angle },
	mirror: edges(2.64, 3.46, -3, -2.62),
	bed: edges(BED.x - 0.7, BED.x + 0.7, -0.25, 1.9),
	football: { x: -3.2, z: 2.03, halfX: 0.13, halfZ: 0.13, angle: 0 },
	suitcase: edges(-2.15, -1.65, 2.72, 2.98),
	// The reading corner, under the corkboard where the bed was.
	armchair: { x: -2.75, z: 1.0, halfX: 0.43, halfZ: 0.38, angle: 0.55 },
	books: { x: -2.0, z: 1.6, halfX: 0.2, halfZ: 0.16, angle: 0 },
	floorLamp: { x: -3.1, z: 0.3, halfX: 0.13, halfZ: 0.13, angle: 0 },
	plant: edges(2.72, 3.28, 2.27, 2.83)
} satisfies Record<string, Footprint>;

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
		// Behind the chair, looking at the laptop.
		approach: { x: -1.8, z: -2.1 },
		hit: { center: [-3.1, 0.95, -2.1], size: [1.0, 1.95, 1.75] },
		focus: [-3.0, 1.25, -2.1],
		priority: 0
	},
	{
		id: 'notebook',
		approach: { x: -2.2, z: -1.15 },
		hit: { center: [-3.0, 1.12, -1.61], size: [0.6, 0.5, 0.7] },
		focus: [-3.0, 1.05, -1.61],
		priority: 1
	},
	{
		id: 'camera',
		approach: { x: -2.5, z: -0.8 },
		hit: { center: [-3.2, 1.25, -0.8], size: [0.85, 2.5, 1.05] },
		focus: [-3.18, 1.2, -0.78],
		priority: 0
	},
	{
		id: 'shelf',
		approach: { x: 0.75, z: -1.95 },
		hit: { center: [0.75, 1.25, -2.72], size: [1.4, 2.6, 0.75] },
		focus: [0.75, 1.35, -2.65],
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
		approach: { x: 3.05, z: -2.2 },
		hit: { center: [3.05, 1.0, -2.85], size: [0.95, 2.0, 0.55] },
		focus: [3.05, 1.1, -2.9],
		priority: 0
	},
	{
		id: 'window',
		// Off to the right of the window, clear of the desk chair.
		approach: { x: -1.45, z: -2.3 },
		hit: { center: [-2.2, 1.95, -2.92], size: [1.5, 1.5, 0.45] },
		focus: [-2.2, 1.9, -2.95],
		priority: 0
	},
	{
		id: 'door',
		// Far enough out that the door swings open clear of the character's head.
		approach: { x: -2.65, z: 2.4 },
		hit: { center: [-3.42, 1.1, 2.5], size: [0.45, 2.3, 1.05] },
		focus: [-3.4, 1.2, 2.5],
		priority: 0
	}
];

const displayRow = SHELF.boards[2] + 0.025;
const cowlAt = onShelf(SHELF.cowl.x, SHELF.cowl.z);
const deloreanAt = onShelf(SHELF.delorean.x, SHELF.delorean.z);

// The Manchester United flag on the back wall, above the right of the desk. Its
// picture (red field and crest) is a texture made by `npm run images`.
export const FLAG = {
	x: 1.85,
	y: 2.35,
	width: 1,
	height: 0.62,
	texture: '/room/flag.webp',
	pixels: { width: 400, height: 248 }
};

export type CuriosityId = 'plush' | 'cowl' | 'delorean' | 'flag' | 'suitcase' | 'football';

export interface CuriosityLayout {
	id: CuriosityId;
	hit: Box;
}

// Environmental details: a one-line note, not a navigation destination.
export const CURIOSITIES: CuriosityLayout[] = [
	{ id: 'plush', hit: { center: [BED.x - 0.08, 0.85, 0.15], size: [0.65, 0.6, 0.6] } },
	{
		id: 'cowl',
		hit: {
			center: [cowlAt.x, displayRow + 0.36, cowlAt.z],
			size: [0.42, 0.72, 0.5]
		}
	},
	{
		id: 'delorean',
		hit: { center: [deloreanAt.x, displayRow + 0.1, deloreanAt.z], size: [0.48, 0.26, 0.4] }
	},
	{ id: 'flag', hit: { center: [FLAG.x, FLAG.y, -2.96], size: [1.04, 0.66, 0.1] } },
	{ id: 'suitcase', hit: { center: [-1.9, 0.38, 2.85], size: [0.62, 0.8, 0.45] } },
	{ id: 'football', hit: { center: [-3.2, 0.14, 2.03], size: [0.42, 0.42, 0.42] } }
];

// The door swings open while its station is focused.
export const DOOR_HINGE: Vec3 = [-3.47, 0, 2.1];
export const DOOR_OPEN = 0.6;

// Generous: the character only needs to be roughly in front of an object.
export const INTERACTION_RADIUS = 1.35;
