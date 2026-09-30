<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import V3Header from '$lib/components/V3Header.svelte';
	import { site } from '$lib/data/site';
	import { deskArtifact, collectionUrl } from '$lib/data/artifacts';
	import { projects } from '$lib/data/projects';
	import { talks } from '$lib/data/talks';
	import { writingSamples } from '$lib/data/writing';
	import { communityInitiatives } from '$lib/data/community';

	const chapters = [
		{
			label: 'Work',
			href: '/work',
			text: 'Developer relations, product launches, and the work behind them.'
		},
		{
			label: 'Projects',
			href: '/projects',
			text: 'Experiments, useful tools, and things made to teach.'
		},
		{ label: 'Speaking', href: '/speaking', text: 'Talks, recordings, and ideas shared out loud.' },
		{
			label: 'Writing',
			href: 'https://oberai.blog',
			text: 'On developer tools, friendship, leaving home, and being human.'
		},
		{
			label: 'Community',
			href: '/community',
			text: 'Spaces for people to write, walk, and build together.'
		},
		{
			label: 'Photography',
			href: 'https://www.pexels.com/@oberai',
			text: 'Street, travel, and the moments between conference sessions.'
		},
		{
			label: 'Collection',
			href: collectionUrl,
			text: 'My Pokémon collection. Blastoise gets pride of place.'
		},
		{ label: 'About', href: '/about', text: 'A little more of the story.' }
	];
	const featured = [
		{
			label: 'At Appwrite',
			title: deskArtifact.title,
			description: deskArtifact.description,
			href: deskArtifact.href!
		},
		{
			label: 'Built',
			title: projects[0].name,
			description: projects[0].overview,
			href: '/projects'
		},
		{
			label: talks[0].event,
			title: talks[0].title,
			description: talks[0].description,
			href: '/speaking'
		},
		{
			label: 'Written',
			title: writingSamples[0].title,
			description: writingSamples[0].description,
			href: writingSamples[0].href
		},
		{
			label: 'Together',
			title: communityInitiatives[0].title,
			description: communityInitiatives[0].what,
			href: '/community#' + communityInitiatives[0].slug
		}
	];
</script>

<PageMeta
	title="Index"
	path="/index"
	description="Aditya Oberai: developer relations at Appwrite, projects, writing, speaking, communities, photography, and Pokémon."
/>
<V3Header />
<div class="index-page">
	<section class="intro" aria-labelledby="index-title">
		<div>
			<p class="eyebrow">The index · a few ways to know me</p>
			<h1 id="index-title">I build things.<br />And bring people together.</h1>
			<p class="lede">
				I'm Aditya, {site.role}. I help developers find their way from an idea to something they can
				make. Away from the desk, there's usually a camera, a notebook, or a Pokémon card nearby.
			</p>
			<div class="intro-links">
				<a href="/contact">Get in touch ↗</a><a href="/resume">Résumé ↗</a><a href="/world"
					>Visit my room →</a
				>
			</div>
		</div>
		<img src={site.portrait} alt="Aditya Oberai" width="240" height="240" />
	</section>
	<section class="directory" aria-labelledby="directory-title">
		<h2 id="directory-title" class="eyebrow">Find your way</h2>
		<div class="chapters">
			{#each chapters as chapter, i (chapter.label)}
				<a href={chapter.href} class="chapter"
					><span class="number">0{i + 1}</span>
					<div>
						<h3>{chapter.label}</h3>
						<p>{chapter.text}</p>
					</div>
					<span aria-hidden="true">↗</span></a
				>
			{/each}
		</div>
	</section>
	<section class="selected" aria-labelledby="selected-title">
		<h2 id="selected-title">A few things to start with</h2>
		{#each featured as item (item.title)}
			<a href={item.href} class="selected-row"
				><span class="eyebrow">{item.label}</span>
				<div>
					<h3>{item.title}</h3>
					<p>{item.description}</p>
				</div>
				<span aria-hidden="true">↗</span></a
			>
		{/each}
	</section>
	<footer><span>Made of many interests.</span><a href="/contact">Let's talk →</a></footer>
</div>

<style>
	.index-page {
		max-width: 1160px;
		margin: auto;
		padding: 0 clamp(24px, 5vw, 64px);
	}
	.intro {
		display: grid;
		grid-template-columns: 1fr 180px;
		align-items: center;
		gap: 60px;
		padding: 72px 0 56px;
	}
	h1 {
		font-size: clamp(36px, 5vw, 60px);
		letter-spacing: -0.045em;
		line-height: 1.06;
		margin: 18px 0 24px;
	}
	.lede {
		max-width: 650px;
		font-size: 20px;
		line-height: 1.6;
		color: #55574d;
	}
	.intro img {
		width: 180px;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: 50% 50% 6px 6px;
		filter: saturate(0.7);
	}
	.intro-links {
		display: flex;
		flex-wrap: wrap;
		gap: 12px 26px;
		margin-top: 24px;
		color: #304e42;
	}
	.intro-links a {
		padding: 10px 0;
		text-decoration: underline;
		text-underline-offset: 5px;
	}
	.directory {
		padding: 28px 0 44px;
		border-top: 1px solid #d6d5c8;
	}
	.chapters {
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: 40px;
		margin-top: 16px;
	}
	.chapter {
		display: grid;
		grid-template-columns: 24px 1fr 16px;
		gap: 14px;
		align-items: baseline;
		padding: 23px 0;
		border-bottom: 1px solid #dedbcf;
	}
	.number {
		font:
			11px system-ui,
			sans-serif;
		color: #69705d;
	}
	h3 {
		font-size: 23px;
		line-height: 1.25;
	}
	.chapter p,
	.selected-row p {
		color: #606456;
		font-size: 16px;
		line-height: 1.5;
		margin-top: 6px;
	}
	.chapter:hover h3,
	.selected-row:hover h3 {
		text-decoration: underline;
		text-underline-offset: 4px;
		color: #304e42;
	}
	.selected h2 {
		font-size: 30px;
		margin: 12px 0 24px;
	}
	.selected-row {
		display: grid;
		grid-template-columns: 110px 1fr 20px;
		gap: 22px;
		padding: 28px 0;
		border-top: 1px solid #dedbcf;
	}
	footer {
		display: flex;
		justify-content: space-between;
		gap: 20px;
		margin-top: 40px;
		padding: 32px 0;
		border-top: 1px solid #d6d5c8;
		font-size: 16px;
		color: #606456;
	}
	@media (max-width: 650px) {
		.intro {
			grid-template-columns: 1fr;
			gap: 28px;
			padding-top: 44px;
		}
		.intro img {
			display: none;
		}
		.chapters {
			grid-template-columns: 1fr;
		}
		.selected-row {
			grid-template-columns: 1fr 18px;
			gap: 8px;
		}
		.selected-row > .eyebrow {
			grid-column: 1 / -1;
		}
	}
</style>
