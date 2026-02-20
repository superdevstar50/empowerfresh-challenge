<script lang="ts">
	import CustomerSelector from '$features/import/CustomerSelector.svelte';
	import FileUploader from '$features/import/FileUploader.svelte';
	import ImportRunner from '$features/import/ImportRunner.svelte';
	import type { UploadedFile } from '$lib/types';

	let selectedCustomerId = $state<number | null>(null);
	let uploadedFiles = $state<UploadedFile[]>([]);
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900">Import Data</h1>

	<CustomerSelector bind:selectedCustomerId />

	<FileUploader bind:files={uploadedFiles} />

	<ImportRunner customerId={selectedCustomerId} bind:files={uploadedFiles} />
</div>
