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
	{#if talk.recording || talk.slides}
		<p class="mt-auto flex flex-wrap gap-x-5 gap-y-1 pt-1">
			{#if talk.recording}
				<a
					href={talk.recording}
					target="_blank"
					rel="noopener noreferrer"
					class="prose-link text-small"
					>Watch recording<span class="ext" aria-hidden="true">&nbsp;↗</span><span class="sr-only"
						>(opens in new tab)</span
					></a
				>
			{/if}
			{#if talk.slides}
				<a
					href={talk.slides}
					target="_blank"
					rel="noopener noreferrer"
					class="prose-link text-small"
					>View slides<span class="ext" aria-hidden="true">&nbsp;↗</span><span class="sr-only"
						>(opens in new tab)</span
					></a
				>
			{/if}
		</p>
	{/if}
</article>
