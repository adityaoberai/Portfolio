<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import PageIntro from '$lib/components/PageIntro.svelte';
	import { ofType } from '$lib/data/artifacts';
	import { cameraBody, pexelsProfile, photoPlaces, withWidth } from '$lib/data/photography';
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
	<PageIntro
		eyebrow="Photography · the camera"
		title="Hallways, cities, people mid-laugh."
		station="camera"
	>
		<p>
			Photography started as a conference habit and turned into a serious pursuit. I shoot on a
			{cameraBody}, and my archive on Pexels is free for anyone to use.
		</p>
	</PageIntro>

	<p class="exif" aria-label="Camera and places">
		<span>{cameraBody}</span>{#each photoPlaces as place (place)}<span>{place}</span>{/each}
	</p>

	<ul class="grid" aria-label="Photographs">
		{#each photos as photo, i (photo.id)}
			<li>
				<a href={photo.externalUrl}>
					<img
						src={withWidth(photo.image, 600)}
						srcset="{withWidth(photo.image, 400)} 400w, {withWidth(
							photo.image,
							800
						)} 800w, {withWidth(photo.image, 1200)} 1200w"
						sizes="(max-width: 650px) 50vw, (max-width: 1100px) 33vw, 360px"
						alt={photo.title}
						width="600"
						height="750"
						loading={i < 3 ? 'eager' : 'lazy'}
						decoding="async"
					/>
					<span class="caption">{photo.title}</span>
				</a>
			</li>
		{/each}
	</ul>

	<p class="cta">
		<a href={pexelsProfile}>The full archive on Pexels ↗</a>
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
		font:
			12px/1.4 ui-monospace,
			monospace;
		color: var(--color-ink-soft);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.grid a {
		display: block;
	}
	.grid img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 4 / 5;
		object-fit: cover;
		background: var(--color-surface);
		border-radius: 3px;
	}
	.caption {
		display: block;
		margin-top: 8px;
		font-size: 15px;
		line-height: 1.4;
		color: var(--color-secondary);
	}
	.grid a:hover .caption {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 3px;
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
	@media (max-width: 1100px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	@media (max-width: 650px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 10px;
		}
		.caption {
			font-size: 13px;
		}
	}
</style>
