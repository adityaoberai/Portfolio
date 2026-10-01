<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import PageIntro from '$lib/components/PageIntro.svelte';
	import { communityInitiatives } from '$lib/data/community';
	import { workThemes } from '$lib/data/work';

	// People first: what it is, why it exists, and who it's for come before any numbers.
	const facets = [
		{ term: 'What', key: 'what' },
		{ term: 'Why', key: 'why' },
		{ term: 'Who', key: 'who' },
		{ term: 'Impact', key: 'impact' }
	] as const;
	const programs = workThemes.find((t) => t.slug === 'community')?.items ?? [];
</script>

<PageMeta
	title="Community"
	description="The community initiatives Aditya Oberai has built and grown: The Writers' Room, Photo Walks, Doon Tech Community, HackOn, and DevRelCon Bengaluru."
	path="/community"
/>

<div class="v3-page">
	<PageIntro
		eyebrow="Community · the corkboard"
		title="Bringing people together."
		station="corkboard"
	>
		<p>
			Developer tools are only half the story. These are the programs and gatherings I've started or
			grown, each one built around people first.
		</p>
	</PageIntro>

	<nav class="toc" aria-label="Initiatives on this page">
		{#each communityInitiatives as initiative (initiative.slug)}
			<a href="#{initiative.slug}">{initiative.title}</a>
		{/each}
	</nav>

	{#each communityInitiatives as initiative, i (initiative.slug)}
		<section
			class="v3-section initiative"
			id={initiative.slug}
			aria-labelledby="{initiative.slug}-title"
		>
			<h2 id="{initiative.slug}-title">
				<span class="n">{String(i + 1).padStart(2, '0')}</span>{initiative.title}
			</h2>
			<dl>
				{#each facets as { term, key } (key)}
					<div>
						<dt>{term}</dt>
						<dd>{initiative[key]}</dd>
					</div>
				{/each}
			</dl>
			{#if initiative.links}
				<p class="links">
					{#each initiative.links as link (link.href)}
						<a href={link.href}
							>{link.label}<span aria-hidden="true">&nbsp;↗</span><span class="sr-only">
								(external site)</span
							></a
						>
					{/each}
				</p>
			{/if}
		</section>
	{/each}

	<section class="v3-section" aria-labelledby="programs-title">
		<h2 id="programs-title"><span class="n">06</span>Community programs at Appwrite</h2>
		<ul class="programs">
			{#each programs as program (program.title)}
				<li>
					<h3>{program.title}</h3>
					<p>{program.description}</p>
				</li>
			{/each}
		</ul>
	</section>
</div>

<style>
	.toc {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 24px;
		padding-bottom: 32px;
	}
	.toc a {
		display: inline-flex;
		align-items: center;
		min-height: 40px;
		font-size: 17px;
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.initiative {
		scroll-margin-top: 24px;
	}
	dl {
		display: grid;
		gap: 14px;
		max-width: 780px;
		margin: 20px 0 0;
		padding-left: 20px;
		border-left: 2px solid var(--color-hairline-strong);
	}
	dl div {
		display: grid;
		grid-template-columns: 80px 1fr;
		gap: 16px;
	}
	dt {
		padding-top: 3px;
		font:
			11px/1.5 system-ui,
			sans-serif;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-secondary);
	}
	dd {
		margin: 0;
		font-size: 17px;
		line-height: 1.6;
		color: var(--color-ink-soft);
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0 24px;
		margin-top: 12px;
		padding-left: 22px;
	}
	.links a {
		display: inline-flex;
		align-items: center;
		min-height: 40px;
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.programs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 20px 32px;
		margin: 20px 0 0;
		padding: 0;
		list-style: none;
	}
	.programs h3 {
		font-size: 20px;
		font-weight: 500;
	}
	.programs p {
		margin-top: 6px;
		font-size: 16px;
		line-height: 1.55;
		color: var(--color-secondary);
	}
	@media (max-width: 650px) {
		dl div {
			grid-template-columns: 1fr;
			gap: 2px;
		}
	}
</style>
