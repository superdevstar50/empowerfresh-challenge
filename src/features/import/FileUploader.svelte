<script lang="ts">
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';
	import FileDropZone from './FileDropZone.svelte';
	import CreateCustomer from './CreateCustomer.svelte';
	import { detectCustomerName } from '$lib/etl/detectType';
	import type { FileType, UploadedFile, Customer } from '$lib/types';

	let { files = $bindable() }: { files: UploadedFile[] } = $props();

	let uploading = $state(false);
	let customers = $state<Customer[]>([]);

	const FILE_TYPE_COLORS: Record<FileType, string> = {
		product: 'bg-violet-100 text-violet-700',
		price: 'bg-amber-100 text-amber-700',
		sale: 'bg-rose-100 text-rose-700',
		unknown: 'bg-gray-100 text-gray-600'
	};

	async function loadCustomers() {
		const res = await fetch('/api/customers');
		if (res.ok) customers = await res.json();
	}

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
				const uploaded: UploadedFile[] = data.files.map((f: UploadedFile) => ({
					...f,
					customerId: (() => {
					const name = detectCustomerName(f.filename);
					return name ? customers.find((c) => c.name.toLowerCase() === name.toLowerCase())?.id ?? null : null;
				})()
				}));
				files = [...files, ...uploaded];
				toast.success(`${uploaded.length} file${uploaded.length !== 1 ? 's' : ''} uploaded.`);
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

	function setCustomer(index: number, id: string) {
		files[index].customerId = id ? parseInt(id) : null;
	}

	onMount(loadCustomers);
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
	<h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Upload Files</h2>

	<FileDropZone {uploading} onFiles={handleFiles} />

	{#if files.length > 0}
		<div class="space-y-3">
			{#each files as file, i}
				<div class="bg-gray-50 rounded-lg px-4 py-3 space-y-2">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<span class="text-sm font-medium text-gray-800">{file.filename}</span>
							<span class="text-xs px-2 py-0.5 rounded-full font-medium {FILE_TYPE_COLORS[file.typeOverride ?? file.detectedType]}">
								{file.typeOverride ?? file.detectedType}
							</span>
							<span class="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
						</div>
						<button class="text-gray-400 hover:text-red-500 text-lg leading-none" onclick={() => removeFile(i)}>
							&times;
						</button>
					</div>
					<div class="flex items-center gap-3">
						<div class="flex items-center gap-2">
							<label for="type-{i}" class="text-xs text-gray-500">Type:</label>
							<select
								id="type-{i}"
								class="text-xs border border-gray-200 rounded px-2 py-1"
								value={file.typeOverride ?? file.detectedType}
								onchange={(e) => setTypeOverride(i, (e.target as HTMLSelectElement).value as FileType)}
							>
								<option value="product">Product</option>
								<option value="price">Price</option>
								<option value="sale">Sale</option>
								<option value="unknown">Unknown</option>
							</select>
						</div>
						<div class="flex items-center gap-2">
							<label for="customer-{i}" class="text-xs text-gray-500">Customer:</label>
							<select
								id="customer-{i}"
								class="text-xs border rounded px-2 py-1 {file.customerId ? 'border-gray-200' : 'border-amber-400 bg-amber-50'}"
								value={file.customerId ? String(file.customerId) : ''}
								onchange={(e) => setCustomer(i, (e.target as HTMLSelectElement).value)}
							>
								<option value="">-- Select --</option>
								{#each customers as c}
									<option value={String(c.id)}>{c.name}</option>
								{/each}
							</select>
							{#if file.customerId}
								<span class="text-xs text-emerald-600">&#10003;</span>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if files.length > 0}
		<CreateCustomer onCreated={loadCustomers} />
	{/if}
</div>
