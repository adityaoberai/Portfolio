import {
	BoxGeometry,
	CircleGeometry,
	DirectionalLight,
	Group,
	HemisphereLight,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	OrthographicCamera,
	Plane,
	Raycaster,
	RingGeometry,
	Scene,
	Vector2,
	Vector3,
	WebGLRenderer,
	type BufferGeometry,
	type Material
} from 'three';
import {
	Batch,
	buildBedroom,
	buildCharacterBody,
	buildCityLights,
	buildCollection,
	buildCorkboard,
	buildDecor,
	buildDesk,
	buildDoorFrame,
	buildDoorSlab,
	buildLanyards,
	buildLeg,
	buildMirror,
	buildPhotography,
	buildShell,
	buildWindow,
	WINDOW
} from './build';
import { bengaluruHour, skyAt } from './time';
import {
	CAMERA_OFFSET,
	CAMERA_TARGET,
	CURIOSITIES,
	DOOR_HINGE,
	DOOR_OPEN,
	ROOM,
	START,
	STATIONS,
	type CuriosityId,
	type StationId,
	type StationLayout,
	type Vec3
} from './layout';
import { clampPoint, keyboardDirection, nearest, SPEED, stepToward, type Point } from './movement';

export interface RoomState {
	x: number;
	z: number;
	moving: boolean;
	near: StationId | null;
	focused: StationId | null;
	frames: number;
	calls: number;
	triangles: number;
	dpr: number;
}

export type HoverTarget =
	| { kind: 'station'; id: StationId }
	| { kind: 'curiosity'; id: CuriosityId };

interface Options {
	onInspect: (id: StationId) => void;
	onCuriosity: (id: CuriosityId) => void;
	onHover: (target: HoverTarget | null, clientX: number, clientY: number) => void;
	onState: (state: RoomState) => void;
	onError: () => void;
	reducedMotion: boolean;
	lowQuality: boolean;
}

