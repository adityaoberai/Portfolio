import {
	BoxGeometry,
	CircleGeometry,
	Color,
	CylinderGeometry,
	DirectionalLight,
	Group,
	HemisphereLight,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	OrthographicCamera,
	Plane,
	Raycaster,
	Scene,
	SphereGeometry,
	Vector2,
	Vector3,
	WebGLRenderer,
	type BufferGeometry,
	type Material,
	type Object3D
} from 'three';
import {
	clampPoint,
	DESK_APPROACH,
	INTERACTION_RADIUS,
	keyboardDirection,
	SPEED,
	stepToward,
	type Point
} from './movement';

export interface RoomState {
	x: number;
	z: number;
	moving: boolean;
	nearDesk: boolean;
	frames: number;
	calls: number;
	triangles: number;
	dpr: number;
}

interface Options {
	onInspect: () => void;
	onState: (state: RoomState) => void;
	onError: () => void;
	reducedMotion: boolean;
	lowQuality: boolean;
}

export function createRoom(canvas: HTMLCanvasElement, options: Options) {
	const coarse = window.matchMedia('(pointer: coarse)').matches;
	const renderer = new WebGLRenderer({
		canvas,
		antialias: !coarse,
		alpha: true,
		powerPreference: 'low-power'
	});
	renderer.setClearColor(0x000000, 0);
	const scene = new Scene();
	const camera = new OrthographicCamera(-6, 6, 5, -5, 0.1, 60);
	camera.position.set(9, 10, 12);
	camera.lookAt(0, 1.05, 0);
	scene.add(new HemisphereLight('#fff5d8', '#8e9a7e', 2.5));
	const sun = new DirectionalLight('#ffe7bd', 2.2);
	sun.position.set(2, 7, 5);
	scene.add(sun);

	const geometries: BufferGeometry[] = [];
	const materials = new Map<string, Material>();
	const geometry = <T extends BufferGeometry>(value: T): T => {
		geometries.push(value);
		return value;
	};
	const cube = geometry(new BoxGeometry(1, 1, 1));
	const cylinder = geometry(new CylinderGeometry(1, 1, 1, 10));
	const sphere = geometry(new SphereGeometry(1, 10, 6));
	const disc = geometry(new CircleGeometry(1, 32));
	function material(color: string, flat = false): Material {
		const key = `${color}:${flat}`;
		let value = materials.get(key);
		if (!value) {
			value = flat
				? new MeshBasicMaterial({ color })
				: new MeshLambertMaterial({ color, flatShading: true });
			materials.set(key, value);
		}
		return value;
	}
	function shape(
		parent: Object3D,
		geom: BufferGeometry,
		color: string,
		position: [number, number, number],
		scale: [number, number, number],
		flat = false
	) {
		const mesh = new Mesh(geom, material(color, flat));
		mesh.position.set(...position);
		mesh.scale.set(...scale);
		parent.add(mesh);
		return mesh;
	}
	function box(
		parent: Object3D,
		color: string,
		position: [number, number, number],
		scale: [number, number, number]
	) {
		return shape(parent, cube, color, position, scale);
	}
	function ground(
		parent: Object3D,
		color: string,
		x: number,
		z: number,
		sx: number,
		sz: number,
		y = 0.012
	) {
		const mesh = shape(parent, disc, color, [x, y, z], [sx, sz, 1], true);
		mesh.rotation.x = -Math.PI / 2;
		return mesh;
	}

	// Reusable primitive geometry is intentional: evaluate interaction before final assets.
	ground(scene, '#d7d8c8', 0, 0, 4.5, 3.8, -0.35);
	box(scene, '#ad805b', [0, -0.2, 0], [6.5, 0.32, 5.4]);
	box(scene, '#dfc49a', [0, -0.025, 0], [6.35, 0.06, 5.25]);
	for (let x = -2.9; x < 3; x += 0.55) box(scene, '#cfb186', [x, 0.009, 0], [0.015, 0.005, 5.15]);
	box(scene, '#e4ddc4', [0, 1.48, -2.7], [6.55, 3, 0.15]);
	box(scene, '#c5cdb2', [-3.25, 1.48, 0], [0.15, 3, 5.4]);
	box(scene, '#b4ae91', [0, 0.13, -2.6], [6.3, 0.22, 0.06]);
	box(scene, '#94a086', [-3.15, 0.13, 0], [0.06, 0.22, 5.15]);
	box(scene, '#a87753', [0, 3, -2.7], [6.65, 0.1, 0.21]);
	box(scene, '#a87753', [-3.25, 3, 0], [0.21, 0.1, 5.45]);

	// A small window and bed establish a bedroom, without building future interactions.
	box(scene, '#a17b58', [-1.8, 1.97, -2.57], [1.55, 1.45, 0.15]);
	box(scene, '#b9d4c3', [-1.8, 1.98, -2.47], [1.35, 1.25, 0.04]);
	box(scene, '#e9dbbb', [-1.8, 1.97, -2.4], [0.055, 1.3, 0.05]);
	box(scene, '#e9dbbb', [-1.8, 1.97, -2.4], [1.4, 0.055, 0.05]);
	box(scene, '#b48a61', [-1.8, 1.22, -2.38], [1.75, 0.09, 0.4]);
	box(scene, '#a9805c', [-2.3, 0.3, 0.45], [1.35, 0.45, 2.65]);
	box(scene, '#faf2da', [-2.3, 0.59, 0.45], [1.3, 0.24, 2.55]);
	box(scene, '#749287', [-2.3, 0.73, 0.75], [1.32, 0.12, 1.85]);
	box(scene, '#f0e3c7', [-2.3, 0.79, -0.39], [1, 0.2, 0.5]);
	box(scene, '#a7b6a1', [-2.3, 0.8, 1.18], [1.34, 0.035, 0.36]);

	// Warm woven rug; no expensive transparency or real-time shadows.
	box(scene, '#bb7156', [0.45, 0.026, 0.85], [3.1, 0.025, 2.35]);
	box(scene, '#d59870', [0.45, 0.042, 0.85], [2.85, 0.009, 2.1]);
	for (const z of [-0.04, 1.74]) box(scene, '#ebc498', [0.45, 0.05, z], [2.8, 0.005, 0.055]);

	const desk = new Group();
	scene.add(desk);
	ground(scene, '#b89f7c', 0.25, -1.65, 1.55, 0.65);
	box(desk, '#ad744c', [0.3, 1.02, -1.87], [2.65, 0.16, 1.12]);
	for (const x of [-0.82, 1.42])
		for (const z of [-2.28, -1.46]) box(desk, '#7c6148', [x, 0.5, z], [0.12, 1, 0.12]);
	box(desk, '#b89063', [1.02, 0.68, -1.96], [0.65, 0.57, 0.78]);
	box(desk, '#785a41', [1.02, 0.69, -1.55], [0.18, 0.04, 0.035]);
	box(desk, '#35483f', [0.05, 1.54, -2.13], [1.21, 0.75, 0.09]);
	const display = box(desk, '#acc4a2', [0.05, 1.55, -2.074], [1.08, 0.62, 0.025]);
	box(desk, '#dae1bd', [-0.22, 1.64, -2.054], [0.37, 0.19, 0.01]);
	box(desk, '#638d7c', [0.25, 1.64, -2.054], [0.37, 0.19, 0.01]);
	box(desk, '#e5e7d1', [0.02, 1.4, -2.053], [0.86, 0.1, 0.01]);
	box(desk, '#35483f', [0.05, 1.18, -2.13], [0.11, 0.3, 0.09]);
	box(desk, '#35483f', [0.05, 1.13, -2.04], [0.5, 0.03, 0.3]);
	box(desk, '#eee5cd', [0.05, 1.12, -1.58], [0.78, 0.055, 0.26]);
	box(desk, '#68816b', [0.9, 1.14, -1.7], [0.45, 0.07, 0.5]).rotation.y = -0.12;
	box(desk, '#eadcbd', [0.9, 1.145, -1.42], [0.38, 0.035, 0.014]);
	box(desk, '#443d36', [1.16, 1.17, -1.7], [0.023, 0.025, 0.38]).rotation.y = -0.18;
	shape(desk, cylinder, '#c27855', [-0.91, 1.25, -1.73], [0.105, 0.26, 0.105]);
	shape(desk, cylinder, '#674937', [-0.91, 1.385, -1.73], [0.077, 0.005, 0.077]);
	// Generous invisible raycast volume includes monitor, desktop, and legs.
	const hitbox = new Mesh(new BoxGeometry(2.95, 2, 1.3), new MeshBasicMaterial({ visible: false }));
	geometries.push(hitbox.geometry);
	materials.set('hitbox', hitbox.material);
	hitbox.position.set(0.3, 1, -1.85);
	scene.add(hitbox);

	const chair = new Group();
	chair.position.set(0.3, 0, -0.94);
	scene.add(chair);
	box(chair, '#5c7667', [0, 0.54, 0], [0.57, 0.12, 0.5]);
	box(chair, '#5c7667', [0, 0.87, 0.22], [0.57, 0.57, 0.1]);
	for (const x of [-0.22, 0.22])
		for (const z of [-0.17, 0.17]) box(chair, '#6c5743', [x, 0.25, z], [0.055, 0.5, 0.055]);

	// A book stack, a pot, and a bag are quiet non-navigation objects.
	box(scene, '#9c704c', [2.42, 0.48, -1.8], [0.8, 0.86, 0.83]);
	for (let i = 0; i < 3; i++)
		box(
			scene,
			['#5e807a', '#bd8c5e', '#ddd2b0'][i],
			[2.4, 0.98 + i * 0.095, -1.85],
			[0.58 - i * 0.06, 0.08, 0.48]
		);
	shape(scene, cylinder, '#b87554', [2.5, 0.35, 1.8], [0.3, 0.66, 0.3]);
	for (let i = 0; i < 5; i++) {
		const angle = (i * Math.PI * 2) / 5;
		const leaf = shape(
			scene,
			sphere,
			i % 2 ? '#658463' : '#7e965f',
			[2.5 + Math.cos(angle) * 0.2, 0.95 + i * 0.1, 1.8 + Math.sin(angle) * 0.2],
			[0.16, 0.43, 0.17]
		);
		leaf.rotation.z = Math.cos(angle) * 0.5;
	}
	box(scene, '#786a52', [-2.65, 0.28, 2.07], [0.62, 0.53, 0.35]);
	box(scene, '#433e32', [-2.65, 0.58, 2.07], [0.25, 0.07, 0.1]);

	const character = new Group();
	character.position.set(0.15, 0, 1.05);
	scene.add(character);
	const shadow = ground(scene, '#b68462', 0.15, 1.05, 0.28, 0.2, 0.064);
	const body = new Group();
	character.add(body);
	const legs = [
		box(body, '#394a45', [-0.115, 0.19, 0], [0.18, 0.37, 0.2]),
		box(body, '#394a45', [0.115, 0.19, 0], [0.18, 0.37, 0.2])
	];
	box(body, '#dfd1ab', [0, 0.54, 0], [0.48, 0.4, 0.27]);
	box(body, '#af7a58', [-0.29, 0.52, 0], [0.12, 0.35, 0.15]);
	box(body, '#af7a58', [0.29, 0.52, 0], [0.12, 0.35, 0.15]);
	box(body, '#b6815f', [0, 0.93, 0], [0.41, 0.4, 0.35]);
	box(body, '#393a31', [0, 1.15, -0.025], [0.46, 0.13, 0.4]);
	box(body, '#393a31', [0, 1.04, -0.18], [0.43, 0.21, 0.09]);
	box(body, '#594434', [0, 0.8, 0.14], [0.3, 0.1, 0.08]);
	for (const x of [-0.105, 0.105]) {
		box(body, '#303b32', [x, 0.97, 0.184], [0.17, 0.11, 0.025]);
		box(body, '#c4c7aa', [x, 0.977, 0.202], [0.11, 0.055, 0.012]);
	}
	box(body, '#303b32', [0, 0.98, 0.19], [0.06, 0.026, 0.02]);
	const targetMarker = ground(scene, '#f1d8a7', 0, 0, 0.12, 0.12, 0.063);
	targetMarker.visible = false;

	const raycaster = new Raycaster();
	const floorPlane = new Plane(new Vector3(0, 1, 0), 0);
	const keys = new Set<string>();
	const movementKeys = new Set([
		'w',
		'a',
		's',
		'd',
		'arrowup',
		'arrowleft',
		'arrowdown',
		'arrowright'
	]);
	let target: Point | null = null;
	let inspectOnArrival = false;
	let reducedMotion = options.reducedMotion;
	let paused = false;
	let disposed = false;
	let frame = 0;
	let lastTime = 0;
	let frames = 0;
	let lowQuality = options.lowQuality;
	let wasNear = false;
	let pointerStart: { x: number; y: number; id: number } | null = null;
	const position = (): Point => ({ x: character.position.x, z: character.position.z });
	const isNear = () =>
		Math.hypot(character.position.x - DESK_APPROACH.x, character.position.z - DESK_APPROACH.z) <=
		INTERACTION_RADIUS;

	function report() {
		options.onState({
			...position(),
			moving: Boolean(target || keys.size),
			nearDesk: isNear(),
			frames,
			calls: renderer.info.render.calls,
			triangles: renderer.info.render.triangles,
			dpr: renderer.getPixelRatio()
		});
	}
	function requestFrame() {
		if (disposed || paused || document.hidden || frame) return;
		frame = requestAnimationFrame(draw);
	}
	function stop() {
		keys.clear();
		target = null;
		inspectOnArrival = false;
		targetMarker.visible = false;
		body.position.y = 0;
		legs.forEach((leg) => (leg.rotation.x = 0));
		cancelAnimationFrame(frame);
		frame = 0;
		lastTime = 0;
	}
	function setPosition(point: Point) {
		const dx = point.x - character.position.x;
		const dz = point.z - character.position.z;
		if (Math.hypot(dx, dz) > 0.001) character.rotation.y = Math.atan2(dx, dz);
		character.position.set(point.x, 0, point.z);
		shadow.position.set(point.x, 0.064, point.z);
	}
	function inspect() {
		stop();
		requestFrame();
		options.onInspect();
	}
	function draw(time: number) {
		frame = 0;
		if (disposed || paused || document.hidden) return;
		const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60;
		lastTime = time;
		const direction = keyboardDirection(keys);
		const keyboardMoving = direction.x !== 0 || direction.z !== 0;
		if (keyboardMoving) {
			setPosition(
				clampPoint({
					x: character.position.x + direction.x * SPEED * delta,
					z: character.position.z + direction.z * SPEED * delta
				})
			);
		} else if (target) {
			setPosition(stepToward(position(), target, delta));
			if (Math.hypot(character.position.x - target.x, character.position.z - target.z) < 0.001) {
				target = null;
				targetMarker.visible = false;
				if (inspectOnArrival) {
					inspect();
					return;
				}
			}
		}
		const moving = keyboardMoving || Boolean(target);
		body.position.y = moving && !reducedMotion ? Math.abs(Math.sin(time * 0.014)) * 0.035 : 0;
		legs.forEach(
			(leg, i) =>
				(leg.rotation.x =
					moving && !reducedMotion ? Math.sin(time * 0.014 + i * Math.PI) * 0.24 : 0)
		);
		const near = isNear();
		if (near !== wasNear) {
			(display.material as MeshLambertMaterial).color = new Color(near ? '#cfdfa9' : '#acc4a2');
			wasNear = near;
		}
		try {
			renderer.render(scene, camera);
		} catch {
			stop();
			options.onError();
			return;
		}
		frames++;
		report();
		if (moving) requestFrame();
		else lastTime = 0;
	}
	function moveTo(point: Point, shouldInspect = false) {
		if (paused || disposed) return;
		keys.clear();
		target = clampPoint(point);
		inspectOnArrival = shouldInspect;
		targetMarker.position.set(target.x, 0.063, target.z);
		targetMarker.visible = !reducedMotion;
		if (reducedMotion) {
			setPosition(target);
			target = null;
			if (shouldInspect) {
				inspect();
				return;
			}
		}
		requestFrame();
	}
	function visitDesk() {
		if (paused || disposed) return;
		canvas.focus({ preventScroll: true });
		if (isNear()) inspect();
		else moveTo(DESK_APPROACH, true);
	}
	function pointerDown(event: PointerEvent) {
		if (!event.isPrimary || event.button !== 0) return;
		pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
	}
	function pointerUp(event: PointerEvent) {
		const start = pointerStart;
		pointerStart = null;
		if (
			!start ||
			start.id !== event.pointerId ||
			Math.hypot(start.x - event.clientX, start.y - event.clientY) > 12 ||
			paused
		)
			return;
		canvas.focus({ preventScroll: true });
		const rect = canvas.getBoundingClientRect();
		const pointer = new Vector2(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			(-(event.clientY - rect.top) / rect.height) * 2 + 1
		);
		raycaster.setFromCamera(pointer, camera);
		if (raycaster.intersectObject(hitbox).length) {
			visitDesk();
			return;
		}
		const point = raycaster.ray.intersectPlane(floorPlane, new Vector3());
		if (point && Math.abs(point.x) <= 3.25 && Math.abs(point.z) <= 2.7) moveTo(point);
	}
	function keyDown(event: KeyboardEvent) {
		if (event.altKey || event.ctrlKey || event.metaKey || paused) return;
		const key = event.key.toLowerCase();
		if (movementKeys.has(key)) {
			event.preventDefault();
			target = null;
			inspectOnArrival = false;
			targetMarker.visible = false;
			keys.add(key);
			requestFrame();
		} else if ((key === 'e' || key === 'enter') && isNear() && !event.repeat) {
			event.preventDefault();
			inspect();
		}
	}
	function keyUp(event: KeyboardEvent) {
		if (movementKeys.has(event.key.toLowerCase())) {
			event.preventDefault();
			keys.delete(event.key.toLowerCase());
			requestFrame();
		}
	}
	function blur() {
		stop();
		requestFrame();
	}
	function visibility() {
		stop();
		if (!document.hidden) requestFrame();
	}
	function contextLost(event: Event) {
		event.preventDefault();
		stop();
		options.onError();
	}
	function resize() {
		if (disposed) return;
		const { width, height } = canvas.getBoundingClientRect();
		if (!width || !height) return;
		const aspect = width / height;
		const viewHeight = Math.max(8.2, 9.7 / aspect);
		camera.left = (-viewHeight * aspect) / 2;
		camera.right = (viewHeight * aspect) / 2;
		camera.top = viewHeight / 2;
		camera.bottom = -viewHeight / 2;
		camera.updateProjectionMatrix();
		renderer.setPixelRatio(
			Math.min(window.devicePixelRatio || 1, lowQuality ? 1 : coarse ? 1.25 : 1.5)
		);
		renderer.setSize(width, height, false);
		requestFrame();
	}
	const observer = new ResizeObserver(resize);
	observer.observe(canvas);
	canvas.addEventListener('pointerdown', pointerDown);
	canvas.addEventListener('pointerup', pointerUp);
	canvas.addEventListener('keydown', keyDown);
	canvas.addEventListener('keyup', keyUp);
	canvas.addEventListener('blur', blur);
	canvas.addEventListener('webglcontextlost', contextLost);
	document.addEventListener('visibilitychange', visibility);
	window.addEventListener('blur', blur);
	resize();

	return {
		visitDesk,
		reset() {
			stop();
			setPosition({ x: 0.15, z: 1.05 });
			character.rotation.y = 0;
			requestFrame();
		},
		setPaused(value: boolean) {
			stop();
			paused = value;
			if (!paused) requestFrame();
		},
		setReducedMotion(value: boolean) {
			reducedMotion = value;
			stop();
			requestFrame();
		},
		setLowQuality(value: boolean) {
			lowQuality = value;
			resize();
		},
		destroy() {
			stop();
			disposed = true;
			observer.disconnect();
			canvas.removeEventListener('pointerdown', pointerDown);
			canvas.removeEventListener('pointerup', pointerUp);
			canvas.removeEventListener('keydown', keyDown);
			canvas.removeEventListener('keyup', keyUp);
			canvas.removeEventListener('blur', blur);
			canvas.removeEventListener('webglcontextlost', contextLost);
			document.removeEventListener('visibilitychange', visibility);
			window.removeEventListener('blur', blur);
			geometries.forEach((value) => value.dispose());
			materials.forEach((value) => value.dispose());
			renderer.dispose();
		}
	};
}

export type RoomController = ReturnType<typeof createRoom>;
