<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import WorldView from '$lib/components/world/WorldView.svelte';
	import IndexView from '$lib/components/index/IndexView.svelte';

	let { data } = $props();
</script>

<PageMeta path="/" />
<!-- The mode comes from the server (cookie), so the right view is in the first HTML. -->
{#if data.mode === 'index'}
	<IndexView />
{:else}
	<WorldView />
{/if}
