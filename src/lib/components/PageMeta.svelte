<script lang="ts">
	import { site } from '$lib/data/site';
	import { canonicalPath } from '$lib/data/canonical';
	import { person, type StructuredEntity } from '$lib/data/identity';

	let {
		title,
		description,
		path = '/',
		mainEntity,
		mentions = []
	}: {
		title?: string;
		description?: string;
		path?: string;
		mainEntity?: StructuredEntity;
		mentions?: StructuredEntity[];
	} = $props();

	const pageTitle = $derived(title ? `${title} · ${site.name}` : `${site.name} · ${site.role}`);
	const pageDescription = $derived(description ?? site.description);
	const canonical = $derived(`${site.url}${canonicalPath(path)}`);

	const introducesPerson = $derived(['/', '/world', '/index', '/about'].includes(path));
	const websiteId = `${site.url}/#website`;
	const hasStructuredData = $derived(
		introducesPerson || Boolean(mainEntity) || mentions.length > 0
	);

	// Reference the same Person across the profile, authored work, and the site itself.
	const structuredData = $derived({
		'@context': 'https://schema.org',
		'@graph': [
			person,
			{
				'@type': 'WebSite',
				'@id': websiteId,
				url: `${site.url}/`,
				name: site.name,
				publisher: { '@id': person['@id'] }
			},
			{
				'@type': path === '/about' ? 'ProfilePage' : mentions.length ? 'CollectionPage' : 'WebPage',
				'@id': `${canonical}#webpage`,
				url: canonical,
				name: canonicalPath(path) === '/' ? site.name : pageTitle,
				description: pageDescription,
				mainEntity: mainEntity
					? { '@id': mainEntity['@id'] }
					: introducesPerson
						? { '@id': person['@id'] }
						: undefined,
				mentions: mentions.length ? mentions.map((item) => ({ '@id': item['@id'] })) : undefined,
				isPartOf: { '@id': websiteId }
			},
			...(mainEntity ? [mainEntity] : []),
			...mentions
		]
	});
	const jsonLd = $derived(
		`<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</${'script'}>`
	);
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

	{#if hasStructuredData}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- static, escaped JSON-LD -->
		{@html jsonLd}
	{/if}
</svelte:head>
