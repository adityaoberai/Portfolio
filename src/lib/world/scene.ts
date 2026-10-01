import {
	BoxGeometry,
	CircleGeometry,
	CustomBlending,
	DirectionalLight,
	Group,
	HemisphereLight,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	OneFactor,
	OneMinusSrcAlphaFactor,
	OrthographicCamera,
	Plane,
	PlaneGeometry,
	Raycaster,
	RingGeometry,
	Scene,
	ShaderMaterial,
	SRGBColorSpace,
	TextureLoader,
	Vector2,
	Vector3,
	WebGLRenderer,
	WebGLRenderTarget,
	type BufferGeometry,
	type Material,
	type Texture
} from 'three';
import { SHELF_ATLAS, shelfCards } from '../data/collection';
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
	DESK,
	DOOR_HINGE,
	DOOR_OPEN,
	FLAG,
	LAPTOP,
	MIRROR,
	ROOM,
	START,
	STATIONS,
	USE_RADIUS,
	type CuriosityId,
	type CuriosityLayout,
	type StationId,
	type StationLayout,
	type Vec3
} from './layout';
import {
	clampPoint,
	keyboardDirection,
	nearest,
	route,
	SPEED,
	stepToward,
	type Point
} from './movement';

export interface RoomState {
	x: number;
	z: number;
	moving: boolean;
	near: StationId | null;
	// A little thing to walk up to (the bed), when no station is near.
	nearCuriosity: CuriosityId | null;
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
	/** Stations switched on in world.ts; hidden ones stay as decor only. */
	stations: StationId[];
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
	const faces = new Batch();
	buildCollection(lit, faces, shelfCards.length);
	buildBedroom(lit);
	buildWindow(lit);
	buildLanyards(lit);
	buildMirror(lit);
	buildCorkboard(lit);
	buildDoorFrame(lit, unlit);
	const flag = new Batch();
	buildDecor(lit, unlit, flag);
	scene.add(new Mesh(keep(lit.build()), litMaterial));
	scene.add(new Mesh(keep(unlit.build()), unlitMaterial));

	const unit = keep(new BoxGeometry(1, 1, 1));
	const displayMaterial = own(new MeshLambertMaterial({ color: '#acc4a2', flatShading: true }));
	// The laptop's screen, in the same frames as build.ts: desk, laptop, then lid.
	const display = new Mesh(unit, displayMaterial);
	const desk = new Group();
	desk.position.set(DESK.x, 0, DESK.z);
	desk.rotation.y = DESK.angle;
	const lid = new Group();
	lid.position.set(LAPTOP.x, DESK.height + LAPTOP.base, LAPTOP.z - LAPTOP.depth / 2);
	lid.rotation.x = -LAPTOP.tilt;
	display.position.set(0, LAPTOP.lid / 2, 0.0025);
	display.scale.set(LAPTOP.width - 0.05, LAPTOP.lid - 0.06, 0.002);
	lid.add(display);
	desk.add(lid);
	scene.add(desk);

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

	// Pictures: a batch of textured planes with one small texture, loaded after the
	// room is up. Until it arrives, what sits behind shows instead: plain card faces
	// on the shelf, a plain red flag.
	const textures: Texture[] = [];
	function pictures(batch: Batch, url: string) {
		const material = own(new MeshLambertMaterial({ vertexColors: true }));
		const mesh = new Mesh(keep(batch.build()), material);
		mesh.visible = false;
		scene.add(mesh);
		new TextureLoader().load(url, (texture) => {
			if (disposed) return texture.dispose();
			texture.colorSpace = SRGBColorSpace;
			texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
			textures.push(texture);
			material.map = texture;
			material.needsUpdate = true;
			mesh.visible = true;
			requestFrame();
		});
	}
	pictures(faces, SHELF_ATLAS);
	pictures(flag, FLAG.texture);

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

