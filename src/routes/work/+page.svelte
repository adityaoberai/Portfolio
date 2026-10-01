<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import PageIntro from '$lib/components/PageIntro.svelte';
	import { workThemes } from '$lib/data/work';
	import { site } from '$lib/data/site';
</script>

<PageMeta
	title="Work"
	description="Aditya Oberai's professional work, organized by theme: developer relations, product storytelling, community, developer experience, and recognition."
	path="/work"
/>

<div class="v3-page">
	<PageIntro eyebrow="Work · {site.role}" title="The work, by theme." station="desk">
		<p>
			Job titles say less than the work does, so here it is, organized by what it was for rather
			than where it happened.
		</p>
	</PageIntro>

	<nav class="toc" aria-label="Themes on this page">
		{#each workThemes as theme (theme.slug)}
			<a href="#{theme.slug}"><span>{theme.number}</span> {theme.title}</a>
		{/each}
	</nav>

	{#each workThemes as theme (theme.slug)}
		<section class="v3-section theme" id={theme.slug} aria-labelledby="{theme.slug}-title">
			<h2 id="{theme.slug}-title"><span class="n">{theme.number}</span>{theme.title}</h2>
			<p class="summary">{theme.summary}</p>
			<ul class="items">
				{#each theme.items as item (item.title)}
					<li>
						<span class="tag">{item.tag}</span>
						<div>
							<h3>{item.title}</h3>
							<p>{item.description}</p>
							{#if item.link}<a href={item.link.href}
									>{item.link.label}<span aria-hidden="true">&nbsp;↗</span><span class="sr-only">
										(external site)</span
									></a
								>{/if}
						</div>
					</li>
				{/each}
			</ul>
		</section>
	{/each}

	<p class="next">
		<a href="/projects">Things I’ve built →</a><a href="/speaking">Where I’ve spoken →</a><a
			href="/resume">Résumé (PDF) →</a
		>
	</p>
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
		gap: 6px;
		min-height: 40px;
		font-size: 17px;
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.toc span {
		font:
			11px system-ui,
			sans-serif;
		color: var(--color-secondary);
	}
	.theme {
		scroll-margin-top: 24px;
	}
	.summary {
		max-width: 680px;
		margin-top: 12px;
		font-size: 18px;
		line-height: 1.6;
		color: var(--color-secondary);
	}
	.items {
		margin: 20px 0 0;
		padding: 0;
		list-style: none;
	}
	.items li {
		display: grid;
		grid-template-columns: 130px 1fr;
		gap: 22px;
		padding: 20px 0;
		border-top: 1px solid var(--color-hairline);
	}
	.tag {
		padding-top: 6px;
		font:
			11px/1.5 system-ui,
			sans-serif;
		letter-spacing: 0.1em;
		color: var(--color-secondary);
	}
	h3 {
		font-size: 22px;
		line-height: 1.3;
		font-weight: 500;
	}
	.items p {
		max-width: 720px;
		margin-top: 6px;
		font-size: 17px;
		line-height: 1.6;
		color: var(--color-ink-soft);
	}
	.items a,
	.next a {
		display: inline-flex;
		align-items: center;
		min-height: 40px;
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.next {
		display: flex;
		flex-wrap: wrap;
		gap: 0 28px;
		margin-top: 48px;
		padding-top: 24px;
		border-top: 1px solid var(--color-hairline);
	}
	@media (max-width: 650px) {
		.items li {
			grid-template-columns: 1fr;
			gap: 4px;
		}
	}
</style>
