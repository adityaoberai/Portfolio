<script lang="ts">
	import { tick } from 'svelte';
	import { page } from '$app/state';
	import { pushState, replaceState } from '$app/navigation';
	import { withWidth } from '$lib/data/photography';
	interface Photo {
		id: string;
		title: string;
		image?: string;
		link?: string;
		externalUrl?: string;
	}
	let {
		photos,
		scope = 'photography',
		panel = false,
		compact = false
	}: { photos: Photo[]; scope?: string; panel?: boolean; compact?: boolean } = $props();
	let viewer: HTMLDialogElement;
	let selected = $state<number | null>(null);
	let opener: HTMLElement | null = null;
	const current = $derived(selected === null ? null : photos[selected]);
	function choose(index: number, event?: MouseEvent) {
		if (
			event &&
			(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
		)
			return;
		event?.preventDefault();
		opener = event?.currentTarget instanceof HTMLElement ? event.currentTarget : opener;
		pushState('', { ...page.state, photo: { scope, id: photos[index].id } });
	}
	function step(direction: number) {
		if (selected === null) return;
		const next = (selected + direction + photos.length) % photos.length;
		replaceState('', { ...page.state, photo: { scope, id: photos[next].id } });
	}
	function dismiss() {
		if (page.state.photo?.scope === scope) history.back();
		else viewer.close();
	}
	function closed() {
		selected = null;
		if (opener?.isConnected) opener.focus({ preventScroll: true });
	}
	$effect(() => {
		const photo = page.state.photo;
		if (!viewer) return;
		const index = photo?.scope === scope ? photos.findIndex((item) => item.id === photo.id) : -1;
		if (index >= 0) {
			selected = index;
			void tick().then(() => {
				if (!viewer?.isConnected || selected !== index) return;
				if (!viewer.open) viewer.showModal();
				viewer.focus({ preventScroll: true });
			});
		} else if (viewer.open) viewer.close();
	});
	function keys(event: KeyboardEvent) {
		event.stopPropagation();
		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			event.preventDefault();
			step(event.key === 'ArrowLeft' ? -1 : 1);
		}
	}
</script>

<ul class="photo-grid" class:panel class:compact aria-label="Photographs">
	{#each photos as photo, i (photo.id)}<li>
			<a
				href={photo.externalUrl ?? photo.link ?? '/photography'}
				onclick={(event) => choose(i, event)}
				aria-label="View photo: {photo.title}"
			>
				<img
					src={withWidth(photo.image, panel ? 400 : 600)}
					srcset="{withWidth(photo.image, 400)} 400w, {withWidth(
						photo.image,
						800
					)} 800w, {withWidth(photo.image, 1200)} 1200w"
					sizes={panel
						? '(max-width: 820px) 90vw, 240px'
						: '(max-width: 650px) 50vw, (max-width: 1100px) 33vw, 400px'}
					alt={photo.title}
					width="600"
					height="750"
					loading={panel || i > 2 ? 'lazy' : 'eager'}
					decoding="async"
				/>
			</a>
			{#if !panel}<p class="caption">{photo.title}</p>{/if}
		</li>{/each}
</ul>
<dialog
	class="photo-viewer"
	bind:this={viewer}
	aria-labelledby="{scope}-photo-title"
	onclose={closed}
	oncancel={(event) => {
		event.preventDefault();
		dismiss();
	}}
	onkeydown={keys}
	tabindex="-1"
>
	{#if current}<header>
			<p>{selected! + 1} of {photos.length}</p>
			<button onclick={dismiss} aria-label="Close photo">Close ×</button>
		</header>
		<figure>
			<img src={withWidth(current.image, 1600)} alt={current.title} width="1200" height="1200" />
			<figcaption>
				<h2 id="{scope}-photo-title">{current.title}</h2>
				{#if current.externalUrl || current.link}<a
						href={current.externalUrl ?? current.link}
						target="_blank"
						rel="noopener">View on Pexels ↗<span class="sr-only"> (opens in a new tab)</span></a
					>{/if}
			</figcaption>
		</figure>
		<nav aria-label="Photo navigation">
			<button onclick={() => step(-1)}>← Previous photo</button><button onclick={() => step(1)}
				>Next photo →</button
			>
		</nav>{/if}
</dialog>

<style>
	.photo-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 24px 16px;
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.photo-grid a {
		display: block;
	}
	.photo-grid img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 4/5;
		object-fit: cover;
		background: var(--color-surface);
		border-radius: 6px;
	}
	.caption {
		margin-top: 10px;
		font: 0.875rem/1.5 var(--font-ui);
		color: var(--color-secondary);
	}
	.panel {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 8px;
		margin-top: 24px;
	}
	.panel img {
		aspect-ratio: 4/3;
	}
	.compact {
		grid-template-columns: 1fr;
	}
	.photo-viewer {
		position: fixed;
		inset: 0;
		width: min(1100px, calc(100vw - 48px));
		height: min(1000px, 94dvh);
		max-width: none;
		max-height: 94dvh;
		margin: auto;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 0 24px 16px;
		background: var(--color-paper);
		color: var(--color-ink);
		border: 0;
		border-radius: 14px;
		box-shadow: 0 20px 80px #1f262050;
	}
	.photo-viewer::backdrop {
		background: #1f2620cc;
	}
	.photo-viewer:focus {
		outline: none;
	}
	header {
		position: sticky;
		top: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 8px 0;
		background: var(--color-paper);
		font: 0.9375rem/1.5 var(--font-ui);
	}
	button {
		min-height: 44px;
		padding: 8px 12px;
		cursor: pointer;
		font: 0.9375rem/1.4 var(--font-ui);
		color: var(--color-accent);
	}
	figure {
		margin: 0;
	}
	figure img {
		display: block;
		width: 100%;
		height: min(66dvh, 720px);
		object-fit: contain;
		background: #eeeee3;
	}
	figcaption {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 12px 24px;
		padding-top: 16px;
	}
	h2 {
		max-width: 55ch;
		font: 500 1.375rem/1.3 var(--font-serif);
	}
	figcaption a {
		font: 0.875rem/1.5 var(--font-ui);
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
		min-height: 44px;
		display: inline-flex;
		align-items: center;
	}
	nav {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		margin-top: 12px;
	}
	@media (max-width: 650px) {
		.photo-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 20px 12px;
		}
		.photo-grid.compact {
			grid-template-columns: 1fr;
		}
		.photo-viewer {
			width: 100%;
			padding-inline: 16px;
			border-radius: 14px 14px 0 0;
			margin: auto 0 0;
		}
		figure img {
			height: 60dvh;
		}
	}
</style>
