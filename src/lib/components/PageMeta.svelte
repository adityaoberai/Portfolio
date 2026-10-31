<script lang="ts">
	import { site } from '$lib/data/site';
	import { canonicalPath } from '$lib/data/canonical';
	import { person } from '$lib/data/identity';

	let {
		title,
		description,
		path = '/'
	}: { title?: string; description?: string; path?: string } = $props();

	const pageTitle = $derived(title ? `${title} · ${site.name}` : `${site.name} · ${site.role}`);
	const pageDescription = $derived(description ?? site.description);
	const canonical = $derived(`${site.url}${canonicalPath(path)}`);

	// Structured data for search engines on the pages that introduce Aditya.
	const structuredData = $derived({
		'@context': 'https://schema.org',
		'@graph': [
			person,
			{
				'@type': 'WebSite',
				'@id': `${site.url}/#website`,
				url: `${site.url}/`,
				name: site.name,
				publisher: { '@id': person['@id'] }
			},
			{
				'@type': path === '/about' ? 'ProfilePage' : 'WebPage',
				'@id': `${canonical}#webpage`,
				url: canonical,
				name: canonicalPath(path) === '/' ? site.name : pageTitle,
				mainEntity: { '@id': person['@id'] },
				isPartOf: { '@id': `${site.url}/#website` }
			}
		]
	});
	const jsonLd = $derived(
		`<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</${'script'}>`
	);
	const introducesPerson = $derived(['/', '/world', '/index', '/about'].includes(path));
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="author" content={site.name} />
	<link rel="canonical" href={canonical} />
	<link rel="describedby" href="/llms.txt" type="text/plain" />

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
