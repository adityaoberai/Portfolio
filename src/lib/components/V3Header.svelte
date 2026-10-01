<script lang="ts">
	import { page } from '$app/state';
	import ModeSwitch from './ModeSwitch.svelte';
	import { sections } from '$lib/data/sections';

	// Deep pages get a section nav; World and Index have their own wayfinding.
	// `overlay` floats the header over the full-page room.
	let { nav = false, overlay = false }: { nav?: boolean; overlay?: boolean } = $props();
	const links = sections.filter((s) => !['resume', 'now'].includes(s.id));
	const path = $derived(page.url.pathname.replace(/\/$/, ''));
</script>

<header class="v3-header" class:overlay>
	<div class="bar">
		<a href="/" class="identity">Aditya Oberai<span>Bengaluru, India</span></a>
		<ModeSwitch />
	</div>
	{#if nav}
		<nav aria-label="Sections">
			<ul>
				{#each links as link (link.id)}
					<li>
						<a
							href={link.href}
							aria-current={path === link.href || path.startsWith(`${link.href}/`)
								? 'page'
								: undefined}>{link.label}</a
						>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}
</header>

<style>
	.v3-header {
		background: var(--color-paper);
		border-bottom: 1px solid var(--color-hairline);
	}
	.overlay {
		background: transparent;
		border-bottom: 0;
	}
	.overlay .bar {
		max-width: none;
	}
	.bar,
	nav {
		max-width: var(--container);
		margin-inline: auto;
		padding-inline: var(--gutter);
	}
	.bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 14px;
		padding-block: 22px;
	}
	.identity {
		font-size: 24px;
		line-height: 1.15;
		letter-spacing: -0.04em;
	}
	.identity span {
		display: block;
		margin-top: 5px;
		font:
			10px/1.4 system-ui,
			sans-serif;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: var(--color-secondary);
	}
	nav {
		padding-bottom: 10px;
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0 22px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	nav a {
		display: inline-flex;
		align-items: center;
		min-height: 36px;
		font:
			13px system-ui,
			sans-serif;
		color: var(--color-secondary);
	}
	nav a:hover {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	nav a[aria-current='page'] {
		color: var(--color-ink);
		text-decoration: underline;
		text-decoration-color: var(--color-accent);
		text-decoration-thickness: 2px;
		text-underline-offset: 6px;
	}
	@media (max-width: 480px) {
		.bar {
			padding-block: 16px;
		}
		.identity {
			font-size: 21px;
		}
		ul {
			gap: 0 16px;
		}
	}
</style>
