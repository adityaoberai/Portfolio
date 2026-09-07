<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import IndexRow from '$lib/components/IndexRow.svelte';
	import CommunityCard from '$lib/components/CommunityCard.svelte';
	import ContactCTA from '$lib/components/ContactCTA.svelte';
	import PhotoGallery from '$lib/components/PhotoGallery.svelte';
	import { highlights } from '$lib/data/highlights';
	import { workThemes } from '$lib/data/work';
	import { talks } from '$lib/data/talks';
	import { communityInitiatives } from '$lib/data/community';
	import { destinations } from '$lib/data/links';
	import { writingSamples } from '$lib/data/writing';
	import { site } from '$lib/data/site';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const featuredWorkRows = [
		{ tag: 'DEVREL', title: 'Developer Relations', slug: 'developer-relations' },
		{ tag: 'STORYTELLING', title: 'Product Storytelling', slug: 'product-storytelling' },
		{ tag: 'COMMUNITY', title: 'Community', slug: 'community' },
		{ tag: 'DX', title: 'Developer Experience', slug: 'developer-experience' },
		{ tag: 'AWARDS', title: 'Recognition', slug: 'recognition' }
	].map((row) => {
		const theme = workThemes.find((t) => t.slug === row.slug);
		return { ...row, description: theme?.summary ?? '' };
	});

	const speakingPreview = talks.filter((t) => t.featured).slice(0, 3);
	const communityPreview = communityInitiatives.filter((c) => c.featured).slice(0, 4);
	const domainOf = (href: string) =>
		href.startsWith('/') ? 'oberai.dev' : new URL(href).hostname.replace(/^www\./, '');
</script>

<PageMeta path="/" />

