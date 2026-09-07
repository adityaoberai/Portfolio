<script lang="ts">
	import type { Talk } from '$lib/data/talks';

	let { talk }: { talk: Talk } = $props();
</script>

<article
	class="flex flex-col gap-3 rounded-md border border-hairline p-6 transition-colors duration-150 hover:border-hairline-strong"
>
	<p class="meta">{talk.event} · {talk.year}</p>
	<h3 class="text-h3">{talk.title}</h3>
	<p class="text-small text-secondary">{talk.description}</p>
	{#if talk.recording}
		<p class="mt-auto pt-1">
			<a
				href={talk.recording}
				target="_blank"
				rel="noopener noreferrer"
				class="prose-link text-small"
				>Watch recording<span class="ext" aria-hidden="true">&nbsp;↗</span><span class="sr-only"
					>(opens in new tab)</span
				></a
			>
		</p>
	{/if}
</article>
