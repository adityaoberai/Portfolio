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
		api ??= new Promise<IFrameAPI>((resolve, reject) => {
			Reflect.set(window, 'onSpotifyIframeApiReady', resolve);
			const script = document.createElement('script');
			script.src = 'https://open.spotify.com/embed/iframe-api/v1';
			script.async = true;
			script.onerror = () => {
				script.remove();
				api = undefined;
				reject(new Error('Spotify’s player did not load'));
			};
			document.head.append(script);
		});
		return api;
	}
</script>

<script lang="ts">
	// The gramophone's music: Spotify's player, in the gramophone's sheet. Once it has
	// started it stays loaded, playing on while the sheet is closed, and picks up where
	// it stopped when the record goes back on.
	import { untrack } from 'svelte';

	interface Props {
		/** An open.spotify.com playlist, album, or track. */
		spotify: string;
		on: boolean;
		height: number;
		/** Whether the music is actually playing, as Spotify reports it. */
		onplayback: (playing: boolean) => void;
	}
	let { spotify, on, height, onplayback }: Props = $props();

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
		try {
			const IFrameAPI = await loadApi();
			if (destroyed) return;
			const slot = document.createElement('div');
			holder.replaceChildren(slot);
			IFrameAPI.createController(slot, { url: spotify, width: '100%', height }, (embed) => {
				if (destroyed) return embed.destroy();
				controller = embed;
				holder.querySelector('iframe')?.setAttribute('title', 'Spotify player');
				embed.addListener('ready', () => {
					if (on) play(embed, 'play');
				});
				embed.addListener('playback_update', ({ data }) => {
					playing = !data.isPaused;
					if (playing) nudge = false;
					onplayback(playing);
				});
			});
		} catch {
			begun = false;
			failed = true;
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
		window.clearTimeout(nudgeTimer);
		controller?.destroy();
	});
</script>

<div class="player" class:failed bind:this={holder} style:min-height="{height}px"></div>
{#if failed}
	<p class="line">
		Spotify’s player didn’t load here.
		<a href={spotify} target="_blank" rel="noopener"
			>Listen on Spotify<span aria-hidden="true">&nbsp;↗</span><span class="sr-only">
				(opens in a new tab)</span
			></a
		>
	</p>
{:else if nudge}
	<p class="line">Press play on the player to start the music.</p>
{/if}

<style>
	/* Room for the player while it loads, so the sheet doesn't jump. */
	.player {
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
	.line a {
		color: #304e42;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