<!-- Hero: the title page -->
<section class="mx-auto max-w-4xl px-6 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24">
	<div class="flex flex-col gap-8 md:flex-row-reverse md:items-center md:gap-16">
		<div class="w-44 shrink-0 md:w-64">
			<div class="rounded-md border border-hairline p-1.5">
				<img
					src={site.portrait}
					alt="Aditya Oberai"
					width="240"
					height="240"
					loading="eager"
					class="w-full rounded-[3px]"
				/>
			</div>
		</div>
		<div class="max-w-2xl">
			<h1 class="text-h1">Hi, I'm <span class="whitespace-nowrap">Aditya Oberai.</span></h1>
			<p class="mt-6 text-lede italic">
				I work in developer relations, helping developer tools communicate better, teach better, and
				build stronger communities.
			</p>
			<p class="mt-5 text-body">
				I lead Developer Relations at Appwrite, where I spend my days turning product launches into
				stories, documentation into teaching, and users into communities. Along the way I've
				organized India's first DevRelCon and photographed more conference hallways than I can
				count.
			</p>
			<div class="mt-8 flex flex-wrap items-center gap-6">
				<a href="/work" class="btn-primary">View my work</a>
				<a
					href="https://oberai.blog"
					target="_blank"
					rel="noopener noreferrer"
					class="link-tertiary"
				>
					Read my writing <span class="arrow" aria-hidden="true">→</span><span class="sr-only"
						>(opens in new tab)</span
					>
				</a>
			</div>
		</div>
	</div>

	<!-- The fact strip: the ledger, folded into the hero -->
	<p class="meta mt-12 flex flex-wrap gap-x-3 gap-y-1 border-t border-hairline pt-6">
		{#each highlights as fact, i (fact)}
			{#if i > 0}<span aria-hidden="true">·</span>{/if}
			<span>{fact}</span>
		{/each}
	</p>
</section>

<p class="asterism" aria-hidden="true">⁂</p>

<!-- 01 · Selected work -->
<section class="mx-auto max-w-4xl px-6 pt-16 md:px-8 md:pt-24">
	<SectionHeader
		number="01"
		label="Selected Work"
		title="What I work on"
		lede="Five themes, from product launches to the programs behind them."
	/>
	<div class="-mx-4 mt-6 divide-y divide-hairline border-b border-t border-hairline">
		{#each featuredWorkRows as row (row.slug)}
			<IndexRow
				meta={row.tag}
				title={row.title}
				description={row.description}
				href="/work#{row.slug}"
			/>
		{/each}
	</div>
</section>

<!-- 02 · Speaking preview -->
<section class="mx-auto max-w-4xl px-6 pt-16 md:px-8 md:pt-24">
	<SectionHeader number="02" label="Speaking" title="Recent and upcoming talks" />
	<div class="-mx-4 mt-6 divide-y divide-hairline border-b border-t border-hairline">
		{#each speakingPreview as talk (talk.event + talk.title)}
			<IndexRow
				meta="{talk.year} · {talk.event}"
				title={talk.title}
				description={talk.description}
				href="/speaking"
			/>
		{/each}
	</div>
	<p class="mt-6">
		<a href="/speaking" class="link-tertiary"
			>All talks <span class="arrow" aria-hidden="true">→</span></a
		>
	</p>
</section>

<!-- 03 · Community preview -->
<section class="mx-auto max-w-4xl px-6 pt-16 md:px-8 md:pt-24">
	<SectionHeader
		number="03"
		label="Community"
		title="Bringing people together"
		lede="Programs and gatherings I've started or grown, because developer tools are only half the story."
	/>
	<div class="mt-8 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
		{#each communityPreview as initiative (initiative.slug)}
			<CommunityCard {initiative} />
		{/each}
	</div>
	<p class="mt-8">
		<a href="/community" class="link-tertiary"
			>More <span class="arrow" aria-hidden="true">→</span></a
		>
	</p>
</section>

<!-- 04 · Writing -->
<section class="mx-auto max-w-4xl px-6 pt-16 md:px-8 md:pt-24">
	<SectionHeader
		number="04"
		label="Writing"
		title="From the blog"
		lede="A few recent pieces. The full archive lives on Substack."
	/>
	<div class="-mx-4 mt-6 divide-y divide-hairline border-b border-t border-hairline">
		{#each writingSamples as post (post.title)}
			<IndexRow
				meta={post.meta}
				title={post.title}
				description={post.description}
				href={post.href}
				external
			/>
		{/each}
	</div>
	<p class="mt-6">
		<a href="https://oberai.blog" target="_blank" rel="noopener noreferrer" class="link-tertiary"
			>Read on Substack <span class="arrow" aria-hidden="true">→</span><span class="sr-only"
				>(opens in new tab)</span
			></a
		>
	</p>
</section>

<!-- 05 · Photography -->
<section class="mx-auto max-w-4xl px-6 pt-16 md:px-8 md:pt-24">
	<SectionHeader
		number="05"
		label="Photography"
		title="Through the lens"
		lede="Street, travel, and event photography, free to use and free to enjoy."
	/>
	<div class="mt-8">
		<PhotoGallery photos={data.photos} />
	</div>
	<p class="mt-8">
		<a
			href="https://www.pexels.com/@oberai"
			target="_blank"
			rel="noopener noreferrer"
			class="link-tertiary"
			>Explore on Pexels <span class="arrow" aria-hidden="true">→</span><span class="sr-only"
				>(opens in new tab)</span
			></a
		>
	</p>
</section>

<!-- 06 · Elsewhere -->
<section class="mx-auto max-w-4xl px-6 pt-16 md:px-8 md:pt-24">
	<SectionHeader
		number="06"
		label="Elsewhere"
		title="Where the work lives"
		lede="This site is the hub; the work itself lives on the platforms that do it best."
	/>
	<div class="-mx-4 mt-6 divide-y divide-hairline border-b border-t border-hairline">
		{#each destinations as dest (dest.title)}
			<IndexRow
				meta={dest.title.toUpperCase()}
				title={dest.cta}
				description={dest.description}
				domain={domainOf(dest.href)}
				href={dest.href}
				external={dest.external}
			/>
		{/each}
	</div>
</section>

<p class="asterism pt-16 md:pt-24" aria-hidden="true">⁂</p>

<!-- Contact close -->
<section class="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-24">
	<ContactCTA />
</section>
