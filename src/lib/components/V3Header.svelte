<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import ModeSwitch from './ModeSwitch.svelte';
	import { sections } from '$lib/data/sections';

	// Deep pages get a section nav; World and Index have their own wayfinding.
	// `overlay` floats the header over the full-page room.
	let {
		nav = false,
		overlay = false,
		menu
	}: { nav?: boolean; overlay?: boolean; menu?: Snippet } = $props();
	const links = sections.filter((s) => s.id !== 'resume');
	const path = $derived(page.url.pathname.replace(/\/$/, ''));
</script>

<header class="v3-header" class:overlay class:with-menu={Boolean(menu)}>
	<div class="bar">
		<a href="/" class="identity">Aditya Oberai</a>
		<div class="header-actions">
			<div class="surface"><ModeSwitch /></div>
			{#if menu}{@render menu()}{/if}
		</div>
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
		gap: 8px 16px;
		flex-wrap: wrap;
		padding-block: 22px;
	}
	.identity {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-size: 24px;
		line-height: 1.15;
		letter-spacing: -0.015em;
	}
	.header-actions {
		display: flex;
		align-items: center;
		gap: 20px;
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
		min-height: 44px;
		font:
			var(--type-ui) / 1.5 var(--font-ui),
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
	@media (max-width: 650px) {
		ul {
			flex-wrap: nowrap;
			overflow-x: auto;
		}
		li {
			flex-shrink: 0;
		}
		.bar {
			padding-block: 14px;
		}
	}
	@media (max-width: 820px) {
		.overlay.with-menu .surface {
			display: none;
		}
	}
</style>
