<script lang="ts">
	import { page } from '$app/state';
	const path = $derived(page.url.pathname.replace(/\/$/, ''));
	// At `/`, the server picked the mode from the visitor's cookie.
	const current = $derived(
		path === '/world' || path === '/index' ? path.slice(1) : path === '' ? page.data.mode : null
	);
</script>

<nav class="mode-switch" aria-label="Website mode">
	<a href="/world" aria-current={current === 'world' ? 'page' : undefined}>World</a>
	<a href="/index" aria-current={current === 'index' ? 'page' : undefined}>Index</a>
</nav>

<style>
	.mode-switch {
		display: inline-flex;
		flex-shrink: 0;
		padding: 4px;
		gap: 3px;
		background: #f8f5ed;
		border: 1px solid #c9c4b6;
		border-radius: 999px;
		font:
			600 12px/1 system-ui,
			sans-serif;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	a {
		display: grid;
		place-items: center;
		min-height: 44px;
		min-width: 78px;
		padding: 0 16px;
		border-radius: 999px;
		color: #55574d;
	}
	a:hover {
		background: #e7e8dd;
	}
	a[aria-current='page'] {
		background: #304e42;
		color: #fffdf6;
	}
</style>
