<script lang="ts">
	import ModeSwitch from '$lib/components/ModeSwitch.svelte';
	import BengaluruTime from '$lib/components/BengaluruTime.svelte';
	import { curiosities, stations } from '$lib/data/room';
	import type { CuriosityId, StationId } from '$lib/world/layout';
	let {
		element = $bindable<HTMLDivElement>(null!),
		lowQuality = $bindable(false),
		reducedMotion = $bindable(false),
		near,
		ready,
		musicOn,
		onvisit,
		oncuriosity,
		onpoem,
		onmusic,
		onsetting,
		ontoggle
	}: {
		element?: HTMLDivElement;
		lowQuality?: boolean;
		reducedMotion?: boolean;
		near?: StationId | null;
		ready: boolean;
		musicOn: boolean;
		onvisit: (id: StationId, event: MouseEvent) => void;
		oncuriosity: (id: CuriosityId) => void;
		onpoem: (id: CuriosityId) => void;
		onmusic: () => void;
		onsetting: (setting: 'view' | 'low_power' | 'less_motion', value?: boolean) => void;
		ontoggle: (event: ToggleEvent) => void;
	} = $props();
</script>

<div id="room-menu" class="menu" popover bind:this={element} {ontoggle}>
	<div class="menu-head">
		<h2>In the room</h2>
		<button popovertarget="room-menu" popovertargetaction="hide" aria-label="Close the menu"
			>×</button
		>
	</div>
	<div class="menu-surface"><ModeSwitch /></div>
	<nav aria-label="In the room">
		<ul class="guide">
			{#each stations as station (station.id)}<li class:is-near={near === station.id}>
					<a
						href={station.href}
						onclick={(event) => onvisit(station.id, event)}
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
					{#if item.poem}<button onclick={() => onpoem(id as CuriosityId)}
							>Read “{item.poem.title}”</button
						>{:else if item.music}<button onclick={onmusic}
							>{musicOn ? 'Stop the record' : 'Put the record on'}</button
						>{:else}<button
							onclick={() => {
								element.hidePopover();
								oncuriosity(id as CuriosityId);
							}}>Take a look</button
						>{/if}
				</li>{/each}
		</ul>
	</details>
	<details class="settings">
		<summary>Room settings</summary>
		<div>
			<button onclick={() => onsetting('view')} disabled={!ready}>Reset view</button><label
				><input
					type="checkbox"
					bind:checked={lowQuality}
					onchange={(event) => onsetting('low_power', event.currentTarget.checked)}
				/> Low power</label
			><label
				><input
					type="checkbox"
					bind:checked={reducedMotion}
					onchange={(event) => onsetting('less_motion', event.currentTarget.checked)}
				/> Less motion</label
			>
		</div>
	</details>
</div>

<style>
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
	.destination-label {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 4px 12px;
	}
	@media (max-width: 820px), (pointer: coarse) {
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
	}
</style>
