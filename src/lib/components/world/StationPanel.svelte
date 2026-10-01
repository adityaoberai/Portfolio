<script lang="ts">
	// Renders a station's panel from src/lib/data/world.ts: title, lead, then its
	// blocks in order, then links. No copy lives here.
	import type { StationId } from '$lib/world/layout';
	import { panels, stationById } from '$lib/data/room';
	import { withWidth } from '$lib/data/photography';
	import { bengaluruTime } from '$lib/data/now';
	import { CARD_IMAGE_HEIGHT, CARD_IMAGE_WIDTH } from '$lib/data/collection';
	import type { Artifact } from '$lib/data/artifacts';
	import Slab from './Slab.svelte';
	import Portrait from '$lib/components/Portrait.svelte';

	let { id }: { id: StationId } = $props();
	const station = $derived(stationById[id]);
	const panel = $derived(panels[id]);
	const fill = (text: string) => text.replace('{time}', bengaluruTime());
	const external = (href: string) => /^(https?:|mailto:)/.test(href);
</script>

{#snippet itemLink(href: string | undefined, label: string)}
	{#if href}<a class="item-link" {href}>{label} {external(href) ? '↗' : '→'}</a>{/if}
{/snippet}

{#snippet cardImage(card: Artifact)}
	<img
		src={card.image}
		alt={card.imageAlt ?? card.title}
		loading="lazy"
		decoding="async"
		width={CARD_IMAGE_WIDTH}
		height={CARD_IMAGE_HEIGHT}
	/>
{/snippet}

{#if station && panel}
	<p class="eyebrow">
		{panel.eyebrow ?? `${station.number} / ${station.object} · ${station.area}`}
	</p>
	<h2 id="station-title">{panel.title}</h2>
	{#if panel.lead}<p class="lead">{fill(panel.lead)}</p>{/if}

	{#each panel.blocks as block, b (b)}
		{#if block.type === 'items'}
			{#if block.heading}<h3 class="subhead">{block.heading}</h3>{/if}
			{#if block.style === 'list'}
				<ul class="entries">
					{#each block.artifacts as item (item.id)}
						<li>
							{#if block.show.date && item.date}<span class="date">{item.date}</span>{/if}
							<h3>{item.title}</h3>
							{#if block.show.context && item.context}<p class="kicker">{item.context}</p>{/if}
							{#if block.show.description && item.description}<p>{item.description}</p>{/if}
							{#if block.show.link}{@render itemLink(
									item.link,
									block.linkLabel ?? item.externalLabel ?? 'Take a look'
								)}{/if}
						</li>
					{/each}
				</ul>
			{:else if block.style === 'pages'}
				<ol class="pages">
					{#each block.artifacts as item (item.id)}
						<li>
							{#if block.show.date && item.date}<span class="date">{item.date}</span>{/if}
							{#if block.show.link && item.link}<a href={item.link}><h3>{item.title}</h3></a
								>{:else}<h3>{item.title}</h3>{/if}
							{#if block.show.context && item.context}<p class="kicker">{item.context}</p>{/if}
							{#if block.show.description && item.description}<p>{item.description}</p>{/if}
						</li>
					{/each}
				</ol>
			{:else if block.style === 'pins'}
				<ul class="pins">
					{#each block.artifacts as item (item.id)}
						<li>
							{#if block.show.date && item.date}<span class="date">{item.date}</span>{/if}
							<h3>{item.title}</h3>
							{#if block.show.description && item.description}<p>{item.description}</p>{/if}
							{#if block.show.context && item.context}<p class="who">
									{item.type === 'community' ? `For: ${item.context}` : item.context}
								</p>{/if}
							{#if block.show.link}{@render itemLink(
									item.link,
									block.linkLabel ?? 'Read more'
								)}{/if}
						</li>
					{/each}
				</ul>
			{:else if block.style === 'badges'}
				<ul class="badges">
					{#each block.artifacts as item (item.id)}
						<li>
							<span class="badge-head"
								>{[block.show.context && item.context, block.show.date && item.date]
									.filter(Boolean)
									.join(' · ') || item.type}</span
							>
							<h3>{item.title}</h3>
							{#if block.show.description && item.description}<p>{item.description}</p>{/if}
							{#if block.show.link}{@render itemLink(
									item.link,
									block.linkLabel ?? item.externalLabel ?? 'Take a look'
								)}{/if}
						</li>
					{/each}
				</ul>
			{:else if block.style === 'photos'}
				<ul class="contact-sheet" aria-label={block.heading ?? 'Contact sheet'}>
					{#each block.artifacts as photo, i (photo.id)}
						<li>
							<a href={photo.link}>
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
			{:else if block.style === 'cards'}
				<ul class="cards">
					{#each block.artifacts as card (card.id)}
						<li>
							<figure>
								{#if block.show.link && card.link}<a href={card.link}>{@render cardImage(card)}</a
									>{:else}{@render cardImage(card)}{/if}
								<figcaption>
									<strong>{card.title}</strong>
									{#if block.show.context && card.context}<span>{card.context}</span>{/if}
									{#if block.show.description && card.description}<span>{card.description}</span
										>{/if}
								</figcaption>
							</figure>
						</li>
					{/each}
				</ul>
			{/if}
		{:else if block.type === 'feature'}
			{#if block.style === 'aside'}
				<p class="aside">
					<strong>{block.artifact.title}</strong>{#if block.artifact.description}: {block.artifact
							.description}{/if}
					{@render itemLink(
						block.link,
						block.linkLabel ?? block.artifact.externalLabel ?? 'Take a look'
					)}
				</p>
			{:else}
				<div class="feature">
					{#if block.kicker}<p class="kicker">{block.kicker}</p>{/if}
					<h3>{block.artifact.title}</h3>
					<p>{block.artifact.description} {block.artifact.context ?? ''}</p>
					{#if block.linkLabel}{@render itemLink(block.link, block.linkLabel)}{/if}
				</div>
			{/if}
		{:else if block.type === 'slab'}
			<div class="slab-row">
				<Slab
					name={block.artifact.title}
					caption={block.caption ?? block.artifact.context}
					image={block.artifact.image}
					alt={block.artifact.imageAlt}
				/>
			</div>
		{:else if block.type === 'profile'}
			<div class="reflection" class:no-portrait={block.portrait === false}>
				{#if block.portrait !== false}<Portrait width={120} height={150} />{/if}
				<p>{fill(block.text)}</p>
			</div>
		{:else if block.type === 'text'}
			<p class="text">{fill(block.text)}</p>
		{:else if block.type === 'tags'}
			<p class="exif">
				{#each block.tags as tag (tag)}<span>{tag}</span>{/each}
			</p>
		{:else if block.type === 'list'}
			{#if block.heading}<h3 class="subhead">{block.heading}</h3>{/if}
			<ul class="entries">
				{#each block.items as item (item.title)}
					<li><p><strong>{item.title}</strong>: {item.text}</p></li>
				{/each}
			</ul>
		{:else if block.type === 'facts'}
			{#if block.heading}<h3 class="subhead">{block.heading}</h3>{/if}
			<dl class="now">
				{#each block.rows as row (row.label)}
					<div>
						<dt>{row.label}</dt>
						<dd>
							{#if row.href}<a href={row.href}>{row.text}</a>{:else}{row.text}{/if}
						</dd>
					</div>
				{/each}
			</dl>
		{:else if block.type === 'contact'}
			{#if block.email}<p class="mail"><a href="mailto:{block.email}">{block.email}</a></p>{/if}
			<ul class="elsewhere">
				{#each block.places as place (place.label)}
					<li>
						<a href={place.href}
							><span>{place.label}</span><span class="detail">{place.detail} ↗</span></a
						>
					</li>
				{/each}
			</ul>
		{:else if block.type === 'links'}
			<div class="links inline">
				{#each block.links as link (link.href + link.label)}
					<a href={link.href}>{link.label} {link.external ? '↗' : '→'}</a>
				{/each}
			</div>
		{/if}
	{/each}

	{#if panel.links.length}
		<div class="links">
			{#each panel.links as link (link.href + link.label)}
				<a href={link.href}>{link.label} {link.external ? '↗' : '→'}</a>
			{/each}
		</div>
	{/if}
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
	.feature {
		margin-top: 16px;
		padding: 16px 0;
		border-top: 1px solid #dedbcf;
		border-bottom: 1px solid #dedbcf;
	}
	.feature p {
		margin-top: 6px;
		font-size: 16px;
		line-height: 1.55;
		color: #5a604f;
	}
	.text {
		margin-top: 16px;
		font-size: 16px;
		line-height: 1.6;
		color: #4f5746;
	}
	.item-link {
		display: inline-block;
		margin-top: 6px;
		color: #304e42;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.reflection.no-portrait {
		grid-template-columns: 1fr;
	}
	.links.inline {
		flex-direction: row;
		flex-wrap: wrap;
		gap: 4px 20px;
		margin-top: 12px;
	}
	.slab-row {
		display: flex;
		justify-content: center;
		margin: 24px 0 8px;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
		gap: 16px;
		margin: 14px 0 0;
		padding: 0;
		list-style: none;
	}
	.cards figure {
		margin: 0;
	}
	.cards img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 63 / 88;
		object-fit: cover;
		border-radius: 4.5% / 3.2%;
		background: #e8e2cc;
		box-shadow: 0 6px 14px #2a3f3a26;
	}
	.cards figcaption {
		margin-top: 8px;
		font-size: 13px;
		line-height: 1.4;
		color: #5a604f;
	}
	.cards strong {
		display: block;
		font-size: 15px;
		font-weight: 600;
		color: #2c3328;
	}
	.cards span {
		display: block;
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
