<script lang="ts">
	import type { Snippet } from 'svelte';

	let { href, children }: { href: string; children: Snippet } = $props();
</script>

<a {href} target="_blank" rel="noopener noreferrer" class="prose-link">
	{@render children()}<span class="ext" aria-hidden="true">&nbsp;↗</span><span class="sr-only"
		>(opens in new tab)</span
	>
</a>
