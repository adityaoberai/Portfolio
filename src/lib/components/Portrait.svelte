<script lang="ts">
	import { site } from '$lib/data/site';

	// 480px derived copies (npm run assets); /aditya.jpg stays full size for organizers (/pic).
	let {
		width,
		height = width,
		loading = 'lazy',
		class: className = ''
	}: { width: number; height?: number; loading?: 'lazy' | 'eager'; class?: string } = $props();
</script>

<picture>
	<source srcset={site.portraitSmall.webp} type="image/webp" />
	<img
		src={site.portraitSmall.jpg}
		alt={site.name}
		{width}
		{height}
		{loading}
		decoding="async"
		class={className}
	/>
</picture>
