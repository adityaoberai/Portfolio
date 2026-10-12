<script lang="ts">
	import { site } from '$lib/data/site';
	import Portrait from '$lib/components/Portrait.svelte';
	import { highlights } from '$lib/data/highlights';
	import { sections } from '$lib/data/sections';
</script>

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
				<a href="/contact">Get in touch</a><a href="/resume">Résumé (PDF)</a><a href="/world"
					>Visit my room →</a
				>
			</div>
		</div>
		<Portrait width={180} loading="eager" class="portrait" />
	</section>

	<section class="glance" aria-labelledby="glance-title">
		<h2 id="glance-title" class="eyebrow">At a glance</h2>
		<ul>
			{#each highlights as fact (fact)}
				<li>{fact}</li>
			{/each}
		</ul>
	</section>

	<nav class="directory" aria-labelledby="directory-title">
		<h2 id="directory-title" class="eyebrow">Find your way</h2>
		<ul class="chapters">
			{#each sections.filter((s) => s.id !== 'now') as section, i (section.id)}
				<li>
					<a href={section.href} class="chapter"
						><span class="number">{String(i + 1).padStart(2, '0')}</span>
						<div>
							<h3>{section.label}</h3>
							<p>{section.summary}</p>
						</div>
						<span aria-hidden="true">{section.external ? '↗' : '→'}</span
						>{#if section.external}<span class="sr-only"> (external site)</span>{/if}</a
					>
				</li>
			{/each}
		</ul>
	</nav>

	<footer>
		<span>Made of many interests. <a href="/world">The room</a> tells the same story.</span><a
			href="mailto:{site.email}">{site.email}</a
		>
	</footer>
</div>

<style>
	.index-page {
		max-width: var(--container);
		margin: auto;
		padding: 0 var(--gutter);
	}
	.intro {
		display: grid;
		grid-template-columns: 1fr 180px;
		align-items: center;
		gap: 60px;
		padding: 72px 0 48px;
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
	.intro :global(.portrait) {
		width: 180px;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: 50% 50% 6px 6px;
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
		font-size: 20px;
		line-height: 1.35;
		letter-spacing: -0.01em;
	}
	.directory {
		padding: 28px 0 44px;
		border-top: 1px solid #d6d5c8;
	}
	.chapters {
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: 40px;
		margin: 16px 0 0;
		padding: 0;
		list-style: none;
	}
	.chapter {
		display: grid;
		grid-template-columns: 24px 1fr 16px;
		gap: 14px;
		align-items: baseline;
		padding: 22px 0;
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
	.chapter p {
		color: #606456;
		font-size: 16px;
		line-height: 1.5;
		margin-top: 6px;
	}
	.chapter:hover h3 {
		text-decoration: underline;
		text-underline-offset: 4px;
		color: #304e42;
	}
	footer {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px 20px;
		margin-top: 40px;
		padding: 32px 0;
		border-top: 1px solid #d6d5c8;
		font-size: 16px;
		color: #606456;
	}
	footer a {
		color: #304e42;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	@media (max-width: 650px) {
		.intro {
			grid-template-columns: 1fr;
			gap: 28px;
			padding-top: 44px;
		}
		.intro :global(.portrait) {
			display: none;
		}
		.chapters {
			grid-template-columns: 1fr;
		}
	}
</style>
