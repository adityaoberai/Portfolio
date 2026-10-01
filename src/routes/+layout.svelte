<script lang="ts">
	import '@fontsource-variable/newsreader/opsz.css';
	import '@fontsource-variable/newsreader/opsz-italic.css';
	import '../app.css';
	import { page } from '$app/state';
	import V3Header from '$lib/components/V3Header.svelte';
	import V3Footer from '$lib/components/V3Footer.svelte';

	const { children } = $props();
	const path = $derived(page.url.pathname.replace(/\/$/, ''));
	// World and Index carry their own wayfinding; every other page gets the section nav.
	const home = $derived(['', '/world', '/index'].includes(path));
	// World fills the whole page and floats its own header, so the shell steps aside.
	const immersive = $derived(path === '/world' || (path === '' && page.data.mode !== 'index'));
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
	{#if !immersive}<V3Header nav={!home} />{/if}
	<main id="main" tabindex="-1" class="flex-1 focus:outline-none">
		{@render children()}
	</main>
	{#if !immersive}<V3Footer />{/if}
</div>
