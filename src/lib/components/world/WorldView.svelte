<script lang="ts">
	import { onMount, tick } from 'svelte';
	import V3Header from '$lib/components/V3Header.svelte';
	import StationPanel from './StationPanel.svelte';
	import { curiosities, stationById, stations } from '$lib/data/room';
	import type { CuriosityId, StationId } from '$lib/world/layout';
	import type { HoverTarget, RoomController, RoomState } from '$lib/world/scene';

	let canvas: HTMLCanvasElement;
	let frameEl: HTMLElement;
	let topEl: HTMLDivElement;
	let hintEl = $state<HTMLDivElement>();
	let menuButton: HTMLButtonElement;
	let menu: HTMLDivElement;
	let dialog: HTMLDialogElement;
	let room: RoomController | undefined;
	let status = $state<'loading' | 'ready' | 'error'>('loading');
	let reducedMotion = $state(false);
	let lowQuality = $state(false);
	let roomState = $state<RoomState>();
	let diagnostics = $state(false);
	let open = $state<StationId | null>(null);
	let hover = $state<{ label: string; x: number; y: number } | null>(null);
	let note = $state('');
	let noteTimer = 0;
	let returnFocus: HTMLElement | null = null;

	const near = $derived(roomState?.near ? stationById[roomState.near] : null);

	// Deep pages link to /world#<station>; open it once the room is ready, or directly if it failed.
	let hashHandled = false;
	function openFromHash() {
		if (hashHandled) return;
		hashHandled = true;
		const id = window.location.hash.slice(1) as StationId;
		if (!(id in stationById)) return;
		if (room && status === 'ready') room.visit(id);
		else void showStation(id);
	}
	$effect(() => {
		if (status !== 'loading') openFromHash();
	});

	async function showStation(id: StationId) {
		// Focus returns to whatever opened the station: the canvas, or the menu button.
		returnFocus ??= document.activeElement as HTMLElement | null;
		open = id;
		room?.setPaused(true);
		hover = null;
		await tick();
		if (!dialog.open) dialog.showModal();
	}
	function closeStation() {
		open = null;
		room?.release();
		room?.setPaused(false);
		returnFocus?.focus({ preventScroll: true });
		returnFocus = null;
	}
	// Picking from the menu closes it; focus comes back to the menu button, which stays visible.
	function visit(id: StationId) {
		if (menu.matches(':popover-open')) menu.hidePopover();
		returnFocus = menuButton;
		if (room && status === 'ready') room.visit(id);
		else void showStation(id);
	}
	function showCuriosity(id: CuriosityId) {
		note = curiosities[id].line;
		window.clearTimeout(noteTimer);
		noteTimer = window.setTimeout(() => (note = ''), 5000);
	}
	function onHover(target: HoverTarget | null, x: number, y: number) {
		if (!target) {
			hover = null;
			return;
		}
		const label =
			target.kind === 'station'
				? `${stationById[target.id].object} · ${stationById[target.id].area}`
				: curiosities[target.id].label;
		hover = { label, x, y };
	}
	// Keep the room clear of the floating title, hint card, and menu button.
	function measureInsets() {
		if (!room || !frameEl) return;
		const height = frameEl.clientHeight;
		const narrow = frameEl.clientWidth < 820;
		const lowest = Math.min(
			menuButton.getBoundingClientRect().top,
			hintEl?.getBoundingClientRect().top ?? height
		);
		room.setInsets({
			top: topEl.getBoundingClientRect().bottom + 8,
			bottom: narrow ? Math.max(24, height - lowest + 12) : 24
		});
	}
	$effect(() => {
		if (status === 'ready' && hintEl) measureInsets();
	});

	onMount(() => {
		let cancelled = false;
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = motion.matches;
		diagnostics = new URLSearchParams(window.location.search).has('diagnostics');
		const updateMotion = () => {
			reducedMotion = motion.matches;
			room?.setReducedMotion(reducedMotion);
		};
		motion.addEventListener('change', updateMotion);
		const observer = new ResizeObserver(measureInsets);
		observer.observe(frameEl);
		observer.observe(topEl);
		const timeout = window.setTimeout(() => {
			if (status === 'loading') status = 'error';
		}, 15000);
		void import('$lib/world/scene')
			.then(({ createRoom }) => {
				if (cancelled) return;
				room = createRoom(canvas, {
					reducedMotion,
					lowQuality,
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
					}
				});
				measureInsets();
				if (diagnostics) Reflect.set(window, '__room', room);
			})
			.catch(() => {
				if (!cancelled) status = 'error';
			});
		return () => {
			cancelled = true;
			observer.disconnect();
			window.clearTimeout(timeout);
			window.clearTimeout(noteTimer);
			motion.removeEventListener('change', updateMotion);
			room?.destroy();
		};
	});
