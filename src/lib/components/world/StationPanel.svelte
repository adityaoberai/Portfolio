<script lang="ts">
	import type { StationId } from '$lib/world/layout';
	import { stationById } from '$lib/data/room';
	import { artifactById, deskArtifact, ofType, shelfArtifact } from '$lib/data/artifacts';
	import { workThemes } from '$lib/data/work';
	import { site } from '$lib/data/site';
	import { cameraBody, pexelsProfile, photoPlaces, withWidth } from '$lib/data/photography';
	import { talks } from '$lib/data/talks';
	import { about } from '$lib/data/about';
	import { bengaluruTime, now } from '$lib/data/now';
	import { socialLinks, sponsorLink } from '$lib/data/links';
	import { collection } from '$lib/data/collection';
	import Slab from './Slab.svelte';
	import Portrait from '$lib/components/Portrait.svelte';

	let { id }: { id: StationId } = $props();
	const station = $derived(stationById[id]);

	// Every list below is a view over the shared artifacts that Index also reads.
	const devrel = workThemes[0];
	const deskItems = ofType('work')
		.filter((a) => a.context === devrel.title)
		.slice(0, 3);
	const built = artifactById.get('project-relief-atl');
	const articles = artifactById.get('work-140-published-articles');
	const essays = ofType('essay').slice(0, 3);
	const sheet = ofType('photo').slice(0, 6);
	// People first: initiatives, then the community programs from work.
	const pins = [...ofType('community'), ...ofType('work').filter((a) => a.context === 'Community')];
	const featuredTalks = talks.filter((t) => t.featured);
	const elsewhere = [
		...socialLinks.map((link) => ({ label: link.name, detail: `@${link.handle}`, href: link.url })),
		{ label: 'Newsletter', detail: 'oberai.blog', href: 'https://oberai.blog' },
		{ label: 'Photography', detail: 'Pexels', href: pexelsProfile },
		{ label: 'Collection', detail: 'Collectr', href: collection.showcaseUrl },
		{ label: 'Sponsor', detail: 'GitHub Sponsors', href: sponsorLink }
	];
</script>

<p class="eyebrow">{station.number} / {station.object} · {station.area}</p>

