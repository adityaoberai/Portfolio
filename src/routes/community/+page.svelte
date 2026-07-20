<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import { communityInitiatives } from '$lib/data/community';

	const numbered = communityInitiatives.map((initiative, i) => ({
		...initiative,
		number: String(i + 1).padStart(2, '0')
	}));

	const facets = [
		{ term: 'What', key: 'what' },
		{ term: 'Why', key: 'why' },
		{ term: 'Who', key: 'who' },
		{ term: 'Impact', key: 'impact' }
	] as const;
</script>

<PageMeta
	title="Community"
	description="The community initiatives Aditya Oberai has built and grown: The Writers' Room, Photo Walks, Doon Tech Community, HackOn, and DevRelCon Bengaluru."
	path="/community"
/>

<div class="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-24">
	<header class="max-w-2xl">
		<p class="eyebrow">Community</p>
		<h1 class="mt-6 text-h1">Bringing people together.</h1>
		<p class="mt-6 text-lede italic text-secondary">
			Developer tools are only half the story. These are the programs and gatherings I've started or
			grown, each one built around people first.
		</p>
	</header>

	{#each numbered as initiative (initiative.slug)}
		<section id={initiative.slug} class="scroll-mt-8 pt-16 md:pt-24">
			<p class="eyebrow">
				<span class="text-accent">{initiative.number}</span> <span aria-hidden="true">·</span> Initiative
			</p>
			<h2 class="mt-3 text-h2">{initiative.title}</h2>
			<dl class="mt-6 max-w-2xl space-y-5 border-l border-hairline pl-6">
				{#each facets as { term, key } (key)}
					<div>
						<dt class="eyebrow">{term}</dt>
						<dd class="mt-1 text-small">{initiative[key]}</dd>
					</div>
				{/each}
			</dl>
			{#if initiative.links}
				<p class="mt-5 flex flex-wrap gap-x-6 gap-y-2 pl-6">
					{#each initiative.links as { label, href } (href)}
						<a {href} target="_blank" rel="noopener noreferrer" class="prose-link text-small"
							>{label}<span class="ext" aria-hidden="true">&nbsp;↗</span><span class="sr-only"
								>(opens in new tab)</span
							></a
						>
					{/each}
				</p>
			{/if}
		</section>
	{/each}
</div>
