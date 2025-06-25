<script>
	import TabButton from './TabButton.svelte';
	import { ACTIVE_TABS, TAB_LABELS } from '$lib/constants/activeTabs.js';

	export let activeTab = ACTIVE_TABS.LINKS;
	export let setActiveTab;
</script>

<div class="tab-buttons">
	<TabButton
		isActive={activeTab === ACTIVE_TABS.LINKS}
		onClick={() => setActiveTab(ACTIVE_TABS.LINKS)}
	>
		{TAB_LABELS[ACTIVE_TABS.LINKS]}
	</TabButton>
	<div class="tab-divider"></div>
	<TabButton isActive={activeTab === ACTIVE_TABS.AMA} onClick={() => setActiveTab(ACTIVE_TABS.AMA)}>
		{TAB_LABELS[ACTIVE_TABS.AMA]}
	</TabButton>
</div>

<style>
	.tab-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		background-color: transparent;
	}

	.tab-divider {
		width: 2px;
		height: 2rem;
		background-color: var(--text-color);
		margin: 0 0.5rem;
	}

	@media (max-width: 480px) {
		.tab-buttons {
			width: 100%;
			gap: 0.25rem;
		}
	}
</style>
