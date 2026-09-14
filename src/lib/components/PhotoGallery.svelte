<script lang="ts">
	import { onMount } from 'svelte';
	import type { Photo } from '$lib/data/photos';

	let { photos }: { photos: Photo[] } = $props();

	const isLandscape = (p: Photo) => p.width > p.height;

	function shuffle<T>(items: T[]): T[] {
		const arr = [...items];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	function pick(pool: Photo[], random: boolean) {
		const landscapes = pool.filter(isLandscape);
		const portraits = pool.filter((p) => !isLandscape(p));
		return {
			landscapes: (random ? shuffle(landscapes) : landscapes).slice(0, 4),
			portrait: (random ? shuffle(portraits) : portraits)[0]
		};
	}

	// Server renders the curated order; each visit swaps in a random pick.
	let selection = $state(pick(photos, false));

	onMount(() => {
		selection = pick(photos, true);
	});

	// Desktop spread: two landscapes stacked left, portrait spanning the
	// centre, two landscapes stacked right. Mobile: one column, landscapes only.
	const slots = [
		'md:col-start-1 md:row-start-1',
		'md:col-start-1 md:row-start-2',
		'md:col-start-3 md:row-start-1',
		'md:col-start-3 md:row-start-2'
	];
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-[9fr_8fr_9fr] md:grid-rows-2 md:gap-6">
	{#each selection.landscapes as photo, i (photo.href)}
		<a
			href={photo.href}
			target="_blank"
			rel="noopener noreferrer"
			class="block rounded-md border border-hairline p-1.5 transition-colors duration-150 hover:border-hairline-strong {slots[
				i
			]}"
		>
			<img
				src={photo.src}
				alt={photo.alt}
				width={photo.width}
				height={photo.height}
				loading="lazy"
				class="w-full rounded-[3px]"
			/>
			<span class="sr-only">View on Pexels (opens in new tab)</span>
		</a>
	{/each}
	{#if selection.portrait}
		<a
			href={selection.portrait.href}
			target="_blank"
			rel="noopener noreferrer"
			class="hidden rounded-md border border-hairline p-1.5 transition-colors duration-150 hover:border-hairline-strong md:col-start-2 md:row-start-1 md:row-span-2 md:block"
		>
			<img
				src={selection.portrait.src}
				alt={selection.portrait.alt}
				width={selection.portrait.width}
				height={selection.portrait.height}
				loading="lazy"
				class="h-full w-full rounded-[3px] object-cover"
			/>
			<span class="sr-only">View on Pexels (opens in new tab)</span>
		</a>
	{/if}
</div>
