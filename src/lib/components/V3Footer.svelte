<script lang="ts">
	import { site } from '$lib/data/site';
	import { socialLinks } from '$lib/data/links';
	import { sectionById } from '$lib/data/sections';
</script>

<footer class="v3-footer">
	<div class="inner">
		<div>
			<p class="name">{site.name}</p>
			<p class="role">{site.role}. Bengaluru, India.</p>
			<p class="modes">
				Two ways in: <a href="/world">the room</a> or <a href="/index">the Index</a>.
			</p>
		</div>
		<nav aria-label="Elsewhere">
			<ul>
				<li><a href="mailto:{site.email}">Email</a></li>
				{#each socialLinks as link (link.name)}
					<li><a href={link.url}>{link.name}</a></li>
				{/each}
				<li><a href="https://oberai.blog">Newsletter</a></li>
				<li><a href={sectionById.now.href}>Now</a></li>
				<li><a href={sectionById.resume.href}>Résumé</a></li>
			</ul>
		</nav>
	</div>
</footer>

<style>
	.v3-footer {
		margin-top: 48px;
		border-top: 1px solid var(--color-hairline);
		background: var(--color-paper);
	}
	.inner {
		max-width: var(--container);
		margin: auto;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 20px 40px;
		padding: 32px var(--gutter) 40px;
	}
	.name {
		font-size: 20px;
	}
	.role,
	.modes {
		margin-top: 4px;
		font-size: 15px;
		color: var(--color-secondary);
	}
	.modes a,
	nav a {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0 20px;
		max-width: 480px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	nav a {
		display: inline-flex;
		align-items: center;
		min-height: 40px;
		font:
			13px system-ui,
			sans-serif;
	}
</style>