</script>

<section class="world" aria-labelledby="world-title" bind:this={frameEl}>
	<canvas
		bind:this={canvas}
		tabindex={status === 'ready' ? 0 : -1}
		aria-label="Aditya's room. Use WASD or arrow keys to walk and E to inspect what's nearby, or tap the floor and objects. Every object is also listed in the menu."
		aria-describedby="room-instructions"
		class:loaded={status === 'ready'}
		data-x={roomState?.x.toFixed(3)}
		data-z={roomState?.z.toFixed(3)}
		data-frames={roomState?.frames}
		data-near={roomState?.near ?? ''}
	>
		Explore Aditya's room through the menu of objects, or open the Index.
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
				<h2>{status === 'loading' ? 'Opening the room…' : 'The room couldn’t open here.'}</h2>
				<p>
					{status === 'loading'
						? 'A small space for the things I make and care about.'
						: 'Everything in it is still in the menu, and in the Index.'}
				</p>
				<div class="fallback-actions">
					<a href="/index">Explore the Index →</a>
					{#if status === 'error'}<button onclick={() => window.location.reload()}
							>Try the room again</button
						>{/if}
				</div>
			</div>
		</div>
	{/if}
	<noscript
		><p class="no-script">
			The interactive room needs JavaScript. <a href="/index">Explore the Index →</a>
		</p></noscript
	>

	<div class="overlay top" bind:this={topEl}>
		<V3Header overlay />
		<div class="title">
			<p class="eyebrow">Aditya's room · Bengaluru</p>
			<h1 id="world-title">Come spend a minute in my world.</h1>
		</div>
		{#if diagnostics && roomState}<output class="diagnostics"
				>{roomState.calls} draws · {roomState.triangles} triangles · DPR {roomState.dpr} · {roomState.frames}
				rendered frames · {roomState.moving ? 'moving' : 'idle'}</output
			>{/if}
	</div>

	{#if hover}
		<span class="hover-label" style="left: {hover.x}px; top: {hover.y}px" aria-hidden="true"
			>{hover.label}</span
		>
	{/if}
	{#if note}
		<p class="note">{note}</p>
	{/if}
	{#if status === 'ready'}
		<div class="room-hint" aria-hidden="true" bind:this={hintEl}>
			{#if near}
				<span class="eyebrow">{near.number} / {near.area}</span>
				<span class="hint-title">{near.object}</span>
				<span class="hint-key"><kbd>E</kbd> or tap it to look closer</span>
			{:else}
				<span class="eyebrow">Start anywhere</span>
				<span class="hint-title">Walk up to something.</span>
				<span class="hint-key">Or open the menu to pick.</span>
			{/if}
		</div>
	{/if}

	<button class="menu-button" popovertarget="room-menu" bind:this={menuButton}
		><span class="bars" aria-hidden="true"><span></span></span>In the room</button
	>
	<div id="room-menu" class="menu" popover bind:this={menu}>
		<div class="menu-head">
			<h2 id="menu-title">In the room</h2>
			<button
				class="menu-close"
				popovertarget="room-menu"
				popovertargetaction="hide"
				aria-label="Close the menu">×</button
			>
		</div>
		<nav aria-label="In the room">
			<ul class="guide">
				{#each stations as station (station.id)}
					<li class:is-near={roomState?.near === station.id}>
						<span class="number">{station.number}</span>
						<div>
							<button class="guide-button" onclick={() => visit(station.id)}
								>Inspect the {station.short}</button
							>
							<p><span class="area">{station.area}</span> · {station.summary}</p>
							<a href={station.href}
								>{station.area}{#if station.external}<span aria-hidden="true">&nbsp;↗</span><span
										class="sr-only"
									>
										(external site)</span
									>{:else}<span aria-hidden="true">&nbsp;→</span>{/if}</a
							>
						</div>
					</li>
				{/each}
			</ul>
		</nav>
		<details class="little-things">
			<summary>Little things in the room</summary>
			<ul>
				{#each Object.values(curiosities) as item (item.label)}
					<li><strong>{item.label}</strong> · {item.line}</li>
				{/each}
			</ul>
		</details>
		<div class="controls">
			<p id="room-instructions">
				<span class="desktop-instructions"
					><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows to walk · <kbd>E</kbd> to
					inspect ·{' '}</span
				>Tap the floor to move. Tap an object to explore.
			</p>
			<div class="settings">
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
		</div>
		<p class="menu-foot">
			A work in progress, just like the person who lives here.
			<a href="/index">Prefer a list? Here's the Index →</a>
		</p>
	</div>

	<p class="sr-only" aria-live="polite">
		{near ? `Near the ${near.short}. Press E while the room is focused to inspect it.` : ''}{note}
	</p>
</section>

<dialog bind:this={dialog} class="sheet" onclose={closeStation} aria-labelledby="station-title">
	{#if open}
		<div class="sheet-top">
			<button class="close" onclick={() => dialog.close()} aria-label="Close and return to the room"
				>Close ×</button
			>
		</div>
		<StationPanel id={open} />
		<button class="back-button" onclick={() => dialog.close()}>← Back to the room</button>
	{/if}
</dialog>

<style>
	/* The room is the page: a fixed, full-viewport stage with UI floating over it. */
	.world {
		position: fixed;
		inset: 0;
		overflow: hidden;
		background: #e9ebdf;
	}
	canvas {
		position: absolute;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
		opacity: 0;
		touch-action: none;
	}
	canvas.loaded {
		opacity: 1;
	}
	canvas:focus-visible {
		outline: 3px solid #304e42;
		outline-offset: -6px;
	}
	.overlay {
		position: absolute;
		z-index: 2;
		left: 0;
		right: 0;
		pointer-events: none;
	}
	.overlay :global(a),
	.overlay :global(button) {
		pointer-events: auto;
	}
	.top {
		top: 0;
	}
	.title {
		padding: 0 var(--gutter);
	}
	.title .eyebrow {
		font-size: 11px;
	}
	h1 {
		max-width: 16ch;
		margin-top: 6px;
		font-size: clamp(26px, 3vw, 42px);
		line-height: 1.08;
		letter-spacing: -0.04em;
		font-weight: 500;
	}
	.diagnostics {
		display: block;
		padding: 8px var(--gutter);
		font: 12px monospace;
	}
	.hover-label {
		position: absolute;
		z-index: 3;
		transform: translate(14px, -130%);
		padding: 6px 10px;
		background: #263b33;
		color: #fffaf0;
		border-radius: 4px;
		font:
			12px/1.3 system-ui,
			sans-serif;
		white-space: nowrap;
		pointer-events: none;
	}
	.note {
		position: absolute;
		z-index: 3;
		right: var(--gutter);
		bottom: 96px;
		max-width: min(320px, calc(100% - 32px));
		padding: 12px 14px;
		background: #263b33;
		color: #fffaf0;
		border-radius: 6px;
		font-size: 16px;
		line-height: 1.45;
	}
	.room-hint {
		position: absolute;
		z-index: 2;
		left: var(--gutter);
		bottom: 24px;
		display: grid;
		gap: 2px;
		padding: 14px 18px;
		background: #faf7eb;
		border: 1px solid #d2cfbb;
		border-radius: 6px;
		box-shadow: 0 3px 0 #bfc5b52b;
		pointer-events: none;
	}
	.room-hint .eyebrow {
		font-size: 10px;
	}
	.hint-title {
		font-size: 22px;
		line-height: 1.25;
	}
	.hint-key {
		font:
			12px/1.6 system-ui,
			sans-serif;
		color: #5f6555;
	}
	kbd {
		font:
			10px system-ui,
			sans-serif;
		padding: 3px 4px;
		border: 1px solid #c5c8b6;
		border-bottom-width: 2px;
		border-radius: 3px;
		margin-right: 3px;
		background: #fffdf6;
	}

	/* Floating menu button and the menu it opens (native popover: works without JS). */
	.menu-button {
		position: absolute;
		z-index: 4;
		right: var(--gutter);
		bottom: 24px;
		display: inline-flex;
		align-items: center;
		gap: 10px;
		min-height: 56px;
		padding: 0 22px 0 18px;
		background: #304e42;
		color: #fffaf0;
		border-radius: 999px;
		box-shadow: 0 8px 24px #1f2a2440;
		font:
			600 14px/1 system-ui,
			sans-serif;
		letter-spacing: 0.02em;
		cursor: pointer;
	}
	.menu-button:hover {
		background: #243d33;
	}
	.menu-button:focus-visible {
		outline: 3px solid #1f2620;
		outline-offset: 3px;
	}
	.bars,
	.bars span,
	.bars::before,
	.bars::after {
		display: block;
		width: 18px;
		height: 2px;
		background: currentColor;
		border-radius: 2px;
	}
	.bars {
		position: relative;
		background: none;
	}
	.bars::before,
	.bars::after {
		content: '';
		position: absolute;
		left: 0;
	}
	.bars::before {
		top: -6px;
	}
	.bars::after {
		top: 6px;
	}
	.menu {
		position: fixed;
		inset: auto var(--gutter) 96px auto;
		width: min(420px, calc(100vw - 32px));
		max-height: calc(100dvh - 200px);
		margin: 0;
		overflow-y: auto;
		padding: 18px 22px 20px;
		background: #faf7ed;
		color: #283f33;
		border: 1px solid #c9c4b6;
		border-radius: 14px;
		box-shadow: 0 24px 60px #1f2a2440;
	}
	.menu::backdrop {
		background: transparent;
	}
	.menu-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.menu-head h2 {
		font:
			12px/1.5 system-ui,
			sans-serif;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #5f6555;
	}
	.menu-close {
		width: 44px;
		height: 44px;
		font-size: 24px;
		line-height: 1;
		cursor: pointer;
	}
	.guide {
		margin: 4px 0 0;
		padding: 0;
		list-style: none;
	}
	.guide li {
		display: grid;
		grid-template-columns: 24px 1fr;
		gap: 8px;
		padding: 10px 0;
		border-top: 1px solid #dedbcf;
	}
	.guide li.is-near {
		border-top-color: #304e42;
	}
	.number {
		padding-top: 13px;
		font:
			11px system-ui,
			sans-serif;
		color: #5f6555;
	}
	.guide-button {
		min-height: 44px;
		font-size: 19px;
		line-height: 1.2;
		text-align: left;
		cursor: pointer;
	}
	.guide-button:hover {
		color: #304e42;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.guide p {
		font-size: 14px;
		line-height: 1.45;
		color: #5f6555;
	}
	.area {
		color: #3f4d40;
	}
	.guide a {
		display: inline-flex;
		align-items: center;
		min-height: 36px;
		font:
			13px system-ui,
			sans-serif;
		color: #304e42;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.little-things {
		padding: 6px 0;
		border-top: 1px solid #dedbcf;
	}
	.little-things summary {
		display: flex;
		align-items: center;
		min-height: 44px;
		cursor: pointer;
		font:
			13px system-ui,
			sans-serif;
		color: #304e42;
	}
	.little-things ul {
		display: grid;
		gap: 8px;
		margin: 4px 0 8px;
		padding-left: 18px;
		font-size: 14px;
		line-height: 1.5;
	}
	.controls {
		padding-top: 8px;
		border-top: 1px solid #dedbcf;
		font:
			12px/1.7 system-ui,
			sans-serif;
		color: #5f6555;
	}
	.settings {
		display: flex;
		flex-wrap: wrap;
		gap: 0 18px;
	}
	.settings button,
	.settings label {
		min-height: 44px;
		display: flex;
		align-items: center;
		gap: 6px;
		cursor: pointer;
	}
	.settings button {
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.settings button:disabled {
		opacity: 0.45;
		cursor: default;
	}
	input {
		accent-color: #385b46;
		width: 16px;
		height: 16px;
	}
	.menu-foot {
		display: grid;
		gap: 4px;
		margin-top: 8px;
		padding-top: 12px;
		border-top: 1px solid #dedbcf;
		font-size: 14px;
		color: #5f6555;
	}
	.menu-foot a {
		color: #304e42;
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	.fallback {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		padding: 24px;
		background: #e9ebdf;
	}
	.fallback .still {
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
		padding: 22px 24px;
		text-align: center;
		background: #faf7ebe6;
		border: 1px solid #d2cfbb;
		border-radius: 10px;
	}
	.fallback h2 {
		font-size: 26px;
		line-height: 1.2;
	}
	.fallback p {
		margin-top: 10px;
		color: #5a604f;
	}
	.fallback-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 8px 16px;
		margin-top: 18px;
	}
	.fallback a {
		display: inline-block;
		background: #304e42;
		color: #fffdf6;
		padding: 12px 22px;
		border-radius: 100px;
	}
	.fallback button {
		min-height: 44px;
		padding: 0 12px;
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
		text-align: center;
		background: #e9ebdf;
	}

	/* Details sheet: right side on wide screens, bottom sheet on phones. */
	.sheet {
		margin: 0 0 0 auto;
		width: min(480px, 42vw);
		height: 100dvh;
		max-height: 100dvh;
		max-width: none;
		overflow-y: auto;
		padding: 28px clamp(24px, 3vw, 40px) 36px;
		background: #faf7ed;
		color: #283f33;
		border: 0;
		border-left: 1px solid #b7bda5;
		box-shadow: -18px 0 60px #25352926;
	}
	.sheet::backdrop {
		background: linear-gradient(90deg, #263b3a14, #263b3a4d);
	}
	.sheet-top {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 8px;
	}
	.close {
		min-height: 44px;
		min-width: 58px;
		font:
			12px system-ui,
			sans-serif;
		cursor: pointer;
	}
	.back-button {
		display: block;
		margin-top: 32px;
		padding: 12px 18px;
		background: #304e42;
		color: #fffdf6;
		border-radius: 4px;
		cursor: pointer;
	}
	@media (prefers-reduced-motion: no-preference) {
		.sheet[open] {
			animation: slide-in 260ms ease-out;
		}
		.menu:popover-open {
			animation: rise 180ms ease-out;
		}
		@keyframes slide-in {
			from {
				transform: translateX(24px);
				opacity: 0;
			}
		}
		@keyframes rise {
			from {
				transform: translateY(8px);
				opacity: 0;
			}
		}
	}
	@media (max-width: 820px) {
		.sheet {
			margin: auto 0 0;
			width: 100%;
			height: auto;
			max-height: 78dvh;
			border-left: 0;
			border-top: 1px solid #b7bda5;
			border-radius: 14px 14px 0 0;
			box-shadow: 0 -18px 60px #25352926;
		}
		.sheet::backdrop {
			background: #263b3a4d;
		}
		@media (prefers-reduced-motion: no-preference) {
			.sheet[open] {
				animation-name: slide-up;
			}
			@keyframes slide-up {
				from {
					transform: translateY(24px);
					opacity: 0;
				}
			}
		}
	}
	@media (max-width: 650px) {
		.menu-button {
			right: 16px;
			bottom: 16px;
		}
		.menu {
			inset: auto 16px 84px 16px;
			width: auto;
			max-height: calc(100dvh - 168px);
		}
		.room-hint {
			left: 16px;
			right: 16px;
			bottom: 84px;
			padding: 10px 14px;
		}
		.hint-title {
			font-size: 19px;
		}
		.note {
			left: 16px;
			right: 16px;
			bottom: 190px;
			max-width: none;
		}
		.desktop-instructions {
			display: none;
		}
	}
</style>
