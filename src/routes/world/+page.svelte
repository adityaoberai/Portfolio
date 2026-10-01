<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import WorldView from '$lib/components/world/WorldView.svelte';
	import { page } from '$lib/data/room';
</script>

<PageMeta title="My world" path="/world" description={page.description} />
<WorldView />
