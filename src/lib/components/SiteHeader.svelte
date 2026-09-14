<script lang="ts">
	import { page } from '$app/state';
	import { primaryNav, site } from '$lib/data/site';

	function isCurrent(href: string): boolean {
		const path = page.url.pathname.replace(/\/$/, '') || '/';
		return href === '/' ? path === '/' : path === href;
	}
</script>

<header class="mx-auto w-full max-w-4xl px-6 py-6 md:px-8">
	<nav aria-label="Primary" class="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
		<a href="/" class="text-lg font-medium italic transition-colors hover:text-accent">
			{site.name}
		</a>
		<ul class="flex flex-wrap justify-center gap-x-5 gap-y-1">
			{#each primaryNav as { label, href } (href)}
				{@const current = isCurrent(href)}
				<li>
					<a
						{href}
						aria-current={current ? 'page' : undefined}
						class="inline-block py-2.5 text-small transition-colors {current
							? 'text-ink'
							: 'text-secondary hover:text-ink'}"
					>
						{#if current}<span class="text-accent" aria-hidden="true">*</span>{/if}{label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>
