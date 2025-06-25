<script>
	const { children, isActive = false, onClick, tabKey = '' } = $props();
</script>

<div
	class="tab-button"
	class:active={isActive}
	on:click={onClick}
	role="button"
	tabindex="0"
	on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
>
	{@render children()}
</div>

<style>
	.tab-button {
		font-family: 'Lato', sans-serif;
		font-weight: 500;
		padding: 0.75rem 1.5rem;
		border-radius: 0.75rem;
		border: 2px solid var(--text-color);
		background-color: var(--background-color);
		color: var(--text-color);
		cursor: pointer;
		transition: all 0.3s ease;
		white-space: nowrap;
		user-select: none;
		text-align: center;
	}

	.tab-button:hover {
		border-color: var(--accent-color);
		background-color: rgba(245, 68, 68, 0.1);
	}

	.tab-button.active {
		border-color: var(--accent-color);
		background-color: var(--accent-color);
		color: var(--background-color);
	}

	@media (max-width: 768px) {
		.tab-button {
			padding: 0.6rem 1.2rem;
			font-size: 0.9rem;
		}
	}

	@media (max-width: 480px) {
		.tab-button {
			flex: 1;
			padding: 0.5rem 0.75rem;
			font-size: 0.8rem;
		}
	}
</style>
