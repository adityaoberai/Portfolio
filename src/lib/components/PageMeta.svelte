<script lang="ts">
	import { site } from '$lib/data/site';
	import { socialLinks } from '$lib/data/links';
	import { pexelsProfile } from '$lib/data/photography';

	let {
		title,
		description,
		path = '/'
	}: { title?: string; description?: string; path?: string } = $props();

	const pageTitle = $derived(title ? `${title} · ${site.name}` : site.name);
	const pageDescription = $derived(description ?? site.description);
	const canonical = $derived(`${site.url}${path === '/' ? '/' : path}`);

	// Structured data for search engines on the pages that introduce Aditya.
	const person = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: site.name,
		url: site.url,
		image: `${site.url}${site.portrait}`,
		jobTitle: 'Developer Relations Lead',
		worksFor: { '@type': 'Organization', name: 'Appwrite', url: 'https://appwrite.io' },
		address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressCountry: 'IN' },
		email: `mailto:${site.email}`,
		sameAs: [...socialLinks.map((link) => link.url), 'https://oberai.blog', pexelsProfile]
	};
	const jsonLd = `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</${'script'}>`;
	const introducesPerson = $derived(['/', '/index', '/about'].includes(path));
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="author" content={site.name} />
	<link rel="canonical" href={canonical} />

	<meta property="og:type" content={path === '/about' ? 'profile' : 'website'} />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={site.ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta
		property="og:image:alt"
		content="Aditya Oberai: come spend a minute in my world. An illustrated low-poly room."
	/>
	<meta property="og:site_name" content={site.name} />
	<meta property="og:locale" content="en_IN" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content={site.twitterHandle} />
	<meta name="twitter:creator" content={site.twitterHandle} />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={site.ogImage} />

	{#if introducesPerson}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- static, escaped JSON-LD -->
		{@html jsonLd}
	{/if}
</svelte:head>
