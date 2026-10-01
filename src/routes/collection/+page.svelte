<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import PageIntro from '$lib/components/PageIntro.svelte';
	import Slab from '$lib/components/world/Slab.svelte';
	import {
		CARD_IMAGE_HEIGHT,
		CARD_IMAGE_WIDTH,
		cardImage,
		collection,
		favouriteCards
	} from '$lib/data/collection';

	const favourite = favouriteCards.find((card) => card.name === collection.favourite);
</script>

<PageMeta
	title="Collection"
	description="Aditya Oberai's Pokémon card collection: Blastoise in pride of place, a few favourite cards, and the full collection on Collectr."
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
		<Slab
			name={collection.favourite}
			image={favourite && cardImage(favourite)}
			alt={favourite?.alt}
			caption={favourite && `${favourite.set} · ${favourite.number}`}
		/>
		<div>
			<h2>The whole collection lives on Collectr.</h2>
			<p>
				Rather than rebuild a catalogue here, the full collection stays on Collectr, where it’s kept
				up to date.
			</p>
			<p class="cta"><a href={collection.showcaseUrl}>Open the binder on Collectr ↗</a></p>
		</div>
	</div>

	<section class="favourites" aria-labelledby="favourites-title">
		<h2 id="favourites-title">A few favourites</h2>
		<ul>
			{#each favouriteCards as card (card.id)}
				<li id={card.id}>
					<img
						src={cardImage(card)}
						alt={card.alt}
						loading="lazy"
						decoding="async"
						width={CARD_IMAGE_WIDTH}
						height={CARD_IMAGE_HEIGHT}
					/>
					<h3>
						{card.name}{#if card.printedName}<span class="printed" lang="ja"
								>{card.printedName}</span
							>{/if}
					</h3>
					<p class="set">{card.set} · {card.number}</p>
					<p class="meta">{card.language} · Illustrated by {card.illustrator}</p>
					{#if card.note}<p class="note">{card.note}</p>{/if}
				</li>
			{/each}
		</ul>
	</section>
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
	.favourites {
		padding: 40px 0 8px;
		border-top: 1px solid var(--color-hairline);
	}
	.favourites ul {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
		gap: 32px 24px;
		margin: 24px 0 0;
		padding: 0;
		list-style: none;
	}
	.favourites li {
		scroll-margin-top: 96px;
	}
	.favourites img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 63 / 88;
		object-fit: cover;
		border-radius: 4.5% / 3.2%;
		background: var(--color-hairline);
		box-shadow: 0 10px 24px #2a3f3a2e;
	}
	h3 {
		margin-top: 16px;
		font-size: 20px;
		line-height: 1.3;
		font-weight: 500;
	}
	.printed {
		margin-left: 8px;
		font-size: 15px;
		color: var(--color-ink-soft);
	}
	.set,
	.meta,
	.note {
		margin-top: 4px;
		font-size: 15px;
		line-height: 1.5;
		color: var(--color-ink-soft);
	}
	.meta {
		font-size: 13px;
	}
	@media (max-width: 650px) {
		.feature {
			grid-template-columns: 1fr;
			gap: 24px;
			justify-items: start;
		}
	}
</style>
