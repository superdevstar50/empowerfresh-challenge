<script lang="ts">
	let {
		uploading = false,
		onFiles
	}: {
		uploading?: boolean;
		onFiles: (files: FileList) => void;
	} = $props();

	let dragOver = $state(false);

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		if (e.dataTransfer?.files) onFiles(e.dataTransfer.files);
	}

	function onFileInput(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files) onFiles(input.files);
		input.value = '';
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer {dragOver ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'}"
	ondragover={(e) => { e.preventDefault(); dragOver = true; }}
	ondragleave={() => (dragOver = false)}
	ondrop={onDrop}
	onclick={() => document.getElementById('file-input')?.click()}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && document.getElementById('file-input')?.click()}
>
	<input id="file-input" type="file" accept=".csv" multiple class="hidden" onchange={onFileInput} />
	{#if uploading}
		<p class="text-gray-500">Uploading...</p>
	{:else}
		<p class="text-gray-500">Drop CSV files here or click to browse</p>
		<p class="text-xs text-gray-400 mt-1">Supports multiple files at once</p>
	{/if}
</div>
