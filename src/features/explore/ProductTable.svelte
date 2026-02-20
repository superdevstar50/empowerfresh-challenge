<script lang="ts">
	import toast from 'svelte-french-toast';
	import DataTable from '$components/DataTable.svelte';
	import Pagination from '$components/Pagination.svelte';

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
		{ key: 'upcPlu', label: 'UPC/PLU' },
		{ key: 'description', label: 'Description' },
		{ key: 'department', label: 'Department' },
		{ key: 'category', label: 'Category' },
		{ key: 'unitSize', label: 'Unit Size' },
		{ key: 'packSize', label: 'Pack' },
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
			const res = await fetch(`/api/products?${query}`);
			if (res.ok) {
				const json = await res.json();
				rows = json.products;
				pagination = json;
			} else {
				toast.error('Failed to load products.');
			}
		} catch {
			toast.error('Failed to load products.');
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
	<DataTable {columns} {rows} emptyMessage="No products found">
		{#snippet renderCell({ row, column })}
			{#if column.key === 'upcPlu'}
				<span class="font-mono text-gray-700">{row.upcPlu}</span>
			{:else if column.key === 'description'}
				<span class="text-gray-900">{row.description ?? '-'}</span>
			{:else if column.key === '_customer'}
				<span class="text-gray-600">{(row.customer as Record<string, unknown>)?.name ?? '-'}</span>
			{:else}
				<span class="text-gray-600">{row[column.key] ?? '-'}</span>
			{/if}
		{/snippet}
	</DataTable>
{/if}

{#if pagination}
	<Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={changePage} />
{/if}
