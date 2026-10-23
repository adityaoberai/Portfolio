<script lang="ts">
	import { onMount } from 'svelte';
	import { bengaluruTime } from '$lib/data/now';

	let date = $state<Date | null>(null);
	onMount(() => {
		const update = () => (date = new Date());
		update();
		const timer = window.setInterval(update, 60_000);
		document.addEventListener('visibilitychange', update);
		return () => {
			window.clearInterval(timer);
			document.removeEventListener('visibilitychange', update);
		};
	});
</script>

{#if date}<time datetime={date.toISOString()} title="Time in Bengaluru">{bengaluruTime(date)}</time
	>{/if}

<style>
	time {
		font: 0.8125rem/1.4 var(--font-ui);
		font-variant-numeric: tabular-nums;
		color: var(--color-secondary);
		white-space: nowrap;
	}
</style>
