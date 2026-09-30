<script lang="ts">
	// One entry in a V3 list: talks, podcasts, links, essays.
	let {
		meta,
		title,
		subtitle,
		description,
		href,
		external = false
	}: {
		meta?: string;
		title: string;
		subtitle?: string;
		description?: string;
		href?: string;
		external?: boolean;
	} = $props();
</script>

{#snippet body()}
	{#if meta}<span class="meta">{meta}</span>{/if}
	<span class="text">
		<span class="title"
			>{title}{#if href}<span class="arrow" aria-hidden="true">&nbsp;{external ? '↗' : '→'}</span
				>{/if}{#if external}<span class="sr-only"> (external site)</span>{/if}</span
		>
		{#if subtitle}<span class="subtitle">{subtitle}</span>{/if}
		{#if description}<span class="description">{description}</span>{/if}
	</span>
{/snippet}

{#if href}
	<a class="row" {href}>{@render body()}</a>
{:else}
	<div class="row">{@render body()}</div>
{/if}

<style>
	.row {
		display: grid;
		grid-template-columns: 110px 1fr;
		gap: 4px 22px;
		padding: 20px 0;
		border-bottom: 1px solid var(--color-hairline);
	}
	.meta {
		padding-top: 5px;
		font:
			12px/1.5 system-ui,
			sans-serif;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-secondary);
	}
	.text {
		display: grid;
		gap: 4px;
		grid-column: 2;
	}
	.meta + .text {
		grid-column: auto;
	}
	.title {
		font-size: 21px;
		line-height: 1.3;
	}
	.arrow {
		color: var(--color-secondary);
		font-size: 0.85em;
	}
	.subtitle {
		font:
			13px/1.5 system-ui,
			sans-serif;
		color: var(--color-ink-soft);
	}
	.description {
		font-size: 16px;
		line-height: 1.55;
		color: var(--color-secondary);
	}
	a.row:hover .title {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	@media (max-width: 650px) {
		.row {
			grid-template-columns: 1fr;
		}
		.text {
			grid-column: 1;
		}
	}
</style>
