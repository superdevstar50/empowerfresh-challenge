<script lang="ts">
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';
	import type { UploadedFile } from '$lib/types';

	let { files = $bindable() }: {
		files: UploadedFile[];
	} = $props();

	let importing = $state(false);

	let allHaveCustomer = $derived(files.length > 0 && files.every((f) => f.customerId));
	let missingCount = $derived(files.filter((f) => !f.customerId).length);

	async function runImport() {
		if (!allHaveCustomer) return;
		importing = true;

		try {
			const res = await fetch('/api/etl', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					files: files.map((f) => ({
						path: f.path,
						filename: f.filename,
						customerId: f.customerId,
						typeOverride: f.typeOverride !== f.detectedType ? f.typeOverride : undefined
					}))
				})
			});
			if (res.ok) {
				const data = await res.json();
				files = [];
				toast.success('Import started. View progress on Pipelines.');
				goto(`/import/jobs/${data.jobId}`);
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
	disabled={!allHaveCustomer || importing}
>
	{#if importing}
		Starting…
	{:else}
		Import {files.length} File{files.length !== 1 ? 's' : ''}
	{/if}
</button>

{#if files.length > 0 && !allHaveCustomer}
	<p class="text-sm text-amber-600">
		{missingCount} file{missingCount !== 1 ? 's' : ''} missing a customer assignment.
	</p>
{/if}
