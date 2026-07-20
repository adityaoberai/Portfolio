<script lang="ts">
	import type { Project } from '$lib/data/projects';

	let { project }: { project: Project } = $props();
</script>

<article
	class="flex flex-col gap-3 rounded-md border border-hairline p-6 transition-colors duration-150 hover:border-hairline-strong"
>
	<h3 class="text-h3">{project.name}</h3>
	<p class="text-small text-secondary">{project.overview}</p>
	<p class="text-small">{project.motivation}</p>
	<p class="text-small italic text-secondary">{project.outcome}</p>
	<p class="meta mt-auto pt-2">{project.technologies.join(', ')}</p>
	<p class="flex gap-4">
		{#each project.links as { label, href } (href)}
			<a {href} target="_blank" rel="noopener noreferrer" class="prose-link text-small">
				{label}<span class="ext" aria-hidden="true">&nbsp;↗</span><span class="sr-only"
					>(opens in new tab)</span
				>
			</a>
		{/each}
	</p>
</article>
