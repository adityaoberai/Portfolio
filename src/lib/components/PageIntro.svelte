<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { StationId } from '$lib/world/layout';
	import { stationById } from '$lib/data/room';

	// Opening of every deep page. `station` links back to the matching object in the room.
	let {
		eyebrow,
		title,
		station,
		children
	}: { eyebrow: string; title: string; station?: StationId; children?: Snippet } = $props();
	const object = $derived(station ? stationById[station] : undefined);
</script>

<header class="page-intro">
	<p class="eyebrow">{eyebrow}</p>
	<h1>{title}</h1>
	{#if children}<div class="lede">{@render children()}</div>{/if}
	{#if object}
		<a class="in-room" href="/world#{object.id}"
			><span aria-hidden="true">⌂</span> In the room: the {object.short} →</a
		>
	{/if}
</header>

<style>
	.page-intro {
		max-width: 760px;
		padding: 64px 0 40px;
	}
	h1 {
		margin-top: 14px;
		font-size: clamp(36px, 5vw, 58px);
		letter-spacing: -0.045em;
		line-height: 1.05;
		font-weight: 500;
	}
	.lede {
		margin-top: 20px;
		font-size: 20px;
		line-height: 1.6;
		color: #55574d;
	}
	.lede :global(p + p) {
		margin-top: 12px;
	}
	.in-room {
		display: inline-flex;
		gap: 8px;
		align-items: center;
		min-height: 44px;
		margin-top: 18px;
		font:
			14px system-ui,
			sans-serif;
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	@media (max-width: 650px) {
		.page-intro {
			padding: 40px 0 28px;
		}
		.lede {
			font-size: 18px;
		}
	}
</style>
