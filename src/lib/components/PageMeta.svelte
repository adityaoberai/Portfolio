<script lang="ts">
	import { site } from '$lib/data/site';

	let {
		title,
		description,
		path = '/'
	}: { title?: string; description?: string; path?: string } = $props();

	const pageTitle = $derived(title ? `${title} · ${site.name}` : site.name);
	const pageDescription = $derived(description ?? site.description);
	const canonical = $derived(`${site.url}${path === '/' ? '/' : path}`);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="author" content={site.name} />
	<link rel="canonical" href={canonical} />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={site.ogImage} />
	<meta property="og:site_name" content={site.name} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={site.ogImage} />
	<meta name="twitter:creator" content={site.twitterHandle} />
</svelte:head>
