import {
	BoxGeometry,
	CircleGeometry,
	Color,
	ConeGeometry,
	CylinderGeometry,
	Euler,
	Float32BufferAttribute,
	Matrix4,
	PlaneGeometry,
	Quaternion,
	SphereGeometry,
	Vector3,
	type BufferGeometry
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { books } from '../data/books';
import {
	BED,
	CABINET,
	DESK,
	FLAG,
	BOARD,
	FOOTPRINTS,
	LANYARDS,
	LAPTOP,
	MIRROR,
	SHELF,
	type Vec3
} from './layout';

type Shape = 'box' | 'cylinder' | 'sphere' | 'disc' | 'cone' | 'plane';

function createBases(): Record<Shape, BufferGeometry> {
	return {
		box: new BoxGeometry(1, 1, 1),
		cylinder: new CylinderGeometry(1, 1, 1, 10),
		sphere: new SphereGeometry(1, 10, 6),
		disc: new CircleGeometry(1, 28),
		cone: new ConeGeometry(1, 1, 8),
		plane: new PlaneGeometry(1, 1)
	};
}

// Collects primitive parts with per-vertex colour, then merges them into a single
// geometry: the whole static room costs one draw call per material.
export class Batch {
	private parts: BufferGeometry[] = [];
	private stack: Matrix4[] = [new Matrix4()];
	private readonly bases = createBases();

	private get top() {
		return this.stack[this.stack.length - 1];
	}

	group(position: Vec3, rotation: Vec3 | number, draw: () => void, scale = 1) {
		const euler = typeof rotation === 'number' ? new Euler(0, rotation, 0) : new Euler(...rotation);
		const local = new Matrix4().compose(
			new Vector3(...position),
			new Quaternion().setFromEuler(euler),
			new Vector3(scale, scale, scale)
		);
		this.stack.push(this.top.clone().multiply(local));
		draw();
		this.stack.pop();
	}

	add(shape: Shape, color: string, position: Vec3, scale: Vec3, rotation: Vec3 = [0, 0, 0]) {
		const geometry = this.bases[shape].clone();
		const local = new Matrix4().compose(
			new Vector3(...position),
			new Quaternion().setFromEuler(new Euler(...rotation)),
			new Vector3(...scale)
		);
		geometry.applyMatrix4(this.top.clone().multiply(local));
		const { r, g, b } = new Color(color);
		const count = geometry.getAttribute('position').count;
		const colors = new Float32Array(count * 3);
		for (let i = 0; i < count; i++) colors.set([r, g, b], i * 3);
		geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
		this.parts.push(geometry);
	}

	box(color: string, position: Vec3, scale: Vec3, rotation?: Vec3) {
		this.add('box', color, position, scale, rotation);
	}

	cylinder(color: string, position: Vec3, radius: number, height: number, rotation?: Vec3) {
		this.add('cylinder', color, position, [radius, height, radius], rotation);
	}

	// Flat floor decal: rugs, shadows, markers.
	decal(color: string, x: number, z: number, sx: number, sz: number, y = 0.012) {
		this.add('disc', color, [x, y, z], [sx, sz, 1], [-Math.PI / 2, 0, 0]);
	}

	// A flat picture facing local +z that shows one cell of a texture atlas:
	// `cell` is [left, bottom, right, top] in texture coordinates (0 to 1).
	picture(position: Vec3, width: number, height: number, rotation: Vec3, cell: number[]) {
		this.add('plane', '#ffffff', position, [width, height, 1], rotation);
		const uv = this.parts[this.parts.length - 1].getAttribute('uv');
		const [left, bottom, right, top] = cell;
		for (let i = 0; i < uv.count; i++)
			uv.setXY(i, left + uv.getX(i) * (right - left), bottom + uv.getY(i) * (top - bottom));
	}

	build(): BufferGeometry {
		const merged = mergeGeometries(this.parts, false);
		this.parts.forEach((part) => part.dispose());
		Object.values(this.bases).forEach((base) => base.dispose());
		this.parts = [];
		if (!merged) throw new Error('Room geometry could not be merged');
		return merged;
	}
}

// Blastoise, local +z facing forward: the figure on top of the shelf, after
// Aditya's plush. Sky-blue and stocky: a big cream belly with a stitched seam, a
// black collar, a wide head with an open red-and-pink mouth, angled eyes and black
// ears; a brown shell with a pale rim; grey cannons over the shoulders; white claws.
export function blastoise(b: Batch) {
	const blue = '#56afdc';
	const claw = '#f6f5ef';
	// Legs and feet.
	for (const side of [-1, 1]) {
		const x = side * 0.1;
		b.add('sphere', blue, [x, 0.13, 0.03], [0.09, 0.095, 0.1]);
		b.add('sphere', blue, [x, 0.045, 0.07], [0.085, 0.05, 0.1]);
		for (const dx of [-0.035, 0.035])
			b.add('cone', claw, [x + dx, 0.03, 0.165], [0.018, 0.04, 0.018], [Math.PI / 2, 0, 0]);
	}
	// Shell, its pale rim, the body, and the belly.
	b.add('sphere', '#5b4030', [0, 0.31, -0.1], [0.2, 0.2, 0.12]);
	b.add('sphere', '#e3e2da', [0, 0.3, -0.03], [0.2, 0.215, 0.11]);
	b.add('sphere', blue, [0, 0.27, 0], [0.165, 0.18, 0.13]);
	b.add('sphere', '#f2ecb0', [0, 0.26, 0.07], [0.135, 0.165, 0.08]);
	b.box('#d6cb7a', [0, 0.32, 0.146], [0.1, 0.006, 0.006]);
	b.box('#d6cb7a', [0, 0.17, 0.142], [0.006, 0.08, 0.006]);
	// Arms with white claws.
	for (const side of [-1, 1]) {
		b.add('sphere', blue, [side * 0.175, 0.32, 0.03], [0.065, 0.095, 0.065], [0, 0, side * 0.35]);
		b.add('sphere', blue, [side * 0.2, 0.22, 0.08], [0.055, 0.06, 0.065]);
		for (const dx of [-0.02, 0.02])
			b.add(
				'cone',
				claw,
				[side * 0.2 + dx, 0.2, 0.145],
				[0.014, 0.035, 0.014],
				[Math.PI / 2 + 0.4, 0, 0]
			);
	}
	// Collar, head, snout, and the open mouth.
	b.add('cylinder', '#1f1f1f', [0, 0.44, 0.02], [0.11, 0.04, 0.095]);
	b.add('sphere', blue, [0, 0.545, 0.03], [0.115, 0.1, 0.11]);
	b.add('sphere', '#f2ecb0', [0, 0.445, 0.1], [0.09, 0.035, 0.075]);
	b.box('#b3262c', [0, 0.49, 0.165], [0.11, 0.035, 0.03]);
	b.box('#ef8c9b', [0, 0.468, 0.17], [0.085, 0.03, 0.03]);
	b.add('sphere', blue, [0, 0.535, 0.13], [0.09, 0.035, 0.07]);
	// Eyes slanting down towards the snout, and black ears.
	for (const side of [-1, 1]) {
		b.group([side * 0.068, 0.575, 0.117], [0, side * 0.6, side * 0.35], () => {
			b.box('#f4f4f0', [0, 0, 0], [0.045, 0.022, 0.01]);
			b.box('#1f1f1f', [side * -0.01, -0.002, 0.003], [0.018, 0.018, 0.01]);
		});
		b.add('cone', '#1f1f1f', [side * 0.08, 0.63, -0.01], [0.03, 0.055, 0.02], [0, 0, side * -0.4]);
	}
	// Cannons over the shoulders, splayed a little, with dark muzzles.
	for (const side of [-1, 1]) {
		const splay = side * -0.25;
		const axis = [-Math.sin(splay), 0, Math.cos(splay)];
		const base: Vec3 = [side * 0.15, 0.44, 0];
		b.add('cylinder', '#b9bab4', base, [0.042, 0.26, 0.042], [Math.PI / 2, 0, splay]);
		b.add(
			'cylinder',
			'#1f1f1f',
			[base[0] + axis[0] * 0.131, base[1], base[2] + axis[2] * 0.131],
			[0.028, 0.006, 0.028],
			[Math.PI / 2, 0, splay]
		);
	}
}

// Squirtle plush, local +z facing forward, after Aditya's own: sky-blue and
// round, a big head with red eyes, a cream belly plate with stitched seams, and a
// brown shell with a cream rim.
export function squirtle(b: Batch) {
	const blue = '#7cc5e3';
	for (const x of [-0.085, 0.085]) {
		b.add('sphere', blue, [x, 0.045, 0.05], [0.07, 0.05, 0.085]);
		b.add('sphere', blue, [x * 0.95, 0.1, 0.02], [0.075, 0.08, 0.075]);
	}
	b.add('sphere', '#b07a4f', [0, 0.22, -0.05], [0.165, 0.175, 0.12]);
	b.cylinder('#ead7a6', [0, 0.22, -0.005], 0.168, 0.035, [Math.PI / 2, 0, 0]);
	b.add('sphere', blue, [0, 0.21, 0], [0.15, 0.16, 0.13]);
	b.add('sphere', blue, [0.07, 0.08, -0.15], [0.05, 0.05, 0.06]);
	// Belly plate and its seams.
	b.box('#efdcaa', [0, 0.205, 0.12], [0.19, 0.23, 0.03]);
	b.box('#6b5440', [0, 0.205, 0.137], [0.006, 0.21, 0.004]);
	for (const y of [0.16, 0.25]) b.box('#6b5440', [0, y, 0.137], [0.17, 0.006, 0.004]);
	for (const side of [-1, 1])
		b.add('sphere', blue, [side * 0.165, 0.245, 0.04], [0.07, 0.05, 0.055], [0, 0, side * 0.6]);
	// Head, eyes, smile.
	b.add('sphere', blue, [0, 0.47, 0.02], [0.175, 0.16, 0.155]);
	for (const side of [-1, 1])
		b.group([side * 0.068, 0.49, 0.156], [0, side * 0.42, 0], () => {
			b.box('#3a2420', [0, 0, 0], [0.062, 0.076, 0.01]);
			b.box('#c7362f', [0, 0, 0.003], [0.05, 0.064, 0.01]);
			b.box('#1f1a18', [0, -0.004, 0.006], [0.022, 0.032, 0.01]);
			b.box('#fbf6ee', [side * -0.01, 0.016, 0.009], [0.014, 0.014, 0.01]);
		});
	b.box('#4a2e28', [0, 0.428, 0.168], [0.05, 0.008, 0.008]);
	for (const side of [-1, 1])
		b.box('#4a2e28', [side * 0.03, 0.434, 0.164], [0.018, 0.008, 0.008], [0, 0, side * 0.5]);
}

// Aditya's Batman cowl (gunmetal black, tall ears, white eye slits) on a foam
// display head, local +z facing forward. The lower face is open, as on his.
// 0.28 tall at scale 1; on the shelf it is scaled to the size of a real head.
export function batmanCowl(b: Batch) {
	const cowl = '#2c2e31';
	const lift = -0.06;
	b.cylinder('#3a3a38', [0, 0.008, 0], 0.06, 0.015);
	b.cylinder('#cfc8bb', [0, 0.095 + lift, 0], 0.035, 0.05);
	b.add('sphere', '#cfc8bb', [0, 0.165 + lift, 0.008], [0.062, 0.08, 0.072]);
	b.add('sphere', cowl, [0, 0.2 + lift, -0.008], [0.073, 0.075, 0.08]);
	b.box(cowl, [0, 0.198 + lift, 0.07], [0.1, 0.05, 0.03]);
	b.box('#45484c', [0, 0.222 + lift, 0.083], [0.1, 0.008, 0.008]);
	for (const side of [-1, 1]) {
		b.box(
			'#e9e6df',
			[side * 0.024, 0.205 + lift, 0.086],
			[0.03, 0.009, 0.004],
			[0, 0, side * 0.25]
		);
		b.box(cowl, [side * 0.062, 0.15 + lift, 0.025], [0.018, 0.075, 0.055]);
		b.add(
			'cone',
			cowl,
			[side * 0.036, 0.3 + lift, -0.012],
			[0.017, 0.085, 0.017],
			[0, 0, side * -0.12]
		);
	}
}

// LEGO Speed Champions DeLorean time machine (77256), local +x forward, after the
// set: a low light-grey wedge with the black side stripe and wheel arches, dark
// windows and mirrors, studs on the hood, the louvred nose with its headlights,
// trans-blue time-circuit coils arching over the rear wheels and glowing along the
// sills, the reactor and Mr. Fusion on the engine deck, the roof lights, rear
// vents and exhausts, and the tall antenna at the back.
export function legoDelorean(b: Batch) {
	const grey = '#a0a5a9';
	const dark = '#55595c';
	const black = '#232323';
	const glass = '#33434b';
	const glow = '#5fcde2';
	// Body: sills, the hood sloping down to the nose, a short cabin and roof.
	b.box(grey, [0, 0.04, 0], [0.34, 0.035, 0.15]);
	b.box(grey, [0.095, 0.062, 0], [0.15, 0.012, 0.14], [0, 0, -0.1]);
	b.box(grey, [-0.04, 0.074, 0], [0.11, 0.032, 0.118]);
	b.box(grey, [-0.045, 0.094, 0], [0.08, 0.008, 0.11]);
	for (const z of [-0.03, 0.03]) b.cylinder('#c4c8cb', [0.1, 0.07, z], 0.008, 0.006);
	// Windscreen, side windows, gull-wing door seams, mirrors.
	b.box(glass, [0.035, 0.076, 0], [0.05, 0.004, 0.11], [0, 0, -0.55]);
	for (const side of [-1, 1]) {
		const z = side * 0.06;
		b.box(glass, [-0.045, 0.078, z], [0.085, 0.02, 0.004]);
		b.box(black, [0.012, 0.062, side * 0.0605], [0.003, 0.032, 0.004]);
		b.box(black, [0.024, 0.08, side * 0.068], [0.012, 0.01, 0.014]);
	}
	// The black stripe along the sides, black wheel arches, black skirts.
	b.box(black, [0, 0.053, 0], [0.335, 0.006, 0.152]);
	b.box(black, [0, 0.03, 0], [0.13, 0.012, 0.152]);
	for (const x of [-0.11, 0.11]) b.box(black, [x, 0.059, 0], [0.075, 0.012, 0.154]);
	// Nose: louvred grille, headlights, a black splitter, a trans-blue bar.
	b.box(black, [0.171, 0.045, 0], [0.006, 0.02, 0.09]);
	for (const y of [0.04, 0.046, 0.052]) b.box(dark, [0.175, y, 0], [0.003, 0.002, 0.07]);
	b.box(black, [0.165, 0.022, 0], [0.03, 0.006, 0.15]);
	b.box(glow, [0.172, 0.03, 0], [0.006, 0.008, 0.14]);
	for (const side of [-1, 1]) b.box('#e8eef0', [0.171, 0.048, side * 0.058], [0.006, 0.014, 0.026]);
	// Engine deck: louvres, the black reactor with its glowing top, Mr. Fusion.
	b.box(dark, [-0.125, 0.07, 0], [0.09, 0.025, 0.14]);
	for (const z of [-0.04, 0, 0.04]) b.box('#2f3133', [-0.125, 0.084, z], [0.07, 0.004, 0.02]);
	b.box(black, [-0.12, 0.093, 0.035], [0.05, 0.022, 0.06]);
	b.box(glow, [-0.12, 0.105, 0.035], [0.045, 0.004, 0.05]);
	b.cylinder('#e6e7e8', [-0.15, 0.097, -0.035], 0.014, 0.03);
	b.cylinder(dark, [-0.15, 0.114, -0.035], 0.01, 0.006);
	// Roof lights, rear vents and twin exhausts.
	for (const z of [-0.02, 0.02])
		b.cylinder('#7d8285', [-0.075, 0.102, z], 0.008, 0.025, [0, 0, Math.PI / 2]);
	b.box(black, [-0.171, 0.062, 0], [0.006, 0.03, 0.12]);
	for (const y of [0.055, 0.065]) b.box(dark, [-0.175, y, 0], [0.003, 0.003, 0.1]);
	for (const z of [-0.04, 0.04])
		b.cylinder(black, [-0.176, 0.042, z], 0.01, 0.012, [0, 0, Math.PI / 2]);
	// Time circuits: a coil arching over each rear wheel, and the sills glowing.
	const arc: [number, number, number][] = [
		[-0.155, 0.066, 0.7],
		[-0.135, 0.079, 0.35],
		[-0.11, 0.084, 0],
		[-0.085, 0.079, -0.35],
		[-0.065, 0.066, -0.7]
	];
	for (const side of [-1, 1]) {
		for (const [x, y, tilt] of arc)
			b.box(glow, [x, y, side * 0.077], [0.024, 0.01, 0.006], [0, 0, tilt]);
		b.box(glow, [0, 0.02, side * 0.076], [0.3, 0.006, 0.004]);
	}
	// Wheels with grey hubs.
	for (const x of [-0.11, 0.11])
		for (const side of [-1, 1]) {
			b.cylinder(black, [x, 0.03, side * 0.07], 0.03, 0.026, [Math.PI / 2, 0, 0]);
			b.cylinder('#8d9295', [x, 0.03, side * 0.0835], 0.02, 0.002, [Math.PI / 2, 0, 0]);
		}
	// The antenna, leaning back, with a ball at its tip.
	b.cylinder(black, [-0.2, 0.165, 0.05], 0.003, 0.18, [0, 0, 0.45]);
	b.add('sphere', black, [-0.239, 0.246, 0.05], [0.006, 0.006, 0.006]);
}

// The Manchester United flag pinned to the wall (FLAG in layout.ts), in a frame
// whose +z points out of the wall: a red backing (all that shows until the
// texture arrives), the picture with the crest, and two pins.
export function manUtdFlag(lit: Batch, picture: Batch) {
	const { width, height } = FLAG;
	const place: [Vec3, number] = [[FLAG.x, FLAG.y, FLAG.z], FLAG.angle];
	lit.group(...place, () => {
		lit.box('#c8102e', [0, 0, 0.007], [width, height, 0.008]);
		for (const dx of [-0.48, 0.48]) lit.box('#d9d4c7', [dx, 0.29, 0.016], [0.02, 0.02, 0.006]);
	});
	picture.group(...place, () =>
		picture.picture([0, 0, 0.012], width, height, [0, 0, 0], [0, 0, 1, 1])
	);
}

// The camera's view direction and screen axes, for placing details on the side of
// a round object that faces the camera.
const toCamera = new Vector3(9, 10, 12).normalize();
const screenRight = new Vector3(0, 1, 0).cross(toCamera).normalize();
const screenUp = toCamera.clone().cross(screenRight).normalize();

// White ball with its graphic as small pixel blocks: two bands either side of the
// face the camera sees, a navy panel on top, and a navy swoosh in the middle.
export function premierLeagueBall(b: Batch, [x, y, z]: Vec3, radius: number) {
	b.add('sphere', '#f4f4f1', [x, y, z], [radius, radius, radius]);
	const block = (color: string, angle: number, around: number, size = 0.032) => {
		const a = (angle * Math.PI) / 180;
		const t = (around * Math.PI) / 180;
		const d = toCamera
			.clone()
			.multiplyScalar(Math.cos(a))
			.add(screenRight.clone().multiplyScalar(Math.sin(a) * Math.cos(t)))
			.add(screenUp.clone().multiplyScalar(Math.sin(a) * Math.sin(t)))
			.multiplyScalar(radius * 0.9);
		b.box(color, [x + d.x, y + d.y, z + d.z], [size, size, size]);
	};
	const band = ['#1d2a5c', '#2f7fd1', '#f07a28', '#5ab8e8', '#1d2a5c', '#2f7fd1'];
	band.forEach((color, i) => {
		block(color, 66, -40 + i * 16);
		block(band[(i + 3) % band.length], 66, 140 + i * 16);
	});
	for (const [around, color] of [
		[75, '#1d2a5c'],
		[95, '#1d2a5c'],
		[115, '#1d2a5c'],
		[95, '#f07a28']
	] as const)
		block(color, color === '#f07a28' ? 30 : 44, around, 0.03);
	// The swoosh: a navy stroke across the middle, thicker at its start.
	const centre = toCamera.clone().multiplyScalar(radius * 0.97);
	b.group(
		[x + centre.x, y + centre.y - 0.012, z + centre.z],
		Math.atan2(toCamera.x, toCamera.z),
		() => {
			b.box('#1d2a5c', [0.012, 0, 0], [0.075, 0.009, 0.01], [0, 0, 0.18]);
			b.box('#1d2a5c', [-0.03, -0.004, 0], [0.025, 0.014, 0.01], [0, 0, -0.5]);
		}
	);
}

// A two-seat sofa, local +z facing out and its back to the wall: a terracotta
// frame, cream seat cushions, tilted back cushions, and a green throw cushion.
export function twoSeatSofa(b: Batch) {
	b.box('#b8644a', [0, 0.2, 0], [1.5, 0.24, 0.8]);
	b.box('#a85a42', [0, 0.55, -0.32], [1.5, 0.6, 0.16]);
	for (const side of [-1, 1]) {
		b.box('#a85a42', [side * 0.69, 0.42, 0.02], [0.12, 0.3, 0.76]);
		b.box('#e2c9a4', [side * 0.31, 0.37, 0.07], [0.6, 0.1, 0.58]);
		b.box('#c67a5a', [side * 0.31, 0.6, -0.2], [0.58, 0.32, 0.1], [-0.12, 0, 0]);
	}
	for (const x of [-0.66, 0.66])
		for (const z of [-0.32, 0.32]) b.box('#5d4a3a', [x, 0.04, z], [0.06, 0.08, 0.06]);
	b.box('#5f8f73', [-0.5, 0.52, -0.08], [0.24, 0.22, 0.1], [-0.2, 0.3, 0.1]);
}

export function buildShell(lit: Batch, unlit: Batch) {
	unlit.decal('#d7d8c8', 0, 0.1, 5.1, 4.4, -0.35);
	lit.box('#ad805b', [-0.075, -0.2, 0.025], [7.15, 0.32, 6.35]);
	lit.box('#dfc49a', [0, -0.025, 0.1], [7, 0.06, 6.2]);
	for (let x = -3.3; x < 3.4; x += 0.55) lit.box('#cfb186', [x, 0.009, 0.1], [0.015, 0.005, 6.1]);
	lit.box('#e4ddc4', [-0.075, 1.52, -3.075], [7.15, 3.1, 0.15]);
	// Left wall in three pieces around the doorway (z 2.1 to 2.9, 2.1 high: the door slab).
	lit.box('#c5cdb2', [-3.575, 1.52, -0.45], [0.15, 3.1, 5.1]);
	lit.box('#c5cdb2', [-3.575, 1.52, 3.05], [0.15, 3.1, 0.3]);
	lit.box('#c5cdb2', [-3.575, 2.585, 2.5], [0.15, 0.97, 0.8]);
	lit.box('#b4ae91', [0, 0.13, -2.98], [7, 0.22, 0.05]);
	for (const [z, length] of [
		[-0.45, 5.1],
		[3.05, 0.3]
	])
		lit.box('#94a086', [-3.48, 0.13, z], [0.05, 0.22, length]);
	lit.box('#a87753', [-0.075, 3.1, -3.075], [7.25, 0.1, 0.21]);
	lit.box('#a87753', [-3.575, 3.1, 0.1], [0.21, 0.1, 6.3]);

	// Warm woven rug; no transparency or real-time shadows.
	lit.box('#bb7156', [0.5, 0.026, 0.7], [3.3, 0.025, 2.5]);
	lit.box('#d59870', [0.5, 0.042, 0.7], [3.05, 0.009, 2.25]);
	for (const z of [-0.3, 1.7]) lit.box('#ebc498', [0.5, 0.05, z], [3, 0.005, 0.055]);
}

// Asus ROG Zephyrus G15, open, local +z towards whoever sits at it: an Eclipse
// Gray chassis, a black keyboard with white backlit rows, a touchpad, ROG's vent
// strip along the hinge, and the lid leaning back. The screen's panels sit in
// front of the display mesh (scene.ts), which lights up when someone is near.
export function zephyrusG15(b: Batch) {
	const { width, depth, base, lid, tilt } = LAPTOP;
	const shell = '#2d2f33';
	b.box(shell, [0, base / 2, 0], [width, base, depth]);
	b.box('#17181a', [0, base + 0.0015, -0.065], [width - 0.05, 0.003, 0.16]);
	for (const z of [-0.13, -0.1, -0.07, -0.04, -0.01])
		b.box('#d8dce2', [0, base + 0.0035, z], [width - 0.09, 0.0015, 0.006]);
	b.box('#3a3c40', [0, base + 0.001, 0.1], [0.16, 0.002, 0.09]);
	b.box('#1c1d20', [0, base + 0.002, -depth / 2 + 0.012], [width - 0.04, 0.004, 0.018]);
	b.group([0, base, -depth / 2], [-tilt, 0, 0], () => {
		b.box(shell, [0, lid / 2, -0.006], [width, lid, 0.012]);
		b.box('#111214', [0, lid / 2, 0.001], [width - 0.02, lid - 0.02, 0.002]);
		b.box('#dae1bd', [-0.11, lid * 0.62, 0.0045], [0.19, 0.1, 0.002]);
		b.box('#638d7c', [0.11, lid * 0.62, 0.0045], [0.19, 0.1, 0.002]);
		b.box('#e5e7d1', [0, lid * 0.3, 0.0045], [0.41, 0.04, 0.002]);
	});
}

// The desk in the back-left corner (DESK in layout.ts), drawn in its own frame:
// the laptop in the middle, the lamp at the back end, the open notebook at the
// front end, drawers underneath. The chair stands in the room's frame.
export function buildDesk(lit: Batch, unlit: Batch) {
	const { length, depth, height } = DESK;
	unlit.group([DESK.x, 0, DESK.z], DESK.angle, () =>
		unlit.decal('#c5aa82', 0, 0.2, length * 0.6, depth * 0.75)
	);
	lit.group([DESK.x, 0, DESK.z], DESK.angle, () => {
		lit.box('#ad744c', [0, height - 0.06, 0], [length, 0.12, depth]);
		for (const x of [-length / 2 + 0.05, length / 2 - 0.05])
			for (const z of [-depth / 2 + 0.07, depth / 2 - 0.07])
				lit.box('#7c6148', [x, 0.47, z], [0.08, 0.94, 0.08]);
		lit.box('#b89063', [0.5, 0.62, -0.02], [0.5, 0.6, 0.7]);
		lit.box('#785a41', [0.5, 0.66, 0.335], [0.16, 0.035, 0.03]);

		lit.group([LAPTOP.x, height, LAPTOP.z], 0, () => zephyrusG15(lit));

		// Desk lamp at the back end: a dark base, a two-part arm reaching towards the
		// laptop, and a shade opening downwards over a warm bulb.
		const lamp = '#2f3133';
		const z = -0.25;
		lit.cylinder(lamp, [0.68, height + 0.012, z], 0.08, 0.024);
		lit.box(lamp, [0.66, height + 0.17, z], [0.022, 0.32, 0.022], [0, 0, 0.12]);
		lit.add('sphere', lamp, [0.641, height + 0.329, z], [0.02, 0.02, 0.02]);
		lit.box(lamp, [0.525, height + 0.388, z], [0.02, 0.26, 0.02], [0, 0, 1.1]);
		lit.add('cone', lamp, [0.42, height + 0.42, z], [0.075, 0.11, 0.075], [0, 0, -0.35]);
		lit.add('sphere', '#ffe9b8', [0.4, height + 0.37, z], [0.03, 0.03, 0.03]);

		// Open notebook and fountain pen.
		lit.group(
			[-0.49, height, 0.1],
			-0.12,
			() => {
				lit.box('#5f7f6a', [0, 0.01, 0], [0.66, 0.02, 0.46]);
				lit.box('#f3ead2', [-0.165, 0.03, 0], [0.3, 0.02, 0.42]);
				lit.box('#efe4c8', [0.165, 0.03, 0], [0.3, 0.02, 0.42]);
				lit.box('#8d7f62', [0, 0.032, 0], [0.012, 0.022, 0.42]);
				for (const x of [-0.165, 0.165])
					for (const z of [-0.13, -0.07, -0.01, 0.05])
						lit.box('#a79c86', [x, 0.042, z], [0.2, 0.004, 0.012]);
				lit.group([0.12, 0.055, 0.1], 0.6, () => {
					lit.cylinder('#23302a', [0, 0, 0], 0.018, 0.3, [0, 0, Math.PI / 2]);
					lit.cylinder('#c9a24a', [0.09, 0, 0], 0.02, 0.02, [0, 0, Math.PI / 2]);
					lit.add('cone', '#c9a24a', [-0.175, 0, 0], [0.016, 0.05, 0.016], [0, 0, Math.PI / 2]);
				});
			},
			0.85
		);
	});

	// The chair, pulled back from the desk.
	const chair = FOOTPRINTS.deskChair;
	lit.group([chair.x, 0, chair.z], chair.angle, () => {
		lit.box('#5c7667', [0, 0.5, 0], [0.52, 0.1, 0.48]);
		lit.box('#5c7667', [0, 0.82, 0.21], [0.52, 0.55, 0.08]);
		for (const x of [-0.2, 0.2])
			for (const z of [-0.18, 0.18]) lit.box('#6c5743', [x, 0.24, z], [0.05, 0.48, 0.05]);
	});
}

// The photography corner (CABINET in layout.ts). Drawn as it stood against the
// back wall, centred on (3.05, -2.7), then moved as one piece.
export function buildPhotography(lit: Batch) {
	lit.group([CABINET.x, 0, CABINET.z], CABINET.angle, () =>
		lit.group([-3.05, 0, 2.7], 0, () => photographyCorner(lit))
	);
}

function photographyCorner(lit: Batch) {
	lit.box('#9c704c', [3.05, 0.45, -2.7], [0.85, 0.9, 0.6]);
	lit.box('#86603f', [3.05, 0.45, -2.395], [0.012, 0.8, 0.01]);
	for (const x of [2.97, 3.13]) lit.box('#6b4f36', [x, 0.55, -2.39], [0.04, 0.04, 0.02]);

	// Fujifilm X-T30 II: silver top plate, retro dials, black body.
	lit.group([3.02, 0.9, -2.66], 0.35, () => {
		lit.box('#2b2b2a', [0, 0.11, 0], [0.34, 0.2, 0.12]);
		lit.box('#bdbbb3', [0, 0.225, 0], [0.34, 0.03, 0.12]);
		lit.box('#2b2b2a', [0, 0.28, -0.005], [0.12, 0.08, 0.1]);
		lit.cylinder('#c7c5bd', [-0.11, 0.26, 0], 0.032, 0.035);
		lit.cylinder('#c7c5bd', [0.1, 0.26, 0], 0.036, 0.03);
		lit.cylinder('#1f1f1e', [0, 0.11, 0.12], 0.068, 0.14, [Math.PI / 2, 0, 0]);
		lit.cylinder('#8d8b84', [0, 0.11, 0.16], 0.071, 0.025, [Math.PI / 2, 0, 0]);
		lit.box('#1d1d1c', [-0.155, 0.1, 0.045], [0.04, 0.17, 0.04]);
	});

	// A strand of prints above the camera.
	lit.box('#6b5a48', [3.02, 2.47, -2.99], [0.95, 0.012, 0.012]);
	const prints: [string, string][] = [
		['#e9c38e', '#b46a4a'],
		['#9fb7c9', '#58707e'],
		['#d8d0b8', '#8b6a4e']
	];
	prints.forEach(([sky, ground], i) => {
		const x = 2.72 + i * 0.3;
		lit.box('#f4efe2', [x, 2.24, -2.985], [0.25, 0.33, 0.012], [0, 0, (i - 1) * 0.05]);
		lit.box(sky, [x, 2.3, -2.977], [0.21, 0.13, 0.006], [0, 0, (i - 1) * 0.05]);
		lit.box(ground, [x, 2.18, -2.977], [0.21, 0.13, 0.006], [0, 0, (i - 1) * 0.05]);
		lit.box('#c9a24a', [x, 2.44, -2.975], [0.035, 0.05, 0.02]);
	});
}

// The Pokémon shelf, by rows (SHELF in layout.ts), drawn in its own frame: +x out
// of its front, z along it (+z is screen-left once it stands on the back wall).
// `faces` collects the card pictures (one textured mesh, see scene.ts); the first
// `cards` slabs show cell i of the shelf atlas, left to right. Slabs past that stay
// abstract.
export function buildCollection(lit: Batch, faces: Batch, cards: number) {
	const { boards } = SHELF;
	const row = (board: number) => boards[board] + 0.025;
	const place: [Vec3, number] = [[SHELF.x, 0, SHELF.z], SHELF.angle];
	lit.group(...place, () =>
		faces.group(...place, () => {
			lit.box('#e9e0c8', [-0.265, 1.15, 0], [0.02, 2.3, 1.2]);
			for (const z of [-0.58, 0.58]) lit.box('#8f6a4c', [0, 1.15, z], [0.55, 2.3, 0.04]);
			for (const y of boards) lit.box('#9f7753', [0, y, 0], [0.55, 0.05, 1.2]);

			// Graded slabs: clear case, card, red label. The card's picture sits just in
			// front of its yellow face, which shows until the atlas has loaded.
			let slot = 0;
			const slab = (z: number, y: number, art: string, tilt = 0) => {
				const face = slot < cards ? slot : -1;
				slot++;
				lit.group([0.145, y, z], [0, 0, tilt], () => {
					lit.box('#dfe9ec', [0, 0.17, 0], [0.04, 0.34, 0.22]);
					lit.box('#e8c85a', [0.021, 0.15, 0], [0.006, 0.25, 0.18]);
					if (face < 0) lit.box(art, [0.025, 0.17, 0], [0.004, 0.12, 0.14]);
					lit.box('#c23b3b', [0.021, 0.3, 0], [0.042, 0.045, 0.2]);
				});
				if (face >= 0)
					faces.group([0.145, y, z], [0, 0, tilt], () =>
						faces.picture(
							[0.0245, 0.15, 0],
							0.18,
							0.25,
							[0, Math.PI / 2, 0],
							[face / cards, 0, (face + 1) / cards, 1]
						)
					);
			};
			// Row 1: the favourite cards side by side, left to right.
			for (const z of [0.39, 0.13, -0.13, -0.39]) slab(z, row(3), '#9fb8d4', 0.12);

			// Row 2: the Batman cowl (sized to fit a head) and the LEGO DeLorean.
			const { cowl, delorean } = SHELF;
			lit.group([cowl.x, row(2), cowl.z], cowl.angle, () => batmanCowl(lit), cowl.scale);
			lit.group(
				[delorean.x, row(2), delorean.z],
				delorean.angle,
				() => legoDelorean(lit),
				delorean.scale
			);

			// Row 3: Aditya's books (books.ts), spines out, left to right and centred
			// between two bookends.
			const gap = 0.004;
			const span = books.reduce((sum, book) => sum + book.thickness + gap, -gap);
			let z = span / 2;
			for (const z0 of [z + 0.02, -z - 0.02]) {
				lit.box('#2f3133', [0.0, row(1) + 0.11, z0], [0.2, 0.22, 0.012]);
				lit.box('#2f3133', [0.0, row(1) + 0.004, z0 + (z0 > 0 ? 0.04 : -0.04)], [0.2, 0.008, 0.08]);
			}
			for (const { spine, band, height, thickness } of books) {
				z -= thickness;
				const middle = z + thickness / 2;
				lit.box(spine, [-0.025, row(1) + height / 2, middle], [0.26, height, thickness]);
				lit.box(band, [0.106, row(1) + height * 0.78, middle], [0.002, 0.03, thickness * 0.8]);
				lit.box(band, [0.106, row(1) + height * 0.12, middle], [0.002, 0.012, thickness * 0.6]);
				z -= gap;
			}

			// Bottom row: binders and sealed boxes.
			lit.box('#355a8a', [0.025, row(0) + 0.165, 0.5], [0.34, 0.33, 0.07]);
			lit.box('#e8e0c8', [0.205, row(0) + 0.2, 0.5], [0.01, 0.12, 0.05]);
			lit.box('#8c3f36', [0.025, row(0) + 0.155, 0.42], [0.34, 0.31, 0.07]);
			lit.box('#c24a3a', [0.025, row(0) + 0.13, 0.18], [0.4, 0.26, 0.3]);
			lit.box('#3d6f9e', [0.025, row(0) + 0.11, -0.14], [0.4, 0.22, 0.3]);
			lit.box('#e2c35a', [0.025, row(0) + 0.09, -0.42], [0.4, 0.18, 0.22]);

			// Pride of place: Blastoise on top, facing the room.
			lit.group([0.045, 2.305, 0], Math.PI / 2, () => blastoise(lit));
		})
	);
}

export function buildBedroom(lit: Batch) {
	// The bed along the right edge of the room (BED in layout.ts).
	const x = BED.x;
	lit.box('#8f6a4c', [x, 0.6, -0.23], [1.42, 1, 0.06]);
	lit.box('#a9805c', [x, 0.25, 0.825], [1.4, 0.4, 2.15]);
	lit.box('#faf2da', [x, 0.53, 0.84], [1.34, 0.18, 2.08]);
	lit.box('#749287', [x, 0.66, 1.15], [1.36, 0.1, 1.45]);
	lit.box('#a7b6a1', [x, 0.72, 0.45], [1.38, 0.03, 0.3]);
	lit.box('#f0e3c7', [x + 0.1, 0.7, 0.07], [0.95, 0.16, 0.4]);
	// Squirtle plush by the pillow, facing the room.
	lit.group([x - 0.18, 0.62, 0.28], Math.PI / 3, () => squirtle(lit), 0.72);
}

// Character parts: body is static relative to the character; legs swing.
export function buildCharacterBody(b: Batch) {
	b.box('#dfd1ab', [0, 0.54, 0], [0.48, 0.4, 0.27]);
	b.box('#af7a58', [-0.29, 0.52, 0], [0.12, 0.35, 0.15]);
	b.box('#af7a58', [0.29, 0.52, 0], [0.12, 0.35, 0.15]);
	b.box('#b6815f', [0, 0.93, 0], [0.41, 0.4, 0.35]);
	b.box('#393a31', [0, 1.15, -0.025], [0.46, 0.13, 0.4]);
	b.box('#393a31', [0, 1.04, -0.18], [0.43, 0.21, 0.09]);
	b.box('#594434', [0, 0.8, 0.14], [0.3, 0.1, 0.08]);
	for (const x of [-0.105, 0.105]) {
		b.box('#303b32', [x, 0.97, 0.184], [0.17, 0.11, 0.025]);
		b.box('#c4c7aa', [x, 0.977, 0.202], [0.11, 0.055, 0.012]);
	}
	b.box('#303b32', [0, 0.98, 0.19], [0.06, 0.026, 0.02]);
}

export function buildLeg(b: Batch) {
	// Pivot at the hip: the leg hangs below its origin.
	b.box('#394a45', [0, -0.185, 0], [0.18, 0.37, 0.2]);
}

// Window onto Bengaluru on the back wall, between the desk and the shelf: frame,
// skyline, gulmohar trees, and the purple metro line. The sky pane and the
// building lights are separate meshes (see scene.ts). The art is drawn centred on
// x = DRAWN_AT and moved to WINDOW.x as one piece.
export const WINDOW = { x: -1.25, y: 1.95, width: 1.26, height: 1.16 };
const DRAWN_AT = -2.2;
const toWindow = (b: Batch, draw: () => void) => b.group([WINDOW.x - DRAWN_AT, 0, 0], 0, draw);
const skylineBase = WINDOW.y - WINDOW.height / 2;
const towers: [number, number, number][] = [
	[-2.72, 0.18, 0.42],
	[-2.5, 0.14, 0.62],
	[-2.3, 0.22, 0.36],
	[-2.05, 0.12, 0.78],
	[-1.84, 0.2, 0.5],
	[-1.66, 0.12, 0.3]
];

export function buildWindow(lit: Batch) {
	toWindow(lit, () => windowArt(lit));
}

function windowArt(lit: Batch) {
	lit.box('#a17b58', [DRAWN_AT, WINDOW.y, -2.98], [1.42, 1.32, 0.06]);
	towers.forEach(([x, w, h], i) =>
		lit.box(i % 2 ? '#7f958b' : '#6f857c', [x, skylineBase + h / 2, -2.938], [w, h, 0.006])
	);
	lit.box('#7f958b', [-2.05, skylineBase + 0.8, -2.938], [0.06, 0.05, 0.006]);
	for (const [x, y] of [
		[-2.62, 1.5],
		[-1.74, 1.47]
	]) {
		lit.add('sphere', '#6d8f5a', [x, y, -2.934], [0.17, 0.11, 0.01]);
		for (const [dx, dy] of [
			[-0.07, 0.03],
			[0.05, 0.05],
			[0.02, -0.03]
		])
			lit.add('sphere', '#d0573a', [x + dx, y + dy, -2.93], [0.025, 0.02, 0.004]);
	}
	lit.box('#7b5aa6', [DRAWN_AT, 1.57, -2.931], [WINDOW.width, 0.035, 0.006]);
	for (const x of [-2.6, -2.2, -1.8]) lit.box('#8c8f86', [x, 1.47, -2.932], [0.025, 0.19, 0.005]);
	lit.box('#e9dbbb', [DRAWN_AT, WINDOW.y, -2.925], [0.05, 1.18, 0.03]);
	lit.box('#e9dbbb', [DRAWN_AT, WINDOW.y, -2.925], [1.28, 0.05, 0.03]);
	lit.box('#b48a61', [DRAWN_AT, 1.3, -2.86], [1.6, 0.08, 0.32]);
	lit.cylinder('#b87554', [-1.72, 1.41, -2.86], 0.08, 0.14);
	lit.add('sphere', '#7e965f', [-1.72, 1.55, -2.86], [0.12, 0.15, 0.12]);
}

// Lit windows in the towers; the mesh colour switches them on after dark.
export function buildCityLights(b: Batch) {
	toWindow(b, () =>
		towers.forEach(([x, w, h]) => {
			for (let y = skylineBase + 0.08; y < skylineBase + h - 0.05; y += 0.1)
				for (const dx of w > 0.15 ? [-w / 4, w / 4] : [0])
					b.box('#ffffff', [x + dx, y, -2.931], [0.028, 0.034, 0.004]);
		})
	);
}

export function buildLanyards(lit: Batch) {
	// The rail along the top of the board, which the lanyards hang from.
	lit.box(
		'#6b5a48',
		[-3.47, BOARD.y + BOARD.height / 2 + 0.045, BOARD.z],
		[0.05, 0.05, BOARD.width]
	);
	// Drawn as they hung on the back wall, centred on x -0.65, then moved.
	lit.group([LANYARDS.x, LANYARDS.drop, LANYARDS.z], LANYARDS.angle, () =>
		lit.group([0.65, 0, 3], 0, () => {
			const straps = ['#c9573c', '#3d6f9e', '#d6a64a', '#5f8f73', '#8a5aa8'];
			straps.forEach((strap, i) => {
				const x = -1.15 + i * 0.25;
				const drop = [0, 0.08, 0.03, 0.12, 0.05][i];
				const badgeY = 1.78 - drop;
				const length = 2.6 - badgeY - 0.1;
				lit.box('#4a3d30', [x, 2.6, -2.94], [0.03, 0.06, 0.04]);
				for (const side of [-1, 1])
					lit.box(
						strap,
						[x + side * 0.045, badgeY + 0.1 + length / 2, -2.96],
						[0.03, length, 0.01],
						[0, 0, -side * 0.12]
					);
				lit.group([x, badgeY, -2.955], [0, 0, (i - 2) * 0.04], () => {
					lit.box('#f6f1e4', [0, 0, 0], [0.2, 0.27, 0.012]);
					lit.box(strap, [0, 0.1, 0.008], [0.2, 0.06, 0.004]);
					for (const y of [-0.01, -0.05, -0.09])
						lit.box('#9a9280', [0, y, 0.008], [0.13, 0.012, 0.004]);
				});
			});
		})
	);
}

export function buildMirror(lit: Batch) {
	// Leaning back against the wall (MIRROR in layout.ts); its own +x faces out.
	lit.group([MIRROR.x, 0, MIRROR.z], [0, MIRROR.angle, 0.08], () => {
		lit.box('#8f6a4c', [0, 0.97, 0], [0.08, 1.92, 0.82]);
		lit.box('#d6e3df', [0.045, 0.99, 0], [0.02, 1.76, 0.66]);
		for (const [y, z] of [
			[1.35, -0.12],
			[1.05, 0.12]
		])
			lit.box('#f1f7f4', [0.057, y, z], [0.005, 0.55, 0.05], [0.5, 0, 0]);
		lit.box('#6f4f37', [0.12, 0.03, 0], [0.3, 0.06, 0.7]);
	});
}

// The board on the left wall (BOARD in layout.ts): a wide corkboard. The things
// pinned to it are drawn where they hung on the old, smaller board, then moved.
export function buildCorkboard(lit: Batch) {
	const { y, z, width, height } = BOARD;
	lit.box('#8f6a4c', [-3.47, y, z], [0.05, height, width]);
	lit.box('#c49a6c', [-3.45, y, z], [0.03, height - 0.1, width - 0.1]);
	// The notes and photos fill the half nearer the door; the lanyards hang on the
	// half nearer the desk (buildLanyards).
	lit.group([0, 0.05, -0.35], 0, () => pinned(lit));
}

function pinned(lit: Batch) {
	const x = -3.43;
	const pin = (y: number, z: number) =>
		lit.add('sphere', '#c23b3b', [x + 0.01, y, z], [0.02, 0.02, 0.02]);
	// Photos from walks and meetups.
	[
		[2.1, 0.35, '#9fb7c9', 0.1],
		[1.95, 0.72, '#e0a36a', -0.08],
		[1.6, 1.42, '#8fae84', 0.06]
	].forEach(([y, z, color, tilt]) => {
		lit.group([x, y as number, z as number], [tilt as number, 0, 0], () => {
			lit.box('#faf6ec', [0, 0, 0], [0.008, 0.28, 0.23]);
			lit.box(color as string, [0.003, 0.03, 0], [0.004, 0.18, 0.18]);
		});
		pin((y as number) + 0.12, z as number);
	});
	// Tickets, notes, a small poster, and a badge.
	lit.box('#e0b84a', [x, 1.62, 0.4], [0.006, 0.09, 0.3], [0.15, 0, 0]);
	lit.box('#c9573c', [x, 1.52, 0.72], [0.006, 0.09, 0.28], [-0.1, 0, 0]);
	lit.box('#f2dc8c', [x, 1.64, 1.05], [0.006, 0.2, 0.2], [0.05, 0, 0]);
	lit.box('#cfe0b9', [x, 2.12, 1.1], [0.006, 0.18, 0.18], [-0.08, 0, 0]);
	pin(1.72, 1.05);
	pin(2.19, 1.1);
	lit.box('#e8dcc0', [x, 2.02, 1.42], [0.006, 0.34, 0.24]);
	lit.box('#5f8f73', [x + 0.003, 2.08, 1.42], [0.004, 0.12, 0.18]);
	pin(2.17, 1.42);
	lit.cylinder('#5a3f8a', [x, 1.5, 1.2], 0.07, 0.008, [0, 0, Math.PI / 2]);
	lit.cylinder('#f0b77c', [x + 0.005, 1.5, 1.2], 0.04, 0.006, [0, 0, Math.PI / 2]);
}

export function buildDoorFrame(lit: Batch, unlit: Batch) {
	for (const z of [2.06, 2.94]) lit.box('#6f4f37', [-3.46, 1.1, z], [0.07, 2.2, 0.07]);
	lit.box('#6f4f37', [-3.46, 2.22, 2.5], [0.07, 0.07, 0.95]);
	lit.box('#8f6a4c', [-3.575, -0.01, 2.5], [0.15, 0.03, 0.8]);
	// The hallway beyond, seen only through the open door. The camera looks along
	// -(9, 10, 12), so the doorway shows floor and wall further back (-z); the floor
	// steps in so no corner pokes out past the front end of the left wall.
	const hall: [number, number, number][] = [
		[-3.75, 0.9, 2.9],
		[-3.95, 0.9, 2.6],
		[-4.15, 0.9, 2.35]
	];
	for (const [x, minZ, maxZ] of hall)
		lit.box('#c9ad86', [x, -0.03, (minZ + maxZ) / 2], [0.2, 0.06, maxZ - minZ]);
	lit.box('#9c5a45', [-3.95, 0.004, 1.75], [0.56, 0.008, 0.5]);
	lit.box('#efe4cb', [-4.275, 0.8, 1.6], [0.05, 1.6, 1.4]);
	lit.box('#c9bd9c', [-4.245, 0.08, 1.6], [0.012, 0.16, 1.4]);
	lit.box('#6f4f37', [-4.24, 1.02, 1.5], [0.02, 0.32, 0.26]);
	lit.box('#a9c2b0', [-4.228, 1.02, 1.5], [0.006, 0.24, 0.18]);
	unlit.decal('#b08d68', -3.05, 2.5, 0.35, 0.5, 0.013);
	// A Manchester United scarf on a hook beside the door.
	lit.box('#4a3d30', [-3.46, 2.05, 1.97], [0.05, 0.04, 0.04]);
	const bars = ['#c8102e', '#f4f1ea', '#1f1f1f', '#f4f1ea', '#c8102e'];
	bars.forEach((color, i) => lit.box(color, [-3.44, 1.95 - i * 0.12, 1.97], [0.02, 0.12, 0.09]));
}

// Door slab in hinge-local coordinates: the hinge is the origin, the slab extends along +z.
export function buildDoorSlab(b: Batch) {
	b.box('#9a6f4b', [0, 1.05, 0.4], [0.05, 2.1, 0.8]);
	for (const y of [0.55, 1.5]) b.box('#a97c56', [0.028, y, 0.4], [0.01, 0.7, 0.55]);
	b.add('sphere', '#c9a24a', [0.05, 1.02, 0.7], [0.035, 0.035, 0.035]);
}

export function buildDecor(lit: Batch, unlit: Batch, flag: Batch) {
	manUtdFlag(lit, flag);

	// Under the board: a small rug and the sofa on it.
	const sofa = FOOTPRINTS.sofa;
	lit.box('#5f7f6a', [-2.8, 0.022, sofa.z], [1.3, 0.02, 1.7]);
	lit.box('#e2cfa6', [-2.8, 0.033, sofa.z], [1.12, 0.004, 1.52]);
	for (const dz of [-0.55, 0.55]) lit.box('#5f7f6a', [-2.8, 0.036, sofa.z + dz], [1, 0.003, 0.05]);
	lit.group([sofa.x, 0, sofa.z], sofa.angle, () => twoSeatSofa(lit));
	// At the foot of the bed: the suitcase with travel stickers, and the football,
	// a white Nike Premier League ball with pixelated navy, blue, and orange bands
	// and a navy swoosh.
	const suitcase = FOOTPRINTS.suitcase;
	lit.group([suitcase.x, 0, suitcase.z], suitcase.angle, () => {
		lit.box('#4f6f7a', [0, 0.36, 0], [0.48, 0.62, 0.26]);
		lit.box('#3c5760', [0, 0.72, 0], [0.18, 0.05, 0.04]);
		const stickers: [number, number, string][] = [
			[-0.12, 0.48, '#e0b84a'],
			[0.1, 0.28, '#c9573c'],
			[-0.05, 0.2, '#f6f1e4']
		];
		for (const [x, y, color] of stickers)
			lit.box(color, [x, y, 0.132], [0.12, 0.09, 0.006], [0, 0, 0.2]);
		for (const x of [-0.17, 0.17])
			lit.cylinder('#2b2b2a', [x, 0.03, 0], 0.03, 0.03, [0, 0, Math.PI / 2]);
	});
	const ball = FOOTPRINTS.football;
	premierLeagueBall(lit, [ball.x, 0.13, ball.z], 0.13);
	unlit.decal('#caa77f', ball.x, ball.z, 0.14, 0.1, 0.014);
}