	// The character's reflection in the mirror. The room camera never turns, so
	// neither does its view in the mirror: a second camera looks along the
	// reflected view direction and renders only the character (layer 1) into a
	// small texture, laid over the glass. The rest of the room isn't reflected.
	const REFLECTED = 1;
	for (const object of [hemisphere, sun, body, ...legs]) object.layers.enable(REFLECTED);
	const { glass } = MIRROR;
	const mirror = new Group();
	mirror.position.set(MIRROR.x, 0, MIRROR.z);
	mirror.rotation.set(0, MIRROR.angle, MIRROR.lean);
	// Sized to the glass below.
	const reflectionTarget = new WebGLRenderTarget(1, 1, { samples: 4 });
	// The texture is cleared to transparent, so its colours are premultiplied: blend
	// them as such. The reflection is a little cooler and lets some glass through.
	const reflectionMaterial = own(
		new ShaderMaterial({
			uniforms: { map: { value: reflectionTarget.texture } },
			vertexShader: /* glsl */ `
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}`,
			fragmentShader: /* glsl */ `
				uniform sampler2D map;
				varying vec2 vUv;
				void main() {
					vec4 colour = texture2D(map, vUv) * 0.82;
					gl_FragColor = vec4(colour.rgb * vec3(0.92, 1.0, 0.98), colour.a);
					#include <colorspace_fragment>
				}`,
			transparent: true,
			depthWrite: false,
			blending: CustomBlending,
			blendSrc: OneFactor,
			blendDst: OneMinusSrcAlphaFactor
		})
	);
	const pane = keep(new PlaneGeometry(glass.width, glass.height));
	const reflection = new Mesh(pane, reflectionMaterial);
	// Just in front of the glass and behind its glare streaks; the plane faces its
	// own +z, the mirror faces out along its +x.
	reflection.position.set(glass.front + 0.0005, glass.y, 0);
	reflection.rotation.y = Math.PI / 2;
	reflection.visible = false;
	mirror.add(reflection);
	scene.add(mirror);
	mirror.updateMatrixWorld(true);
	const normal = new Vector3(1, 0, 0).transformDirection(mirror.matrixWorld);
	const looking = new Vector3(...CAMERA_OFFSET).negate().normalize();
	looking.addScaledVector(normal, -2 * looking.dot(normal));
	const glassCentre = reflection.getWorldPosition(new Vector3());
	const mirrorCamera = new OrthographicCamera();
	mirrorCamera.layers.set(REFLECTED);
	mirrorCamera.up.set(0, 1, 0).transformDirection(mirror.matrixWorld);
	mirrorCamera.position.copy(glassCentre).addScaledVector(looking, -4);
	mirrorCamera.lookAt(glassCentre);
	mirrorCamera.updateMatrixWorld();
	// Frame the glass exactly: its corners as the mirror camera sees them give the
	// frustum, and where each corner falls in it is that corner's texture coordinate.
	const corners = pane.getAttribute('position');
	const seen = Array.from({ length: corners.count }, (_, i) =>
		new Vector3()
			.fromBufferAttribute(corners, i)
			.applyMatrix4(reflection.matrixWorld)
			.applyMatrix4(mirrorCamera.matrixWorldInverse)
	);
	mirrorCamera.left = Math.min(...seen.map((v) => v.x));
	mirrorCamera.right = Math.max(...seen.map((v) => v.x));
	mirrorCamera.bottom = Math.min(...seen.map((v) => v.y));
	mirrorCamera.top = Math.max(...seen.map((v) => v.y));
	mirrorCamera.near = 0.1;
	mirrorCamera.far = 10;
	mirrorCamera.updateProjectionMatrix();
	const across = mirrorCamera.right - mirrorCamera.left;
	const tall = mirrorCamera.top - mirrorCamera.bottom;
	const uv = pane.getAttribute('uv');
	seen.forEach((v, i) =>
		uv.setXY(i, (v.x - mirrorCamera.left) / across, (v.y - mirrorCamera.bottom) / tall)
	);
	uv.needsUpdate = true;
	const REFLECTION_HEIGHT = 512;
	reflectionTarget.setSize(Math.round((REFLECTION_HEIGHT * across) / tall), REFLECTION_HEIGHT);
	// Skip the extra pass unless some of the character could show in the glass.
	const probe = new Vector3();
	function inMirror() {
		probe.copy(character.position);
		probe.y += 0.6;
		probe.applyMatrix4(mirrorCamera.matrixWorldInverse);
		const reach = 0.75;
		return (
			probe.x > mirrorCamera.left - reach &&
			probe.x < mirrorCamera.right + reach &&
			probe.y > mirrorCamera.bottom - reach &&
			probe.y < mirrorCamera.top + reach
		);
	}

