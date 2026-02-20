<script lang="ts">
	import { onMount } from 'svelte';
	import { formatCurrency } from '$lib/utils/format';
	import StatCard from '$components/StatCard.svelte';

	let stats = $state<Record<string, number> | null>(null);
	let loading = $state(true);

	onMount(async () => {
		try {
			const res = await fetch('/api/stats');
			if (res.ok) stats = await res.json();
		} finally {
			loading = false;
		}
	});

	const cards = $derived(stats ? [
		{ label: 'Products', value: stats.products },
		{ label: 'Prices', value: stats.prices },
		{ label: 'Transactions', value: stats.sales },
		{ label: 'Revenue', value: formatCurrency(stats.totalRevenue) }
	] : []);
</script>

{#if loading}
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		{#each Array(4) as _}
			<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
				<div class="h-4 bg-gray-200 rounded w-16 mb-2"></div>
				<div class="h-7 bg-gray-200 rounded w-20"></div>
			</div>
		{/each}
	</div>
{:else if stats}
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		{#each cards as card}
			<StatCard label={card.label} value={card.value} />
		{/each}
	</div>
{/if}
