<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import PageIntro from '$lib/components/PageIntro.svelte';
	import Row from '$lib/components/Row.svelte';
	import { site } from '$lib/data/site';
	import { socialLinks, sponsorLink } from '$lib/data/links';
	import { pexelsProfile } from '$lib/data/photography';
	import { collection } from '$lib/data/collection';

	const domain = (url: string) => new URL(url).hostname.replace(/^www\./, '');
	const rows = [
		...socialLinks.map(({ name, handle, url }) => ({
			meta: name,
			title: `@${handle}`,
			subtitle: domain(url),
			href: url
		})),
		{
			meta: 'Writing',
			title: 'The newsletter',
			subtitle: 'oberai.blog',
			href: 'https://oberai.blog'
		},
		{ meta: 'Photos', title: 'Pexels archive', subtitle: 'pexels.com', href: pexelsProfile },
		{
			meta: 'Cards',
			title: 'Collectr showcase',
			subtitle: 'getcollectr.com',
			href: collection.showcaseUrl
		},
		{ meta: 'Support', title: 'GitHub Sponsors', subtitle: 'github.com', href: sponsorLink }
	];
</script>

<PageMeta
	title="Contact"
	description="Get in touch with Aditya Oberai for speaking invitations, consulting, and community collaborations."
	path="/contact"
/>

<div class="v3-page">
	<PageIntro eyebrow="Contact · the door" title="Say hello." station="door">
		<p>
			Whether it's a speaking invitation, a consulting question, or a community collaboration, my
			inbox is open. And I actually read it.
		</p>
	</PageIntro>

	<p class="mail"><a href="mailto:{site.email}">{site.email}</a></p>
	<p class="also">
		<a href="mailto:{site.email}?subject=Speaking invitation">Speaking invitation ↗</a>
		<a href="/resume">Résumé (PDF) →</a>
	</p>

	<section class="v3-section" aria-labelledby="elsewhere-title">
		<h2 id="elsewhere-title"><span class="n">01</span>Elsewhere</h2>
		<div class="list">
			{#each rows as row (row.href)}
				<Row meta={row.meta} title={row.title} subtitle={row.subtitle} href={row.href} external />
			{/each}
		</div>
	</section>
</div>

<style>
	.mail {
		font-size: clamp(24px, 3vw, 32px);
	}
	.mail a,
	.also a {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 5px;
	}
	.also {
		display: flex;
		flex-wrap: wrap;
		gap: 0 28px;
		margin: 12px 0 40px;
	}
	.also a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
	}
	.list {
		max-width: 760px;
		margin-top: 16px;
		border-top: 1px solid var(--color-hairline);
	}
</style>
