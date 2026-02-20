<script lang="ts">
	import toast from 'svelte-french-toast';
	import DataTable from '$components/DataTable.svelte';
	import Pagination from '$components/Pagination.svelte';
	import { formatCurrency } from '$lib/utils/format';

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

	function storeCode(row: Record<string, unknown>): string {
		return ((row.store as Record<string, unknown> | undefined)?.storeCode as string) ?? '-';
	}

	function customerName(row: Record<string, unknown>): string {
		const store = row.store as Record<string, unknown> | undefined;
		return ((store?.customer as Record<string, unknown> | undefined)?.name as string) ?? '-';
	}

	const columns = [
		{ key: 'upcPlu', label: 'UPC/PLU' },
		{ key: 'price', label: 'Price' },
		{ key: 'priceType', label: 'Type' },
		{ key: 'startDate', label: 'Start Date' },
		{ key: 'endDate', label: 'End Date' },
		{ key: '_store', label: 'Store' },
		{ key: '_customer', label: 'Customer' }
	];

	function buildQuery(p: number): string {
		const params = new URLSearchParams();
		if (customerId) params.set('customerId', customerId);
		if (storeId) params.set('storeId', storeId);
		if (search) params.set('search', search);
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
			const res = await fetch(`/api/prices?${query}`);
			if (res.ok) {
				const json = await res.json();
				rows = json.prices;
				pagination = json;
			} else {
				toast.error('Failed to load prices.');
			}
		} catch {
			toast.error('Failed to load prices.');
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
	<DataTable {columns} {rows} emptyMessage="No prices found">
		{#snippet renderCell({ row, column })}
			{#if column.key === 'upcPlu'}
				<span class="font-mono text-gray-700">{row.upcPlu}</span>
			{:else if column.key === 'price'}
				<span class="text-gray-900 font-medium">{formatCurrency(row.price)}</span>
			{:else if column.key === 'priceType'}
				<span class="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{row.priceType ?? '-'}</span>
			{:else if column.key === '_store'}
				<span class="text-gray-600">{storeCode(row)}</span>
			{:else if column.key === '_customer'}
				<span class="text-gray-600">{customerName(row)}</span>
			{:else}
				<span class="text-gray-600">{row[column.key] ?? '-'}</span>
			{/if}
		{/snippet}
	</DataTable>
{/if}

{#if pagination}
	<Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={changePage} />
{/if}
