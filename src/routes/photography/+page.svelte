<script lang="ts">
	import PhotoGallery from '$lib/components/PhotoGallery.svelte';
	import PageMeta from '$lib/components/PageMeta.svelte';
	import PageIntro from '$lib/components/PageIntro.svelte';
	import { ofType } from '$lib/data/artifacts';
	import { cameraBody, pexelsProfile, photoPlaces } from '$lib/data/photography';
	import { communityInitiatives } from '$lib/data/community';

	const photos = ofType('photo');
	const walks = communityInitiatives.find((c) => c.slug === 'photo-walks');
</script>

<PageMeta
	title="Photography"
	description="Street and travel photography by Aditya Oberai from Bengaluru, Toronto, Jaipur and beyond, free for anyone to use on Pexels."
	path="/photography"
/>

<div class="v3-page">
	<PageIntro title="Hallways, cities, people mid-laugh." station="camera">
		<p>
			Photography started as a conference habit and turned into a serious pursuit. I shoot on a
			{cameraBody}, and my archive on Pexels is free for anyone to use.
		</p>
	</PageIntro>

	<p class="exif" aria-label="Camera and places">
		<span>{cameraBody}</span>{#each photoPlaces as place (place)}<span>{place}</span>{/each}
	</p>

	<PhotoGallery {photos} />

	<p class="cta">
		<a href={pexelsProfile} target="_blank" rel="noopener">The full archive on Pexels ↗</a>
		{#if walks}<a href="/community#photo-walks">{walks.title}: come shoot with us →</a>{/if}
	</p>
</div>

<style>
	.exif {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 0 0 24px;
	}
	.exif span {
		padding: 4px 8px;
		border: 1px solid var(--color-hairline-strong);
		border-radius: 3px;
		font: var(--type-meta) / 1.4 var(--font-ui);
		color: var(--color-ink-soft);
	}
	.cta {
		display: flex;
		flex-wrap: wrap;
		gap: 0 28px;
		margin-top: 32px;
	}
	.cta a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
</style>
