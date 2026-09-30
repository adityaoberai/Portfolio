<script lang="ts">
	import { onMount } from 'svelte';
	import PageMeta from '$lib/components/PageMeta.svelte';
	import V3Header from '$lib/components/V3Header.svelte';
	import { deskArtifact } from '$lib/data/artifacts';
	import type { RoomController, RoomState } from '$lib/world/scene';

	let canvas: HTMLCanvasElement;
	let dialog: HTMLDialogElement;
	let room: RoomController | undefined;
	let status = $state<'loading' | 'ready' | 'error'>('loading');
	let reducedMotion = $state(false);
	let lowQuality = $state(false);
	let roomState = $state<RoomState>();
	let diagnostics = $state(false);
	let previousFocus: HTMLElement | null = null;

	function inspect() {
		previousFocus = document.activeElement as HTMLElement | null;
		room?.setPaused(true);
		dialog.showModal();
	}
	function closeInspection() {
		room?.setPaused(false);
		previousFocus?.focus({ preventScroll: true });
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
					onInspect: inspect,
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
			})
			.catch(() => {
				if (!cancelled) status = 'error';
			})
			.finally(() => window.clearTimeout(timeout));
		return () => {
			cancelled = true;
			window.clearTimeout(timeout);
			motion.removeEventListener('change', updateMotion);
			room?.destroy();
		};
	});
</script>

<PageMeta
	title="My world"
	path="/world"
	description="Come spend a minute in Aditya Oberai's world. A small, warm studio to explore, with an accessible Index a click away."
