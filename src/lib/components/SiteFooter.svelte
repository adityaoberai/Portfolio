<script lang="ts">
	import { site } from '$lib/data/site';
	import { socialLinks } from '$lib/data/links';

	const year = new Date().getFullYear();

	const footerLinks = [
		...socialLinks.map(({ name, url }) => ({ name, url, external: true })),
		{ name: 'Email', url: `mailto:${site.email}`, external: false },
		{ name: 'Writing', url: 'https://oberai.blog', external: true },
		{ name: 'Photography', url: 'https://www.pexels.com/@oberai', external: true },
		{ name: 'Résumé', url: site.resume, external: false }
	];
</script>

<footer class="mx-auto mt-16 w-full max-w-4xl px-6 pb-10 md:px-8">
	<!-- The end-matter frame: a printed double rule, the way a book closes -->
	<div class="border-t border-hairline" aria-hidden="true"></div>
	<div class="mt-[3px] border-t-2 border-ink" aria-hidden="true"></div>

	<nav aria-label="Elsewhere" class="mt-8">
		<ul class="flex flex-wrap gap-x-6 gap-y-2">
			{#each footerLinks as { name, url, external } (name)}
				<li>
					<a
						href={url}
						target={external ? '_blank' : undefined}
						rel={external ? 'noopener noreferrer' : undefined}
						class="eyebrow inline-block py-2.5 transition-colors hover:text-accent"
					>
						{name}{#if external}<span class="sr-only"> (opens in new tab)</span>{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<p class="mt-6 text-small italic text-secondary">
		Set in Newsreader · Built with SvelteKit · © {year} Aditya Oberai
	</p>
</footer>
