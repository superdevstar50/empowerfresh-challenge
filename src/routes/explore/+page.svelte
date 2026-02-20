<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import StatsBar from '$features/explore/StatsBar.svelte';
	import FilterBar from '$features/explore/FilterBar.svelte';
	import ProductTable from '$features/explore/ProductTable.svelte';
	import PriceTable from '$features/explore/PriceTable.svelte';
	import SaleTable from '$features/explore/SaleTable.svelte';
	import SummaryTable from '$features/explore/SummaryTable.svelte';
	import type { ExploreTab } from '$lib/types';

	let selectedCustomerId = $state('');
	let selectedStoreId = $state('');
	let searchQuery = $state('');
	let activeTab = $state<ExploreTab>('products');

	function switchTab(tab: ExploreTab) {
		activeTab = tab;
	}

	onMount(() => {
		const params = $page.url.searchParams;
		selectedCustomerId = params.get('customerId') ?? '';
		selectedStoreId = params.get('storeId') ?? '';
		searchQuery = params.get('search') ?? '';
	});
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900">Explore Data</h1>

	<StatsBar />

	<FilterBar
		bind:selectedCustomerId
		bind:selectedStoreId
		bind:searchQuery
	/>

	<!-- Tabs -->
	<div class="border-b border-gray-200">
		<nav class="flex gap-0">
			{#each [
				{ key: 'products' as ExploreTab, label: 'Products' },
				{ key: 'prices' as ExploreTab, label: 'Prices' },
				{ key: 'sales' as ExploreTab, label: 'Sales' },
				{ key: 'summary' as ExploreTab, label: 'Sales Summary' }
			] as tab}
				<button
					class="px-5 py-3 text-sm font-medium border-b-2 transition-colors {
						activeTab === tab.key
							? 'border-emerald-500 text-emerald-600'
							: 'border-transparent text-gray-500 hover:text-gray-700'
					}"
					onclick={() => switchTab(tab.key)}
				>
					{tab.label}
				</button>
			{/each}
		</nav>
	</div>

	<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
		{#if activeTab === 'products'}
			<ProductTable customerId={selectedCustomerId} storeId={selectedStoreId} search={searchQuery} />
		{:else if activeTab === 'prices'}
			<PriceTable customerId={selectedCustomerId} storeId={selectedStoreId} search={searchQuery} />
		{:else if activeTab === 'sales'}
			<SaleTable customerId={selectedCustomerId} storeId={selectedStoreId} search={searchQuery} />
		{:else if activeTab === 'summary'}
			<SummaryTable customerId={selectedCustomerId} storeId={selectedStoreId} search={searchQuery} />
		{/if}
	</div>
</div>
