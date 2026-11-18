<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page as room } from '$lib/data/room';
	import { site } from '$lib/data/site';
	import { stationId } from '$lib/world/journey';

	let dialog: HTMLDialogElement;

	onMount(() => {
		// Fragments are only available in the browser. Keep old shared station URLs working.
		const station = stationId(location.hash.slice(1));
		if (station) {
			void goto(`/world${location.search}#${station}`, { replaceState: true });
			return;
		}
		// The server renders the open dialog. Upgrade it to a native modal for keyboard focus.
		dialog.close();
		dialog.showModal();
	});

	function enterOnEscape(event: Event) {
		event.preventDefault();
		void goto('/world', { replaceState: true });
	}
</script>

<div class="room-preview" aria-hidden="true">
	<img src="/room-still.jpg" width="1440" height="1000" alt="" />
</div>

<dialog
	bind:this={dialog}
	open
	aria-modal="true"
	aria-labelledby="welcome-title"
	aria-describedby="welcome-intro"
	oncancel={enterOnEscape}
>
	<h1 id="welcome-title">{room.title}</h1>
	<p id="welcome-intro">
		I'm {site.name}, {site.role}. I work on product launches, developer docs, and community
		programs.
	</p>
	<div class="actions" data-sveltekit-preload-data="off" data-sveltekit-replacestate="true">
		<a class="btn-primary" href="/world">Enter the room <span aria-hidden="true">→</span></a>
		<a class="prose-link" href="/index">See it on paper</a>
	</div>
</dialog>

<style>
	.room-preview {
		position: fixed;
		inset: 0;
		background: #e9ebdf;
	}
	.room-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.room-preview::after {
		position: absolute;
		inset: 0;
		background: #1f262050;
		content: '';
	}
	dialog {
		position: fixed;
		inset: 0;
		width: min(calc(100% - 32px), 540px);
		height: fit-content;
		max-height: calc(100dvh - 32px);
		margin: auto;
		padding: clamp(24px, 6vw, 40px);
		overflow: auto;
		border: 1px solid var(--color-hairline-strong);
		border-radius: 12px;
		background: var(--color-paper);
		color: var(--color-ink);
		box-shadow: 0 20px 80px #1f262040;
	}
	dialog::backdrop {
		background: transparent;
	}
	h1 {
		max-width: 19ch;
		font-size: var(--type-page);
		font-weight: 500;
		line-height: 1.08;
		letter-spacing: -0.02em;
		text-wrap: balance;
	}
	p {
		margin-top: 16px;
		color: var(--color-ink-soft);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 20px;
		margin-top: 24px;
	}
	.actions a {
		display: inline-flex;
		min-height: 44px;
		align-items: center;
		font: 500 var(--type-ui) / 1.4 var(--font-ui);
	}
</style>
