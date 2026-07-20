<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import { projects } from '$lib/data/projects';
</script>

<PageMeta
	title="Projects"
	description="A curated selection of projects by Aditya Oberai, from an AI-powered GitHub profile reviewer to an accessibility tool used more than 150,000 times."
	path="/projects"
/>

<div class="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-24">
	<header class="max-w-2xl">
		<p class="eyebrow">Projects</p>
		<h1 class="mt-6 text-h1">Things I've built.</h1>
		<p class="mt-6 text-lede italic text-secondary">
			Six projects, curated. Most were built to teach something, and all of them to scratch an itch.
		</p>
	</header>

	<div class="pt-16 md:pt-24">
		<SectionHeader number="01" label="Selected projects" />
	</div>
	<div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
		{#each projects as project (project.slug)}
			<ProjectCard {project} />
		{/each}
	</div>

	<p class="mt-12 text-body text-secondary">
		There's plenty more where these came from:
		<ExternalLink href="https://github.com/adityaoberai"
			>browse the full archive on GitHub</ExternalLink
		>.
	</p>
</div>
