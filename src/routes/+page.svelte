<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import PageMeta from '$lib/components/PageMeta.svelte';
	import WelcomeDialog from '$lib/components/world/WelcomeDialog.svelte';
	import WorldView from '$lib/components/world/WorldView.svelte';
	import IndexView from '$lib/components/index/IndexView.svelte';
	import { stationId } from '$lib/world/journey';

	let { data } = $props();

	afterNavigate(({ to }) => {
		// World already handles station fragments when it is the saved view.
		if (!to || data.mode === 'world' || !stationId(to.url.hash.slice(1))) return;
		const room = new URL(to.url);
		room.pathname = '/world';
		room.searchParams.set('keep-mode', '1');
		void goto(room, { replaceState: true });
	});
</script>

<PageMeta path="/" />
{#if data.mode === 'index'}
	<IndexView />
{:else if data.mode === 'world'}
	<WorldView />
{:else}
	<WelcomeDialog />
{/if}