{#if id === 'desk'}
	<h2 id="station-title">{site.role}</h2>
	<p class="lead">{devrel.summary}</p>
	<ul class="entries">
		{#each deskItems as item (item.id)}
			<li>
				<h3>{item.title}</h3>
				<p>{item.description}</p>
				{#if item.externalUrl}<a href={item.externalUrl}>Take a look ↗</a>{/if}
			</li>
		{/each}
		{#if built}
			<li>
				<p class="kicker">Recently built</p>
				<h3>{built.title}</h3>
				<p>{built.description} {built.context}</p>
			</li>
		{/if}
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
		{#each essays as essay (essay.id)}
			<li>
				<span class="date">{essay.date}</span>
				<a href={essay.externalUrl}><h3>{essay.title}</h3></a>
				<p>{essay.description}</p>
			</li>
		{/each}
	</ol>
	{#if articles}
		<p class="aside">
			<strong>{articles.title}</strong>: {articles.description}
			{#if articles.externalUrl}<a href={articles.externalUrl}>On the Appwrite blog ↗</a>{/if}
		</p>
	{/if}
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
				<a href={photo.externalUrl}>
					<img
						src={withWidth(photo.image, 360)}
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
	<h2 id="station-title">{shelfArtifact.title} gets the top shelf.</h2>
	<p class="lead">
		{shelfArtifact.description} The shelf holds a few slabs and binders; the whole collection is catalogued
		on Collectr.
	</p>
	<div class="slab-row"><Slab name={shelfArtifact.title} /></div>
	<div class="links"><a href={shelfArtifact.externalUrl}>Open the binder on Collectr ↗</a></div>
{:else if id === 'corkboard'}
	<h2 id="station-title">Pinned to the corkboard</h2>
	<p class="lead">
		Spaces I’ve helped build for people to write, walk, meet, and make things together. Who they’re
		for matters more than how big they got.
	</p>
	<ul class="pins">
		{#each pins as pin (pin.id)}
			<li>
				<h3>{pin.title}</h3>
				<p>{pin.description}</p>
				{#if pin.type === 'community' && pin.context}<p class="who">For: {pin.context}</p>{/if}
				{#if pin.href}<a href={pin.href}>Read more →</a>{/if}
			</li>
		{/each}
	</ul>
	<div class="links"><a href={station.href}>All community work →</a></div>
{:else if id === 'lanyards'}
	<h2 id="station-title">Lanyards from the road</h2>
	<p class="lead">{talks.length} talks and counting. A few of the badges I kept:</p>
	<ul class="badges">
		{#each featuredTalks as talk (talk.event + talk.year)}
			<li>
				<span class="badge-head">{talk.event} · {talk.year}</span>
				<h3>{talk.title}</h3>
				{#if talk.recording}<a href={talk.recording}>Watch the recording ↗</a>
				{:else if talk.slides}<a href={talk.slides}>See the slides ↗</a>{/if}
			</li>
		{/each}
	</ul>
	<div class="links">
		<a href={station.href}>Every talk and podcast →</a>
		<a href="mailto:{site.email}?subject=Speaking invitation">Invite me to speak ↗</a>
	</div>
{:else if id === 'mirror'}
	<h2 id="station-title">{about.headline}</h2>
	<p class="lead">{about.standfirst}</p>
	<div class="reflection">
		<Portrait width={120} height={150} />
		<p>{about.intro}</p>
	</div>
	<h3 class="subhead">What I care about</h3>
	<ul class="entries">
		{#each about.careAbout as item (item.title)}
			<li><p><strong>{item.title}</strong>: {item.text}</p></li>
		{/each}
	</ul>
	<div class="links"><a href={station.href}>The longer story →</a></div>
{:else if id === 'window'}
	<h2 id="station-title">Right now</h2>
	<p class="lead">It’s {bengaluruTime()} in Bengaluru.</p>
	<dl class="now">
		{#each now.items as item (item.label)}
			<div>
				<dt>{item.label}</dt>
				<dd>
					{#if item.href}<a href={item.href}>{item.text}</a>{:else}{item.text}{/if}
				</dd>
			</div>
		{/each}
	</dl>
	<div class="links"><a href={station.href}>The Now page →</a></div>
{:else if id === 'door'}
	<h2 id="station-title">Elsewhere</h2>
	<p class="lead">The quickest way to reach me is still email.</p>
	<p class="mail"><a href="mailto:{site.email}">{site.email}</a></p>
	<ul class="elsewhere">
		{#each elsewhere as link (link.label)}
			<li>
				<a href={link.href}><span>{link.label}</span><span class="detail">{link.detail} ↗</span></a
				>
			</li>
		{/each}
	</ul>
	<div class="links"><a href={station.href}>Contact page →</a></div>
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
	.pins {
		display: grid;
		gap: 14px;
		margin: 20px 0 0;
		padding: 0;
		list-style: none;
	}
	.pins li {
		position: relative;
		padding: 16px 16px 14px;
		background: #fbf3d9;
		border: 1px solid #e6d9ae;
		box-shadow: 0 2px 0 #d9c99b;
		transform: rotate(-0.6deg);
	}
	.pins li:nth-child(even) {
		transform: rotate(0.5deg);
		background: #f3f5e8;
		border-color: #d9dfc3;
	}
	.pins li::before {
		content: '';
		position: absolute;
		top: -5px;
		left: 50%;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #c23b3b;
	}
	.pins p {
		margin-top: 6px;
		font-size: 15px;
		line-height: 1.5;
		color: #5a604f;
	}
	.pins .who {
		font-style: italic;
	}
	.pins a,
	.badges a {
		display: inline-block;
		margin-top: 8px;
		color: #304e42;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.badges {
		display: grid;
		gap: 12px;
		margin: 20px 0 0;
		padding: 0;
		list-style: none;
	}
	.badges li {
		padding: 0 16px 14px;
		background: #fffdf6;
		border: 1px solid #d8d4c2;
		border-radius: 8px;
		overflow: hidden;
	}
	.badge-head {
		display: block;
		margin: 0 -16px 12px;
		padding: 8px 16px;
		background: #304e42;
		color: #fffaf0;
		font:
			11px/1.4 system-ui,
			sans-serif;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.reflection {
		display: grid;
		grid-template-columns: 120px 1fr;
		gap: 18px;
		align-items: start;
		margin-top: 20px;
	}
	.reflection :global(img) {
		width: 120px;
		height: 150px;
		object-fit: cover;
		border-radius: 60px 60px 6px 6px;
		border: 6px solid #8f6a4c;
		filter: saturate(0.8);
	}
	.reflection p {
		font-size: 16px;
		line-height: 1.6;
		color: #4f5746;
	}
	.subhead {
		margin-top: 24px;
		font-size: 18px;
	}
	.now {
		margin: 18px 0 0;
		border-top: 1px solid #dedbcf;
	}
	.now div {
		display: grid;
		grid-template-columns: 120px 1fr;
		gap: 12px;
		padding: 12px 0;
		border-bottom: 1px solid #dedbcf;
	}
	.now dt {
		padding-top: 3px;
		font:
			11px/1.5 system-ui,
			sans-serif;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #69705d;
	}
	.now dd {
		margin: 0;
		font-size: 16px;
		line-height: 1.5;
	}
	.now a {
		color: inherit;
		text-decoration: underline;
		text-decoration-color: #b9bda8;
		text-underline-offset: 4px;
	}
	.mail {
		margin-top: 14px;
		font-size: 22px;
	}
	.mail a {
		color: #304e42;
		text-decoration: underline;
		text-underline-offset: 5px;
	}
	.elsewhere {
		margin: 18px 0 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid #dedbcf;
	}
	.elsewhere a {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		min-height: 44px;
		align-items: center;
		border-bottom: 1px solid #dedbcf;
	}
	.elsewhere a:hover span:first-child {
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.detail {
		font:
			13px system-ui,
			sans-serif;
		color: #606456;
	}
	@media (max-width: 420px) {
		.reflection,
		.now div {
			grid-template-columns: 1fr;
			gap: 4px;
		}
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
