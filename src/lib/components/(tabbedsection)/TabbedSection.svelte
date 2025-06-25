<script>
	import AMA from '../AMA.svelte';
	import Links from '../Links.svelte';
	import TabbedSectionNav from './TabbedSectionNav.svelte';
	import { ACTIVE_TABS } from '$lib/constants/activeTabs.js';

	let activeTab = ACTIVE_TABS.LINKS;

	function setActiveTab(tab) {
		activeTab = tab;
	}
</script>

<section class="tabbed-section">
	<TabbedSectionNav {activeTab} {setActiveTab} />
	<div class="tab-content">
		{#if activeTab === ACTIVE_TABS.LINKS}
			<Links />
		{:else if activeTab === ACTIVE_TABS.AMA}
			<AMA />
		{/if}
	</div>
</section>

<style>
	.tabbed-section {
		width: 100%;
		max-width: 600px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	.tab-content {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 300px;
	}

	@media (max-width: 768px) {
		.tabbed-section {
			width: 95%;
		}
	}

	@media (max-width: 480px) {
		.tab-content {
			min-height: 250px;
		}
	}
</style>
