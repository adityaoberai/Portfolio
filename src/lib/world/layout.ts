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

// The camera cabinet stands against the back wall right of the shelf, with a
// strand of prints above it; the mirror leans against the back wall in the right
// corner. Both are drawn in their own frames (build.ts).
export const CABINET = { x: 1.95, z: -2.7, angle: 0 };

// One board on the left wall above the sofa: a wide corkboard with the lanyards
// hanging on the half nearer the desk and notes and photos pinned on the half
// nearer the door, under a rail along its top. `z` is its centre and `width` its length along the wall.
export const BOARD = { z: -0.025, width: 2.5, y: 1.9, height: 1.05 };
export const LANYARDS = { x: -3.47, z: -0.65, angle: Math.PI / 2, drop: -0.12 };
// The mirror leans back by `lean`; `glass` is its pane in the mirror's frame
// (+x faces out): the front surface, the centre height, and the size.
export const MIRROR = {
	x: 3.05,
	z: -2.88,
	angle: -Math.PI / 2,
	lean: 0.08,
	glass: { front: 0.055, y: 0.99, width: 0.66, height: 1.76 }
};

// The bed runs along the right edge of the room, headboard at the back.
export const BED = { x: 2.8 };

export const FOOTPRINTS = {
	desk: { x: DESK.x, z: DESK.z, halfX: DESK.length / 2, halfZ: DESK.depth / 2, angle: DESK.angle },
	deskChair: { x: -2.4, z: -2.15, halfX: 0.26, halfZ: 0.25, angle: Math.PI / 2 - 0.3 },
	cabinet: { x: CABINET.x, z: CABINET.z, halfX: 0.45, halfZ: 0.3, angle: CABINET.angle },
	shelf: { x: SHELF.x, z: SHELF.z, halfX: 0.275, halfZ: 0.6, angle: SHELF.angle },
	mirror: edges(2.64, 3.46, -3, -2.62),
	bed: edges(BED.x - 0.7, BED.x + 0.7, -0.25, 1.9),
	// At the foot of the bed: the suitcase, turned a little towards the room, and the ball.
	suitcase: { x: 2.45, z: 2.6, halfX: 0.25, halfZ: 0.13, angle: -0.25 },
	football: { x: 3.05, z: 2.3, halfX: 0.13, halfZ: 0.13, angle: 0 },
	// A two-seat sofa against the left wall under the board, on a small rug, with
	// room for one person between it and the desk.
	sofa: { x: -3.08, z: 0.05, halfX: 0.75, halfZ: 0.4, angle: Math.PI / 2 }
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
	// Where the character sits while the station is open: a point on the floor
	// plan, the way it faces, and how far it is lifted (seat height less hip
	// height). It stands up again at `approach` when the station closes.
	seat?: Seat;
}

export interface Seat {
	x: number;
	z: number;
	facing: number;
	lift: number;
}

// A point in a turned footprint's frame, in the room.
function within(f: Footprint, x: number, z: number): Point {
	const c = Math.cos(f.angle);
	const s = Math.sin(f.angle);
	return { x: f.x + c * x + s * z, z: f.z - s * x + c * z };
}

// On the desk chair, facing the laptop (the chair's sitter faces its own -z).
const chair = FOOTPRINTS.deskChair;
const chairSeat = within(chair, 0, 0.03);
// On the sofa cushion nearer the room, facing out.
const sofaSeat = within(FOOTPRINTS.sofa, -0.31, 0.13);

