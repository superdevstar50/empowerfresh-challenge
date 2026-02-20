<script lang="ts">
	import type { ETLSummary, FileType } from '$lib/types';

	let { results }: { results: ETLSummary } = $props();

	const FILE_TYPE_COLORS: Record<FileType, string> = {
		product: 'bg-violet-100 text-violet-700',
		price: 'bg-amber-100 text-amber-700',
		sale: 'bg-rose-100 text-rose-700',
		unknown: 'bg-gray-100 text-gray-600'
	};

	const summaryCards = $derived([
		{ label: 'Inserted', value: results.totalInserted, bg: 'bg-emerald-50', text: 'text-emerald-700' },
		{ label: 'Updated', value: results.totalUpdated, bg: 'bg-blue-50', text: 'text-blue-700' },
		{ label: 'Skipped', value: results.totalSkipped, bg: 'bg-gray-50', text: 'text-gray-600' },
		{ label: 'Duplicates', value: results.totalDuplicatesSkipped, bg: 'bg-amber-50', text: 'text-amber-600' },
		{ label: 'Errors', value: results.totalErrors, bg: 'bg-red-50', text: 'text-red-600' }
	]);
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
	<h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Import Results</h2>
	<div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
		{#each summaryCards as card}
			<div class="text-center p-3 {card.bg} rounded-lg">
				<p class="text-2xl font-bold {card.text}">{card.value}</p>
				<p class="text-xs text-gray-500">{card.label}</p>
			</div>
		{/each}
	</div>

	<div class="space-y-2">
		{#each results.results as result}
			<div class="text-sm flex items-center gap-2 px-3 py-2 bg-gray-50 rounded">
				<span class="font-medium text-gray-700">{result.filename}</span>
				<span class="px-2 py-0.5 rounded-full text-xs font-medium {FILE_TYPE_COLORS[result.fileType ?? 'unknown']}">
					{result.fileType}
				</span>
				<span class="text-gray-500">
					{result.inserted} inserted, {result.updated} updated, {result.skipped} skipped
					{#if result.errors > 0}
						<span class="text-red-500">, {result.errors} errors</span>
					{/if}
				</span>
			</div>
		{/each}
	</div>
</div>