	// Hitboxes are never rendered; they only answer raycasts.
	const hitMaterial = own(new MeshBasicMaterial());
	const hitbox = (center: Vec3, size: Vec3) => {
		const mesh = new Mesh(unit, hitMaterial);
		mesh.position.set(...center);
		mesh.scale.set(...size);
		mesh.updateMatrixWorld();
		return mesh;
	};
	const active = STATIONS.filter((station) => options.stations.includes(station.id));
	const stationHits = [...active]
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
	// Click-to-walk waypoints around the furniture; the last one is the destination.
	let path: Point[] = [];
	// What happens at the end of the walk: open a station, or use a little thing.
	let onArrival: (() => void) | null = null;
	// The beat between looking at the bed and turning away from it.
	let turning = 0;
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
	let nearCuriosity: CuriosityLayout | undefined;
	const walkUps = CURIOSITIES.filter((item): item is CuriosityLayout & { approach: Point } =>
		Boolean(item.approach)
	);
	let focused: StationLayout | null = null;
	// The station whose seat the character is sitting in, if any.
	let seated: StationLayout | null = null;
	let pointerStart: { x: number; y: number; id: number } | null = null;

	// Camera framing tween: target point and zoom.
	const view = { target: new Vector3(...CAMERA_TARGET), zoom: 1, door: 0 };
	let tween: { from: typeof view; to: typeof view; start: number } | null = null;

	const position = (): Point => ({ x: character.position.x, z: character.position.z });

