<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import PageIntro from '$lib/components/PageIntro.svelte';
	import Row from '$lib/components/Row.svelte';
	import { talks, speakingTopics, speakerBio } from '$lib/data/talks';
	import { podcasts } from '$lib/data/podcasts';
	import { site } from '$lib/data/site';
	import { contentId, trackEvent } from '$lib/analytics';
	import { contactVisibility } from '$lib/contact-visibility';

	const featured = talks.filter((t) => t.featured);
	let copied = $state(false);

	async function copyBio() {
		try {
			await navigator.clipboard.writeText(speakerBio);
			trackEvent('speaker_bio_copied', { section: 'speaking_page' });
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

<div class="v3-page" data-analytics-section="speaking_page">
	<PageIntro title="Talks, stages, and the occasional microphone." station="corkboard">
		<p>
			I speak about developer relations, communities, and building with AI, and I've organized a
			conference or two myself. If you're putting an event together, I'd love to hear about it.
		</p>
	</PageIntro>

	<section class="v3-section" aria-labelledby="featured-title">
		<h2 id="featured-title"><span class="n">01</span>Featured talks</h2>
		<ul class="badges">
			{#each featured as talk (talk.event + talk.year)}
				<li
					data-content-type="talk"
					data-content-id={contentId('talk', `${talk.event}-${talk.year}`)}
				>
					<span class="badge-head">{talk.event} · {talk.year}</span>
					<h3>{talk.title}</h3>
					<p>{talk.description}</p>
					{#if talk.recording}<a href={talk.recording} data-content-action="recording"
							>Watch the recording ↗</a
						>
					{:else if talk.slides}<a href={talk.slides} data-content-action="slides"
							>See the slides ↗</a
						>{/if}
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
			<div
				class="bio-actions"
				data-contact-section="speaking_page"
				use:contactVisibility={{ section: 'speaking_page' }}
			>
				<button type="button" onclick={copyBio}>{copied ? 'Copied!' : 'Copy bio'}</button>
				<a href="/pic" data-speaker-asset="headshot">Headshot</a>
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
					tracking={{
						type: 'talk',
						id: contentId('talk', `${talk.event}-${talk.year}`),
						action: talk.recording ? 'recording' : 'slides'
					}}
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
					tracking={{
						type: 'podcast',
						id: contentId('podcast', `${episode.year}-${episode.title}`)
					}}
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
			var(--type-meta) / 1.5 var(--font-ui),
			sans-serif;
		letter-spacing: normal;
		text-transform: none;
	}
	.badges h3 {
		font-size: 20px;
		line-height: 1.3;
		font-weight: 500;
	}
	.badges p {
		margin-top: 8px;
		font-size: var(--type-body);
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
		font-size: var(--type-body);
		line-height: 1.6;
	}
	.bio .bio-label {
		margin-top: 0;
		font:
			var(--type-meta) / 1.5 var(--font-ui),
			sans-serif;
		letter-spacing: normal;
		text-transform: none;
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
		font-size: var(--type-body);
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
