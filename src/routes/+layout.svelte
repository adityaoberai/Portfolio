<script lang="ts">
	import '@fontsource-variable/newsreader/opsz.css';
	import '@fontsource-variable/newsreader/opsz-italic.css';
	import '../app.css';
	import { page } from '$app/state';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	const { children } = $props();
	const isV3 = $derived(['/world', '/index'].includes(page.url.pathname.replace(/\/$/, '')));
</script>

<svelte:head>
	<!-- Global site tag (gtag.js) - Google Analytics -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=G-1BXTEHW3F6"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag('js', new Date());
		gtag('config', 'G-1BXTEHW3F6');
	</script>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<a
		href="#main"
		class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2.5 focus:text-small focus:text-paper"
	>
		Skip to content
	</a>
	{#if !isV3}<SiteHeader />{/if}
	{#key page.url.pathname}
		<main id="main" tabindex="-1" class:page-enter={!isV3} class="flex-1 focus:outline-none">
			{@render children()}
		</main>
	{/key}
	{#if !isV3}<SiteFooter />{/if}
</div>
