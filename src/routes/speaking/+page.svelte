<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import PageIntro from '$lib/components/PageIntro.svelte';
	import Row from '$lib/components/Row.svelte';
	import { talks, speakingTopics, speakerBio } from '$lib/data/talks';
	import { podcasts } from '$lib/data/podcasts';
	import { site } from '$lib/data/site';

	const featured = talks.filter((t) => t.featured);
	let copied = $state(false);

	async function copyBio() {
		try {
			await navigator.clipboard.writeText(speakerBio);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			copied = false;
		}
	}
</script>

<PageMeta
	title="Speaking"
	description="Aditya Oberai speaks about developer relations, community building, writing, and developer education at conferences including RenderATL, All Things Open, and DevRelCon."
	path="/speaking"
/>

<div class="v3-page">
	<PageIntro
		eyebrow="Speaking · the conference wall"
		title="Talks, stages, and the occasional microphone."
		station="lanyards"
	>
		<p>
			I speak about developer relations, communities, and building with AI, and I've organized a
			conference or two myself. If you're putting an event together, I'd love to hear about it.
		</p>
	</PageIntro>

	<section class="v3-section" aria-labelledby="featured-title">
		<h2 id="featured-title"><span class="n">01</span>Featured talks</h2>
		<ul class="badges">
			{#each featured as talk (talk.event + talk.year)}
				<li>
					<span class="badge-head">{talk.event} · {talk.year}</span>
					<h3>{talk.title}</h3>
					<p>{talk.description}</p>
					{#if talk.recording}<a href={talk.recording}>Watch the recording ↗</a>
					{:else if talk.slides}<a href={talk.slides}>See the slides ↗</a>{/if}
				</li>
			{/each}
		</ul>
	</section>

	<section class="v3-section" aria-labelledby="bio-title">
		<h2 id="bio-title"><span class="n">02</span>For organizers</h2>
		<div class="bio">
			<p class="bio-label">Speaker bio · copy freely</p>
			{#each speakerBio.split('\n\n') as paragraph (paragraph)}
				<p>{paragraph}</p>
			{/each}
			<div class="bio-actions">
				<button type="button" onclick={copyBio}>{copied ? 'Copied!' : 'Copy bio'}</button>
				<a href="/pic">Headshot</a>
				<a href="mailto:{site.email}?subject=Speaking invitation">Invite me to speak ↗</a>
			</div>
			<span class="sr-only" aria-live="polite">{copied ? 'Bio copied to clipboard' : ''}</span>
		</div>
		<p class="topics">
			I speak about {speakingTopics.join(', ')}, and the places where they overlap.
		</p>
	</section>

	<section class="v3-section" aria-labelledby="archive-title">
		<h2 id="archive-title"><span class="n">03</span>Every talk</h2>
		<div class="list">
			{#each talks as talk (talk.event + talk.title)}
				<Row
					meta={String(talk.year)}
					title={talk.title}
					subtitle={talk.event}
					description={talk.description}
					href={talk.recording ?? talk.slides}
					external={Boolean(talk.recording ?? talk.slides)}
				/>
			{/each}
		</div>
		<p class="note">Also: organized DevRelCon Bengaluru 2024, the first-ever DevRelCon in India.</p>
	</section>

	<section class="v3-section" id="podcasts" aria-labelledby="podcasts-title">
		<h2 id="podcasts-title"><span class="n">04</span>Podcasts and streams</h2>
		<div class="list">
			{#each podcasts as episode (episode.url)}
				<Row
					meta={String(episode.year)}
					title={episode.title}
					subtitle={episode.show}
					href={episode.url}
					external
				/>
			{/each}
		</div>
	</section>
</div>

<style>
	.badges {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 16px;
		margin: 20px 0 0;
		padding: 0;
		list-style: none;
	}
	.badges li {
		padding: 0 20px 18px;
		background: #fffdf6;
		border: 1px solid var(--color-hairline-strong);
		border-radius: 10px;
		overflow: hidden;
	}
	.badge-head {
		display: block;
		margin: 0 -20px 14px;
		padding: 10px 20px;
		background: var(--color-accent);
		color: #fffaf0;
		font:
			11px/1.4 system-ui,
			sans-serif;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.badges h3 {
		font-size: 20px;
		line-height: 1.3;
		font-weight: 500;
	}
	.badges p {
		margin-top: 8px;
		font-size: 15px;
		line-height: 1.55;
		color: var(--color-secondary);
	}
	.badges a,
	.bio-actions a {
		display: inline-flex;
		align-items: center;
		min-height: 40px;
		margin-top: 6px;
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.bio {
		max-width: 720px;
		margin-top: 20px;
		padding: 24px;
		background: var(--color-surface);
		border: 1px solid var(--color-hairline);
		border-radius: 6px;
	}
	.bio p {
		margin-top: 10px;
		font-size: 16px;
		line-height: 1.6;
	}
	.bio .bio-label {
		margin-top: 0;
		font:
			11px/1.5 system-ui,
			sans-serif;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-secondary);
	}
	.bio-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 24px;
		margin-top: 16px;
	}
	.bio-actions button {
		min-height: 44px;
		padding: 0 18px;
		background: var(--color-accent);
		color: #fffaf0;
		border-radius: 4px;
		cursor: pointer;
	}
	.topics,
	.note {
		max-width: 720px;
		margin-top: 18px;
		font-size: 16px;
		line-height: 1.6;
		color: var(--color-secondary);
	}
	.list {
		margin-top: 16px;
		border-top: 1px solid var(--color-hairline);
	}
	#podcasts {
		scroll-margin-top: 24px;
	}
</style>
