<script lang="ts">
	import FileUploader from '$features/import/FileUploader.svelte';
	import ImportRunner from '$features/import/ImportRunner.svelte';
	import type { UploadedFile } from '$lib/types';

	let uploadedFiles = $state<UploadedFile[]>([]);
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900">Import Data</h1>

	<FileUploader bind:files={uploadedFiles} />

	<ImportRunner bind:files={uploadedFiles} />
</div>
