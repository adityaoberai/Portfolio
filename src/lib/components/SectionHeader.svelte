<script lang="ts">
	let {
		number,
		label,
		title,
		lede
	}: { number: string; label: string; title?: string; lede?: string } = $props();
</script>

{#if title}
	<p class="eyebrow">
		<span class="text-accent">{number}</span>
		<span aria-hidden="true">·</span>
		{label}
	</p>
	<h2 class="mt-3 text-h2">{title}</h2>
{:else}
	<h2 class="eyebrow">
		<span class="text-accent">{number}</span>
		<span aria-hidden="true">·</span>
		{label}
	</h2>
{/if}
{#if lede}
	<p class="mt-4 max-w-2xl text-body text-secondary">{lede}</p>
{/if}
