<script lang="ts">
	let { status = 404 }: { status?: number } = $props();

	const heading =
		status === 404 ? 'This page seems to be unwritten.' : 'Something went off the page.';
</script>

<div class="mx-auto max-w-2xl px-6 py-24 text-center md:px-8 md:py-32">
	<p class="eyebrow">
		<span class="text-accent">{status}</span> <span aria-hidden="true">·</span> Error
	</p>
	<h1 class="mt-6 text-h1">{heading}</h1>
	<p class="mt-6 text-body text-secondary">
		The page you're looking for doesn't exist, or it has moved somewhere quieter.
	</p>
	<p class="mt-8">
		<a href="/" class="link-tertiary"
			>Back to the title page <span class="arrow" aria-hidden="true">→</span></a
		>
	</p>
</div>