	function report() {
		options.onState({
			...position(),
			moving: Boolean(path.length || keys.size),
			near: near?.id ?? null,
			nearCuriosity: nearCuriosity?.id ?? null,
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
		window.clearTimeout(turning);
		keys.clear();
		path = [];
		onArrival = null;
		stalled = 0;
		targetMarker.visible = false;
		body.position.y = 0;
		pose();
	}
	// Sitting: legs straight out in front, like a minifigure. Standing: legs down.
	function pose() {
		legs.forEach((leg) => (leg.rotation.x = seated ? -Math.PI / 2 : 0));
	}
	function sit(station: StationLayout) {
		const seat = station.seat;
		if (!seat) return;
		seated = station;
		character.position.set(seat.x, seat.lift, seat.z);
		character.rotation.y = seat.facing;
		shadow.visible = false;
		pose();
	}
	// Back on the floor at the station's approach point, facing where it sat.
	function standUp() {
		if (!seated) return;
		const { approach } = seated;
		seated = null;
		character.position.set(approach.x, 0, approach.z);
		shadow.position.set(approach.x, 0.064, approach.z);
		shadow.visible = true;
		pose();
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
		standUp();
		if (station.seat) sit(station);
		else face(station.focus);
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
		} else if (path.length && !paused) {
			const next = path[0];
			const before = Math.hypot(character.position.x - next.x, character.position.z - next.z);
			setPosition(clampPoint(stepToward(position(), next, delta)));
			const after = Math.hypot(character.position.x - next.x, character.position.z - next.z);
			// If something still deflects the walk, give up gracefully instead of jittering.
			stalled = before - after < SPEED * delta * 0.25 ? stalled + 1 : 0;
			if (after < 0.001 && path.length > 1) {
				path.shift();
				stalled = 0;
			} else if (after < 0.001 || stalled > 8) {
				const arrive = onArrival;
				stopMovement();
				arrive?.();
			}
		}
		const moving = keyboardMoving || path.length > 0;
		body.position.y = moving && !reducedMotion ? Math.abs(Math.sin(time * 0.014)) * 0.035 : 0;
		if (seated) pose();
		else
			legs.forEach(
				(leg, i) =>
					(leg.rotation.x =
						moving && !reducedMotion ? Math.sin(time * 0.014 + i * Math.PI) * 0.4 : 0)
			);

		const nowNear = focused ?? nearest(position(), active);
		nearCuriosity = nowNear ? undefined : nearest(position(), walkUps, USE_RADIUS);
		const ringAt = (nowNear ?? nearCuriosity)?.approach;
		if (ringAt) nearRing.position.set(ringAt.x, 0.066, ringAt.z);
		if (nowNear !== near) {
			near = nowNear;
			// The monitor wakes when the character is at the desk.
			displayMaterial.color.set(
				near?.id === 'desk' || near?.id === 'notebook' ? '#d6e6ae' : '#acc4a2'
			);
		}
		nearRing.visible = Boolean(ringAt) && !focused;

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
			reflection.visible = inMirror();
			if (reflection.visible) {
				renderer.setRenderTarget(reflectionTarget);
				renderer.render(scene, mirrorCamera);
				renderer.setRenderTarget(null);
			}
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
	function moveTo(point: Point, arrive: (() => void) | null = null) {
		if (paused || disposed) return;
		standUp();
		window.clearTimeout(turning);
		keys.clear();
		const target = clampPoint(point);
		path = route(position(), target);
		onArrival = arrive;
		stalled = 0;
		targetMarker.position.set(target.x, 0.063, target.z);
		targetMarker.visible = !reducedMotion && !arrive;
		if (reducedMotion) {
			setPosition(target);
			path = [];
			if (arrive) return arrive();
		}
		requestFrame();
	}
	function visit(id: StationId) {
		const station = active.find((item) => item.id === id);
		if (!station || paused || disposed) return;
		const here = position();
		if (Math.hypot(here.x - station.approach.x, here.z - station.approach.z) < 0.35)
			inspect(station);
		else moveTo(station.approach, () => inspect(station));
	}
	// Walk up to a little thing (the bed): look at it, then turn as it says (away
	// from the bed) and show its note. Walking off before the turn cancels it.
	function use(item: CuriosityLayout) {
		stopMovement();
		standUp();
		face(item.hit.center);
		requestFrame();
		const turn = () => {
			if (item.facing !== undefined) character.rotation.y = item.facing;
			options.onCuriosity(item.id);
			requestFrame();
		};
		if (reducedMotion || item.facing === undefined) turn();
		else turning = window.setTimeout(turn, 450);
	}
	function walkUp(item: CuriosityLayout) {
		const at = item.approach;
		if (!at || paused || disposed) return;
		const here = position();
		if (Math.hypot(here.x - at.x, here.z - at.z) < 0.35) use(item);
		else moveTo(at, () => use(item));
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
		// The nearest little thing wins (the cowl stands behind the DeLorean).
		let curiosity: { id: CuriosityId; distance: number } | null = null;
		for (const { item, mesh } of curiosityHits) {
			const hit = raycaster.intersectObject(mesh)[0];
			if (hit && (!curiosity || hit.distance < curiosity.distance))
				curiosity = { id: item.id, distance: hit.distance };
		}
		if (curiosity) return { kind: 'curiosity', id: curiosity.id } as const;
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
		if (picked?.kind === 'curiosity') {
			const item = CURIOSITIES.find((entry) => entry.id === picked.id);
			return item?.approach ? walkUp(item) : options.onCuriosity(picked.id);
		}
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
			standUp();
			window.clearTimeout(turning);
			path = [];
			onArrival = null;
			targetMarker.visible = false;
			keys.add(key);
			requestFrame();
		} else if ((key === 'e' || key === 'enter') && (near || nearCuriosity) && !event.repeat) {
			event.preventDefault();
			if (near) inspect(near);
			else if (nearCuriosity) use(nearCuriosity);
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
			standUp();
			focused = null;
			frameTo(null);
			requestFrame();
		},
		reset() {
			stopMovement();
			standUp();
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
			textures.forEach((value) => value.dispose());
			reflectionTarget.dispose();
			renderer.dispose();
		}
	};
}

export type RoomController = ReturnType<typeof createRoom>;
