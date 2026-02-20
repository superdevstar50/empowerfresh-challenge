<script lang="ts">
	import toast from 'svelte-french-toast';
	import ImportResults from './ImportResults.svelte';
	import type { UploadedFile, ETLSummary } from '$lib/types';

	let { customerId, files = $bindable() }: {
		customerId: number | null;
		files: UploadedFile[];
	} = $props();

	let importing = $state(false);
	let importResults = $state<ETLSummary | null>(null);

	async function runImport() {
		if (!customerId || files.length === 0) return;
		importing = true;
		importResults = null;

		try {
			const res = await fetch('/api/etl', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					customerId,
					files: files.map((f) => ({
						path: f.path,
						filename: f.filename,
						typeOverride: f.typeOverride !== f.detectedType ? f.typeOverride : undefined
					}))
				})
			});
			if (res.ok) {
				importResults = await res.json();
				files = [];
				const r = importResults!;
				if (r.totalErrors > 0) {
					toast.error(`Import completed with ${r.totalErrors} error${r.totalErrors !== 1 ? 's' : ''}.`);
				} else {
					toast.success(`Import completed: ${r.totalInserted} inserted, ${r.totalUpdated} updated.`);
				}
			} else {
				const data = await res.json().catch(() => ({}));
				toast.error(data.error ?? 'Import failed.');
			}
		} catch {
			toast.error('Import request failed. Please try again.');
		} finally {
			importing = false;
		}
	}
</script>

<button
	class="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
	onclick={runImport}
	disabled={!customerId || files.length === 0 || importing}
>
	{#if importing}
		Processing...
	{:else}
		Import {files.length} File{files.length !== 1 ? 's' : ''}
	{/if}
</button>

{#if !customerId && files.length > 0}
	<p class="text-sm text-amber-600">Please select or create a customer before importing.</p>
{/if}

{#if importResults}
	<ImportResults results={importResults} />
{/if}
