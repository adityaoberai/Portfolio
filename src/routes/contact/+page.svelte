<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import IndexRow from '$lib/components/IndexRow.svelte';
	import { site } from '$lib/data/site';
	import { socialLinks } from '$lib/data/links';

	const rows = [
		...socialLinks.map(({ name, handle, url }) => ({
			meta: name.toUpperCase(),
			title: `@${handle}`,
			href: url,
			external: true,
			domain: new URL(url).hostname.replace(/^www\./, '')
		})),
		{
			meta: 'WRITING',
			title: 'Substack newsletter',
			href: 'https://oberai.blog',
			external: true,
			domain: 'oberai.blog'
		},
		{
			meta: 'PHOTOS',
			title: 'Pexels archive',
			href: 'https://www.pexels.com/@oberai',
			external: true,
			domain: 'pexels.com'
		},
		{
			meta: 'RÉSUMÉ',
			title: 'resume.pdf',
			href: site.resume,
			external: false,
			domain: 'oberai.dev'
		}
	];
</script>

<PageMeta
	title="Contact"
	description="Get in touch with Aditya Oberai for speaking invitations, consulting, and community collaborations."
	path="/contact"
/>

<div class="mx-auto max-w-2xl px-6 py-16 md:px-8 md:py-24">
	<h1 class="text-h1">Say hello.</h1>
	<p class="mt-6 text-lede italic text-secondary">
		Whether it's a speaking invitation, a consulting question, or a community collaboration, my
		inbox is open. And I actually read it.
	</p>

	<p class="mt-10">
		<a href="mailto:{site.email}" class="prose-link text-[1.3125rem]">{site.email}</a>
	</p>

	<div class="-mx-4 mt-12 divide-y divide-hairline border-b border-t border-hairline">
		{#each rows as row (row.meta)}
			<IndexRow
				meta={row.meta}
				title={row.title}
				domain={row.domain}
				href={row.href}
				external={row.external}
			/>
		{/each}
	</div>
</div>
