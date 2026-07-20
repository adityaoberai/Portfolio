<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import IndexRow from '$lib/components/IndexRow.svelte';
	import { workThemes } from '$lib/data/work';
</script>

<PageMeta
	title="Work"
	description="Aditya Oberai's professional work, organized by theme: developer relations, product storytelling, community, developer experience, and recognition."
	path="/work"
/>

<div class="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-24">
	<header class="max-w-2xl">
		<p class="eyebrow">Work</p>
		<h1 class="mt-6 text-h1">The work, by theme.</h1>
		<p class="mt-6 text-lede italic text-secondary">
			Job titles say less than the work does, so here it is, organized by what it was for rather
			than where it happened.
		</p>
	</header>

	{#each workThemes as theme (theme.slug)}
		<section id={theme.slug} class="scroll-mt-8 pt-16 md:pt-24">
			<SectionHeader number={theme.number} label={theme.title} lede={theme.summary} />
			<div class="-mx-4 mt-6 divide-y divide-hairline border-b border-t border-hairline">
				{#each theme.items as item (item.title)}
					<IndexRow
						meta={item.tag}
						title={item.title}
						description={item.description}
						href={item.link?.href}
						external={Boolean(item.link)}
					/>
				{/each}
			</div>
		</section>
	{/each}
</div>
