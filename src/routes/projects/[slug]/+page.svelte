<script lang="ts">
	import PageIntro from '$lib/components/PageIntro.svelte';
	import PageMeta from '$lib/components/PageMeta.svelte';
	import { person, type StructuredEntity } from '$lib/data/identity';
	import { projectPagePath } from '$lib/data/projects';
	import { site } from '$lib/data/site';
	import { externalLinkAttrs } from '$lib/external-links';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const project = $derived(data.project);
	const path = $derived(projectPagePath(project.slug));
	const url = $derived(new URL(path, site.url).href);
	const references = $derived([...project.links, ...project.detail.sources]);
	const projectEntity = $derived<StructuredEntity>({
		'@type': 'CreativeWork',
		'@id': `${url}#project`,
		url,
		name: project.name,
		description: project.overview,
		genre: 'Software project',
		contributor: { '@id': person['@id'] },
		citation: references.map((link) => link.href)
	});
</script>

<PageMeta title={project.name} description={project.overview} {path} mainEntity={projectEntity} />

<div class="v3-page" data-analytics-section="project_detail">
	<article class="v3-detail">
		<PageIntro title={project.name} station="desk">
			<p>{project.overview}</p>
			<p class="meta">
				<a href="/about" class="prose-link">{site.name}</a> · {project.detail.period}
			</p>
		</PageIntro>

		<section class="v3-section" aria-labelledby="contribution">
			<h2 id="contribution">My contribution</h2>
			<p>{project.motivation}</p>
			<p>{project.detail.contribution}</p>
		</section>
		<section class="v3-section" aria-labelledby="how-it-works">
			<h2 id="how-it-works">How it works</h2>
			<p>{project.detail.approach}</p>
			<p><strong>Built with</strong> {project.technologies.join(', ')}.</p>
		</section>
		<section class="v3-section" aria-labelledby="outcome">
			<h2 id="outcome">Outcome</h2>
			<p>{project.outcome}</p>
		</section>
		<section class="v3-section" aria-labelledby="project-links">
			<h2 id="project-links">Project links and sources</h2>
			<ul data-content-type="project" data-content-id={`project-${project.slug}`}>
				{#each references as link (link.href)}
					<li>
						<a
							class="prose-link"
							href={link.href}
							{...externalLinkAttrs(link.href)}
							data-content-action={link.label.toLowerCase()}
						>
							{link.label}<span class="sr-only"> (opens in a new tab)</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
		<a class="detail-back prose-link" href="/projects">← All projects</a>
	</article>
</div>
