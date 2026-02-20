<script lang="ts">
	import toast from 'svelte-french-toast';
	import DataTable from '$components/DataTable.svelte';
	import Pagination from '$components/Pagination.svelte';
	import { formatCurrency, formatNumber } from '$lib/utils/format';

	interface PageInfo { total: number; page: number; limit: number; totalPages: number }

	let { customerId = '', storeId = '', search = '' }: {
		customerId?: string;
		storeId?: string;
		search?: string;
	} = $props();

	let rows = $state<Record<string, unknown>[]>([]);
	let pagination = $state<PageInfo | null>(null);
	let loading = $state(true);
	let page = $state(1);

	const columns = [
		{ key: 'upc_plu', label: 'UPC/PLU' },
		{ key: 'description', label: 'Description' },
		{ key: 'store_code', label: 'Store' },
		{ key: 'customer_name', label: 'Customer' },
		{ key: 'transaction_count', label: 'Transactions', align: 'right' as const },
		{ key: 'total_units_sold', label: 'Units Sold', align: 'right' as const },
		{ key: 'total_revenue', label: 'Revenue', align: 'right' as const },
		{ key: 'avg_unit_price', label: 'Avg Price', align: 'right' as const }
	];

	function buildQuery(p: number): string {
		const params = new URLSearchParams();
		if (customerId) params.set('customerId', customerId);
		if (storeId) params.set('storeId', storeId);
		if (search) params.set('search', search);
		params.set('aggregate', 'true');
		params.set('page', String(p));
		params.set('limit', '25');
		return params.toString();
	}

	$effect(() => {
		page = 1;
		fetchData(buildQuery(1));
	});

	async function fetchData(query: string) {
		loading = true;
		try {
			const res = await fetch(`/api/sales?${query}`);
			if (res.ok) {
				const json = await res.json();
				rows = json.aggregates;
				pagination = json;
			} else {
				toast.error('Failed to load sales summary.');
			}
		} catch {
			toast.error('Failed to load sales summary.');
		} finally {
			loading = false;
		}
	}

	function changePage(p: number) {
		page = p;
		fetchData(buildQuery(p));
	}
</script>

{#if loading}
	<div class="p-12 text-center text-gray-500">Loading...</div>
{:else}
	<DataTable {columns} {rows} emptyMessage="No aggregated data found">
		{#snippet renderCell({ row, column })}
			{#if column.key === 'upc_plu'}
				<span class="font-mono text-gray-700">{row.upc_plu}</span>
			{:else if column.key === 'total_revenue' || column.key === 'avg_unit_price'}
				<span class="{column.key === 'total_revenue' ? 'text-gray-900 font-medium' : 'text-gray-600'}">{formatCurrency(row[column.key])}</span>
			{:else if column.key === 'transaction_count' || column.key === 'total_units_sold'}
				<span class="text-gray-600">{formatNumber(row[column.key])}</span>
			{:else}
				<span class="text-gray-600">{row[column.key] ?? '-'}</span>
			{/if}
		{/snippet}
	</DataTable>
{/if}

{#if pagination}
	<Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={changePage} />
{/if}
