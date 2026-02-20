<script lang="ts">
	let {
		page,
		totalPages,
		total,
		onPageChange
	}: {
		page: number;
		totalPages: number;
		total: number;
		onPageChange: (page: number) => void;
	} = $props();
</script>

<div class="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
	<span class="text-sm text-gray-500">
		Page {page} of {totalPages} &middot; {total.toLocaleString()} total
	</span>
	<div class="flex gap-2">
		<button
			class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
			disabled={page <= 1}
			onclick={() => onPageChange(page - 1)}
		>
			Prev
		</button>
		<button
			class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
			disabled={page >= totalPages}
			onclick={() => onPageChange(page + 1)}
		>
			Next
		</button>
	</div>
</div>