const FOCUS_ZOOM = 1.55;
const TWEEN_MS = 480;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

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
	const camera = new OrthographicCamera(-6, 6, 5, -5, 0.1, 80);
	const hemisphere = new HemisphereLight('#fff5d8', '#8e9a7e', 2.5);
	scene.add(hemisphere);
	const sun = new DirectionalLight('#ffe7bd', 2.2);
	sun.position.set(2, 7, 5);
	scene.add(sun);

	const geometries: BufferGeometry[] = [];
	const materials: Material[] = [];
	const own = <T extends Material>(material: T) => (materials.push(material), material);
	const keep = <T extends BufferGeometry>(geometry: T) => (geometries.push(geometry), geometry);
	const litMaterial = own(new MeshLambertMaterial({ vertexColors: true, flatShading: true }));
	const unlitMaterial = own(new MeshBasicMaterial({ vertexColors: true }));

	// Static room: two merged meshes, whatever the furniture count.
	const lit = new Batch();
	const unlit = new Batch();
	buildShell(lit, unlit);
	buildDesk(lit, unlit);
	buildPhotography(lit);
	buildCollection(lit);
	buildBedroom(lit);
	buildWindow(lit);
	buildLanyards(lit);
	buildMirror(lit);
	buildCorkboard(lit);
	buildDoorFrame(lit, unlit);
	buildDecor(lit, unlit);
	scene.add(new Mesh(keep(lit.build()), litMaterial));
	scene.add(new Mesh(keep(unlit.build()), unlitMaterial));

	const unit = keep(new BoxGeometry(1, 1, 1));
	const displayMaterial = own(new MeshLambertMaterial({ color: '#acc4a2', flatShading: true }));
	const display = new Mesh(unit, displayMaterial);
	display.position.set(0.85, 1.62, -2.755);
	display.scale.set(1.07, 0.6, 0.02);
	scene.add(display);

	// Bengaluru through the window: sky colour and city lights follow local time there.
	const skyMaterial = own(new MeshBasicMaterial({ color: '#b9d4c3' }));
	const skyPane = new Mesh(unit, skyMaterial);
	skyPane.position.set(WINDOW.x, WINDOW.y, -2.945);
	skyPane.scale.set(WINDOW.width, WINDOW.height, 0.01);
	scene.add(skyPane);
	const lightsBatch = new Batch();
	buildCityLights(lightsBatch);
	const cityLightsMaterial = own(new MeshBasicMaterial({ vertexColors: true }));
	const cityLights = new Mesh(keep(lightsBatch.build()), cityLightsMaterial);
	scene.add(cityLights);
	function applySky() {
		const sky = skyAt(bengaluruHour());
		skyMaterial.color.set(sky.sky);
		cityLights.visible = Boolean(sky.lights);
		if (sky.lights) cityLightsMaterial.color.set(sky.lights);
		hemisphere.intensity = sky.hemisphere;
		sun.intensity = sky.sun;
	}
	applySky();

	// The door swings open while its station is focused.
	const door = new Group();
	door.position.set(...DOOR_HINGE);
	const doorBatch = new Batch();
	buildDoorSlab(doorBatch);
	door.add(new Mesh(keep(doorBatch.build()), litMaterial));
	scene.add(door);

	// Character: one merged body, two swinging legs.
	const character = new Group();
	scene.add(character);
	const bodyBatch = new Batch();
	buildCharacterBody(bodyBatch);
	const body = new Mesh(keep(bodyBatch.build()), litMaterial);
	character.add(body);
	const legGeometry = (() => {
		const legBatch = new Batch();
		buildLeg(legBatch);
		return keep(legBatch.build());
	})();
	const legs = [-0.115, 0.115].map((x) => {
		const leg = new Mesh(legGeometry, litMaterial);
		leg.position.set(x, 0.37, 0);
		body.add(leg);
		return leg;
	});
	const disc = keep(new CircleGeometry(1, 24));
	const shadow = new Mesh(disc, own(new MeshBasicMaterial({ color: '#b68462' })));
	shadow.rotation.x = -Math.PI / 2;
	shadow.scale.set(0.28, 0.2, 1);
	scene.add(shadow);
	const targetMarker = new Mesh(disc, own(new MeshBasicMaterial({ color: '#f1d8a7' })));
	targetMarker.rotation.x = -Math.PI / 2;
	targetMarker.scale.set(0.12, 0.12, 1);
	targetMarker.visible = false;
	scene.add(targetMarker);
	const nearRing = new Mesh(
		keep(new RingGeometry(0.34, 0.42, 32)),
		own(new MeshBasicMaterial({ color: '#f6e2b5' }))
	);
	nearRing.rotation.x = -Math.PI / 2;
	nearRing.visible = false;
	scene.add(nearRing);

	// Hitboxes are never rendered; they only answer raycasts.
	const hitMaterial = own(new MeshBasicMaterial());
	const hitbox = (center: Vec3, size: Vec3) => {
		const mesh = new Mesh(unit, hitMaterial);
		mesh.position.set(...center);
		mesh.scale.set(...size);
		mesh.updateMatrixWorld();
		return mesh;
	};
	const stationHits = [...STATIONS]
		.sort((a, b) => b.priority - a.priority)
		.map((station) => ({ station, mesh: hitbox(station.hit.center, station.hit.size) }));
	const curiosityHits = CURIOSITIES.map((item) => ({
		item,
		mesh: hitbox(item.hit.center, item.hit.size)
	}));

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
	let inspectOnArrival: StationLayout | null = null;
	let reducedMotion = options.reducedMotion;
	let lowQuality = options.lowQuality;
	// Screen space covered by overlaid UI (CSS px); the room is framed in what's left.
	let insets = { top: 0, bottom: 0, units: 9.4 };
	let paused = false;
	let disposed = false;
	let frame = 0;
	let lastTime = 0;
	let frames = 0;
	let stalled = 0;
	let near: StationLayout | undefined;
	let focused: StationLayout | null = null;
	let pointerStart: { x: number; y: number; id: number } | null = null;

	// Camera framing tween: target point and zoom.
	const view = { target: new Vector3(...CAMERA_TARGET), zoom: 1, door: 0 };
	let tween: { from: typeof view; to: typeof view; start: number } | null = null;

	const position = (): Point => ({ x: character.position.x, z: character.position.z });

	function report() {
		options.onState({
			...position(),
			moving: Boolean(target || keys.size),
			near: near?.id ?? null,
			focused: focused?.id ?? null,
			frames,
			calls: renderer.info.render.calls,
			triangles: renderer.info.render.triangles,
			dpr: renderer.getPixelRatio()
		});
	}
	function requestFrame() {
		if (disposed || document.hidden || frame) return;
		frame = requestAnimationFrame(draw);
	}
	function stopMovement() {
		keys.clear();
		target = null;
		inspectOnArrival = null;
		stalled = 0;
		targetMarker.visible = false;
		body.position.y = 0;
		legs.forEach((leg) => (leg.rotation.x = 0));
	}
	function setPosition(point: Point) {
		const dx = point.x - character.position.x;
		const dz = point.z - character.position.z;
		if (Math.hypot(dx, dz) > 0.001) character.rotation.y = Math.atan2(dx, dz);
		character.position.set(point.x, 0, point.z);
		shadow.position.set(point.x, 0.064, point.z);
	}
	function face(point: Vec3) {
		character.rotation.y = Math.atan2(
			point[0] - character.position.x,
			point[2] - character.position.z
		);
	}
	function applyView() {
		camera.position.set(
			view.target.x + CAMERA_OFFSET[0],
			view.target.y + CAMERA_OFFSET[1],
			view.target.z + CAMERA_OFFSET[2]
		);
		camera.lookAt(view.target);
		camera.zoom = view.zoom;
		camera.updateProjectionMatrix();
		door.rotation.y = view.door;
	}
	function framing(station: StationLayout | null) {
		if (!station) return { target: new Vector3(...CAMERA_TARGET), zoom: 1, door: 0 };
		const zoom = FOCUS_ZOOM;
		const width = (camera.right - camera.left) / zoom;
		const height = (camera.top - camera.bottom) / zoom;
		camera.updateMatrixWorld();
		const rightAxis = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
		const upAxis = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
		const focusPoint = new Vector3(...station.focus);
		// Leave room for the details sheet: right side on wide screens, bottom on narrow.
		if (canvas.clientWidth >= 820) focusPoint.addScaledVector(rightAxis, width * 0.2);
		else focusPoint.addScaledVector(upAxis, -height * 0.18);
		return { target: focusPoint, zoom, door: station.id === 'door' ? DOOR_OPEN : 0 };
	}
	function frameTo(station: StationLayout | null) {
		const to = framing(station);
		if (reducedMotion) {
			tween = null;
			view.target.copy(to.target);
			view.zoom = to.zoom;
			view.door = to.door;
			applyView();
		} else {
			tween = {
				from: { target: view.target.clone(), zoom: view.zoom, door: view.door },
				to,
				start: performance.now()
			};
		}
		requestFrame();
	}
	function inspect(station: StationLayout) {
		stopMovement();
		face(station.focus);
		focused = station;
		frameTo(station);
		options.onInspect(station.id);
	}
	function draw(time: number) {
		frame = 0;
		if (disposed || document.hidden) return;
		const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60;
		lastTime = time;
		const direction = keyboardDirection(keys);
		const keyboardMoving = !paused && (direction.x !== 0 || direction.z !== 0);
		if (keyboardMoving) {
			setPosition(
				clampPoint({
					x: character.position.x + direction.x * SPEED * delta,
					z: character.position.z + direction.z * SPEED * delta
				})
			);
		} else if (target && !paused) {
			const before = Math.hypot(character.position.x - target.x, character.position.z - target.z);
			setPosition(clampPoint(stepToward(position(), target, delta)));
			const after = Math.hypot(character.position.x - target.x, character.position.z - target.z);
			// Furniture can deflect a straight path; give up gracefully instead of jittering.
			stalled = before - after < SPEED * delta * 0.25 ? stalled + 1 : 0;
			if (after < 0.001 || stalled > 8) {
				const pending = inspectOnArrival;
				stopMovement();
				if (pending) {
					inspect(pending);
				}
			}
		}
		const moving = keyboardMoving || Boolean(target);
		body.position.y = moving && !reducedMotion ? Math.abs(Math.sin(time * 0.014)) * 0.035 : 0;
		legs.forEach(
			(leg, i) =>
				(leg.rotation.x = moving && !reducedMotion ? Math.sin(time * 0.014 + i * Math.PI) * 0.4 : 0)
		);

		const nowNear = focused ?? nearest(position(), STATIONS);
		if (nowNear !== near) {
			near = nowNear;
			nearRing.visible = Boolean(near) && !focused;
			if (near) nearRing.position.set(near.approach.x, 0.066, near.approach.z);
			// The monitor wakes when the character is at the desk.
			displayMaterial.color.set(
				near?.id === 'desk' || near?.id === 'notebook' ? '#d6e6ae' : '#acc4a2'
			);
		}
		nearRing.visible = Boolean(near) && !focused;

		let animating = false;
		if (tween) {
			const t = Math.min(1, (performance.now() - tween.start) / TWEEN_MS);
			const k = ease(t);
			view.target.lerpVectors(tween.from.target, tween.to.target, k);
			view.zoom = tween.from.zoom + (tween.to.zoom - tween.from.zoom) * k;
			view.door = tween.from.door + (tween.to.door - tween.from.door) * k;
			applyView();
			if (t >= 1) tween = null;
			else animating = true;
		}
		try {
			renderer.render(scene, camera);
		} catch {
			stopMovement();
			options.onError();
			return;
		}
		frames++;
		report();
		if (moving || animating) requestFrame();
		else lastTime = 0;
	}
	function moveTo(point: Point, station: StationLayout | null = null) {
		if (paused || disposed) return;
		keys.clear();
		target = clampPoint(point);
		inspectOnArrival = station;
		stalled = 0;
		targetMarker.position.set(target.x, 0.063, target.z);
		targetMarker.visible = !reducedMotion && !station;
		if (reducedMotion) {
			setPosition(target);
			target = null;
			if (station) {
				inspect(station);
				return;
			}
		}
		requestFrame();
	}
	function visit(id: StationId) {
		const station = STATIONS.find((item) => item.id === id);
		if (!station || paused || disposed) return;
		const here = position();
		if (Math.hypot(here.x - station.approach.x, here.z - station.approach.z) < 0.35)
			inspect(station);
		else moveTo(station.approach, station);
	}
	function pick(event: PointerEvent) {
		const rect = canvas.getBoundingClientRect();
		raycaster.setFromCamera(
			new Vector2(
				((event.clientX - rect.left) / rect.width) * 2 - 1,
				(-(event.clientY - rect.top) / rect.height) * 2 + 1
			),
			camera
		);
		const curiosity = curiosityHits.find(({ mesh }) => raycaster.intersectObject(mesh).length);
		if (curiosity) return { kind: 'curiosity', id: curiosity.item.id } as const;
		// Hits are ordered by priority, then by distance so the nearest object wins.
		let best: { id: StationId; priority: number; distance: number } | null = null;
		for (const { station, mesh } of stationHits) {
			const hit = raycaster.intersectObject(mesh)[0];
			if (!hit) continue;
			if (
				!best ||
				station.priority > best.priority ||
				(station.priority === best.priority && hit.distance < best.distance)
			)
				best = { id: station.id, priority: station.priority, distance: hit.distance };
		}
		if (best) return { kind: 'station', id: best.id } as const;
		return null;
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
		const picked = pick(event);
		if (picked?.kind === 'station') return visit(picked.id);
		if (picked?.kind === 'curiosity') return options.onCuriosity(picked.id);
		const point = raycaster.ray.intersectPlane(floorPlane, new Vector3());
		if (
			point &&
			point.x >= ROOM.minX &&
			point.x <= ROOM.maxX &&
			point.z >= ROOM.minZ &&
			point.z <= ROOM.maxZ
		)
			moveTo(point);
	}
	let hoverKey = '';
	function pointerMove(event: PointerEvent) {
		if (event.pointerType !== 'mouse' || paused) return;
		const picked = pick(event);
		const key = picked ? `${picked.kind}:${picked.id}` : '';
		canvas.style.cursor = picked ? 'pointer' : '';
		if (key !== hoverKey || picked) options.onHover(picked, event.clientX, event.clientY);
		hoverKey = key;
	}
	function pointerLeave() {
		hoverKey = '';
		canvas.style.cursor = '';
		options.onHover(null, 0, 0);
	}
	function keyDown(event: KeyboardEvent) {
		if (event.altKey || event.ctrlKey || event.metaKey || paused) return;
		const key = event.key.toLowerCase();
		if (movementKeys.has(key)) {
			event.preventDefault();
			target = null;
			inspectOnArrival = null;
			targetMarker.visible = false;
			keys.add(key);
			requestFrame();
		} else if ((key === 'e' || key === 'enter') && near && !event.repeat) {
			event.preventDefault();
			inspect(near);
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
		stopMovement();
		requestFrame();
	}
	function visibility() {
		cancelAnimationFrame(frame);
		frame = 0;
		lastTime = 0;
		stopMovement();
		if (tween) {
			view.target.copy(tween.to.target);
			view.zoom = tween.to.zoom;
			view.door = tween.to.door;
			tween = null;
			applyView();
		}
		if (!document.hidden) {
			applySky();
			requestFrame();
		}
	}
	function contextLost(event: Event) {
		event.preventDefault();
		stopMovement();
		options.onError();
	}
	function resize() {
		if (disposed) return;
		const { width, height } = canvas.getBoundingClientRect();
		if (!width || !height) return;
		const free = Math.max(height * 0.4, height - insets.top - insets.bottom);
		// The room is ~9.5 × 8 units on screen; `units` sets how snugly it fills the free height.
		const freeHeight = Math.max(insets.units, 11.4 / (width / free));
		const unitsPerPx = freeHeight / free;
		const viewHeight = unitsPerPx * height;
		const aspect = width / height;
		// Shift the frustum so the room centres in the free area, not the whole canvas.
		const shift = ((insets.top - insets.bottom) / 2) * unitsPerPx;
		camera.left = (-viewHeight * aspect) / 2;
		camera.right = (viewHeight * aspect) / 2;
		camera.top = viewHeight / 2 + shift;
		camera.bottom = -viewHeight / 2 + shift;
		if (focused && !tween) {
			const to = framing(focused);
			view.target.copy(to.target);
			view.zoom = to.zoom;
			view.door = to.door;
		}
		applyView();
		renderer.setPixelRatio(
			Math.min(window.devicePixelRatio || 1, lowQuality ? 1 : coarse ? 1.25 : 1.5)
		);
		renderer.setSize(width, height, false);
		requestFrame();
	}

	setPosition(START);
	character.rotation.y = 0;
	applyView();
	const observer = new ResizeObserver(resize);
	observer.observe(canvas);
	canvas.addEventListener('pointerdown', pointerDown);
	canvas.addEventListener('pointerup', pointerUp);
	canvas.addEventListener('pointermove', pointerMove);
	canvas.addEventListener('pointerleave', pointerLeave);
	canvas.addEventListener('keydown', keyDown);
	canvas.addEventListener('keyup', keyUp);
	canvas.addEventListener('blur', blur);
	canvas.addEventListener('webglcontextlost', contextLost);
	document.addEventListener('visibilitychange', visibility);
	window.addEventListener('blur', blur);
	resize();

	// Client coordinates of a world point; used by diagnostics and browser tests.
	function project(point: Vec3) {
		const v = new Vector3(...point).project(camera);
		const rect = canvas.getBoundingClientRect();
		return {
			x: rect.left + ((v.x + 1) / 2) * rect.width,
			y: rect.top + ((1 - v.y) / 2) * rect.height
		};
	}

	return {
		visit,
		project,
		anchor(id: StationId | CuriosityId) {
			const item = [...STATIONS, ...CURIOSITIES].find((entry) => entry.id === id);
			return item ? project(item.hit.center) : null;
		},
		// Return the camera to the overview after a station closes.
		release() {
			focused = null;
			frameTo(null);
		},
		reset() {
			stopMovement();
			focused = null;
			setPosition(START);
			character.rotation.y = 0;
			frameTo(null);
		},
		setPaused(value: boolean) {
			if (value) stopMovement();
			paused = value;
			requestFrame();
		},
		setReducedMotion(value: boolean) {
			reducedMotion = value;
			stopMovement();
			requestFrame();
		},
		setLowQuality(value: boolean) {
			lowQuality = value;
			resize();
		},
		setInsets(value: { top: number; bottom: number; units: number }) {
			if (
				value.top === insets.top &&
				value.bottom === insets.bottom &&
				value.units === insets.units
			)
				return;
			insets = value;
			resize();
		},
		destroy() {
			stopMovement();
			cancelAnimationFrame(frame);
			frame = 0;
			disposed = true;
			observer.disconnect();
			canvas.removeEventListener('pointerdown', pointerDown);
			canvas.removeEventListener('pointerup', pointerUp);
			canvas.removeEventListener('pointermove', pointerMove);
			canvas.removeEventListener('pointerleave', pointerLeave);
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
