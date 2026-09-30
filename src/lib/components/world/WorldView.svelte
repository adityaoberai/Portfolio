<script lang="ts">
	import { onMount, tick } from 'svelte';
	import StationPanel from './StationPanel.svelte';
	import { curiosities, stationById, stations } from '$lib/data/room';
	import type { CuriosityId, StationId } from '$lib/world/layout';
	import type { HoverTarget, RoomController, RoomState } from '$lib/world/scene';

	let canvas: HTMLCanvasElement;
	let frameEl: HTMLDivElement;
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
		// Focus returns to whatever opened the station: the canvas, or a guide button.
		returnFocus = document.activeElement as HTMLElement | null;
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
	}
	function visit(id: StationId) {
		// Without a working scene, the same content opens directly.
		if (!room || status !== 'ready') return void showStation(id);
		// Bring the room into view so the walk and camera push are visible.
		const rect = frameEl.getBoundingClientRect();
		if (rect.top < 0 || rect.bottom > window.innerHeight)
			frameEl.scrollIntoView({
				block: window.innerWidth >= 820 ? 'center' : 'start',
				behavior: reducedMotion ? 'auto' : 'smooth'
			});
		room.visit(id);
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
		const rect = frameEl.getBoundingClientRect();
		const label =
			target.kind === 'station'
				? `${stationById[target.id].object} · ${stationById[target.id].area}`
				: curiosities[target.id].label;
		hover = { label, x: x - rect.left, y: y - rect.top };
	}

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
				if (diagnostics) Reflect.set(window, '__room', room);
			})
			.catch(() => {
				if (!cancelled) status = 'error';
			});
		return () => {
			cancelled = true;
			window.clearTimeout(timeout);
			window.clearTimeout(noteTimer);
			motion.removeEventListener('change', updateMotion);
			room?.destroy();
		};
	});
</script>