/>
<V3Header />
<section class="world-page" aria-labelledby="world-title">
	<div class="welcome">
		<div>
			<p class="eyebrow">A little room, a few stories</p>
			<h1 id="world-title">Come spend a minute<br class="mobile-break" /> in my world.</h1>
		</div>
		<p>Make yourself at home.<br />Start with the desk.</p>
	</div>
	<div class="room-frame">
		<div class="room-caption">
			<span class="status-dot" aria-hidden="true"></span> Aditya's room
			<span class="edition">/ first sketch</span>
		</div>
		<canvas
			bind:this={canvas}
			tabindex={status === 'ready' ? 0 : -1}
			aria-label="Aditya's room. Use WASD or arrow keys to walk, tap the floor to move, or choose Inspect the desk below."
			aria-describedby="room-instructions"
			class:loaded={status === 'ready'}
			data-x={roomState?.x.toFixed(3)}
			data-z={roomState?.z.toFixed(3)}
			data-frames={roomState?.frames}
		>
			Explore Aditya's work through the desk, or open the conventional Index.
		</canvas>
		{#if status !== 'ready'}
			<div class="fallback" role="status">
				<span class="fallback-symbol" aria-hidden="true">{status === 'loading' ? '◌' : '↗'}</span>
				<h2>{status === 'loading' ? 'Opening the room…' : 'The room couldn’t open here.'}</h2>
				<p>
					{status === 'loading'
						? 'A small space for the things I make and care about.'
						: 'You can still explore everything about me in the Index.'}
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
		{#if status === 'ready'}
			<div class="desk-prompt">
				<span class="eyebrow">01 / Desk & computer</span><button
					class="inspect-button"
					onclick={() => room?.visitDesk()}
					>Inspect the desk <span aria-hidden="true">↗</span></button
				><span class="desk-note">Developer relations. Things I've built.</span>
			</div>
		{/if}
	</div>
	<div class="room-toolbar">
		<p id="room-instructions">
			<span class="desktop-instructions"
				><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows to walk ·{' '}</span
			>Tap the floor to move. Tap the desk to explore.
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
		{roomState?.nearDesk
			? 'Near the desk. Press E or Enter while the room is focused to inspect.'
			: 'Explore the room, or use the Inspect the desk button.'}
	</p>
	{#if diagnostics && roomState}<output class="diagnostics"
			>{roomState.calls} draws · {roomState.triangles} triangles · DPR {roomState.dpr} · {roomState.frames}
			rendered frames · {roomState.moving ? 'moving' : 'idle'}</output
		>{/if}
	<div class="room-footer">
		<p>A work in progress, just like the person who lives here.</p>
		<a href="/index">Prefer a list? Here's the Index →</a>
	</div>
</section>

<dialog bind:this={dialog} onclose={closeInspection} aria-labelledby="artifact-title">
	<div class="dialog-top">
		<span class="eyebrow">From the desk / Work & build</span><button
			onclick={() => dialog.close()}
			aria-label="Close work details">Close ×</button
		>
	</div>
	<p class="artifact-kicker">Developer Relations at Appwrite</p>
	<h2 id="artifact-title">{deskArtifact.title}</h2>
	<p class="artifact-description">{deskArtifact.description}</p>
	<div class="artifact-links">
		<a href={deskArtifact.href}>More about my work →</a>{#if deskArtifact.externalUrl}<a
				href={deskArtifact.externalUrl}>Explore Appwrite Init ↗</a
			>{/if}
	</div>
	<button class="back-button" onclick={() => dialog.close()}>← Back to the room</button>
</dialog>

<style>
	.world-page {
		background: #f8f5ed;
		padding: 32px clamp(16px, 4vw, 64px) 24px;
		min-height: calc(100svh - 97px);
	}
	.welcome {
		max-width: 1400px;
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
		max-width: 1400px;
		margin: auto;
		height: clamp(440px, 59vh, 720px);
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
		outline-offset: -4px;
	}
	.desk-prompt {
		position: absolute;
		bottom: 24px;
		left: 24px;
		background: #faf7eb;
		border: 1px solid #d2cfbb;
		padding: 15px 18px;
		border-radius: 6px;
		box-shadow: 0 3px 0 #bfc5b52b;
		display: grid;
		gap: 3px;
	}
	.desk-prompt .eyebrow {
		font-size: 10px;
	}
	.inspect-button {
		min-height: 44px;
		display: flex;
		align-items: center;
		gap: 30px;
		text-align: left;
		font-size: 23px;
		cursor: pointer;
	}
	.inspect-button:hover {
		color: #386348;
		text-decoration: underline;
		text-underline-offset: 5px;
	}
	.desk-note {
		color: #686c5a;
		font-size: 13px;
	}
	.room-toolbar {
		max-width: 1400px;
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
	.room-footer {
		max-width: 1400px;
		margin: 18px auto 0;
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
	.diagnostics {
		font: 12px monospace;
		display: block;
		padding: 8px 0;
	}
	dialog {
		margin: auto;
		width: min(580px, calc(100% - 32px));
		max-height: calc(100svh - 40px);
		overflow-y: auto;
		padding: clamp(24px, 4vw, 42px);
		background: #faf7ed;
		color: #283f33;
		border: 1px solid #b7bda5;
		border-radius: 10px;
		box-shadow: 0 24px 100px #25352940;
	}
	dialog::backdrop {
		background: #263b3a75;
	}
	.dialog-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}
	.dialog-top button {
		min-height: 44px;
		min-width: 58px;
		font:
			12px system-ui,
			sans-serif;
		cursor: pointer;
	}
	.artifact-kicker {
		margin: 32px 0 10px;
		font-size: 16px;
		color: #687257;
	}
	dialog h2 {
		font-size: 40px;
		letter-spacing: -0.035em;
		line-height: 1.1;
	}
	.artifact-description {
		font-size: 20px;
		line-height: 1.65;
		margin: 24px 0;
		color: #59614e;
	}
	.artifact-links {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.artifact-links a {
		padding: 8px 0;
		text-decoration: underline;
		text-underline-offset: 5px;
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
			height: 480px;
		}
		canvas {
			height: 365px;
		}
		.room-caption {
			top: 16px;
			left: 16px;
			font-size: 11px;
		}
		.desk-prompt {
			bottom: 16px;
			left: 16px;
			right: 16px;
			padding: 10px 14px;
		}
		.desk-note {
			display: none;
		}
		.inspect-button {
			justify-content: space-between;
			font-size: 21px;
		}
		.desktop-instructions {
			display: none;
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
