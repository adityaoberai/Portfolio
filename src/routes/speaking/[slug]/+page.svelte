<script lang="ts">
	import { contentId } from '$lib/analytics';
	import PageIntro from '$lib/components/PageIntro.svelte';
	import PageMeta from '$lib/components/PageMeta.svelte';
	import { person, type StructuredEntity } from '$lib/data/identity';
	import { site } from '$lib/data/site';
	import { talkPagePath, talkResources } from '$lib/data/talks';
	import { externalLinkAttrs } from '$lib/external-links';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const talk = $derived(data.talk);
	const path = $derived(talkPagePath(talk.detail.slug));
	const url = $derived(new URL(path, site.url).href);
	const references = $derived(talkResources(talk));
	const talkEntity = $derived<StructuredEntity>({
		'@type': 'CreativeWork',
		'@id': `${url}#talk`,
		url,
		name: talk.title,
		description: talk.description,
		genre: 'Conference talk',
		creator: [
			{ '@id': person['@id'] },
			...(talk.detail.coSpeakers ?? []).map((name) => ({ '@type': 'Person', name }))
		],
		citation: references.map((link) => link.href)
	});
</script>

<PageMeta title={talk.title} description={talk.description} {path} mainEntity={talkEntity} />

<div class="v3-page" data-analytics-section="talk_detail">
	<article class="v3-detail">
		<PageIntro title={talk.title} station="corkboard">
			<p>{talk.description}</p>
			<p class="meta">{talk.event} · {talk.year} · {talk.detail.location}</p>
			<p class="meta">
				<a class="prose-link" href="/about">{site.name}</a>{#if talk.detail.coSpeakers}
					with {talk.detail.coSpeakers.join(' and ')}
				{/if}
			</p>
		</PageIntro>

		<section class="v3-section" aria-labelledby="topics">
			<h2 id="topics">What the talk covers</h2>
			<ul>
				{#each talk.detail.takeaways as takeaway (takeaway)}
					<li>{takeaway}</li>
				{/each}
			</ul>
		</section>
		<section class="v3-section" aria-labelledby="talk-links">
			<h2 id="talk-links">Talk resources</h2>
			<ul
				data-content-type="talk"
				data-content-id={contentId('talk', `${talk.event}-${talk.year}`)}
			>
				{#each references as link (link.href)}
					<li>
						<a
							class="prose-link"
							href={link.href}
							{...externalLinkAttrs(link.href)}
							data-content-action={link.action ?? 'source'}
						>
							{link.label}<span class="sr-only"> (opens in a new tab)</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
		<a class="detail-back prose-link" href="/speaking">← All talks</a>
	</article>
</div>
