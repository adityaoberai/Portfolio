<script lang="ts">
	import type { Project } from '$lib/data/projects';

	let { project }: { project: Project } = $props();
</script>

<article
	class="flex flex-col rounded-md border border-hairline p-6 transition-colors duration-150 hover:border-hairline-strong"
>
	<div class="flex flex-col gap-3">
		<h3 class="text-h3">{project.name}</h3>
		<p class="text-small text-secondary">{project.overview}</p>
		<p class="text-small">{project.motivation}</p>
		<p class="text-small italic text-secondary">{project.outcome}</p>
	</div>
	<div class="mt-auto flex flex-col gap-3 pt-6">
		<p class="meta">{project.technologies.join(', ')}</p>
		<p class="flex flex-wrap gap-x-5 gap-y-1">
			{#each project.links as { label, href } (href)}
				<a {href} target="_blank" rel="noopener noreferrer" class="prose-link text-small">
					{label}<span class="ext" aria-hidden="true">&nbsp;↗</span><span class="sr-only"
						>(opens in new tab)</span
					>
				</a>
			{/each}
		</p>
	</div>
</article>