export const STATIONS: StationLayout[] = [
	{
		id: 'desk',
		// Behind the chair, looking at the laptop; the character sits on the chair.
		approach: { x: -1.8, z: -2.1 },
		hit: { center: [-3.1, 0.95, -2.1], size: [1.0, 1.95, 1.75] },
		focus: [-3.0, 1.25, -2.1],
		priority: 0,
		seat: { ...chairSeat, facing: chair.angle + Math.PI, lift: 0.21 }
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
		approach: { x: CABINET.x, z: -1.95 },
		hit: { center: [CABINET.x + 0.02, 1.25, -2.72], size: [1.05, 2.5, 0.85] },
		focus: [CABINET.x + 0.03, 1.2, -2.7],
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
		// In front of the sofa; the character sits on it while the board is open.
		approach: { x: -2.3, z: FOOTPRINTS.sofa.z },
		hit: { center: [-3.42, BOARD.y, BOARD.z], size: [0.4, BOARD.height + 0.2, BOARD.width] },
		focus: [-3.4, BOARD.y - 0.05, BOARD.z],
		priority: 0,
		seat: { ...sofaSeat, facing: Math.PI / 2, lift: 0.1 }
	},
	{
		id: 'lanyards',
		// Part of the board now; world.ts hides this station, so only the board opens.
		approach: { x: -2.1, z: -0.75 },
		hit: { center: [-3.42, BOARD.y, LANYARDS.z], size: [0.4, 1.2, 1.1] },
		focus: [-3.4, BOARD.y - 0.05, LANYARDS.z],
		priority: 0
	},
	{
		id: 'mirror',
		// Left of centre and clear of the cabinet: the camera looks at the glass from
		// the right, so this is where the character's reflection lands in the middle.
		approach: { x: 2.5, z: -2.05 },
		hit: { center: [3.05, 1.0, -2.85], size: [0.95, 2.0, 0.55] },
		focus: [3.05, 1.1, -2.9],
		priority: 0
	},
	{
		id: 'window',
		approach: { x: -1.25, z: -2.3 },
		hit: { center: [-1.25, 1.95, -2.92], size: [1.5, 1.5, 0.45] },
		focus: [-1.25, 1.9, -2.95],
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

// The Manchester United flag on the left wall above the desk, facing the room.
// Its picture (red field and crest) is a texture made by `npm run images`.
export const FLAG = {
	x: -3.5,
	y: 2.3,
	z: -2.1,
	angle: Math.PI / 2,
	width: 1,
	height: 0.62,
	texture: '/room/flag.webp',
	pixels: { width: 400, height: 248 }
};

export type CuriosityId = 'plush' | 'cowl' | 'delorean' | 'flag' | 'suitcase' | 'football' | 'bed';

export interface CuriosityLayout {
	id: CuriosityId;
	hit: Box;
	// Something to walk up to (the bed): clicking it, or pressing E within
	// USE_RADIUS of `approach`, walks the character there and turns it to `facing`
	// before the note shows. Other little things just show their note.
	approach?: Point;
	facing?: number;
	// Where the camera pushes toward while its poem is open, as for a station.
	focus?: Vec3;
}

// Environmental details: a one-line note, not a navigation destination.
export const CURIOSITIES: CuriosityLayout[] = [
	{ id: 'plush', hit: { center: [BED.x - 0.08, 0.85, 0.15], size: [0.65, 0.6, 0.6] } },
	{
		// Trying to sleep: the character walks to the bed's side by its foot (further
		// up, the bed hides it from the camera), looks at the bed, then turns its back
		// on it to face the room and the camera (world.ts has why). The plush on the
		// bed wins clicks on itself (the nearest hit wins).
		id: 'bed',
		hit: { center: [BED.x, 0.4, 0.825], size: [1.42, 0.8, 2.15] },
		approach: { x: 1.75, z: 1.7 },
		facing: Math.atan2(0.25, 1),
		// Between the bed and the character turned away from it.
		focus: [2.3, 0.75, 1.3]
	},
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
	{ id: 'flag', hit: { center: [FLAG.x + 0.04, FLAG.y, FLAG.z], size: [0.1, 0.66, 1.04] } },
	{
		id: 'suitcase',
		hit: {
			center: [FOOTPRINTS.suitcase.x, 0.38, FOOTPRINTS.suitcase.z],
			size: [0.62, 0.8, 0.45]
		}
	},
	{
		id: 'football',
		hit: {
			center: [FOOTPRINTS.football.x, 0.14, FOOTPRINTS.football.z],
			size: [0.42, 0.42, 0.42]
		}
	}
];

// The door swings open while its station is focused.
export const DOOR_HINGE: Vec3 = [-3.47, 0, 2.1];
export const DOOR_OPEN = 0.6;

// Generous: the character only needs to be roughly in front of an object.
export const INTERACTION_RADIUS = 1.35;
// Tighter for the bed, so the room's start point isn't already beside it.
export const USE_RADIUS = 0.75;
