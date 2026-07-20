<script lang="ts">
	import { page } from '$app/state';
	import NotFound from '$lib/components/NotFound.svelte';
</script>

<svelte:head>
	<title>Page not found · Aditya Oberai</title>
</svelte:head>

<NotFound status={page.status} />
