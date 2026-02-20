<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Column {
		key: string;
		label: string;
		align?: 'left' | 'right';
	}

	let {
		columns,
		rows,
		emptyMessage = 'No data found',
		renderCell
	}: {
		columns: Column[];
		rows: Record<string, unknown>[];
		emptyMessage?: string;
		renderCell?: Snippet<[{ row: Record<string, unknown>; column: Column }]>;
	} = $props();
</script>

<div class="overflow-x-auto">
	<table class="min-w-full divide-y divide-gray-200">
		<thead class="bg-gray-50">
			<tr>
				{#each columns as col}
					<th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase {col.align === 'right' ? 'text-right' : 'text-left'}">
						{col.label}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-100">
			{#each rows as row}
				<tr class="hover:bg-gray-50">
					{#each columns as column}
						<td class="px-4 py-3 text-sm {column.align === 'right' ? 'text-right' : 'text-left'}">
							{#if renderCell}
								{@render renderCell({ row, column })}
							{:else}
								<span class="text-gray-600">{row[column.key] ?? '-'}</span>
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
			{#if rows.length === 0}
				<tr><td colspan={columns.length} class="px-4 py-8 text-center text-gray-400">{emptyMessage}</td></tr>
			{/if}
		</tbody>
	</table>
</div>
