<script lang="ts">
	import { onMount } from 'svelte';
	import PageMeta from '$lib/components/PageMeta.svelte';
	import { bengaluruTime, now } from '$lib/data/now';

	// Prerendered: the time is filled in on the visitor's device.
	let time = $state('');
	onMount(() => {
		time = bengaluruTime();
	});
	const updated = new Date(now.updated).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});
</script>

<PageMeta
	title="Now"
	path="/now"
	description="What Aditya Oberai is working on, writing, photographing, and collecting right now."
/>
<article class="now-page">
	<h1>Right now</h1>
	<p class="lede">
		{now.basedIn}{#if time}. It’s {time} here{/if}.
	</p>
	<dl>
		{#each now.items as item (item.label)}
			<div>
				<dt>{item.label}</dt>
				<dd>
					{#if item.href}<a href={item.href}>{item.text}</a>{:else}{item.text}{/if}
				</dd>
			</div>
		{/each}
	</dl>
	<p class="updated">Last updated <time datetime={now.updated}>{updated}</time>.</p>
	<p class="back">
		<a href="/world#window">Back to the room →</a>
		<a href="/index#now">See it on paper →</a>
	</p>
</article>

<style>
	.now-page {
		max-width: 760px;
		margin: auto;
		padding: 64px clamp(20px, 5vw, 48px) 56px;
	}
	h1 {
		margin-top: 0;
		font-size: var(--type-page);
		letter-spacing: -0.02em;
		line-height: 1.12;
	}
	.lede {
		margin-top: 16px;
		font-size: var(--type-lead);
		color: #55574d;
	}
	dl {
		margin: 36px 0 0;
		border-top: 1px solid #d6d5c8;
	}
	dl div {
		display: grid;
		grid-template-columns: 170px 1fr;
		gap: 16px;
		padding: 18px 0;
		border-bottom: 1px solid #dedbcf;
	}
	dt {
		padding-top: 4px;
		font:
			var(--type-meta) / 1.5 var(--font-ui),
			sans-serif;
		letter-spacing: normal;
		text-transform: none;
		color: #69705d;
	}
	dd {
		margin: 0;
		font-size: var(--type-body);
		line-height: 1.5;
	}
	dd a,
	.back a {
		color: #304e42;
		text-decoration: underline;
		text-decoration-color: #b9bda8;
		text-underline-offset: 4px;
	}
	.updated {
		margin-top: 24px;
		font-size: var(--type-body);
		color: #606456;
	}
	.back {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		margin-top: 32px;
	}
	@media (max-width: 560px) {
		dl div {
			grid-template-columns: 1fr;
			gap: 4px;
		}
	}
</style>
