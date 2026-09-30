<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import PageIntro from '$lib/components/PageIntro.svelte';
	import { about } from '$lib/data/about';
	import { site } from '$lib/data/site';
</script>

<PageMeta
	title="About"
	description="The person behind the work: how Aditya Oberai found his way from hackathons to leading Developer Relations at Appwrite, and what he cares about along the way."
	path="/about"
/>

<div class="v3-page">
	<PageIntro eyebrow="About · the mirror" title={about.headline} station="mirror">
		<p>{about.standfirst}</p>
	</PageIntro>

	<article class="story">
		<figure>
			<img src={site.portrait} alt="Aditya Oberai" width="240" height="300" />
		</figure>
		<p class="first">{about.intro}</p>

		<section aria-labelledby="journey-title">
			<h2 id="journey-title"><span class="n">01</span>Career journey</h2>
			{#each about.journey as paragraph (paragraph)}<p>{paragraph}</p>{/each}
		</section>

		<section aria-labelledby="care-title">
			<h2 id="care-title"><span class="n">02</span>What I care about</h2>
			<p>Three things, mostly.</p>
			<ul>
				{#each about.careAbout as item (item.title)}
					<li><em>{item.title}</em>: {item.text}</li>
				{/each}
			</ul>
		</section>

		<section aria-labelledby="how-title">
			<h2 id="how-title"><span class="n">03</span>How I work</h2>
			<ul>
				{#each about.howIWork as item (item.title)}
					<li><em>{item.title}</em>: {item.text}</li>
				{/each}
			</ul>
		</section>

		<section aria-labelledby="beyond-title">
			<h2 id="beyond-title"><span class="n">04</span>Beyond work</h2>
			{#each about.beyond as item (item.text)}
				<p>
					{item.text}
					{#if item.link}<a href={item.link.href}>{item.link.label} →</a>{/if}
				</p>
			{/each}
		</section>

		<p class="formal">
			Prefer the formal version? <a href="/resume">Résumé (PDF)</a> ·
			<a href="/resume/docx">Word document</a>
		</p>
	</article>
</div>

<style>
	.story {
		max-width: 720px;
		padding-bottom: 16px;
		border-top: 1px solid var(--color-hairline);
	}
	figure {
		float: right;
		width: 220px;
		margin: 32px 0 16px 32px;
	}
	figure img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 4 / 5;
		object-fit: cover;
		border-radius: 110px 110px 6px 6px;
		border: 6px solid #8f6a4c;
	}
	.story p,
	.story li {
		font-size: 19px;
		line-height: 1.7;
		color: var(--color-ink-soft);
	}
	.story p {
		margin-top: 16px;
	}
	.first {
		padding-top: 16px;
		font-size: 21px !important;
		color: var(--color-ink) !important;
	}
	section {
		margin-top: 40px;
	}
	h2 {
		font-size: 26px;
		letter-spacing: -0.02em;
		font-weight: 500;
	}
	h2 .n {
		margin-right: 12px;
		font:
			12px system-ui,
			sans-serif;
		color: var(--color-secondary);
		vertical-align: middle;
	}
	ul {
		display: grid;
		gap: 10px;
		margin: 14px 0 0;
		padding-left: 20px;
	}
	em {
		font-style: italic;
		color: var(--color-ink);
	}
	.story a {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.formal {
		clear: both;
		margin-top: 48px !important;
		padding-top: 24px;
		border-top: 1px solid var(--color-hairline);
	}
	@media (max-width: 650px) {
		figure {
			float: none;
			width: 180px;
			margin: 28px 0 0;
		}
	}
</style>
