<script module lang="ts">
	// Spotify's iFrame API: https://developer.spotify.com/documentation/embeds/references/iframe-api
	interface Playback {
		isPaused: boolean;
		isBuffering: boolean;
		position: number;
		duration: number;
	}
	interface EmbedController {
		addListener(event: 'ready', listener: () => void): void;
		addListener(event: 'playback_update', listener: (event: { data: Playback }) => void): void;
		play(): void;
		resume(): void;
		pause(): void;
		destroy(): void;
	}
	interface IFrameAPI {
		createController(
			element: HTMLElement,
			options: { url: string; width: string; height: number },
			created: (controller: EmbedController) => void
		): void;
	}

	// Loaded the first time a record goes on, never before, and kept for the visit.
	let api: Promise<IFrameAPI> | undefined;
	function loadApi() {
		if (api) return api;
		const loading = new Promise<IFrameAPI>((resolve, reject) => {
			let settled = false;
			const script = document.createElement('script');
			const cleanup = () => {
				window.clearTimeout(timeout);
				if (Reflect.get(window, 'onSpotifyIframeApiReady') === ready)
					Reflect.deleteProperty(window, 'onSpotifyIframeApiReady');
			};
			const fail = () => {
				if (settled) return;
				settled = true;
				cleanup();
				script.remove();
				reject(new Error('Spotify’s player did not load'));
			};
			const ready = (value: IFrameAPI) => {
				if (settled) return;
				settled = true;
				cleanup();
				resolve(value);
			};
			const timeout = window.setTimeout(fail, 10000);
			Reflect.set(window, 'onSpotifyIframeApiReady', ready);
			script.src = 'https://open.spotify.com/embed/iframe-api/v1';
			script.async = true;
			script.onerror = fail;
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
	// The gramophone's music: Spotify's player. Once it has started it stays loaded, hidden
	// while the record is off, and picks up where it stopped when the record goes back on.
	// At 80 px, Spotify lays it out compact: just the song that's playing (cover, title,
	// artist), with previous, play or pause, and next. Taller, it adds the track list.
	import { untrack } from 'svelte';

	interface Props {
		/** An open.spotify.com playlist, album, or track. */
		spotify: string;
		on: boolean;
		/** Whether the music is actually playing, as Spotify reports it. */
		onplayback: (playing: boolean) => void;
	}
	let { spotify, on, onplayback }: Props = $props();

	let holder: HTMLDivElement;
	let controller: EmbedController | undefined;
	let begun = false;
	let destroyed = false;
	let failed = $state(false);
	let playing = false;
	// Some browsers (Safari) won't start the music from here; then the player's own
	// play button has to.
	let nudge = $state(false);
	let nudgeTimer = 0;
	let readyTimer = 0;
	let attempt = 0;

	function fail(current: number) {
		if (destroyed || current !== attempt) return;
		attempt++;
		window.clearTimeout(readyTimer);
		window.clearTimeout(nudgeTimer);
		controller?.destroy();
		controller = undefined;
		holder.replaceChildren();
		if (playing) {
			playing = false;
			onplayback(false);
		}
		begun = false;
		failed = true;
		nudge = false;
	}

	function play(embed: EmbedController, how: 'play' | 'resume') {
		embed[how]();
		window.clearTimeout(nudgeTimer);
		nudgeTimer = window.setTimeout(() => (nudge = on && !playing), 3000);
	}

	async function start() {
		if (controller) return play(controller, 'resume');
		// Still loading: `ready` starts it, if the record is still on by then.
		if (begun) return;
		begun = true;
		failed = false;
		const current = ++attempt;
		try {
			const IFrameAPI = await loadApi();
			if (destroyed || current !== attempt) return;
			const slot = document.createElement('div');
			holder.replaceChildren(slot);
			readyTimer = window.setTimeout(() => fail(current), 10000);
			IFrameAPI.createController(slot, { url: spotify, width: '100%', height: 80 }, (embed) => {
				if (destroyed || current !== attempt) return embed.destroy();
				controller = embed;
				holder.querySelector('iframe')?.setAttribute('title', 'Spotify player');
				embed.addListener('ready', () => {
					if (destroyed || current !== attempt) return;
					window.clearTimeout(readyTimer);
					if (on) play(embed, 'play');
				});
				embed.addListener('playback_update', ({ data }) => {
					if (destroyed || current !== attempt) return;
					playing = !data.isPaused;
					if (playing) nudge = false;
					onplayback(playing);
				});
			});
		} catch {
			fail(current);
		}
	}

	$effect(() => {
		if (on) untrack(start);
		else
			untrack(() => {
				controller?.pause();
				window.clearTimeout(nudgeTimer);
				nudge = false;
			});
	});

	// Effects only run in the browser, so this cleanup does too (onDestroy runs on the server).
	$effect(() => () => {
		destroyed = true;
		attempt++;
		window.clearTimeout(readyTimer);
		window.clearTimeout(nudgeTimer);
		controller?.destroy();
	});
</script>

<div class="player" class:failed bind:this={holder}></div>
{#if failed}
	<p class="line" role="status">
		Spotify’s player didn’t load here.
		<a href={spotify} target="_blank" rel="noopener"
			>Listen on Spotify<span aria-hidden="true">&nbsp;↗</span><span class="sr-only">
				(opens in a new tab)</span
			></a
		>
		<button onclick={() => start()}>Retry player</button>
	</p>
{:else if nudge}
	<p class="line">Press play on the player to start the music.</p>
{/if}

<style>
	/* Room for the player while it loads, so the card doesn't jump. */
	.player {
		min-height: 80px;
		border-radius: 12px;
		background: #ece6d3;
	}
	.player.failed {
		display: none;
	}
	.player :global(iframe) {
		display: block;
		border: 0;
		border-radius: 12px;
	}
	.line {
		margin-top: 10px;
		font:
			13px/1.5 system-ui,
			sans-serif;
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
