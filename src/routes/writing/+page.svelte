<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import PageIntro from '$lib/components/PageIntro.svelte';
	import Row from '$lib/components/Row.svelte';
	import { ofType } from '$lib/data/artifacts';
	import { workThemes } from '$lib/data/work';

	const essays = ofType('essay');
	// Professional writing lives on Appwrite's site; these are the existing records for it.
	const professional = workThemes.find((t) => t.slug === 'product-storytelling')?.items ?? [];
</script>

<PageMeta
	title="Writing"
	description="Personal essays by Aditya Oberai on home, friendship, legacy, and being human, plus 140+ technical articles and customer stories for Appwrite."
	path="/writing"
/>

<div class="v3-page">
	<PageIntro eyebrow="Writing · the notebook" title="Writing things down." station="notebook">
		<p>
			I write about developer relations, developer tools, and whatever I'm currently figuring out:
			personal essays on oberai.blog, and technical writing for Appwrite.
		</p>
	</PageIntro>

	<section class="v3-section" aria-labelledby="essays-title">
		<h2 id="essays-title"><span class="n">01</span>Personal essays</h2>
		<p class="note">On oberai.blog, newest first.</p>
		<div class="list">
			{#each essays as essay (essay.id)}
				<Row
					meta={essay.date}
					title={essay.title}
					description={essay.description}
					href={essay.externalUrl}
					external
				/>
			{/each}
		</div>
		<p class="cta"><a href="https://oberai.blog">Subscribe to the newsletter ↗</a></p>
	</section>

	<section class="v3-section" aria-labelledby="work-title">
		<h2 id="work-title"><span class="n">02</span>For work</h2>
		<div class="list">
			{#each professional as item (item.title)}
				<Row
					meta={item.tag}
					title={item.title}
					description={item.description}
					href={item.link?.href}
					external={Boolean(item.link)}
				/>
			{/each}
		</div>
	</section>
</div>

<style>
	.note {
		margin-top: 8px;
		font-size: 16px;
		color: var(--color-secondary);
	}
	.list {
		margin-top: 16px;
		border-top: 1px solid var(--color-hairline);
	}
	.cta a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		margin-top: 16px;
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
</style>