<section class="world-page" aria-labelledby="world-title">
	<div class="welcome">
		<div>
			<p class="eyebrow">A little room, a few stories</p>
			<h1 id="world-title">Come spend a minute<br class="mobile-break" /> in my world.</h1>
		</div>
		<p>Make yourself at home.<br />Everything here is something I care about.</p>
	</div>
	<div class="room-frame" bind:this={frameEl}>
		<div class="room-caption">
			<span class="status-dot" aria-hidden="true"></span> Aditya's room
			<span class="edition">/ Bengaluru</span>
		</div>
		<canvas
			bind:this={canvas}
			tabindex={status === 'ready' ? 0 : -1}
			aria-label="Aditya's room. Use WASD or arrow keys to walk and E to inspect what's nearby, or tap the floor and objects. Every object is also listed below."
			aria-describedby="room-instructions"
			class:loaded={status === 'ready'}
			data-x={roomState?.x.toFixed(3)}
			data-z={roomState?.z.toFixed(3)}
			data-frames={roomState?.frames}
			data-near={roomState?.near ?? ''}
		>
			Explore Aditya's room through the list of objects below, or open the Index.
		</canvas>
		{#if status !== 'ready'}
			<div class="fallback" role="status">
				<img
					class="still"
					src="/room-still.jpg"
					alt=""
					width="1164"
					height="619"
					fetchpriority="high"
				/>
				<span class="fallback-symbol" aria-hidden="true">{status === 'loading' ? '◌' : '↗'}</span>
				<h2>{status === 'loading' ? 'Opening the room…' : 'The room couldn’t open here.'}</h2>
				<p>
					{status === 'loading'
						? 'A small space for the things I make and care about.'
						: 'Everything in it is still listed below, and in the Index.'}
				</p>
				<a href="/index">Explore the Index →</a>
				{#if status === 'error'}<button onclick={() => window.location.reload()}
						>Try the room again</button
					>{/if}
			</div>
		{/if}
		<noscript
			><p class="no-script">
				The interactive room needs JavaScript. <a href="/index">Explore the Index →</a>
			</p></noscript
		>
		{#if hover}
			<span class="hover-label" style="left: {hover.x}px; top: {hover.y}px" aria-hidden="true"
				>{hover.label}</span
			>
		{/if}
		{#if status === 'ready'}
			<div class="room-hint" aria-hidden="true">
				{#if near}
					<span class="eyebrow">{near.number} / {near.area}</span>
					<span class="hint-title">{near.object}</span>
					<span class="hint-key"><kbd>E</kbd> or tap it to look closer</span>
				{:else}
					<span class="eyebrow">Start anywhere</span>
					<span class="hint-title">Walk up to something.</span>
					<span class="hint-key">Or pick from the list below.</span>
				{/if}
			</div>
		{/if}
		{#if note}
			<p class="note">{note}</p>
		{/if}
	</div>
	<div class="room-toolbar">
		<p id="room-instructions">
			<span class="desktop-instructions"
				><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows to walk · <kbd>E</kbd> to
				inspect ·{' '}</span
			>Tap the floor to move. Tap an object to explore.
		</p>
		<div class="settings">
			<button onclick={() => room?.reset()} disabled={status !== 'ready'}>Reset view</button><label
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
	<p class="sr-only" aria-live="polite">
		{near ? `Near the ${near.short}. Press E while the room is focused to inspect it.` : ''}{note}
	</p>
	{#if diagnostics && roomState}<output class="diagnostics"
			>{roomState.calls} draws · {roomState.triangles} triangles · DPR {roomState.dpr} · {roomState.frames}
			rendered frames · {roomState.moving ? 'moving' : 'idle'}</output
		>{/if}

	<nav class="guide" aria-labelledby="guide-title">
		<h2 id="guide-title" class="eyebrow">In the room</h2>
		<ul>
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
	<div class="room-footer">
		<p>A work in progress, just like the person who lives here.</p>
		<a href="/index">Prefer a list? Here's the Index →</a>
	</div>
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
	.world-page {
		max-width: var(--container);
		margin: auto;
		padding: 32px var(--gutter) 24px;
	}
	.welcome {
		margin: 0 auto 24px;
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 24px;
	}
	h1 {
		font-size: clamp(30px, 3.5vw, 49px);
		line-height: 1.08;
		letter-spacing: -0.045em;
		margin-top: 10px;
	}
	.welcome > p {
		color: #676957;
		font-size: 17px;
		line-height: 1.5;
		text-align: right;
	}
	.mobile-break {
		display: none;
	}
	.room-frame {
		margin: auto;
		height: clamp(460px, 62vh, 760px);
		position: relative;
		overflow: hidden;
		border: 1px solid #d3d5c3;
		border-radius: 8px;
		background: #e9ebdf;
	}
	.room-caption {
		position: absolute;
		z-index: 1;
		top: 22px;
		left: 24px;
		display: flex;
		align-items: center;
		gap: 8px;
		font:
			12px/1.5 system-ui,
			sans-serif;
		color: #3c5142;
	}
	.status-dot {
		width: 6px;
		height: 6px;
		background: #64825c;
		border-radius: 50%;
	}
	.edition {
		color: #69705d;
	}
	canvas {
		display: block;
		width: 100%;
		height: 100%;
		opacity: 0;
		touch-action: pan-y;
	}
	canvas.loaded {
		opacity: 1;
	}
	canvas:focus-visible {
		outline: 3px solid #304e42;
		outline-offset: -4px;
	}
	.hover-label {
		position: absolute;
		z-index: 2;
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
	.room-hint {
		position: absolute;
		bottom: 22px;
		left: 22px;
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
	.note {
		position: absolute;
		z-index: 2;
		top: 18px;
		right: 18px;
		max-width: min(320px, calc(100% - 36px));
		padding: 12px 14px;
		background: #263b33;
		color: #fffaf0;
		border-radius: 6px;
		font-size: 16px;
		line-height: 1.45;
	}
	.room-toolbar {
		margin: auto;
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 8px 20px;
		padding: 14px 0;
		border-bottom: 1px solid #dedbcf;
		color: #5e6555;
		font:
			12px/1.7 system-ui,
			sans-serif;
	}
	.room-toolbar > p {
		padding-top: 12px;
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
	.settings {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 20px;
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
		opacity: 0.4;
		cursor: default;
	}
	input {
		accent-color: #385b46;
		width: 16px;
		height: 16px;
	}
	.diagnostics {
		font: 12px monospace;
		display: block;
		padding: 8px 0;
	}
	.guide {
		margin: 28px auto 0;
	}
	.guide ul {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 0 28px;
		margin: 12px 0 0;
		padding: 0;
		list-style: none;
	}
	.guide li {
		display: grid;
		grid-template-columns: 26px 1fr;
		gap: 10px;
		padding: 16px 0;
		border-top: 1px solid #dedbcf;
	}
	.guide li.is-near {
		border-top-color: #304e42;
	}
	.number {
		padding-top: 12px;
		font:
			11px system-ui,
			sans-serif;
		color: #69705d;
	}
	.guide-button {
		min-height: 44px;
		font-size: 21px;
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
		font-size: 15px;
		line-height: 1.5;
		color: #606456;
	}
	.area {
		color: #3f4d40;
	}
	.guide a {
		display: inline-block;
		margin-top: 4px;
		padding: 8px 0;
		font:
			13px system-ui,
			sans-serif;
		color: #304e42;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.little-things {
		margin: 8px auto 0;
		padding: 12px 0;
		border-top: 1px solid #dedbcf;
		color: #4f5746;
	}
	.little-things summary {
		min-height: 44px;
		display: flex;
		align-items: center;
		cursor: pointer;
		font:
			13px system-ui,
			sans-serif;
		color: #304e42;
	}
	.little-things ul {
		display: grid;
		gap: 8px;
		margin: 6px 0 0;
		padding: 0 0 0 18px;
		font-size: 15px;
		line-height: 1.5;
	}
	.room-footer {
		margin: 18px auto 0;
		padding-top: 18px;
		border-top: 1px solid #dedbcf;
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font-size: 15px;
		color: #606456;
	}
	.room-footer a {
		color: #304e42;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.fallback {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 24px;
		text-align: center;
		background: #e9ebdf;
	}
	.fallback .still {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		opacity: 0.35;
		filter: saturate(0.6);
		pointer-events: none;
	}
	.fallback > :not(.still) {
		position: relative;
	}
	.fallback-symbol {
		font-size: 36px;
		color: #5c765d;
	}
	.fallback h2 {
		font-size: 30px;
		margin: 12px 0;
	}
	.fallback p {
		max-width: 340px;
		color: #606456;
	}
	.fallback a {
		display: inline-block;
		background: #304e42;
		color: #fffdf6;
		padding: 12px 22px;
		border-radius: 100px;
		margin-top: 24px;
	}
	.fallback button {
		padding: 12px;
		text-decoration: underline;
		cursor: pointer;
	}
	.no-script {
		position: absolute;
		bottom: 18px;
		width: 100%;
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
		@keyframes slide-in {
			from {
				transform: translateX(24px);
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
		.world-page {
			padding-top: 24px;
		}
		.welcome {
			align-items: start;
			margin-bottom: 20px;
		}
		.welcome > p {
			display: none;
		}
		.mobile-break {
			display: block;
		}
		.room-frame {
			height: min(118vw, 520px);
		}
		.room-caption {
			top: 14px;
			left: 14px;
			font-size: 11px;
		}
		.room-hint {
			left: 12px;
			right: 12px;
			bottom: 12px;
			padding: 10px 14px;
		}
		.hint-title {
			font-size: 19px;
		}
		.desktop-instructions {
			display: none;
		}
		.guide ul {
			grid-template-columns: 1fr;
		}
		.room-footer {
			flex-direction: column;
			font-size: 14px;
		}
		.settings {
			gap: 4px 16px;
		}
	}
</style>
