<script lang="ts">
	import RecordPlayer from './RecordPlayer.svelte';
	let {
		element = $bindable<HTMLElement>(null!),
		button = $bindable<HTMLButtonElement>(null!),
		soundcloud,
		on,
		expanded,
		compact,
		playing,
		reducedMotion,
		disabled,
		ontoggle,
		onstop,
		onplayback
	}: {
		element?: HTMLElement;
		button?: HTMLButtonElement;
		soundcloud: string;
		on: boolean;
		expanded: boolean;
		compact: boolean;
		playing: boolean;
		reducedMotion: boolean;
		disabled: boolean;
		ontoggle: (expanded: boolean) => void;
		onstop: () => void;
		onplayback: (playing: boolean) => void;
	} = $props();
</script>

<section class="dock" class:compact aria-label="Gramophone" hidden={!on} bind:this={element}>
	<button
		class="music-button"
		bind:this={button}
		hidden={!compact}
		{disabled}
		aria-label="Show player"
		aria-expanded="false"
		aria-controls="music-player"
		onclick={() => ontoggle(true)}
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
		<span>Show player</span>
	</button>
	<div class="dock-top" hidden={compact}>
		<span class="disc" class:turning={playing && !reducedMotion} aria-hidden="true"></span>
		<span class="dock-label">Gramophone</span>
		<div class="dock-actions">
			<button
				aria-label={expanded ? 'Hide player' : 'Show player'}
				title={expanded ? 'Hide player' : 'Show player'}
				aria-expanded={expanded}
				aria-controls="music-player"
				onclick={() => ontoggle(!expanded)}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					{#if expanded}<path d="M5 12h14" />{:else}<rect
							x="3"
							y="4"
							width="18"
							height="16"
							rx="2"
						/><path d="m10 9 5 3-5 3z" />{/if}
				</svg>
				<span>{expanded ? 'Hide' : 'Show'}</span>
			</button>
			<button aria-label="Stop" title="Stop music" onclick={onstop}>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" stroke="none" />
				</svg>
			</button>
		</div>
	</div>
	<div id="music-player" hidden={!expanded}>
		<RecordPlayer {soundcloud} {on} {onplayback} />
	</div>
</section>

<style>
	.dock-top[hidden],
	.music-button[hidden] {
		display: none;
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
		border: 1px solid #c5b58d;
		border-radius: 12px;
		background: #faf7ed;
		color: var(--color-accent);
		font: 500 0.8125rem/1.4 var(--font-ui);
		pointer-events: auto;
		cursor: pointer;
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
	.music-button:disabled {
		background: #faf7edda;
		color: var(--color-secondary);
		border-color: var(--color-hairline-strong);
		opacity: 0.6;
		cursor: default;
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
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		min-width: 44px;
		min-height: 44px;
		padding: 0 8px;
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
		.disc.turning {
			animation: turn 1.8s linear infinite;
		}
		@keyframes turn {
			to {
				transform: rotate(360deg);
			}
		}
	}
	@media (max-width: 820px), (pointer: coarse) {
		.dock {
			width: 100%;
		}
		.dock.compact {
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
	}
</style>
