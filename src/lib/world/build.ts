import {
	BoxGeometry,
	CircleGeometry,
	Color,
	ConeGeometry,
	CylinderGeometry,
	Euler,
	Float32BufferAttribute,
	Matrix4,
	Quaternion,
	SphereGeometry,
	Vector3,
	type BufferGeometry
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { FOOTPRINTS, type Vec3 } from './layout';

type Shape = 'box' | 'cylinder' | 'sphere' | 'disc' | 'cone';

function createBases(): Record<Shape, BufferGeometry> {
	return {
		box: new BoxGeometry(1, 1, 1),
		cylinder: new CylinderGeometry(1, 1, 1, 10),
		sphere: new SphereGeometry(1, 10, 6),
		disc: new CircleGeometry(1, 28),
		cone: new ConeGeometry(1, 1, 8)
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

	build(): BufferGeometry {
		const merged = mergeGeometries(this.parts, false);
		this.parts.forEach((part) => part.dispose());
		Object.values(this.bases).forEach((base) => base.dispose());
		this.parts = [];
		if (!merged) throw new Error('Room geometry could not be merged');
		return merged;
	}
}

// Low-poly Blastoise, local +z facing forward. Used for the shelf figure and the plush.
export function blastoise(b: Batch) {
	b.box('#8a6a45', [0, 0.27, -0.09], [0.37, 0.34, 0.2]);
	b.box('#6f5436', [0, 0.27, -0.2], [0.3, 0.26, 0.03]);
	b.box('#4f7fb8', [0, 0.25, 0.02], [0.3, 0.32, 0.22]);
	b.box('#e3d6a3', [0, 0.24, 0.135], [0.22, 0.24, 0.02]);
	b.box('#5b8cc4', [0, 0.5, 0.05], [0.2, 0.17, 0.18]);
	for (const x of [-0.05, 0.05]) b.box('#24231f', [x, 0.53, 0.142], [0.03, 0.035, 0.01]);
	for (const x of [-0.085, 0.085]) b.box('#4f7fb8', [x, 0.61, 0.02], [0.05, 0.06, 0.03]);
	for (const x of [-0.14, 0.14]) {
		b.cylinder('#9aa3a8', [x, 0.45, 0.0], 0.036, 0.26, [Math.PI / 2, 0, 0]);
		b.box('#4f7fb8', [x * 1.28, 0.28, 0.04], [0.07, 0.16, 0.08]);
		b.box('#4f7fb8', [x * 0.58, 0.035, 0.05], [0.09, 0.07, 0.11]);
	}
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

export function buildDesk(lit: Batch, unlit: Batch) {
	unlit.decal('#c5aa82', 1.1, -2.35, 1.5, 0.75);
	lit.box('#ad744c', [1.1, 1, -2.5], [2.4, 0.12, 1]);
	for (const x of [0, 2.2])
		for (const z of [-2.9, -2.1]) lit.box('#7c6148', [x, 0.47, z], [0.1, 0.94, 0.1]);
	lit.box('#b89063', [1.95, 0.62, -2.55], [0.55, 0.6, 0.8]);
	lit.box('#785a41', [1.95, 0.66, -2.14], [0.16, 0.035, 0.03]);

	// Monitor frame; the display face is a separate mesh so it can wake.
	lit.box('#35483f', [0.85, 1.62, -2.8], [1.2, 0.72, 0.08]);
	lit.box('#dae1bd', [0.6, 1.72, -2.74], [0.4, 0.2, 0.01]);
	lit.box('#638d7c', [1.1, 1.72, -2.74], [0.4, 0.2, 0.01]);
	lit.box('#e5e7d1', [0.83, 1.46, -2.74], [0.9, 0.1, 0.01]);
	lit.box('#35483f', [0.85, 1.2, -2.8], [0.1, 0.28, 0.08]);
	lit.box('#35483f', [0.85, 1.075, -2.72], [0.45, 0.03, 0.28]);
	lit.box('#eee5cd', [0.85, 1.08, -2.3], [0.78, 0.04, 0.24]);

	// Desk lamp: warm, not RGB.
	lit.cylinder('#5d4a3a', [0.12, 1.08, -2.7], 0.1, 0.03);
	lit.box('#5d4a3a', [0.12, 1.33, -2.7], [0.03, 0.5, 0.03], [0, 0, -0.2]);
	lit.add('cone', '#d9a35a', [0.24, 1.55, -2.62], [0.13, 0.16, 0.13], [0.4, 0, -0.7]);

	// Open notebook and fountain pen.
	lit.group([1.8, 1.06, -2.3], -0.2, () => {
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
	});

	// Chair pulled back between the two approach points.
	const chair = FOOTPRINTS.deskChair;
	lit.group([chair.x, 0, chair.z], chair.angle, () => {
		lit.box('#5c7667', [0, 0.5, 0], [0.52, 0.1, 0.48]);
		lit.box('#5c7667', [0, 0.82, 0.21], [0.52, 0.55, 0.08]);
		for (const x of [-0.2, 0.2])
			for (const z of [-0.18, 0.18]) lit.box('#6c5743', [x, 0.24, z], [0.05, 0.48, 0.05]);
	});
}

export function buildPhotography(lit: Batch) {
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

export function buildCollection(lit: Batch) {
	const x = -3.225;
	lit.box('#e9e0c8', [-3.49, 1.15, -2.2], [0.02, 2.3, 1.2]);
	for (const z of [-2.78, -1.62]) lit.box('#8f6a4c', [x, 1.15, z], [0.55, 2.3, 0.04]);
	for (const y of [0.05, 0.6, 1.15, 1.7, 2.28]) lit.box('#9f7753', [x, y, -2.2], [0.55, 0.05, 1.2]);

	// Graded slabs: clear case, card, red label.
	const slab = (z: number, y: number, card: string, tilt = 0) => {
		lit.group([-3.2, y, z], [0, 0, tilt], () => {
			lit.box('#dfe9ec', [0, 0.17, 0], [0.04, 0.34, 0.22]);
			lit.box('#e8c85a', [0.021, 0.15, 0], [0.006, 0.25, 0.18]);
			lit.box(card, [0.025, 0.17, 0], [0.004, 0.12, 0.14]);
			lit.box('#c23b3b', [0.021, 0.3, 0], [0.042, 0.045, 0.2]);
		});
	};
	slab(-2.62, 1.175, '#9fb8d4', 0.1);
	slab(-2.38, 1.175, '#e0a36a', 0.1);
	slab(-2.02, 1.175, '#b7c98e', 0.1);
	slab(-1.78, 1.175, '#d5a0b8', 0.1);
	// The Blastoise slab on an easel in the middle of the shelf.
	lit.box('#6b4f36', [-3.12, 1.73, -2.2], [0.14, 0.04, 0.2]);
	slab(-2.2, 1.73, '#5b8cc4', 0.2);
	slab(-2.55, 1.725, '#c7b58a', 0.12);
	slab(-1.85, 1.725, '#a9c2b0', 0.12);

	// Binders and sealed boxes.
	lit.box('#355a8a', [-3.2, 0.81, -2.62], [0.34, 0.37, 0.07]);
	lit.box('#e8e0c8', [-3.02, 0.84, -2.62], [0.01, 0.12, 0.05]);
	lit.box('#8c3f36', [-3.2, 0.8, -2.52], [0.34, 0.35, 0.07]);
	lit.box('#d8b34a', [-3.2, 0.72, -2.2], [0.36, 0.2, 0.28]);
	lit.box('#c24a3a', [-3.2, 0.2, -2.55], [0.4, 0.26, 0.3]);
	lit.box('#3d6f9e', [-3.2, 0.18, -2.2], [0.4, 0.22, 0.3]);
	lit.box('#e2c35a', [-3.2, 0.16, -1.88], [0.4, 0.18, 0.26]);

	// Pride of place: Blastoise on top, facing the room.
	lit.group([-3.18, 2.305, -2.2], Math.PI / 2, () => blastoise(lit));
}

export function buildBedroom(lit: Batch) {
	lit.box('#8f6a4c', [-2.8, 0.6, -0.23], [1.42, 1, 0.06]);
	lit.box('#a9805c', [-2.8, 0.25, 0.825], [1.4, 0.4, 2.15]);
	lit.box('#faf2da', [-2.8, 0.53, 0.84], [1.34, 0.18, 2.08]);
	lit.box('#749287', [-2.8, 0.66, 1.15], [1.36, 0.1, 1.45]);
	lit.box('#a7b6a1', [-2.8, 0.72, 0.45], [1.38, 0.03, 0.3]);
	lit.box('#f0e3c7', [-2.9, 0.7, 0.07], [0.95, 0.16, 0.4]);
	// Blastoise plush by the pillow.
	lit.group([-2.62, 0.62, 0.28], Math.PI / 3, () => blastoise(lit), 0.72);

	// Front-right plant.
	lit.cylinder('#b87554', [3.0, 0.33, 2.55], 0.3, 0.66);
	for (let i = 0; i < 5; i++) {
		const angle = (i * Math.PI * 2) / 5;
		lit.add(
			'sphere',
			i % 2 ? '#658463' : '#7e965f',
			[3.0 + Math.cos(angle) * 0.2, 0.95 + i * 0.1, 2.55 + Math.sin(angle) * 0.2],
			[0.16, 0.43, 0.17],
			[0, 0, Math.cos(angle) * 0.5]
		);
	}
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

// Window onto Bengaluru: frame, skyline, gulmohar trees, and the purple metro line.
// The sky pane and the building lights are separate meshes (see scene.ts).
export const WINDOW = { x: -2.2, y: 1.95, width: 1.26, height: 1.16 };
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
	lit.box('#a17b58', [WINDOW.x, WINDOW.y, -2.98], [1.42, 1.32, 0.06]);
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
	lit.box('#7b5aa6', [WINDOW.x, 1.57, -2.931], [WINDOW.width, 0.035, 0.006]);
	for (const x of [-2.6, -2.2, -1.8]) lit.box('#8c8f86', [x, 1.47, -2.932], [0.025, 0.19, 0.005]);
	lit.box('#e9dbbb', [WINDOW.x, WINDOW.y, -2.925], [0.05, 1.18, 0.03]);
	lit.box('#e9dbbb', [WINDOW.x, WINDOW.y, -2.925], [1.28, 0.05, 0.03]);
	lit.box('#b48a61', [WINDOW.x, 1.3, -2.86], [1.6, 0.08, 0.32]);
	lit.cylinder('#b87554', [-1.72, 1.41, -2.86], 0.08, 0.14);
	lit.add('sphere', '#7e965f', [-1.72, 1.55, -2.86], [0.12, 0.15, 0.12]);
}

// Lit windows in the towers; the mesh colour switches them on after dark.
export function buildCityLights(b: Batch) {
	towers.forEach(([x, w, h]) => {
		for (let y = skylineBase + 0.08; y < skylineBase + h - 0.05; y += 0.1)
			for (const dx of w > 0.15 ? [-w / 4, w / 4] : [0])
				b.box('#ffffff', [x + dx, y, -2.931], [0.028, 0.034, 0.004]);
	});
}

export function buildLanyards(lit: Batch) {
	lit.box('#6b5a48', [-0.65, 2.62, -2.97], [1.35, 0.05, 0.05]);
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
	// A talk poster at eye level.
	lit.box('#e8dcc0', [-0.65, 1.1, -2.985], [0.62, 0.48, 0.01]);
	lit.add('sphere', '#d9774f', [-0.8, 1.16, -2.978], [0.12, 0.12, 0.004]);
	for (const y of [1.2, 1.12, 1.04]) lit.box('#5c5446', [-0.52, y, -2.978], [0.22, 0.025, 0.004]);
}

export function buildMirror(lit: Batch) {
	lit.group([-3.38, 0, -0.95], [0, 0, 0.08], () => {
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

export function buildCorkboard(lit: Batch) {
	lit.box('#8f6a4c', [-3.47, 1.85, 0.9], [0.05, 1.05, 1.55]);
	lit.box('#c49a6c', [-3.45, 1.85, 0.9], [0.03, 0.95, 1.45]);
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
	// A football scarf on a hook beside the door.
	lit.box('#4a3d30', [-3.46, 2.05, 1.97], [0.05, 0.04, 0.04]);
	for (let i = 0; i < 5; i++)
		lit.box(i % 2 ? '#e6e1d3' : '#2f4f7f', [-3.44, 1.95 - i * 0.12, 1.97], [0.02, 0.12, 0.09]);
}

// Door slab in hinge-local coordinates: the hinge is the origin, the slab extends along +z.
export function buildDoorSlab(b: Batch) {
	b.box('#9a6f4b', [0, 1.05, 0.4], [0.05, 2.1, 0.8]);
	for (const y of [0.55, 1.5]) b.box('#a97c56', [0.028, y, 0.4], [0.01, 0.7, 0.55]);
	b.add('sphere', '#c9a24a', [0.05, 1.02, 0.7], [0.035, 0.035, 0.035]);
}

export function buildDecor(lit: Batch, unlit: Batch) {
	// Superman mug on the desk.
	lit.cylinder('#3d5f9e', [0.4, 1.12, -2.25], 0.06, 0.12);
	lit.box('#3d5f9e', [0.47, 1.12, -2.25], [0.03, 0.07, 0.02]);
	lit.box('#c23b3b', [0.4, 1.12, -2.188], [0.045, 0.045, 0.004], [0, 0, Math.PI / 4]);
	lit.box('#e8c85a', [0.4, 1.12, -2.185], [0.025, 0.025, 0.004], [0, 0, Math.PI / 4]);
	// Chargers and cables.
	lit.box('#2f3530', [1.35, 1.065, -2.62], [0.5, 0.01, 0.02], [0, 0.3, 0]);
	lit.box('#2f3530', [1.55, 1.07, -2.05], [0.14, 0.02, 0.08]);

	// Reading corner: armchair, headphones, books, lamp.
	const armchair = FOOTPRINTS.armchair;
	lit.group([armchair.x, 0, armchair.z], armchair.angle, () => {
		lit.box('#b8644a', [0, 0.3, 0], [0.82, 0.3, 0.74]);
		lit.box('#e2c9a4', [0, 0.49, 0.03], [0.62, 0.1, 0.6]);
		lit.box('#a85a42', [0, 0.72, -0.31], [0.82, 0.62, 0.14]);
		for (const x of [-0.38, 0.38]) lit.box('#a85a42', [x, 0.56, 0], [0.1, 0.22, 0.74]);
		for (const x of [-0.32, 0.32])
			for (const z of [-0.28, 0.28]) lit.box('#5d4a3a', [x, 0.07, z], [0.06, 0.14, 0.06]);
		// Headphones resting on the cushion.
		lit.box('#2b2b2a', [0.05, 0.62, 0.05], [0.26, 0.03, 0.04], [0, 0.4, 0]);
		for (const dx of [-0.1, 0.18])
			lit.cylinder('#2b2b2a', [dx, 0.57, 0.05 + dx * 0.4], 0.05, 0.04, [0, 0, Math.PI / 2]);
	});
	const books: [string, number][] = [
		['#5e807a', 0.1],
		['#bd8c5e', -0.15],
		['#ddd2b0', 0.2],
		['#8c3f36', 0]
	];
	const stack = FOOTPRINTS.books;
	books.forEach(([color, turn], i) =>
		lit.box(color, [stack.x, 0.05 + i * 0.09, stack.z], [0.36, 0.08, 0.26], [0, turn, 0])
	);
	const lamp = FOOTPRINTS.floorLamp;
	lit.cylinder('#5d4a3a', [lamp.x, 0.02, lamp.z], 0.12, 0.03);
	lit.cylinder('#5d4a3a', [lamp.x, 0.75, lamp.z], 0.015, 1.45);
	lit.add('cone', '#e9d2a6', [lamp.x, 1.5, lamp.z], [0.2, 0.22, 0.2]);

	// Tripod folded against the cabinet.
	const legs: [number, number][] = [
		[-0.06, 0],
		[0.04, 0.05],
		[0.03, -0.05]
	];
	const tripod = FOOTPRINTS.tripod;
	for (const [dx, dz] of legs)
		lit.cylinder('#3a3a38', [tripod.x + dx, 0.55, tripod.z + dz], 0.012, 1.1, [
			dz * 1.5,
			0,
			dx * 1.5
		]);
	lit.box('#2b2b2a', [tripod.x, 1.12, tripod.z], [0.08, 0.06, 0.08]);

	// Suitcase with travel stickers, and a football.
	lit.box('#4f6f7a', [-1.9, 0.36, 2.85], [0.48, 0.62, 0.26]);
	lit.box('#3c5760', [-1.9, 0.72, 2.85], [0.18, 0.05, 0.04]);
	const stickers: [number, number, string][] = [
		[-2.02, 0.48, '#e0b84a'],
		[-1.8, 0.28, '#c9573c'],
		[-1.95, 0.2, '#f6f1e4']
	];
	for (const [x, y, color] of stickers)
		lit.box(color, [x, y, 2.982], [0.12, 0.09, 0.006], [0, 0, 0.2]);
	for (const x of [-2.07, -1.73])
		lit.cylinder('#2b2b2a', [x, 0.03, 2.85], 0.03, 0.03, [0, 0, Math.PI / 2]);
	// The football waits by the door, under the scarf.
	const ball = FOOTPRINTS.football;
	lit.add('sphere', '#f1eee6', [ball.x, 0.13, ball.z], [0.13, 0.13, 0.13]);
	const patches: [number, number, number][] = [
		[0.08, 0.06, 0.08],
		[-0.1, 0.02, 0.07],
		[0.02, 0.11, -0.06],
		[0.1, -0.02, -0.07]
	];
	for (const [dx, dy, dz] of patches)
		lit.add('sphere', '#2b2b2a', [ball.x + dx, 0.13 + dy, ball.z + dz], [0.035, 0.035, 0.035]);
	unlit.decal('#caa77f', ball.x, ball.z, 0.14, 0.1, 0.014);
}
