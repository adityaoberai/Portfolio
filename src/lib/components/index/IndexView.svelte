<script lang="ts">
	import { externalLinkAttrs } from '$lib/external-links';
	import { roomJourney } from '$lib/world/journey';
	import { site } from '$lib/data/site';
	import Portrait from '$lib/components/Portrait.svelte';
	import { highlights } from '$lib/data/highlights';
	import { sections } from '$lib/data/sections';
	import { trackEvent } from '$lib/analytics';
	import { contactVisibility } from '$lib/contact-visibility';
	const directory = sections.filter((section) => section.id !== 'now');
	const roomHref = $derived(`/world${$roomJourney?.panel ? `#${$roomJourney.panel}` : ''}`);
</script>

<div class="index-page">
	<section class="intro" aria-labelledby="index-title">
		<h1 id="index-title">I build things.<br />And bring people together.</h1>
		<Portrait width={180} loading="eager" class="portrait" />
		<div class="intro-copy">
			<p class="lede">
				I'm Aditya, {site.role}. I help developers find their way from an idea to something they can
				make. Away from the desk, there's usually a camera, a notebook, or a Pokémon card nearby.
			</p>
			<div
				class="intro-links"
				data-contact-section="index"
				use:contactVisibility={{ section: 'index' }}
			>
				<a href="/contact">Get in touch</a><a href="/resume">Resume (PDF)</a>
			</div>
		</div>
	</section>

	<section class="glance" aria-labelledby="glance-title">
		<h2 id="glance-title">A few things about me</h2>
		<ul>
			{#each highlights as fact (fact)}
				<li>{fact}</li>
			{/each}
		</ul>
	</section>

	<a
		class="room-invitation"
		href={roomHref}
		data-sveltekit-preload-data="off"
		onclick={() => trackEvent('mode_switched', { from: 'index', to: 'world' })}
	>
		<img
			class="room-preview"
			src="/room-still.jpg"
			width="1440"
			height="1000"
			alt="Aditya's illustrated room"
		/>
		<div>
			<h2>Step into my room <span aria-hidden="true">↗</span></h2>
			<p>A little space for the things I make and care about.</p>
		</div>
	</a>

	<nav class="directory" aria-labelledby="directory-title">
		<h2 id="directory-title">Find your way</h2>
		<ul class="chapters">
			{#each directory as section (section.id)}
				<li id={section.id} tabindex="-1">
					<a href={section.href} {...externalLinkAttrs(section.href)} class="chapter"
						><div>
							<h3>{section.label}</h3>
							<p>{section.summary}</p>
						</div>
						<span aria-hidden="true">{section.external ? '↗' : '→'}</span
						>{#if section.external}<span class="sr-only"> (opens in a new tab)</span>{/if}</a
					>
				</li>
			{/each}
		</ul>
	</nav>
</div>

<style>
	.index-page {
		max-width: var(--container);
		margin: auto;
		padding: 0 var(--gutter);
		overflow-wrap: anywhere;
	}
	.intro {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 180px;
		align-items: center;
		gap: 24px 60px;
		padding: 72px 0 48px;
	}
	.intro h1 {
		grid-column: 1;
		grid-row: 1;
	}
	.intro-copy {
		grid-column: 1;
		grid-row: 2;
	}
	.intro :global(picture) {
		grid-column: 2;
		grid-row: 1 / span 2;
	}
	h1 {
		font-size: var(--type-hero);
		font-weight: 500;
		letter-spacing: -0.02em;
		line-height: 1.12;
		margin: 0;
	}
	.lede {
		max-width: 650px;
		font-size: var(--type-lead);
		line-height: 1.6;
		color: #55574d;
	}
	.intro :global(.portrait) {
		display: block;
		width: 180px;
		max-width: 100%;
		height: auto;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: 0;
		filter: saturate(0.7);
	}
	.intro-links {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 26px;
		margin-top: 24px;
		color: #304e42;
	}
	.intro-links a {
		padding: 10px 0;
		text-decoration: underline;
		text-underline-offset: 5px;
	}
	.glance {
		padding: 24px 0 36px;
		border-top: 1px solid #d6d5c8;
	}
	.glance ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
		gap: 12px 32px;
		margin: 14px 0 0;
		padding: 0;
		list-style: none;
	}
	.glance li {
		font-size: var(--type-lead);
		line-height: 1.35;
		letter-spacing: -0.01em;
	}
	.directory {
		padding: 28px 0 44px;
		border-top: 1px solid #d6d5c8;
	}
	.chapters {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		column-gap: 40px;
		margin: 16px 0 0;
		padding: 0;
		list-style: none;
	}
	.chapter {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 14px;
		align-items: baseline;
		padding: 22px 0;
		border-bottom: 1px solid #dedbcf;
	}
	h3 {
		font-size: 1.5rem;
		line-height: 1.25;
	}
	.chapter p {
		color: #606456;
		font-size: var(--type-body);
		line-height: 1.5;
		margin-top: 6px;
	}
	.chapter:hover h3 {
		text-decoration: underline;
		text-underline-offset: 4px;
		color: #304e42;
	}
	@media (max-width: 650px) {
		.intro {
			grid-template-columns: minmax(0, 1fr);
			padding-top: 44px;
		}
		.intro h1,
		.intro-copy,
		.intro :global(picture) {
			grid-column: 1;
			grid-row: auto;
		}

		.chapters {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	h2 {
		font-size: 1.5rem;
		font-weight: 500;
		line-height: 1.25;
	}
	.chapters li {
		scroll-margin-top: 24px;
	}
	.chapter p {
		max-width: 58ch;
	}
	.room-invitation {
		display: grid;
		grid-template-columns: 220px 1fr;
		gap: 28px;
		align-items: center;
		margin: 0 0 36px;
		padding: 24px;
		border: 1px solid var(--color-hairline);
		border-radius: 12px;
		background: var(--color-surface);
	}
	.room-preview {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 1.44;
		object-fit: contain;
		view-transition-name: room-scene;
	}
	.room-invitation p {
		margin-top: 8px;
		max-width: 48ch;
		font-size: var(--type-body);
		color: var(--color-secondary);
	}
	.room-invitation:hover h2 {
		text-decoration: underline;
		text-underline-offset: 5px;
	}
	@media (max-width: 650px) {
		.room-invitation {
			grid-template-columns: 88px 1fr;
			gap: 16px;
			padding: 16px;
		}
		.room-invitation h2 {
			font-size: 1.25rem;
		}
		.room-invitation p {
			font-size: 1rem;
		}
	}
</style>
