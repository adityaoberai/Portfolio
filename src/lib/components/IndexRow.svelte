<script lang="ts">
	let {
		meta,
		title,
		subtitle,
		description,
		href,
		external = false,
		domain
	}: {
		meta?: string;
		title: string;
		subtitle?: string;
		description?: string;
		href?: string;
		external?: boolean;
		domain?: string;
	} = $props();
</script>

{#snippet inner()}
	{#if meta}
		<span class="meta pt-1">{meta}</span>
	{/if}
	<span class="flex min-w-0 flex-col gap-1">
		<span class="row-title text-h3">
			{title}{#if external}
				<span class="ext" aria-hidden="true">&nbsp;↗</span><span class="sr-only"
					>(opens in new tab)</span
				>{/if}
		</span>
		{#if subtitle}
			<span class="meta">{subtitle}</span>
		{/if}
		{#if description}
			<span class="text-small text-secondary">{description}</span>
		{/if}
		{#if domain}
			<span class="meta">{domain}</span>
		{/if}
	</span>
{/snippet}

{#if href}
	<a
		{href}
		target={external ? '_blank' : undefined}
		rel={external ? 'noopener noreferrer' : undefined}
		class="group grid grid-cols-1 gap-x-4 gap-y-1 rounded-md px-4 py-5 transition-colors duration-150 hover:bg-surface {meta
			? 'md:grid-cols-[5.5rem_1fr]'
			: ''}"
	>
		{@render inner()}
	</a>
{:else}
	<div class="grid grid-cols-1 gap-x-4 gap-y-1 px-4 py-5 {meta ? 'md:grid-cols-[5.5rem_1fr]' : ''}">
		{@render inner()}
	</div>
{/if}

<style>
	a:hover .row-title {
		text-decoration: underline;
		text-decoration-color: var(--color-accent);
		text-underline-offset: 4px;
	}
</style>
