<script lang="ts">
	import { site } from '$lib/data/site';

	let { invitation = "Building something for developers? Let's talk." }: { invitation?: string } =
		$props();
</script>

<div class="mx-auto max-w-2xl text-center">
	<p class="text-[1.3125rem] italic leading-relaxed">
		{invitation}
	</p>
	<p class="mt-4">
		<a href="mailto:{site.email}" class="prose-link text-lede">{site.email}</a>
	</p>
</div>
