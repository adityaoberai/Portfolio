<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { StationId } from '$lib/world/layout';
	import { stationById } from '$lib/data/room';

	// Opening of every deep page. `station` links back to the matching object in the room.
	let { title, station, children }: { title: string; station?: StationId; children?: Snippet } =
		$props();
	const object = $derived(station ? stationById[station] : undefined);
</script>

<header class="page-intro">
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
		margin-top: 0;
		font-size: var(--type-page);
		letter-spacing: -0.02em;
		line-height: 1.12;
		font-weight: 500;
	}
	.lede {
		margin-top: 20px;
		font-size: var(--type-lead);
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
			font-size: var(--type-lead);
		}
	}
</style>
