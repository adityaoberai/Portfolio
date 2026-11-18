<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import WelcomeDialog from '$lib/components/world/WelcomeDialog.svelte';
	import WorldView from '$lib/components/world/WorldView.svelte';
	import IndexView from '$lib/components/index/IndexView.svelte';

	let { data } = $props();
</script>

<PageMeta path="/" />
{#if data.mode === 'index'}
	<IndexView />
{:else if data.mode === 'world'}
	<WorldView />
{:else}
	<WelcomeDialog />
{/if}
