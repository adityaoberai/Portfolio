<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import IndexRow from '$lib/components/IndexRow.svelte';
	import TalkCard from '$lib/components/TalkCard.svelte';
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

<div class="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-24">
	<header class="max-w-2xl">
		<h1 class="text-h1">Talks, stages, and the occasional microphone.</h1>
		<p class="mt-6 text-lede italic text-secondary">
			I speak about developer relations, communities, and building with AI, and I've organized a
			conference or two myself. If you're putting an event together, I'd love to hear about it.
		</p>
	</header>

	<section class="pt-16 md:pt-24">
		<SectionHeader number="01" label="Featured talks" />
		<div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
			{#each featured as talk (talk.event + talk.title)}
				<TalkCard {talk} />
			{/each}
		</div>
	</section>

	<section class="pt-16 md:pt-24">
		<SectionHeader number="02" label="Speaker bio" />
		<div class="mt-6 max-w-2xl rounded-md border border-hairline bg-surface p-6 md:p-8">
			<p class="eyebrow">For organizers · copy freely</p>
			<div class="mt-4 flex flex-col gap-3 text-small">
				{#each speakerBio.split('\n\n') as paragraph (paragraph)}
					<p>{paragraph}</p>
				{/each}
			</div>
			<div class="mt-6 flex flex-wrap items-center gap-4">
				<button type="button" class="btn-secondary cursor-pointer" onclick={copyBio}>
					{copied ? 'Copied!' : 'Copy bio'}
				</button>
				<a href="/pic" class="prose-link text-small">Headshot</a>
			</div>
		</div>
	</section>

	<section class="pt-16 md:pt-24">
		<SectionHeader number="03" label="Invite me" />
		<p class="mt-5 max-w-2xl text-body">
			Have a stage and an audience of developers? Tell me about the event, the audience, and the
			date. I'll get back to you quickly.
		</p>
		<p class="mt-4 max-w-2xl text-body">
			I speak about {speakingTopics.join(', ')}, and the places where they overlap.
		</p>
		<p class="mt-6">
			<a href="mailto:{site.email}?subject=Speaking invitation" class="btn-primary">
				Invite me to speak
			</a>
		</p>
	</section>
	<section class="pt-16 md:pt-24">
		<SectionHeader number="04" label="Talk archive" />
		<div class="-mx-4 mt-6 divide-y divide-hairline border-b border-t border-hairline">
			{#each talks as talk (talk.event + talk.title)}
				<IndexRow
					meta={String(talk.year)}
					title={talk.title}
					subtitle={talk.event}
					description={talk.description}
					href={talk.recording ?? talk.slides}
					external={Boolean(talk.recording ?? talk.slides)}
				/>
			{/each}
		</div>
		<p class="meta mt-4">
			Also: organized DevRelCon Bengaluru 2024, the first-ever DevRelCon in India.
		</p>
	</section>

	<section class="pt-16 md:pt-24">
		<SectionHeader number="05" label="Podcasts and streams" />
		<div class="-mx-4 mt-6 divide-y divide-hairline border-b border-t border-hairline">
			{#each podcasts as episode (episode.url)}
				<IndexRow
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
