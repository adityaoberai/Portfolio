<script>
	import { getPinkIcon, featureLinks } from '$lib/constants/links';
</script>

<section id="links">
	<h2>Important Links</h2>
	<ul>
		{#each featureLinks as { url, type, name }}
			<li>
				<a href={url} target="_blank" rel="noopener noreferrer">
					{name}
					<span class={getPinkIcon(type)}></span>
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
	ul {
		padding: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		width: 90%;
		max-width: 500px;
		margin: 0;
	}

	ul > li {
		display: flex;
		list-style: none;
		width: 100%;
		height: max-content;
	}

	ul > li > a {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: center;
		list-style: none;
		width: 100%;
		height: 100%;
		border: 2px solid var(--text-color);
		border-radius: 1rem;
		color: var(--text-color);
		padding: 0.75rem 1rem;
		text-align: left;
	}

	ul > li > a:hover {
		border-color: var(--accent-color);
	}

	ul > li > a > span {
		font-size: 1.5rem;
	}

	@media (max-width: 768px) {
		ul > li > a {
			width: 90%;
			margin: auto;
		}

		ul > li > a > span {
			font-size: 1.2rem;
		}
	}

	@media (max-width: 480px) {
		ul > li > a {
			padding: 0.5rem 0.75rem;
			gap: 0.25rem;
		}

		ul > li > a > span {
			font-size: 1rem;
		}
	}
</style>
