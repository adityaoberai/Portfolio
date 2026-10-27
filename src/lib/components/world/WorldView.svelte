<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { beforeNavigate, pushState, replaceState } from '$app/navigation';
	import { page as route } from '$app/state';
	import { trackEvent } from '$lib/analytics';
	import V3Header from '$lib/components/V3Header.svelte';
	import ModeSwitch from '$lib/components/ModeSwitch.svelte';
	import BengaluruTime from '$lib/components/BengaluruTime.svelte';
	import RecordPlayer from './RecordPlayer.svelte';
	import StationPanel from './StationPanel.svelte';
	import RoomJoystick from './RoomJoystick.svelte';
	import { curiosities, page as copy, stationById, stations } from '$lib/data/room';
	import type { Curiosity } from '$lib/data/world';
	import type { CuriosityId, StationId } from '$lib/world/layout';
	import { readJourney, rememberJourney, stationId, type RoomJourney } from '$lib/world/journey';
	import type { HoverTarget, RoomController, RoomState } from '$lib/world/scene';

	let canvas: HTMLCanvasElement;
	let frameEl = $state<HTMLElement>(null!);
	let topEl: HTMLDivElement;
	let cornerEl: HTMLDivElement;
	let menuButton: HTMLButtonElement;
	let menu: HTMLDivElement;
	let dockEl = $state<HTMLElement>(null!);
	let musicButton = $state<HTMLButtonElement>(null!);
	let menuOpen = $state(false);
	let dialog: HTMLDialogElement;
	let poemDialog: HTMLDialogElement;
	let room: RoomController | undefined;
	let status = $state<'loading' | 'ready' | 'error'>('loading');
	let reducedMotion = $state(false);
	let lowQuality = $state(false);
	let roomState = $state<RoomState>();
	let diagnostics = $state(false);
	let coarse = $state(false);
	let narrow = $state(false);
	let open = $state<StationId | null>(null);
	let pending = $state<StationId | null>(null);
	let expanded = $state(false);
	let hover = $state<{ label: string; x: number; y: number } | null>(null);
	let note = $state<Curiosity | null>(null);
	let noteTimer = 0;
	let poemOf = $state<CuriosityId | null>(null);
	let poemExpanded = $state(false);
	let poemScroll = 0;
	const poem = $derived((poemOf && curiosities[poemOf].poem) || null);
	const poemReading = $derived(Boolean(poemOf && (!narrow || poemExpanded)));
	const music = Object.values(curiosities).find((item) => item.music)?.music;
	let musicOn = $state(false);
	let playerExpanded = $state(true);
	let recordPlaying = $state<boolean | null>(null);
	let musicNews = $state('');
	let firstPlayback = true;
	let returnFocus: HTMLElement | null = null;
	let lastStation: StationId | null = null;
	let saved: RoomJourney | null = null;
	let restoring = true;
	let disposed = false;
	const scrollPositions = new Map<StationId, number>();
	const near = $derived((roomState?.near && stationById[roomState.near]) || null);
	const nearThing = $derived(
		(!near && roomState?.nearCuriosity && curiosities[roomState.nearCuriosity]) || null
	);
	const nearHint = $derived(
		nearThing && (nearThing.music && musicOn ? nearThing.music.stop : nearThing.use)
	);
	const selected = $derived(pending ? stationById[pending] : null);
	const touchControls = $derived(narrow || coarse);
	const playerRowOpen = $derived(touchControls && musicOn && playerExpanded && !open && !poemOf);
	const objectRowOpen = $derived(
		narrow && Boolean((open && !expanded) || (poemOf && !poemExpanded))
	);
	const joystickAvailable = $derived(
		status === 'ready' && touchControls && !open && !poemOf && !playerRowOpen
	);
	const compactPlayer = $derived(joystickAvailable && musicOn && !playerExpanded);
	async function togglePlayer(value: boolean) {
		playerExpanded = value;
		if (!touchControls) return;
		room?.cancelVisit();
		await tick();
		if (value)
			dockEl?.querySelector<HTMLButtonElement>('[aria-label="Hide player"]')?.focus(quietFocus);
		else musicButton?.focus(quietFocus);
	}
	$effect(() => {
		if (status === 'ready' && touchControls && !open && !poemOf) room?.setPaused(playerRowOpen);
	});
	function moveWithJoystick(direction: { x: number; y: number }) {
		room?.setMovement(direction);
	}
	function enterNearby() {
		room?.interact();
	}

	function remember() {
		if (disposed) return;
		rememberJourney({
			position: room?.snapshot() ?? saved?.position,
			station: lastStation,
			panel: pending ?? open,
			expanded,
			scroll: open
				? !narrow || expanded
					? (dialog?.scrollTop ?? 0)
					: (scrollPositions.get(open) ?? 0)
				: 0
		});
	}
	beforeNavigate(() => remember());
	const quietFocus = { preventScroll: true, focusVisible: false };
	function focusRoom() {
		canvas.focus(quietFocus);
	}
	function backToRoom() {
		if (status === 'ready') focusRoom();
		else menuButton.focus({ preventScroll: true });
	}
	function baseUrl() {
		return `${route.url.pathname}${route.url.search}`;
	}
	function selectStation(id: StationId) {
		lastStation = id;
		pending = id;
		if (location.hash !== `#${id}`) {
			const state = { ...route.state, roomPanel: id, roomPanelEntry: true };
			if (route.state.roomPanelEntry) replaceState(`${baseUrl()}#${id}`, state);
			else pushState(`${baseUrl()}#${id}`, state);
		}
		remember();
	}
	async function showStation(id: StationId) {
		if (poemOf) {
			poemOf = null;
			poemDialog.close();
		}
		if (touchControls) playerExpanded = false;
		const focused = document.activeElement as HTMLElement | null;
		returnFocus ??= focused && focused !== document.body ? focused : null;
		selectStation(id);
		const restore = restoring && saved?.panel === id;
		expanded = restore ? saved!.expanded : false;
		open = id;
		pending = null;
		hover = null;
		await presentStation();
		if (open !== id) return;
		trackEvent('room_station_opened', { station: id });
		if (restore) scrollPositions.set(id, saved!.scroll);
		dialog.scrollTop = narrow && !expanded ? 0 : (scrollPositions.get(id) ?? 0);
		restoring = false;
		remember();
	}
	async function presentStation() {
		await tick();
		if (!dialog?.isConnected || !open) return;
		const reading = !narrow || expanded;
		if (dialog.open && dialog.matches(':modal') !== reading) dialog.close();
		if (!dialog.open) {
			if (reading) dialog.showModal();
			else dialog.show();
		}
		room?.setPreview(!reading);
		room?.setPaused(reading);
		dialog.focus(quietFocus);
		measureLayout();
	}
	async function readStation(value: boolean) {
		if (!open) return;
		if (expanded) scrollPositions.set(open, dialog.scrollTop);
		expanded = value;
		await presentStation();
		if (!open) return;
		dialog.scrollTop = value ? (scrollPositions.get(open) ?? 0) : 0;
		if (!value) dialog.querySelector<HTMLButtonElement>('.object-open')?.focus(quietFocus);
		remember();
	}
	function stationClosed() {
		// Changing a non-modal object card into a modal queues a close event.
		if (!dialog.open && open) closeStation();
	}
	function dismissStation() {
		if (route.state.roomPanelEntry) history.back();
		else replaceState(baseUrl(), { ...route.state, roomPanel: null, roomPanelEntry: false });
	}
	function closeStation() {
		if (disposed) return;
		if (open && (!narrow || expanded)) scrollPositions.set(open, dialog.scrollTop);
		open = null;
		pending = null;
		room?.setPanel(null);
		room?.cancelVisit();
		room?.release();
		room?.setPreview(false);
		room?.setPaused(false);
		if (returnFocus?.isConnected && !menu.contains(returnFocus))
			returnFocus.focus({ preventScroll: true });
		else backToRoom();
		returnFocus = null;
		remember();
		measureLayout();
	}
	function visit(id: StationId, event?: MouseEvent) {
		if (
			event &&
			(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
		)
			return;
		event?.preventDefault();
		if (menu.matches(':popover-open')) menu.hidePopover();
		returnFocus =
			event?.currentTarget instanceof HTMLElement && !menu.contains(event.currentTarget)
				? event.currentTarget
				: status === 'ready'
					? canvas
					: menuButton;
		if (room && status === 'ready') room.visit(id);
		else {
			selectStation(id);
			void showStation(id);
		}
	}
	// URL changes, Back/Forward, same-page anchors, and cold shared links use one path.
	$effect(() => {
		// SvelteKit's shallow history updates page.state, while page.url stays at the
		// last navigation URL. Keep an explicit panel value, including a closed null.
		const id =
			route.state.roomPanel === undefined
				? stationId(route.url.hash.slice(1))
				: route.state.roomPanel;
		if (status === 'loading') return;
		if (id) {
			if (id === open || id === pending) return;
			pending = id;
			lastStation = id;
			if (room && status === 'ready') room.reveal(id);
			else void showStation(id);
		} else {
			if (dialog?.open) dialog.close();
			if (pending) {
				pending = null;
				room?.cancelVisit();
			}
		}
	});
	let arrived = false;
	$effect(() => {
		if (status !== 'ready' || arrived) return;
		arrived = true;
		if (!stationId(route.url.hash.slice(1)) && document.activeElement === document.body)
			focusRoom();
	});
	function sheetKeys(event: KeyboardEvent) {
		if (
			(event.target as Element).closest('dialog') !== event.currentTarget ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey
		)
			return;
		const sheet = event.currentTarget as HTMLDialogElement;
		const key = event.key.toLowerCase();
		if (key === 'w' || key === 's') {
			event.preventDefault();
			sheet.scrollBy({
				top: key === 's' ? 120 : -120,
				behavior: reducedMotion ? 'instant' : 'smooth'
			});
		}
		if (key === 'e' && !event.repeat) {
			event.preventDefault();
			event.stopPropagation();
			if (sheet === dialog) dismissStation();
			else sheet.close();
		}
	}
	function sheetOpen() {
		return [...document.querySelectorAll<HTMLDialogElement>('dialog[open]')].at(-1);
	}
	function wheelToSheet(event: WheelEvent) {
		const sheet = sheetOpen();
		if (!sheet) return;
		const box = sheet.getBoundingClientRect();
		if (
			event.clientX >= box.left &&
			event.clientX <= box.right &&
			event.clientY >= box.top &&
			event.clientY <= box.bottom
		)
			return;
		sheet.scrollBy({ top: event.deltaMode === 1 ? event.deltaY * 40 : event.deltaY });
	}
	const roomKeys = new Set([
		'w',
		'a',
		's',
		'd',
		'e',
		'arrowup',
		'arrowleft',
		'arrowdown',
		'arrowright'
	]);
	function forwardRoomKeys(event: KeyboardEvent) {
		if (playerRowOpen && event.key === 'Escape' && !event.defaultPrevented) {
			event.preventDefault();
			void togglePlayer(false);
			return;
		}
		if (
			event.key === 'Escape' &&
			!event.defaultPrevented &&
			narrow &&
			objectRowOpen &&
			!menu.matches(':popover-open')
		) {
			event.preventDefault();
			if (poemOf) poemDialog.close();
			else dismissStation();
			return;
		}
		if (
			status !== 'ready' ||
			playerRowOpen ||
			document.activeElement !== document.body ||
			sheetOpen() ||
			menu.matches(':popover-open') ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey ||
			!roomKeys.has(event.key.toLowerCase())
		)
			return;
		event.preventDefault();
		focusRoom();
		canvas.dispatchEvent(
			new KeyboardEvent('keydown', { key: event.key, repeat: event.repeat, cancelable: true })
		);
	}
	function menuToggled(event: ToggleEvent) {
		menuOpen = event.newState === 'open';
		if (menuOpen) {
			if (pending) room?.setMovement({ x: 0, y: 0 });
			else room?.cancelVisit();
		}
		if (
			event.newState === 'closed' &&
			status === 'ready' &&
			!sheetOpen() &&
			(document.activeElement === document.body ||
				document.activeElement === menuButton ||
				menu.contains(document.activeElement))
		)
			focusRoom();
	}
	function showCuriosity(id: CuriosityId) {
		const item = curiosities[id];
		if (item.poem) return void showPoem(id);
		if (item.music) return setMusic(!musicOn);
		note = item;
		window.clearTimeout(noteTimer);
		noteTimer = window.setTimeout(() => (note = null), 5000);
	}
	async function showPoem(id: CuriosityId, reading = false) {
		if (open || pending) {
			dialog.close();
			closeStation();
			replaceState(baseUrl(), { ...route.state, roomPanel: null, roomPanelEntry: false });
		}
		if (touchControls) playerExpanded = false;
		window.clearTimeout(noteTimer);
		note = null;
		poemOf = id;
		poemExpanded = reading;
		poemScroll = 0;
		room?.look(id);
		hover = null;
		await presentPoem();
		poemDialog.scrollTop = 0;
	}
	async function presentPoem() {
		await tick();
		if (!poemDialog?.isConnected || !poemOf) return;
		const reading = !narrow || poemExpanded;
		if (poemDialog.open && poemDialog.matches(':modal') !== reading) poemDialog.close();
		if (!poemDialog.open) {
			if (reading) poemDialog.showModal();
			else poemDialog.show();
		}
		room?.setPreview(!reading);
		room?.setPaused(reading);
		poemDialog.focus(quietFocus);
		measureLayout();
	}
	async function expandPoem(value: boolean) {
		if (!poemOf) return;
		if (poemExpanded) poemScroll = poemDialog.scrollTop;
		poemExpanded = value;
		await presentPoem();
		if (!poemOf) return;
		poemDialog.scrollTop = value ? poemScroll : 0;
		if (!value) poemDialog.querySelector<HTMLButtonElement>('.object-open')?.focus(quietFocus);
	}
	function readPoem(id: CuriosityId) {
		if (menu.matches(':popover-open')) menu.hidePopover();
		void showPoem(id, true);
	}
	function poemClosed() {
		if (!poemDialog.open && poemOf) closePoem();
	}
	function closePoem() {
		poemOf = null;
		poemExpanded = false;
		room?.setPanel(null);
		room?.release();
		room?.setPreview(false);
		room?.setPaused(false);
		backToRoom();
		measureLayout();
	}
	function setMusic(value: boolean) {
		musicOn = value;
		firstPlayback = true;
		if (value) playerExpanded = true;
		musicNews = value
			? 'The record is on. Open the player for playback controls, or stop the record.'
			: 'The record is off.';
	}
	function musicPlayback(playing: boolean) {
		recordPlaying = playing;
		room?.setRecord(playing);
		if (playing && narrow && firstPlayback) {
			playerExpanded = false;
			firstPlayback = false;
		}
	}
	function stopMusic() {
		setMusic(false);
		backToRoom();
	}
	function musicFromMenu() {
		if (menu.matches(':popover-open')) menu.hidePopover();
		if (!musicOn && touchControls && pending) {
			pending = null;
			room?.cancelVisit();
			replaceState(baseUrl(), { ...route.state, roomPanel: null, roomPanelEntry: false });
		}
		setMusic(!musicOn);
		backToRoom();
	}
	function roomAfterPlayer(event: PointerEvent) {
		if (
			event.pointerType === 'mouse' &&
			status === 'ready' &&
			document.activeElement instanceof HTMLIFrameElement &&
			document.activeElement.closest('.dock')
		)
			focusRoom();
	}
	function onHover(target: HoverTarget | null, x: number, y: number) {
		if (!target) {
			hover = null;
			return;
		}
		hover = {
			label:
				target.kind === 'station'
					? `${stationById[target.id]?.area} · ${stationById[target.id]?.short}`
					: curiosities[target.id].label,
			x,
			y
		};
	}
	function measureLayout() {
		if (disposed || !room || !frameEl) return;
		const height = frameEl.clientHeight;
		const small = frameEl.clientWidth <= 820;
		const stacked = small && (height >= frameEl.clientWidth || Boolean(open) || Boolean(poemOf));
		const inspecting = Boolean(
			(open && (!small || expanded)) || (poemOf && (!small || poemExpanded))
		);
		const cornerTop = objectRowOpen ? height : cornerEl.getBoundingClientRect().top;
		const card =
			small && open && !expanded && dialog.open
				? dialog
				: small && poemOf && !poemExpanded && poemDialog.open
					? poemDialog
					: null;
		const cardTop = card?.getBoundingClientRect().top ?? height;
		const cornerInset = `${Math.max(0, height - cornerTop)}px`;
		frameEl.style.setProperty('--corner', cornerInset);
		dialog.style.setProperty('--corner', cornerInset);
		frameEl.style.setProperty('--menu-top', `${menuButton.getBoundingClientRect().bottom + 12}px`);
		const titleBottom = topEl.getBoundingClientRect().bottom;
		room.setInsets(
			stacked
				? {
						top: titleBottom + 8,
						bottom: inspecting ? 16 : Math.max(24, height - Math.min(cornerTop, cardTop) + 12),
						units: 9.4
					}
				: {
						top: inspecting ? 80 : titleBottom * 0.5,
						bottom: compactPlayer || playerRowOpen ? Math.max(24, height - cornerTop + 12) : 24,
						units: 8.6
					}
		);
		const sheet =
			dialog.open && inspecting ? dialog : poemDialog.open && inspecting ? poemDialog : null;
		const box = sheet?.getBoundingClientRect();
		room.setPanel(
			box ? { left: box.left, top: box.top, width: box.width, height: box.height } : null
		);
	}
	$effect(() => {
		if (status === 'ready') {
			void expanded;
			void open;
			void poemOf;
			void poemExpanded;
			void playerExpanded;
			void compactPlayer;
			void playerRowOpen;
			void objectRowOpen;
			void pending;
			void tick().then(measureLayout);
		}
	});
	onMount(() => {
		let cancelled = false;
		saved = readJourney();
		lastStation = saved?.station ?? null;
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
		const size = matchMedia('(max-width: 820px)');
		const pointer = matchMedia('(pointer: coarse)');
		reducedMotion = motion.matches;
		narrow = size.matches;
		coarse = pointer.matches;
		playerExpanded = !narrow;
		const updateMotion = () => {
			reducedMotion = motion.matches;
			room?.setReducedMotion(reducedMotion);
		};
		const updateSize = () => {
			const changed = narrow !== size.matches;
			narrow = size.matches;
			coarse = pointer.matches;
			if (changed && open) void presentStation();
			else if (changed && poemOf) void presentPoem();
			else measureLayout();
		};
		diagnostics = new URLSearchParams(location.search).has('diagnostics');
		motion.addEventListener('change', updateMotion);
		size.addEventListener('change', updateSize);
		pointer.addEventListener('change', updateSize);
		window.addEventListener('keydown', forwardRoomKeys);
		window.addEventListener('wheel', wheelToSheet, { passive: true });
		window.addEventListener('pagehide', remember);
		const observer = new ResizeObserver(measureLayout);
		[frameEl, topEl, cornerEl, menuButton, dialog, poemDialog].forEach((el) =>
			observer.observe(el)
		);
		const timeout = window.setTimeout(() => {
			if (status === 'loading') status = 'error';
		}, 15000);
		void import('$lib/world/scene')
			.then(({ createRoom }) => {
				if (cancelled) return;
				room = createRoom(canvas, {
					stations: stations.map((station) => station.id),
					reducedMotion,
					lowQuality,
					onSelect: selectStation,
					onInspect: (id) => void showStation(id),
					onCuriosity: showCuriosity,
					onHover,
					onState: (state) => {
						roomState = state;
						status = 'ready';
						window.clearTimeout(timeout);
					},
					onError: () => {
						status = 'error';
						room?.destroy();
						room = undefined;
						if (pending) void showStation(pending);
					}
				});
				if (saved?.position) room.restore(saved.position);
				measureLayout();
				room.setRecord(recordPlaying === true);
				if (diagnostics) Reflect.set(window, '__room', room);
			})
			.catch(() => {
				if (!cancelled) status = 'error';
			});
		return () => {
			// beforeNavigate saved the live dialog. At teardown its scroll layout is gone.
			disposed = true;
			cancelled = true;
			observer.disconnect();
			window.clearTimeout(timeout);
			window.clearTimeout(noteTimer);
			motion.removeEventListener('change', updateMotion);
			size.removeEventListener('change', updateSize);
			pointer.removeEventListener('change', updateSize);
			window.removeEventListener('keydown', forwardRoomKeys);
			window.removeEventListener('wheel', wheelToSheet);
			window.removeEventListener('pagehide', remember);
			room?.destroy();
		};
	});
</script>

{#snippet roomMenu()}
	<button
		class="menu-button"
		popovertarget="room-menu"
		aria-label="Room menu"
		bind:this={menuButton}
	>
		<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
			<path
				d="M3 5h14M3 10h14M3 15h14"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
			/>
		</svg>
		Menu
	</button>
{/snippet}

<section
	class="world"
	class:row-panel={playerRowOpen || objectRowOpen}
	class:inspecting={Boolean((open && (!narrow || expanded)) || poemReading)}
	aria-labelledby="world-title"
	bind:this={frameEl}
>
	<canvas
		bind:this={canvas}
		tabindex={status === 'ready' ? 0 : -1}
		onpointermove={roomAfterPlayer}
		aria-label="Aditya's room. Tap the floor to move around, or use WASD and the arrow keys. Tap an object or press E nearby to look closer. All objects are also in the menu."
		aria-describedby="room-instructions"
		class:loaded={status === 'ready'}
		data-x={roomState?.x.toFixed(3)}
		data-z={roomState?.z.toFixed(3)}
		data-frames={roomState?.frames}
		data-near={roomState?.near ?? ''}
	>
		Explore Aditya's room through the object menu, or see it on paper.
	</canvas>
	{#if status !== 'ready'}
		<div class="fallback" role="status">
			<img
				class="still"
				src="/room-still.jpg"
				alt=""
				width="1440"
				height="1000"
				fetchpriority="high"
			/>
			<div class="fallback-card">
				<h2>{status === 'loading' ? copy.loading.title : copy.failed.title}</h2>
				<p>{status === 'loading' ? copy.loading.text : copy.failed.text}</p>
				<div class="fallback-actions">
					<a href="/index">See it on paper →</a>{#if status === 'error'}<button
							onclick={() => location.reload()}>Try the room again</button
						>{/if}
				</div>
			</div>
		</div>
	{/if}
	<noscript
		><p class="no-script">
			The interactive room needs JavaScript. <a href="/index">See it on paper →</a>
		</p></noscript
	>
	<div class="top" bind:this={topEl}>
		<V3Header overlay menu={roomMenu} />
		<div class="welcome">
			<h1 id="world-title">{copy.title}</h1>
		</div>
		{#if diagnostics && roomState}<output class="diagnostics"
				>{roomState.calls} draws · {roomState.triangles} triangles · DPR {roomState.dpr} · {roomState.frames}
				rendered frames · {roomState.moving ? 'moving' : 'idle'}</output
			>{/if}
	</div>
	{#if hover}<span
			class="hover-label"
			style="left: {Math.min(hover.x, frameEl.clientWidth - 220)}px; top: {hover.y}px"
			aria-hidden="true">{hover.label}</span
		>{/if}
	{#if note}<p class="note">{note.line}</p>{/if}
	<div
		class="corner"
		class:compact-player={compactPlayer}
		class:object-row={objectRowOpen}
		bind:this={cornerEl}
	>
		{#if music}<section class="dock" aria-label="Gramophone" hidden={!musicOn} bind:this={dockEl}>
				<button
					class="music-button"
					bind:this={musicButton}
					hidden={!compactPlayer}
					disabled={menuOpen || Boolean(pending)}
					aria-label="Open player"
					aria-expanded="false"
					aria-controls="music-player"
					onclick={() => togglePlayer(true)}
				>
					<svg class="gramophone-icon" viewBox="0 0 64 56" aria-hidden="true">
						<path d="M14 48h5v4h-5zm28 0h5v4h-5z" fill="#5e3b27" />
						<rect x="12" y="36" width="38" height="14" rx="2" fill="#7a4e33" />
						<path d="M11 36h40v4H11z" fill="#a9805c" />
						<rect x="25" y="43" width="12" height="4" rx="1" fill="#c9a24a" />
						<path d="M50 42h4v5h3" fill="none" stroke="#a48342" stroke-width="2" />
						<ellipse cx="27" cy="35" rx="12" ry="4" fill="#263b33" />
						<ellipse cx="27" cy="35" rx="9" ry="2.5" fill="none" stroke="#647369" />
						<ellipse cx="27" cy="35" rx="4" ry="1.5" fill="#c23b3b" />
						<path d="M27 35v-3" stroke="#efe4c8" stroke-width="1.5" />
						<path
							d="M42 35V25q0-7-10-7"
							fill="none"
							stroke="#c9a24a"
							stroke-width="5"
							stroke-linecap="round"
						/>
						<path d="M34 15 16 5l-5 21 23-5z" fill="#d4ad55" stroke="#a48342" />
						<ellipse
							cx="13.5"
							cy="15.5"
							rx="6"
							ry="11"
							transform="rotate(13 13.5 15.5)"
							fill="#5a4220"
							stroke="#c9a24a"
							stroke-width="2"
						/>
						<path d="M43 32h-6l-3 4" fill="none" stroke="#d4ad55" stroke-width="2" />
					</svg>
					<span>Gramophone</span>
				</button>
				<div class="dock-top" hidden={compactPlayer}>
					<span class="disc" class:turning={recordPlaying && !reducedMotion} aria-hidden="true"
					></span>
					<span class="dock-label">Gramophone</span>
					<div class="dock-actions">
						<button
							aria-label={playerExpanded ? 'Hide player' : 'Open player'}
							title={playerExpanded ? 'Hide player' : 'Open player'}
							aria-expanded={playerExpanded}
							aria-controls="music-player"
							onclick={() => togglePlayer(!playerExpanded)}
						>
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path d={playerExpanded ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} />
							</svg>
						</button>
						<button aria-label="Stop" title="Stop music" onclick={stopMusic}>
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" stroke="none" />
							</svg>
						</button>
					</div>
				</div>
				<div id="music-player" hidden={!playerExpanded}>
					<RecordPlayer spotify={music.spotify} on={musicOn} onplayback={musicPlayback} />
				</div>
			</section>{/if}
		{#if status === 'ready'}<div class="movement" hidden={playerRowOpen}>
				<div
					class="room-hint"
					class:touch-hint={touchControls}
					class:idle={!selected && !near && !(nearThing && nearHint)}
					id="room-instructions"
					hidden={objectRowOpen ||
						((narrow || coarse) && musicOn && Boolean(nearThing?.music) && !selected)}
				>
					{#if selected}<p role="status">Heading to <strong>{selected.area}</strong>…</p>
					{:else if near && touchControls}<p>
							<strong>{near.area}</strong><span>Enter to explore</span>
						</p>
					{:else if near}<button onclick={() => visit(near.id)}
							>{near.area}<span>{coarse ? 'Tap to explore' : 'E to explore'}</span></button
						>
					{:else if nearThing && nearHint && touchControls}<p>
							<strong>{nearHint.title}</strong><span>Enter to explore</span>
						</p>
					{:else if nearThing && nearHint}<button
							onclick={() => showCuriosity(roomState!.nearCuriosity!)}
							>{nearHint.title}<span>{coarse ? nearHint.touch : `Press E ${nearHint.keys}`}</span
							></button
						>
					{:else}<p>
							{coarse || narrow
								? 'Take a wander. Drag the stick or tap the floor to move.'
								: 'Take a wander. WASD or arrows to move, E to look closer.'}
						</p>{/if}
				</div>
				{#if touchControls}<div class="touch-controls">
						{#if joystickAvailable}<RoomJoystick
								disabled={menuOpen || Boolean(pending)}
								onmove={moveWithJoystick}
							/>{/if}
						<div class="touch-actions" class:with-enter={joystickAvailable}>
							{#if joystickAvailable}<button
									class="enter-button"
									disabled={menuOpen || Boolean(pending) || (!near && !nearThing)}
									aria-label={near
										? `Explore ${near.area}`
										: nearThing
											? `Use ${nearThing.label}`
											: 'Enter (move near an object)'}
									onclick={enterNearby}>Enter</button
								>{/if}
						</div>
					</div>{/if}
			</div>{/if}
	</div>
	<div id="room-menu" class="menu" popover bind:this={menu} ontoggle={menuToggled}>
		<div class="menu-head">
			<h2>In the room</h2>
			<button popovertarget="room-menu" popovertargetaction="hide" aria-label="Close the menu"
				>×</button
			>
		</div>
		<div class="menu-surface"><ModeSwitch /></div>
		<nav aria-label="In the room">
			<ul class="guide">
				{#each stations as station (station.id)}<li class:is-near={roomState?.near === station.id}>
						<a
							href={station.href}
							onclick={(event) => visit(station.id, event)}
							aria-label={station.area}
							><span class="destination-label"
								>{station.area}{#if station.id === 'window'}<BengaluruTime />{/if}</span
							><span class="object">{station.short} <span aria-hidden="true">→</span></span></a
						>
					</li>{/each}
			</ul>
		</nav>
		<details class="little-things">
			<summary>Little things in the room</summary>
			<ul>
				{#each Object.entries(curiosities) as [id, item] (id)}<li>
						<strong>{item.label}</strong>
						<p>{item.line}</p>
						{#if item.poem}<button onclick={() => readPoem(id as CuriosityId)}
								>Read “{item.poem.title}”</button
							>{:else if item.music}<button onclick={musicFromMenu}
								>{musicOn ? 'Stop the record' : 'Put the record on'}</button
							>{:else}<button
								onclick={() => {
									menu.hidePopover();
									showCuriosity(id as CuriosityId);
								}}>Take a look</button
							>{/if}
					</li>{/each}
			</ul>
		</details>
		<details class="settings">
			<summary>Room settings</summary>
			<div>
				<button onclick={() => room?.reset()} disabled={status !== 'ready'}>Reset view</button
				><label
					><input
						type="checkbox"
						bind:checked={lowQuality}
						onchange={() => room?.setLowQuality(lowQuality)}
					/> Low power</label
				><label
					><input
						type="checkbox"
						bind:checked={reducedMotion}
						onchange={() => room?.setReducedMotion(reducedMotion)}
					/> Less motion</label
				>
			</div>
		</details>
	</div>
	<p class="sr-only" aria-live="polite">
		{near
			? `Near the ${near.short}. ${coarse ? 'Tap the object or use Menu to explore.' : 'Press E while the room is focused to explore.'}`
			: ''}{note ? ` ${note.line}` : ''}
	</p>
	<p class="sr-only" aria-live="polite">{musicNews}</p>
</section>

<dialog
	bind:this={dialog}
	class="sheet"
	class:expanded
	class:object-card={narrow && !expanded}
	onclose={stationClosed}
	oncancel={(event) => {
		event.preventDefault();
		dismissStation();
	}}
	onkeydown={sheetKeys}
	onanimationend={measureLayout}
	aria-labelledby="station-title"
	aria-modal={!narrow || expanded}
	tabindex="-1"
>
	{#if open && narrow && !expanded && (selected ?? stationById[open])}
		{@const station = selected ?? stationById[open]}
		<div class="object-head">
			<div class="object-title">
				<h2 id="station-title">{station?.area}</h2>
				{#if (pending ?? open) === 'window'}<BengaluruTime />{/if}
			</div>
			<button class="close" onclick={dismissStation} aria-label="Close and return to the room"
				>×</button
			>
		</div>
		<p class="object-summary">{station?.summary}</p>
		<button
			class="object-open"
			disabled={Boolean(pending)}
			aria-label={`Open ${station?.area}`}
			onclick={() => readStation(true)}
		>
			{pending ? 'Walking over…' : 'Open'}<span aria-hidden="true">↗</span>
		</button>
	{:else if open}<div class="sheet-top">
			<span class="sheet-context">{stationById[open]?.area ?? 'In the room'}</span>
			<div>
				{#if narrow}<button aria-expanded={expanded} onclick={() => readStation(false)}
						>See room<span aria-hidden="true">↙</span></button
					>{/if}<button
					class="close"
					onclick={dismissStation}
					aria-label="Close and return to the room">Close ×</button
				>
			</div>
		</div>
		<div class="sheet-content">
			<StationPanel id={open} />
			<button class="back-button" onclick={dismissStation}>← Back to the room</button>
		</div>{/if}
</dialog>
<dialog
	bind:this={poemDialog}
	class="sheet poem"
	class:expanded={poemExpanded}
	class:object-card={narrow && !poemExpanded}
	onclose={poemClosed}
	onkeydown={sheetKeys}
	onanimationend={measureLayout}
	aria-labelledby="poem-title"
	aria-modal={!narrow || poemExpanded}
	tabindex="-1"
>
	{#if poemOf && poem && narrow && !poemExpanded}
		<div class="object-head">
			<h2 id="poem-title">{curiosities[poemOf].label}</h2>
			<button
				class="close"
				onclick={() => poemDialog.close()}
				aria-label="Close and return to the room">×</button
			>
		</div>
		<p class="object-summary">{curiosities[poemOf].line}</p>
		<button class="object-open" onclick={() => expandPoem(true)}>
			Read poem<span aria-hidden="true">↗</span>
		</button>
	{:else if poemOf && poem}<div class="sheet-top">
			<span class="sheet-context">{poem.author}</span>
			<div>
				{#if narrow}<button aria-expanded={poemExpanded} onclick={() => expandPoem(false)}
						>See room<span aria-hidden="true">↙</span></button
					>{/if}
				<button
					class="close"
					onclick={() => poemDialog.close()}
					aria-label="Close and return to the room">Close ×</button
				>
			</div>
		</div>
		<div class="sheet-content">
			<h2 id="poem-title">{poem.title}</h2>
			<div class="verse">
				{#each poem.stanzas as stanza, s (s)}<p>
						{#each stanza as line, i (i)}{#if i}<br
								/>{/if}{#if poem.bold && line.startsWith(poem.bold)}<strong>{line}</strong
								>{:else}{line}{/if}{/each}
					</p>{/each}
			</div>
			<button class="back-button" onclick={() => poemDialog.close()}>← Back to the room</button>
		</div>{/if}
</dialog>

<style>
	.world {
		position: fixed;
		inset: 0;
		overflow: hidden;
		background: #e9ebdf;
		view-transition-name: room-scene;
	}
	canvas {
		position: absolute;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
		opacity: 0;
		touch-action: pinch-zoom;
	}
	canvas.loaded {
		opacity: 1;
	}
	canvas:focus-visible {
		outline: 3px solid var(--color-accent);
		outline-offset: -6px;
	}
	.top {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 2;
		pointer-events: none;
	}
	.top :global(a),
	.top :global(button) {
		pointer-events: auto;
	}
	.welcome {
		padding: 0 var(--gutter);
		max-width: 520px;
	}
	h1 {
		max-width: 30ch;
		font-size: clamp(1.25rem, 1.65vw, 1.5rem);
		line-height: 1.3;
		letter-spacing: -0.01em;
		font-weight: 400;
	}
	.inspecting .welcome {
		display: none;
	}
	.inspecting .top :global(.identity) {
		visibility: hidden;
	}
	.inspecting .corner,
	.inspecting .menu-button {
		visibility: hidden;
	}
	.row-panel .menu-button,
	.corner.object-row {
		visibility: hidden;
	}
	.movement[hidden],
	.dock-top[hidden],
	.music-button[hidden] {
		display: none;
	}
	.diagnostics {
		display: block;
		padding: 8px var(--gutter);
		font: 12px monospace;
	}
	.hover-label {
		position: absolute;
		z-index: 3;
		transform: translate(12px, -130%);
		padding: 8px 12px;
		max-width: 240px;
		background: var(--color-accent);
		color: #fffaf0;
		border-radius: 6px;
		font: 0.875rem/1.4 var(--font-ui);
		pointer-events: none;
	}
	.note {
		position: absolute;
		z-index: 3;
		right: var(--gutter);
		bottom: 104px;
		max-width: min(340px, calc(100% - 32px));
		padding: 14px 16px;
		background: var(--color-accent);
		color: #fffaf0;
		border-radius: 8px;
		font-size: 1.0625rem;
		line-height: 1.5;
	}
	.corner {
		position: absolute;
		z-index: 2;
		left: var(--gutter);
		bottom: max(24px, env(safe-area-inset-bottom));
		display: grid;
		gap: 10px;
		justify-items: start;
		max-width: min(420px, calc(100% - 32px));
		pointer-events: none;
	}
	.room-hint {
		background: #faf7edf2;
		border: 1px solid #c9c4b6;
		border-radius: 10px;
		font: 0.875rem/1.5 var(--font-ui);
		pointer-events: auto;
	}
	.movement {
		display: grid;
		gap: 8px;
		width: 100%;
	}
	.touch-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		width: 100%;
	}
	.touch-actions {
		width: 80px;
		min-height: 44px;
		margin-left: auto;
		pointer-events: none;
	}
	.touch-actions.with-enter {
		min-height: 108px;
		padding-bottom: 52px;
	}
	.enter-button,
	.music-button {
		display: grid;
		place-items: center;
		width: 80px;
		min-height: 56px;
		padding: 8px;
		border: 1px solid var(--color-accent);
		border-radius: 12px;
		font: 500 0.9375rem/1.4 var(--font-ui);
		background: var(--color-accent);
		color: var(--color-paper);
		pointer-events: auto;
		cursor: pointer;
	}
	.music-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		width: 100%;
		height: 100%;
		min-height: 108px;
		padding: 10px 4px;
		border-color: #c5b58d;
		background: #faf7ed;
		color: var(--color-accent);
		font-size: 0.8125rem;
	}
	.music-button:hover {
		background: #f0ebdc;
		border-color: #a48342;
	}
	.gramophone-icon {
		width: 64px;
		height: 56px;
		flex: none;
	}
	.enter-button:disabled,
	.music-button:disabled {
		background: #faf7edda;
		color: var(--color-secondary);
		border-color: var(--color-hairline-strong);
		opacity: 0.6;
		cursor: default;
	}
	.room-hint.touch-hint {
		background: transparent;
		border: 0;
		min-height: 42px;
	}
	.room-hint.touch-hint p {
		padding: 0;
	}
	.touch-hint strong {
		font-weight: 500;
		color: var(--color-ink);
	}
	.touch-hint p span {
		margin-left: 8px;
		color: var(--color-secondary);
	}
	.room-hint p {
		padding: 12px 16px;
	}
	.room-hint button {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px 16px;
		min-height: 48px;
		padding: 10px 16px;
		text-align: left;
		cursor: pointer;
	}
	.room-hint button span {
		color: var(--color-secondary);
	}
	.menu-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 8px 12px;
		border: 1px solid #b7bda5;
		border-radius: 8px;
		background: #faf7ed;
		color: var(--color-accent);
		font: 500 0.9375rem/1.4 var(--font-ui);
		cursor: pointer;
		white-space: nowrap;
	}
	.menu-button:hover {
		background: #eeeee2;
	}
	.menu {
		position: fixed;
		inset: var(--menu-top, 80px) var(--gutter) auto auto;
		width: min(380px, calc(100vw - 32px));
		max-height: calc(100dvh - var(--menu-top, 80px) - 16px);
		margin: 0;
		overflow-y: auto;
		padding: 8px 20px 16px;
		background: #faf7ed;
		color: var(--color-ink);
		border: 1px solid #c9c4b6;
		border-radius: 14px;
		box-shadow: 0 20px 60px #1f2a2433;
	}
	.menu::backdrop {
		background: transparent;
	}
	.menu-head {
		position: sticky;
		top: -8px;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #faf7ed;
		padding: 8px 0;
	}
	.menu-head h2 {
		font-size: 1.5rem;
		font-weight: 500;
	}
	.menu-head button {
		width: 44px;
		height: 44px;
		font-size: 1.5rem;
		cursor: pointer;
	}
	.guide {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.guide li {
		border-top: 1px solid var(--color-hairline);
	}
	.guide a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		min-height: 56px;
		padding: 8px 0;
		font-size: 1.25rem;
	}
	.guide a > span:first-child {
		min-width: 0;
	}
	.guide a:hover {
		color: var(--color-accent);
	}
	.guide .object {
		font: 0.875rem/1.4 var(--font-ui);
		color: var(--color-secondary);
	}
	.guide .is-near a {
		color: var(--color-accent);
	}
	details {
		border-top: 1px solid var(--color-hairline);
	}
	summary {
		display: flex;
		align-items: center;
		min-height: 48px;
		font: 0.9375rem/1.4 var(--font-ui);
		cursor: pointer;
	}
	summary::after {
		content: '+';
		margin-left: auto;
	}
	details[open] summary::after {
		content: '−';
	}
	.little-things ul {
		list-style: none;
		padding: 0 0 12px;
	}
	.little-things li {
		padding: 10px 0;
	}
	.little-things p {
		font-size: 1rem;
		line-height: 1.5;
		color: var(--color-secondary);
		margin-top: 4px;
	}
	.little-things button {
		min-height: 44px;
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
		cursor: pointer;
	}
	.settings div {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 20px;
		padding-bottom: 12px;
	}
	.settings button,
	.settings label {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		font: 0.875rem/1.4 var(--font-ui);
		cursor: pointer;
	}
	.settings button {
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.settings button:disabled {
		opacity: 0.5;
		cursor: default;
	}
	input {
		accent-color: #304e42;
		width: 18px;
		height: 18px;
	}
	.menu-surface {
		padding: 4px 0 8px;
		border-bottom: 1px solid var(--color-hairline);
	}
	.fallback {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		padding: 24px;
	}
	.still {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		opacity: 0.4;
		filter: saturate(0.6);
		pointer-events: none;
	}
	.fallback-card {
		position: relative;
		max-width: 380px;
		padding: 24px;
		text-align: center;
		background: #faf7ebed;
		border: 1px solid #d2cfbb;
		border-radius: 12px;
	}
	.fallback h2 {
		font-size: 1.625rem;
		line-height: 1.2;
	}
	.fallback p {
		margin-top: 12px;
		color: var(--color-secondary);
	}
	.fallback-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 8px 16px;
		margin-top: 20px;
	}
	.fallback a {
		padding: 12px 20px;
		background: var(--color-accent);
		color: #fffaf0;
		border-radius: 100px;
	}
	.fallback button {
		min-height: 44px;
		text-decoration: underline;
		cursor: pointer;
	}
	.no-script {
		position: absolute;
		z-index: 2;
		left: 0;
		right: 0;
		bottom: 96px;
		padding: 12px;
		background: #e9ebdf;
		text-align: center;
	}
	.sheet {
		position: fixed;
		z-index: 5;
		inset: 0 0 0 auto;
		margin: 0;
		width: min(520px, 44vw);
		height: 100dvh;
		max-height: 100dvh;
		max-width: none;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 0;
		background: #faf7ed;
		color: #283f33;
		border: 0;
		border-left: 1px solid #b7bda5;
		box-shadow: -18px 0 60px #25352926;
	}
	.sheet::backdrop {
		background: #263b3a30;
	}
	.sheet:focus {
		outline: none;
	}
	.object-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.object-head h2 {
		font: 500 1.25rem/1.25 var(--font-serif);
	}
	.object-title,
	.destination-label {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 4px 12px;
	}
	.object-head button {
		flex: none;
		width: 44px;
		height: 44px;
		font: 1.5rem/1 var(--font-ui);
		color: var(--color-accent);
		cursor: pointer;
	}
	.object-summary {
		margin: 4px 0 12px;
		font: 1rem/1.5 var(--font-serif);
		color: var(--color-secondary);
	}
	.object-open {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		width: 100%;
		min-height: 44px;
		padding: 10px 14px;
		border-radius: 7px;
		background: var(--color-accent);
		color: var(--color-paper);
		font: 500 0.9375rem/1.4 var(--font-ui);
		cursor: pointer;
	}
	.object-open:disabled {
		opacity: 0.65;
		cursor: wait;
	}
	.sheet-top {
		position: sticky;
		top: 0;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 72px;
		padding: 12px 24px;
		background: #faf7ed;
		border-bottom: 1px solid var(--color-hairline);
		font: 0.875rem/1.4 var(--font-ui);
	}
	.sheet-top > div {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.sheet-context {
		color: var(--color-secondary);
	}
	.sheet-top button {
		min-height: 44px;
		padding: 8px;
		color: var(--color-accent);
		cursor: pointer;
	}
	.sheet-content {
		container-type: inline-size;
		padding: 28px clamp(24px, 3vw, 40px) max(32px, env(safe-area-inset-bottom));
	}
	.back-button {
		display: inline-flex;
		align-items: center;
		margin-top: 28px;
		min-height: 44px;
		padding: 10px 16px;
		background: var(--color-accent);
		color: #fffaf0;
		border-radius: 8px;
		font: 0.9375rem/1.4 var(--font-ui);
		cursor: pointer;
	}
	.poem .sheet-content h2 {
		font: 500 var(--type-panel) / 1.15 var(--font-serif);
		letter-spacing: -0.015em;
	}
	.verse {
		margin-top: 24px;
		font-size: 1.125rem;
		line-height: 1.65;
	}
	.verse p + p {
		margin-top: 20px;
	}
	.dock {
		width: 400px;
		max-width: 100%;
		padding: 6px 10px;
		background: #faf7ed;
		border: 1px solid #c9c4b6;
		border-radius: 10px;
		pointer-events: auto;
	}
	.dock[hidden] {
		display: none;
	}
	.dock-top {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 4px 8px;
		font: 0.8125rem/1.5 var(--font-ui);
	}
	.dock-label {
		flex: 1;
	}
	.dock-actions {
		display: flex;
		gap: 4px;
		margin-left: auto;
	}
	.dock-top button {
		display: inline-grid;
		place-items: center;
		min-width: 44px;
		min-height: 44px;
		padding: 0;
		border-radius: 6px;
		color: var(--color-accent);
		cursor: pointer;
	}
	.dock-top button:hover {
		background: #eeece1;
	}
	.dock-top svg {
		width: 20px;
		height: 20px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.75;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	#music-player {
		padding-bottom: 4px;
	}
	#music-player[hidden] {
		display: none;
	}
	.disc {
		flex: none;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: radial-gradient(circle, #f8f5ed 0 2px, #c23b3b 2px 5px, #263b33 5px);
	}
	@media (prefers-reduced-motion: no-preference) {
		.sheet[open] {
			animation: reveal 220ms ease-out;
		}
		@keyframes reveal {
			from {
				opacity: 0;
				transform: translateX(20px);
			}
		}
		.disc.turning {
			animation: turn 1.8s linear infinite;
		}
		@keyframes turn {
			to {
				transform: rotate(360deg);
			}
		}
	}
	@media (min-width: 821px) {
		.top :global(.identity) {
			font-size: 1.875rem;
		}
		.top :global(.v3-header .bar) {
			padding-block: 12px 4px;
		}
	}
	@media (max-width: 820px), (pointer: coarse) {
		.welcome {
			display: none;
		}
		.corner {
			left: 16px;
			right: 16px;
			bottom: max(20px, env(safe-area-inset-bottom));
			max-width: none;
			justify-items: stretch;
		}
		.dock {
			width: 100%;
		}
		.compact-player {
			grid-template-columns: 96px minmax(0, 1fr) 80px;
			gap: 8px 10px;
			align-items: center;
		}
		.compact-player .movement,
		.compact-player .touch-controls {
			display: contents;
		}
		.compact-player .room-hint {
			grid-column: 1 / -1;
			grid-row: 1;
		}
		.compact-player :global(.joystick) {
			grid-column: 1;
			grid-row: 2;
		}
		.compact-player .touch-actions {
			grid-column: 3;
			grid-row: 2;
		}
		.compact-player .dock {
			display: grid;
			grid-column: 2;
			grid-row: 2;
			justify-self: center;
			align-self: stretch;
			max-width: 136px;
			min-width: 0;
			padding: 0;
			border: 0;
			background: transparent;
		}
		.room-hint {
			background: #faf7edeb;
		}
		.room-hint p {
			padding: 8px 12px;
		}
		.room-hint.idle {
			background: transparent;
			border: 0;
			color: var(--color-secondary);
		}
		.room-hint.idle p {
			padding: 0;
		}
		.note {
			left: 16px;
			right: 16px;
			bottom: calc(var(--corner, 160px) + 12px);
			max-width: none;
		}
		.menu {
			inset: 0 0 0 auto;
			width: min(380px, calc(100vw - 24px));
			height: 100dvh;
			max-height: 100dvh;
			padding: 0 20px max(20px, env(safe-area-inset-bottom));
			border: 0;
			border-left: 1px solid var(--color-hairline-strong);
			border-radius: 0;
			box-shadow: -16px 0 48px #25352926;
			overscroll-behavior: contain;
		}
		.menu-head {
			top: 0;
			padding: max(12px, env(safe-area-inset-top)) 0 8px;
		}
		.menu-button {
			position: fixed;
			right: 16px;
			bottom: max(20px, env(safe-area-inset-bottom));
			width: 80px;
			justify-content: center;
		}
	}
	@media (max-height: 500px) and (min-aspect-ratio: 3/2) {
		.room-hint.touch-hint {
			position: fixed;
			top: 72px;
			left: 16px;
			max-width: calc(20vw - 32px);
		}
	}
	@media (max-width: 820px) {
		.sheet {
			inset: auto 0 0;
			width: 100%;
			height: 75dvh;
			max-height: 75dvh;
			border-left: 0;
			border-top: 1px solid #b7bda5;
			border-radius: 18px 18px 0 0;
			box-shadow: 0 -16px 48px #25352926;
		}
		.sheet.expanded {
			height: 75dvh;
			max-height: 75dvh;
		}
		.sheet.object-card {
			inset: auto 16px max(20px, env(safe-area-inset-bottom));
			width: calc(100% - 32px);
			max-width: none;
			height: auto;
			max-height: min(320px, 45dvh);
			padding: 8px 16px 16px;
			border: 1px solid var(--color-hairline-strong);
			border-radius: 14px;
			box-shadow: 0 12px 40px #25352926;
		}
		.sheet-top {
			min-height: 64px;
			padding: 8px 16px;
		}
		.sheet-content {
			container-type: inline-size;
			padding: 24px 20px max(28px, calc(env(safe-area-inset-bottom) + 16px));
		}
		@media (prefers-reduced-motion: no-preference) {
			@keyframes reveal {
				from {
					opacity: 0;
					transform: translateY(20px);
				}
			}
		}
	}
</style>
