<script lang="ts">
	import { page } from '$app/state';
	import { roomJourney } from '$lib/world/journey';
	import { stationById } from '$lib/data/room';
	import { trackEvent } from '$lib/analytics';
	const path = $derived(page.url.pathname.replace(/\/$/, ''));
	const inRoom = $derived(path === '/world' || (path === '' && page.data.mode !== 'index'));
	const station = $derived($roomJourney?.station);
	const section = $derived(station ? stationById[station]?.section : null);
	const roomHref = $derived(`/world${$roomJourney?.panel ? `#${$roomJourney.panel}` : ''}`);
	const paperHref = $derived(`/index${section && section !== 'now' ? `#${section}` : ''}`);
</script>

<nav class="surface-link" aria-label="Explore another way">
	<a
		href={inRoom ? paperHref : roomHref}
		data-sveltekit-preload-data="off"
		onclick={() =>
			trackEvent('mode_switched', {
				from: inRoom ? 'world' : 'index',
				to: inRoom ? 'index' : 'world'
			})}
	>
		{inRoom ? 'See it on paper' : 'Step into my room'}<span aria-hidden="true">↗</span>
	</a>
</nav>

<style>
	.surface-link {
		flex-shrink: 0;
		font: 500 var(--type-ui) / 1.4 var(--font-ui);
	}
	a {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		min-height: 44px;
		padding: 8px 0;
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 5px;
		text-decoration-color: #b7bda5;
	}
	a:hover {
		text-decoration-color: currentColor;
	}
	span {
		font-size: 1.1em;
	}
	@media (max-width: 380px) {
		.surface-link {
			font-size: 0.875rem;
		}
		a {
			gap: 5px;
		}
	}
</style>
