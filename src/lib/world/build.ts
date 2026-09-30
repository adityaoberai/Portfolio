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
import type { Vec3 } from './layout';

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
	lit.box('#c5cdb2', [-3.575, 1.52, 0.1], [0.15, 3.1, 6.2]);
	lit.box('#b4ae91', [0, 0.13, -2.98], [7, 0.22, 0.05]);
	lit.box('#94a086', [-3.48, 0.13, 0.1], [0.05, 0.22, 6.2]);
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
	lit.group([1.35, 0, -1.8], -0.3, () => {
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
