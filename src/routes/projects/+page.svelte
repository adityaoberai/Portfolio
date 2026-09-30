<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import PageIntro from '$lib/components/PageIntro.svelte';
	import { projects } from '$lib/data/projects';
</script>

<PageMeta
	title="Projects"
	description="A curated selection of projects by Aditya Oberai, from an AI-powered GitHub profile reviewer to an accessibility tool used more than 150,000 times."
	path="/projects"
/>

<div class="v3-page">
	<PageIntro eyebrow="Projects · things I've built" title="Things I've built." station="desk">
		<p>
			Seven projects, curated. Most were built to teach something, and all of them to scratch an
			itch.
		</p>
	</PageIntro>

	<ol class="projects">
		{#each projects as project, i (project.slug)}
			<li id={project.slug}>
				<span class="n">{String(i + 1).padStart(2, '0')}</span>
				<article aria-labelledby="{project.slug}-title">
					<h2 id="{project.slug}-title">{project.name}</h2>
					<p class="overview">{project.overview}</p>
					<dl>
						<div>
							<dt>Why</dt>
							<dd>{project.motivation}</dd>
						</div>
						<div>
							<dt>Outcome</dt>
							<dd>{project.outcome}</dd>
						</div>
						<div>
							<dt>Built with</dt>
							<dd>
								<ul class="tech">
									{#each project.technologies as tech (tech)}<li>{tech}</li>{/each}
								</ul>
							</dd>
						</div>
					</dl>
					<p class="links">
						{#each project.links as link (link.href)}
							<a href={link.href}
								>{link.label}<span aria-hidden="true">&nbsp;↗</span><span class="sr-only">
									(external site)</span
								></a
							>
						{/each}
					</p>
				</article>
			</li>
		{/each}
	</ol>
</div>

<style>
	.projects {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.projects > li {
		display: grid;
		grid-template-columns: 60px 1fr;
		gap: 16px;
		padding: 36px 0;
		border-top: 1px solid var(--color-hairline);
		scroll-margin-top: 24px;
	}
	.n {
		padding-top: 10px;
		font:
			12px system-ui,
			sans-serif;
		color: var(--color-secondary);
	}
	h2 {
		font-size: clamp(26px, 3vw, 32px);
		letter-spacing: -0.03em;
		line-height: 1.15;
		font-weight: 500;
	}
	.overview {
		max-width: 720px;
		margin-top: 10px;
		font-size: 19px;
		line-height: 1.6;
	}
	dl {
		display: grid;
		gap: 12px;
		max-width: 760px;
		margin: 18px 0 0;
	}
	dl div {
		display: grid;
		grid-template-columns: 110px 1fr;
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
		font-size: 16px;
		line-height: 1.6;
		color: var(--color-ink-soft);
	}
	.tech {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.tech li {
		padding: 2px 8px;
		border: 1px solid var(--color-hairline-strong);
		border-radius: 3px;
		font:
			12px/1.6 system-ui,
			sans-serif;
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0 24px;
		margin-top: 14px;
	}
	.links a {
		display: inline-flex;
		align-items: center;
		min-height: 40px;
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	@media (max-width: 650px) {
		.projects > li {
			grid-template-columns: 1fr;
			gap: 4px;
		}
		dl div {
			grid-template-columns: 1fr;
			gap: 2px;
		}
	}
</style>
