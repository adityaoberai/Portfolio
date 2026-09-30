<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import PageIntro from '$lib/components/PageIntro.svelte';
	import Slab from '$lib/components/world/Slab.svelte';
	import { collection } from '$lib/data/collection';
</script>

<PageMeta
	title="Collection"
	description="Aditya Oberai's Pokémon card collection, with Blastoise in pride of place. The full collection is catalogued on Collectr."
	path="/collection"
/>

<div class="v3-page">
	<PageIntro
		eyebrow="Collection · the shelf"
		title="{collection.favourite} gets the top shelf."
		station="shelf"
	>
		<p>
			I collect {collection.subject}. {collection.favourite} is my favourite Pokémon, so it gets pride
			of place. The shelf in my room holds a few graded slabs, a couple of binders, and some sealed boxes.
		</p>
	</PageIntro>

	<div class="feature">
		<Slab name={collection.favourite} />
		<div>
			<h2>The whole collection lives on Collectr.</h2>
			<p>
				Rather than rebuild a catalogue here, the full collection stays on Collectr, where it’s kept
				up to date.
			</p>
			<p class="cta"><a href={collection.showcaseUrl}>Open the binder on Collectr ↗</a></p>
		</div>
	</div>
</div>

<style>
	.feature {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 48px;
		align-items: center;
		max-width: 860px;
		padding: 40px 0;
		border-top: 1px solid var(--color-hairline);
	}
	h2 {
		font-size: clamp(24px, 3vw, 30px);
		letter-spacing: -0.03em;
		line-height: 1.2;
		font-weight: 500;
	}
	.feature p {
		margin-top: 12px;
		font-size: 18px;
		line-height: 1.6;
		color: var(--color-ink-soft);
	}
	.cta a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	@media (max-width: 650px) {
		.feature {
			grid-template-columns: 1fr;
			gap: 24px;
			justify-items: start;
		}
	}
</style>
