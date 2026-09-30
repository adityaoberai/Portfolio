<script lang="ts">
	import type { StationId } from '$lib/world/layout';
	import { stationById } from '$lib/data/room';
	import { deskArtifact } from '$lib/data/artifacts';
	import { workThemes } from '$lib/data/work';
	import { projects } from '$lib/data/projects';
	import { site } from '$lib/data/site';
	import { writingSamples } from '$lib/data/writing';
	import { collection } from '$lib/data/collection';
	import {
		cameraBody,
		pexelsProfile,
		photoPlaces,
		photoSrc,
		photographs
	} from '$lib/data/photography';
	import Slab from './Slab.svelte';

	let { id }: { id: StationId } = $props();
	const station = $derived(stationById[id]);

	const devrel = workThemes[0];
	const deskItems = [devrel.items[0], devrel.items[2], devrel.items[1]];
	const built = projects.find((p) => p.slug === 'relief-atl') ?? projects[0];
	const articles = workThemes[1].items[0];
	const sheet = photographs.slice(0, 6);
</script>

<p class="eyebrow">{station.number} / {station.object} · {station.area}</p>

{#if id === 'desk'}
	<h2 id="station-title">{site.role}</h2>
	<p class="lead">{devrel.summary}</p>
	<ul class="entries">
		{#each deskItems as item (item.title)}
			<li>
				<h3>{item.title}</h3>
				<p>{item.description}</p>
				{#if item.link}<a href={item.link.href}>{item.link.label} ↗</a>{/if}
			</li>
		{/each}
		<li>
			<p class="kicker">Recently built</p>
			<h3>{built.name}</h3>
			<p>{built.overview} {built.outcome}</p>
		</li>
	</ul>
	<div class="links">
		<a href={deskArtifact.href}>More about my work →</a><a href="/projects">All projects →</a>
	</div>
{:else if id === 'notebook'}
	<h2 id="station-title">Pages from the notebook</h2>
	<p class="lead">
		The personal essays live on oberai.blog; the professional writing lives on the Appwrite blog.
	</p>
	<ol class="pages">
		{#each writingSamples.slice(0, 3) as essay (essay.href)}
			<li>
				<span class="date">{essay.meta}</span>
				<a href={essay.href}><h3>{essay.title}</h3></a>
				<p>{essay.description}</p>
			</li>
		{/each}
	</ol>
	<p class="aside">
		<strong>{articles.title}</strong>: {articles.description}
		{#if articles.link}<a href={articles.link.href}>{articles.link.label} ↗</a>{/if}
	</p>
	<div class="links"><a href={station.href}>Read everything on oberai.blog ↗</a></div>
{:else if id === 'camera'}
	<h2 id="station-title">{cameraBody}</h2>
	<p class="lead">{station.summary}</p>
	<p class="exif">
		<span>{cameraBody}</span>{#each photoPlaces as place (place)}<span>{place}</span>{/each}
	</p>
	<ul class="contact-sheet" aria-label="Contact sheet">
		{#each sheet as photo, i (photo.id)}
			<li>
				<a href={photo.href}>
					<img
						src={photoSrc(photo, 360)}
						alt={photo.title}
						loading="lazy"
						decoding="async"
						width="360"
						height="270"
					/>
					<span>{String(i + 1).padStart(2, '0')}</span>
				</a>
			</li>
		{/each}
	</ul>
	<div class="links"><a href={pexelsProfile}>The full archive on Pexels ↗</a></div>
{:else if id === 'shelf'}
	<h2 id="station-title">{collection.favourite} gets the top shelf.</h2>
	<p class="lead">
		{collection.favourite} is my favourite Pokémon, so it gets pride of place. The shelf holds a few
		slabs and binders; the whole collection is catalogued on Collectr.
	</p>
	<div class="slab-row"><Slab name={collection.favourite} /></div>
	<div class="links"><a href={collection.showcaseUrl}>Open the binder on Collectr ↗</a></div>
{/if}

<style>
	.eyebrow {
		font:
			11px/1.5 system-ui,
			sans-serif;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #5f6755;
	}
	h2 {
		margin-top: 20px;
		font-size: clamp(28px, 4vw, 38px);
		letter-spacing: -0.035em;
		line-height: 1.1;
	}
	.lead {
		margin: 16px 0 8px;
		font-size: 18px;
		line-height: 1.6;
		color: #525a48;
	}
	h3 {
		font-size: 20px;
		line-height: 1.3;
	}
	.entries,
	.pages {
		margin: 20px 0 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid #dedbcf;
	}
	.entries li,
	.pages li {
		padding: 16px 0;
		border-bottom: 1px solid #dedbcf;
	}
	.entries p,
	.pages p {
		margin-top: 6px;
		font-size: 16px;
		line-height: 1.55;
		color: #5a604f;
	}
	.kicker,
	.date {
		display: block;
		font:
			11px/1.5 system-ui,
			sans-serif;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #69705d;
	}
	.pages li {
		background: repeating-linear-gradient(transparent 0 27px, #e7e1cf 27px 28px);
		padding-left: 12px;
		border-left: 2px solid #d9a88f;
	}
	.pages a:hover h3,
	.entries a:hover {
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.entries a,
	.aside a {
		display: inline-block;
		margin-top: 6px;
		color: #304e42;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.aside {
		margin-top: 18px;
		font-size: 15px;
		line-height: 1.55;
		color: #5a604f;
	}
	.exif {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 14px;
	}
	.exif span {
		padding: 4px 8px;
		border: 1px solid #cfd2c1;
		border-radius: 3px;
		font:
			11px/1.4 ui-monospace,
			monospace;
		color: #4d5645;
	}
	.contact-sheet {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 6px;
		margin: 18px 0 0;
		padding: 8px;
		list-style: none;
		background: #1f2320;
		border-radius: 4px;
	}
	.contact-sheet a {
		position: relative;
		display: block;
	}
	.contact-sheet img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		background: #3a3f3a;
	}
	.contact-sheet span {
		position: absolute;
		left: 4px;
		bottom: 2px;
		font:
			9px ui-monospace,
			monospace;
		color: #f1d8a7;
	}
	.contact-sheet a:focus-visible {
		outline-offset: 1px;
	}
	.slab-row {
		display: flex;
		justify-content: center;
		margin: 24px 0 8px;
	}
	.links {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 22px;
	}
	.links a {
		padding: 6px 0;
		color: #304e42;
		text-decoration: underline;
		text-underline-offset: 5px;
	}
</style>
