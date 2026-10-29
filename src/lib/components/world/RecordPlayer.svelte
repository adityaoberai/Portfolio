<script module lang="ts">
	// SoundCloud's hosted player and Widget API own audio playback and its controls.
	interface Widget {
		bind(event: string, listener: () => void): void;
		unbind(event: string): void;
		play(): void;
		pause(): void;
		isPaused(callback: (paused: boolean) => void): void;
	}
	interface WidgetFactory {
		(frame: HTMLIFrameElement): Widget;
		Events: Record<'READY' | 'PLAY' | 'PAUSE' | 'FINISH' | 'ERROR', string>;
	}
	const LOAD_TIMEOUT = 10000;
	const PLAYER_TIMEOUT = 30000;
	let api: Promise<WidgetFactory> | undefined;
	function loadApi() {
		if (api) return api;
		const loading = new Promise<WidgetFactory>((resolve, reject) => {
			let settled = false;
			const script = document.createElement('script');
			const fail = () => {
				if (settled) return;
				settled = true;
				window.clearTimeout(timeout);
				script.remove();
				reject(new Error('SoundCloud’s player did not load'));
			};
			const timeout = window.setTimeout(fail, LOAD_TIMEOUT);
			script.src = 'https://w.soundcloud.com/player/api.js';
			script.async = true;
			script.onerror = fail;
			script.onload = () => {
				if (settled) return;
				const factory = (Reflect.get(window, 'SC') as { Widget?: WidgetFactory } | undefined)
					?.Widget;
				if (!factory) return fail();
				settled = true;
				window.clearTimeout(timeout);
				resolve(factory);
			};
			document.head.append(script);
		});
		api = loading;
		void loading.catch(() => {
			if (api === loading) api = undefined;
		});
		return loading;
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	let {
		soundcloud,
		on,
		onplayback
	}: {
		soundcloud: string;
		on: boolean;
		onplayback: (playing: boolean) => void;
	} = $props();

	let holder: HTMLDivElement;
	let frame: HTMLIFrameElement | undefined;
	let widget: Widget | undefined;
	let events: string[] = [];
	let begun = false;
	let ready = false;
	let destroyed = false;
	let playing = false;
	let attempt = 0;
	let readyTimer = 0;
	let nudgeTimer = 0;
	let failed = $state(false);
	let nudge = $state(false);
	let loading = $state(false);

	function report(value: boolean) {
		playing = value;
		if (value) {
			nudge = false;
			window.clearTimeout(nudgeTimer);
		}
		onplayback(value);
	}
	function release() {
		widget?.pause();
		for (const event of events) widget?.unbind(event);
		widget = undefined;
		events = [];
		ready = false;
		frame?.remove();
		frame = undefined;
	}
	function fail(current: number) {
		if (destroyed || current !== attempt) return;
		attempt++;
		window.clearTimeout(readyTimer);
		window.clearTimeout(nudgeTimer);
		release();
		if (playing) report(false);
		begun = false;
		failed = true;
		nudge = false;
		loading = false;
	}
	function play(player: Widget) {
		window.clearTimeout(nudgeTimer);
		nudgeTimer = window.setTimeout(() => (nudge = on && !playing), 3000);
		player.play();
	}
	async function start() {
		if (widget && ready) return play(widget);
		if (begun) return;
		begun = true;
		failed = false;
		loading = true;
		const current = ++attempt;
		const active = () => !destroyed && current === attempt;
		try {
			const factory = await loadApi();
			if (!active()) return;
			const url = new URL('https://w.soundcloud.com/player/');
			url.search = new URLSearchParams({
				url: soundcloud,
				auto_play: 'false',
				visual: 'false',
				color: '304e42',
				show_artwork: 'false',
				show_user: 'true'
			}).toString();
			frame = document.createElement('iframe');
			frame.title = 'SoundCloud player';
			frame.width = '100%';
			frame.height = '300';
			frame.allow = 'autoplay; encrypted-media';
			frame.setAttribute('scrolling', 'no');
			frame.src = url.href;
			frame.onerror = () => fail(current);
			holder.replaceChildren(frame);
			const player = factory(frame);
			widget = player;
			const bind = (event: string, callback: () => void) => {
				events.push(event);
				player.bind(event, () => {
					if (active()) callback();
				});
			};
			readyTimer = window.setTimeout(() => fail(current), PLAYER_TIMEOUT);
			bind(factory.Events.READY, () => {
				window.clearTimeout(readyTimer);
				ready = true;
				loading = false;
				if (on) play(player);
			});
			bind(factory.Events.PLAY, () => report(true));
			bind(factory.Events.PAUSE, () => report(false));
			bind(factory.Events.FINISH, () =>
				player.isPaused((paused) => {
					if (active()) report(!paused);
				})
			);
			bind(factory.Events.ERROR, () => {
				if (!ready) return fail(current);
				// Keep SoundCloud's controls available so an unavailable track can be skipped.
				window.clearTimeout(nudgeTimer);
				nudge = false;
				report(false);
			});
		} catch {
			fail(current);
		}
	}

	$effect(() => {
		if (on) untrack(start);
		else
			untrack(() => {
				widget?.pause();
				window.clearTimeout(nudgeTimer);
				nudge = false;
			});
	});
	$effect(() => () => {
		destroyed = true;
		attempt++;
		window.clearTimeout(readyTimer);
		window.clearTimeout(nudgeTimer);
		release();
	});
</script>

<div class="player" class:failed bind:this={holder}></div>
{#if failed}
	<p class="line" role="status">
		SoundCloud’s player didn’t load here.
		<a href={soundcloud} target="_blank" rel="noopener"
			>Listen on SoundCloud ↗<span class="sr-only"> (opens in a new tab)</span></a
		>
		<button onclick={() => start()}>Retry player</button>
	</p>
{:else if loading}
	<p class="line" role="status">Loading playlist…</p>
{:else if nudge}
	<p class="line" role="status">Press play on the player to start the music.</p>
{/if}

<style>
	.player {
		--player-height: clamp(166px, 36dvh, 300px);
		min-height: var(--player-height);
		border-radius: 8px;
		background: #ece6d3;
	}
	.player.failed {
		display: none;
	}
	.player :global(iframe) {
		display: block;
		width: 100%;
		height: var(--player-height);
		border: 0;
		border-radius: 8px;
	}
	@media (max-width: 820px), (pointer: coarse) {
		.player {
			--player-height: 166px;
		}
	}
	.line {
		margin-top: 10px;
		font: 13px/1.5 var(--font-ui);
		color: #5f6555;
	}
	.line a,
	.line button {
		color: #304e42;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.line button {
		display: inline-block;
		min-height: 44px;
		margin-left: 12px;
		cursor: pointer;
	}
</style>
