<script lang="ts">
	import type { CommunityInitiative } from '$lib/data/community';

	let { initiative }: { initiative: CommunityInitiative } = $props();
</script>

<a href="/community#{initiative.slug}" class="group flex flex-col gap-2">
	<h3 class="text-h3 transition-colors group-hover:text-accent">{initiative.title}</h3>
	<p class="line-clamp-3 text-small text-secondary">{initiative.what}</p>
</a>
