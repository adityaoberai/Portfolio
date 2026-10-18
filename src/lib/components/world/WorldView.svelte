<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { beforeNavigate, pushState, replaceState } from '$app/navigation';
	import { page as route } from '$app/state';
	import V3Header from '$lib/components/V3Header.svelte';
	import RecordPlayer from './RecordPlayer.svelte';
	import StationPanel from './StationPanel.svelte';
	import { curiosities, page as copy, stationById, stations } from '$lib/data/room';
	import { site } from '$lib/data/site';
	import type { Curiosity } from '$lib/data/world';
	import type { CuriosityId, StationId } from '$lib/world/layout';
	import { readJourney, rememberJourney, stationId, type RoomJourney } from '$lib/world/journey';
	import type { HoverTarget, RoomController, RoomState } from '$lib/world/scene';

	let canvas: HTMLCanvasElement;
	let frameEl = $state<HTMLElement>(null!);
	let topEl: HTMLDivElement;
	let cornerEl: HTMLDivElement;
	let toolsEl: HTMLDivElement;
	let menuButton: HTMLButtonElement;
	let menu: HTMLDivElement;
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
	const poem = $derived((poemOf && curiosities[poemOf].poem) || null);
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

	function remember() {
		if (disposed) return;
		rememberJourney({
			position: room?.snapshot() ?? saved?.position,
			station: lastStation,
			panel: open ?? pending,
			expanded,
			scroll: open ? (dialog?.scrollTop ?? 0) : 0
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
		const focused = document.activeElement as HTMLElement | null;
		returnFocus ??= focused && focused !== document.body ? focused : null;
		selectStation(id);
		const restore = restoring && saved?.panel === id;
		expanded = restore ? saved!.expanded : false;
		open = id;
		pending = null;
		room?.setPaused(true);
		hover = null;
		await tick();
		if (!dialog?.isConnected || open !== id) return;
		if (!dialog.open) dialog.showModal();
		dialog.scrollTop = restore ? saved!.scroll : (scrollPositions.get(id) ?? 0);
		dialog.focus(quietFocus);
		restoring = false;
		measureLayout();
		remember();
	}
	function dismissStation() {
		if (route.state.roomPanelEntry) history.back();
		else replaceState(baseUrl(), { ...route.state, roomPanel: null, roomPanelEntry: false });
	}
	function closeStation() {
		if (disposed) return;
		if (open) scrollPositions.set(open, dialog.scrollTop);
		open = null;
		pending = null;
		room?.setPanel(null);
		room?.release();
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
		if (
			status !== 'ready' ||
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
	async function showPoem(id: CuriosityId) {
		window.clearTimeout(noteTimer);
		note = null;
		poemOf = id;
		room?.setPaused(true);
		room?.look(id);
		hover = null;
		await tick();
		if (!poemDialog?.isConnected || poemOf !== id) return;
		if (!poemDialog.open) poemDialog.showModal();
		poemDialog.focus(quietFocus);
		measureLayout();
	}
	function readPoem(id: CuriosityId) {
		if (menu.matches(':popover-open')) menu.hidePopover();
		void showPoem(id);
	}
	function closePoem() {
		poemOf = null;
		room?.setPanel(null);
		room?.release();
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
		const inspecting = Boolean(open || poemOf);
		const cornerTop = cornerEl.getBoundingClientRect().top;
		frameEl.style.setProperty('--corner', `${Math.max(0, height - cornerTop)}px`);
		const lowest = Math.min(toolsEl.getBoundingClientRect().top, cornerTop);
		const titleBottom = topEl.getBoundingClientRect().bottom;
		room.setInsets(
			small
				? {
						top: titleBottom + 8,
						bottom: inspecting ? 16 : Math.max(24, height - lowest + 12),
						units: 9.4
					}
				: { top: inspecting ? 80 : titleBottom * 0.5, bottom: 24, units: 8.6 }
		);
		const sheet = dialog.open ? dialog : poemDialog.open ? poemDialog : null;
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
			void playerExpanded;
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
			narrow = size.matches;
			coarse = pointer.matches;
			measureLayout();
		};
		diagnostics = new URLSearchParams(location.search).has('diagnostics');
		motion.addEventListener('change', updateMotion);
		size.addEventListener('change', updateSize);
		pointer.addEventListener('change', updateSize);
		window.addEventListener('keydown', forwardRoomKeys);
		window.addEventListener('wheel', wheelToSheet, { passive: true });
		window.addEventListener('pagehide', remember);
		const observer = new ResizeObserver(measureLayout);
		[frameEl, topEl, cornerEl, toolsEl, dialog, poemDialog].forEach((el) => observer.observe(el));
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

<section
	class="world"
	class:inspecting={Boolean(open || poemOf)}
	aria-labelledby="world-title"
	bind:this={frameEl}
>
	<canvas
		bind:this={canvas}
		tabindex={status === 'ready' ? 0 : -1}
		onpointermove={roomAfterPlayer}
		aria-label="Aditya's room. Tap a destination to explore, or tap the floor to walk. With a keyboard, use WASD or arrows to walk and E to inspect. All objects are also in the menu."
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
		<V3Header overlay />
		<div class="welcome">
			<h1 id="world-title">{copy.title}</h1>
			<p>{site.role}. Writer, photographer, and community builder.</p>
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
	<div class="corner" bind:this={cornerEl}>
		{#if music}<section class="dock" aria-label="Gramophone" hidden={!musicOn}>
				<div class="dock-top">
					<span class="disc" class:turning={recordPlaying && !reducedMotion} aria-hidden="true"
					></span><span
						>{recordPlaying === null
							? 'Putting the record on…'
							: recordPlaying
								? 'On the gramophone'
								: 'Gramophone · paused'}</span
					><button
						aria-expanded={playerExpanded}
						aria-controls="music-player"
						onclick={() => (playerExpanded = !playerExpanded)}
						>{playerExpanded ? 'Hide player' : 'Open player'}</button
					><button onclick={stopMusic}>Stop<span aria-hidden="true"> ×</span></button>
				</div>
				<div id="music-player" hidden={!playerExpanded}>
					<RecordPlayer spotify={music.spotify} on={musicOn} onplayback={musicPlayback} />
				</div>
			</section>{/if}
		{#if status === 'ready'}<div class="room-hint" id="room-instructions">
				{#if selected}<p role="status">Heading to <strong>{selected.area}</strong>…</p>
				{:else if near}<button onclick={() => visit(near.id)}
						>{near.area}<span>{coarse ? 'Tap to explore' : 'E to explore'}</span></button
					>
				{:else if nearThing && nearHint}<button
						onclick={() => showCuriosity(roomState!.nearCuriosity!)}
						>{nearHint.title}<span>{coarse ? nearHint.touch : `Press E ${nearHint.keys}`}</span
						></button
					>
				{:else}<p>
						{coarse || narrow
							? 'Choose a destination below, or tap the floor to wander.'
							: 'WASD or arrows to wander. E to look closer.'}
					</p>{/if}
			</div>{/if}
	</div>
	<div class="room-tools" bind:this={toolsEl}>
		<nav class="destinations" aria-label="Explore the room">
			{#each stations as station (station.id)}<button
					class:selected={pending === station.id || open === station.id}
					onclick={(event) => visit(station.id, event)}>{station.area}</button
				>{/each}
		</nav>
		<button class="menu-button" popovertarget="room-menu" bind:this={menuButton}
			><span aria-hidden="true">☷</span> In the room</button
		>
	</div>
	<div id="room-menu" class="menu" popover bind:this={menu} ontoggle={menuToggled}>
		<div class="menu-head">
			<h2>In the room</h2>
			<button popovertarget="room-menu" popovertargetaction="hide" aria-label="Close the menu"
				>×</button
			>
		</div>
		<nav aria-label="In the room">
			<ul class="guide">
				{#each stations as station (station.id)}<li class:is-near={roomState?.near === station.id}>
						<a
							href={station.href}
							onclick={(event) => visit(station.id, event)}
							aria-label={station.area}
							><span>{station.area}</span><span class="object"
								>{station.short} <span aria-hidden="true">→</span></span
							></a
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
		<p class="menu-foot"><a href="/index">See it on paper →</a></p>
	</div>
	<p class="sr-only" aria-live="polite">
		{near
			? `Near the ${near.short}. ${coarse ? 'Use the explore button or the object menu.' : 'Press E while the room is focused to explore.'}`
			: ''}{note ? ` ${note.line}` : ''}
	</p>
	<p class="sr-only" aria-live="polite">{musicNews}</p>
</section>

<dialog
	bind:this={dialog}
	class="sheet"
	class:expanded
	onclose={closeStation}
	oncancel={(event) => {
		event.preventDefault();
		dismissStation();
	}}
	onkeydown={sheetKeys}
	onanimationend={measureLayout}
	aria-labelledby="station-title"
	tabindex="-1"
>
	{#if open}<div class="sheet-top">
			<span class="sheet-context">{stationById[open]?.area ?? 'In the room'}</span>
			<div>
				{#if narrow}<button
						aria-expanded={expanded}
						onclick={() => {
							expanded = !expanded;
							remember();
						}}
						>{expanded ? 'Show preview' : 'Keep reading'}<span aria-hidden="true">
							{expanded ? '↙' : '↗'}</span
						></button
					>{/if}<button
					class="close"
					onclick={dismissStation}
					aria-label="Close and return to the room">Close ×</button
				>
			</div>
		</div>
		<div class="sheet-content">
			<StationPanel id={open} preview={narrow && !expanded} /><a
				class="paper-link"
				href={`/index#${stationById[open]?.section}`}>See it on paper →</a
			><button class="back-button" onclick={dismissStation}>← Back to the room</button>
		</div>{/if}
</dialog>
<dialog
	bind:this={poemDialog}
	class="sheet poem expanded"
	onclose={closePoem}
	onkeydown={sheetKeys}
	onanimationend={measureLayout}
	aria-labelledby="poem-title"
	tabindex="-1"
>
	{#if poemOf && poem}<div class="sheet-top">
			<span class="sheet-context">{poem.author}</span><button
				class="close"
				onclick={() => poemDialog.close()}
				aria-label="Close and return to the room">Close ×</button
			>
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
		max-width: 470px;
	}
	h1 {
		max-width: 18ch;
		font-size: clamp(1.75rem, 2.8vw, 2.5rem);
		line-height: 1.12;
		letter-spacing: -0.02em;
		font-weight: 500;
	}
	.welcome p {
		margin-top: 12px;
		font-size: 1.0625rem;
		line-height: 1.5;
		color: var(--color-ink-soft);
		max-width: 38ch;
	}
	.inspecting .welcome {
		display: none;
	}
	.inspecting .corner,
	.inspecting .room-tools {
		visibility: hidden;
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
	.room-tools {
		position: absolute;
		z-index: 4;
		right: var(--gutter);
		bottom: max(24px, env(safe-area-inset-bottom));
	}
	.menu-button {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		min-height: 52px;
		padding: 0 20px;
		border-radius: 100px;
		background: var(--color-accent);
		color: #fffaf0;
		box-shadow: 0 6px 20px #1f2a242b;
		font: 500 0.9375rem/1.4 var(--font-ui);
		cursor: pointer;
		white-space: nowrap;
	}
	.menu-button:hover {
		background: #213a30;
	}
	.destinations {
		display: none;
	}
	.menu {
		position: fixed;
		inset: auto var(--gutter) 92px auto;
		width: min(380px, calc(100vw - 32px));
		max-height: calc(100dvh - 160px);
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
	.menu-foot {
		padding-top: 12px;
		border-top: 1px solid var(--color-hairline);
		font: 0.9375rem/1.5 var(--font-ui);
	}
	.menu-foot a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		text-decoration: underline;
		text-underline-offset: 4px;
		color: var(--color-accent);
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
	.paper-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		margin: 20px 16px 0 0;
		font: var(--type-ui) / 1.5 var(--font-ui);
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
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
	.poem h2 {
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
	.dock-top > span:not(.disc) {
		flex: 1;
	}
	.dock-top button {
		min-height: 44px;
		padding: 4px 6px;
		color: var(--color-accent);
		cursor: pointer;
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
	@media (max-width: 820px) {
		.welcome {
			max-width: 100%;
		}
		.welcome p {
			font-size: 0.9375rem;
			max-width: 42ch;
			margin-top: 8px;
		}
		.room-tools {
			left: 12px;
			right: 12px;
			bottom: max(12px, env(safe-area-inset-bottom));
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: center;
			gap: 8px;
			padding: 6px;
			border: 1px solid #c9c4b6;
			border-radius: 14px;
			background: #faf7ed;
			box-shadow: 0 4px 16px #2535291a;
		}
		.destinations {
			display: flex;
			align-items: center;
			gap: 6px;
			overflow-x: auto;
			scrollbar-width: thin;
			padding-bottom: 3px;
		}
		.destinations button {
			flex: 0 0 auto;
			min-height: 46px;
			padding: 8px 14px;
			border-radius: 8px;
			background: #eeeee2;
			font: 0.9375rem/1.4 var(--font-ui);
			cursor: pointer;
		}
		.destinations button.selected {
			background: var(--color-accent);
			color: #fffaf0;
		}
		.menu-button {
			min-height: 48px;
			padding: 0 12px;
			border-radius: 8px;
			box-shadow: none;
			font-size: 0.875rem;
		}
		.menu-button > span {
			display: none;
		}
		.corner {
			left: 16px;
			right: 16px;
			bottom: max(96px, calc(env(safe-area-inset-bottom) + 84px));
			max-width: none;
			justify-items: stretch;
		}
		.dock {
			width: 100%;
		}
		.room-hint {
			background: #faf7edeb;
		}
		.room-hint p {
			padding: 8px 12px;
		}
		.note {
			left: 16px;
			right: 16px;
			bottom: calc(var(--corner, 160px) + 12px);
			max-width: none;
		}
		.menu {
			inset: auto 12px max(94px, calc(env(safe-area-inset-bottom) + 82px));
			width: auto;
			max-height: calc(100dvh - 160px);
		}
		.sheet {
			inset: auto 0 0;
			width: 100%;
			height: 44dvh;
			max-height: 44dvh;
			border-left: 0;
			border-top: 1px solid #b7bda5;
			border-radius: 18px 18px 0 0;
			box-shadow: 0 -16px 48px #25352926;
		}
		.sheet.expanded {
			height: 92dvh;
			max-height: 92dvh;
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
