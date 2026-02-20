<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { CustomerWithStores } from '$lib/types';

	let {
		selectedCustomerId = $bindable(),
		selectedStoreId = $bindable(),
		searchQuery = $bindable()
	}: {
		selectedCustomerId: string;
		selectedStoreId: string;
		searchQuery: string;
	} = $props();

	let customers = $state<CustomerWithStores[]>([]);

	let stores = $derived(
		selectedCustomerId
			? customers.find((c) => c.id === parseInt(selectedCustomerId))?.stores ?? []
			: customers.flatMap((c) => c.stores)
	);

	function applyFilters() {
		const params = new URLSearchParams();
		if (selectedCustomerId) params.set('customerId', selectedCustomerId);
		if (selectedStoreId) params.set('storeId', selectedStoreId);
		if (searchQuery.trim()) params.set('search', searchQuery.trim());
		goto(`?${params}`, { replaceState: true, noScroll: true });
	}

	onMount(async () => {
		const res = await fetch('/api/customers');
		if (res.ok) customers = await res.json();
	});
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
	<div class="flex flex-wrap gap-4 items-end">
		<div class="min-w-[180px]">
			<label for="filter-customer" class="block text-xs text-gray-500 mb-1">Customer</label>
			<select
				id="filter-customer"
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
				bind:value={selectedCustomerId}
				onchange={() => { selectedStoreId = ''; applyFilters(); }}
			>
				<option value="">All Customers</option>
				{#each customers as c}
					<option value={String(c.id)}>{c.name}</option>
				{/each}
			</select>
		</div>
		<div class="min-w-[180px]">
			<label for="filter-store" class="block text-xs text-gray-500 mb-1">Store</label>
			<select
				id="filter-store"
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
				bind:value={selectedStoreId}
				onchange={applyFilters}
			>
				<option value="">All Stores</option>
				{#each stores as s}
					<option value={String(s.id)}>{s.storeCode}</option>
				{/each}
			</select>
		</div>
		<div class="flex-1 min-w-[200px]">
			<label for="filter-search" class="block text-xs text-gray-500 mb-1">Search</label>
			<input
				id="filter-search"
				type="text"
				placeholder="Search..."
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
				bind:value={searchQuery}
				onkeydown={(e) => e.key === 'Enter' && applyFilters()}
				onchange={applyFilters}
			/>
		</div>
		<button
			class="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
			onclick={applyFilters}
		>
			Apply
		</button>
	</div>
</div>
