<script lang="ts">
	import toast from 'svelte-french-toast';
	import FileDropZone from './FileDropZone.svelte';
	import type { FileType, UploadedFile } from '$lib/types';

	let { files = $bindable() }: { files: UploadedFile[] } = $props();

	let uploading = $state(false);

	const FILE_TYPE_COLORS: Record<FileType, string> = {
		product: 'bg-violet-100 text-violet-700',
		price: 'bg-amber-100 text-amber-700',
		sale: 'bg-rose-100 text-rose-700',
		unknown: 'bg-gray-100 text-gray-600'
	};

	async function handleFiles(fileList: FileList) {
		if (!fileList.length) return;
		uploading = true;
		const formData = new FormData();
		for (const file of fileList) {
			formData.append('files', file);
		}

		try {
			const res = await fetch('/api/upload', { method: 'POST', body: formData });
			if (res.ok) {
				const data = await res.json();
				files = [...files, ...data.files];
				toast.success(`${data.files.length} file${data.files.length !== 1 ? 's' : ''} uploaded.`);
			} else {
				const data = await res.json().catch(() => ({}));
				toast.error(data.error ?? 'Failed to upload files.');
			}
		} catch {
			toast.error('Upload failed. Please try again.');
		} finally {
			uploading = false;
		}
	}

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
	}

	function setTypeOverride(index: number, type: FileType) {
		files[index].typeOverride = type;
	}
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
	<h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Upload Files</h2>

	<FileDropZone {uploading} onFiles={handleFiles} />

	{#if files.length > 0}
		<div class="mt-4 space-y-2">
			{#each files as file, i}
				<div class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
					<div class="flex items-center gap-3">
						<span class="text-sm font-medium text-gray-800">{file.filename}</span>
						<span class="text-xs px-2 py-0.5 rounded-full font-medium {FILE_TYPE_COLORS[file.typeOverride ?? file.detectedType]}">
							{file.typeOverride ?? file.detectedType}
						</span>
						<span class="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
					</div>
					<div class="flex items-center gap-2">
						<select
							class="text-xs border border-gray-200 rounded px-2 py-1"
							value={file.typeOverride ?? file.detectedType}
							onchange={(e) => setTypeOverride(i, (e.target as HTMLSelectElement).value as FileType)}
						>
							<option value="product">Product</option>
							<option value="price">Price</option>
							<option value="sale">Sale</option>
							<option value="unknown">Unknown</option>
						</select>
						<button class="text-gray-400 hover:text-red-500 text-lg leading-none" onclick={() => removeFile(i)}>
							&times;
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
