<script lang="ts">
	import { onMount } from 'svelte';
	import ImportResults from '$features/import/ImportResults.svelte';
	import type { ETLJob, JobStatus } from '$lib/types';

	let { id }: { id: string } = $props();

	let job = $state<ETLJob | null>(null);
	let notFound = $state(false);
	let intervalId = $state<ReturnType<typeof setInterval> | null>(null);

	async function fetchJob() {
		if (!id) return null;
		const res = await fetch(`/api/jobs/${id}`);
		if (res.status === 404) {
			notFound = true;
			return null;
		}
		if (res.ok) {
			job = await res.json();
			return job;
		}
		return null;
	}

	$effect(() => {
		if (!id) return;
		job = null;
		notFound = false;
		fetchJob();
	});

	onMount(() => {
		intervalId = setInterval(async () => {
			if (!id) return;
			const updated = await fetchJob();
			if (updated && (updated.status === 'completed' || updated.status === 'failed')) {
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
			}
		}, 2000);

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	});

	function statusIcon(status: JobStatus): string {
		switch (status) {
			case 'pending': return '○';
			case 'processing': return '◐';
			case 'completed': return '✓';
			case 'failed': return '✗';
			default: return '?';
		}
	}

	function statusClass(status: JobStatus): string {
		switch (status) {
			case 'pending': return 'text-gray-400';
			case 'processing': return 'text-amber-500 animate-pulse';
			case 'completed': return 'text-emerald-600';
			case 'failed': return 'text-red-600';
			default: return 'text-gray-500';
		}
	}
</script>

{#if notFound}
	<div class="space-y-4">
		<p class="text-gray-600">Job not found.</p>
		<a href="/import/jobs" class="text-emerald-600 hover:underline">Back to Pipelines</a>
	</div>
{:else if job}
	<div class="space-y-6">
		<div class="flex items-center gap-4">
			<a href="/import/jobs" class="text-sm text-emerald-600 hover:underline">← Pipelines</a>
			<h1 class="text-2xl font-bold text-gray-900">Pipeline</h1>
			<span class="text-sm font-mono text-gray-500">{job.id.slice(0, 8)}…</span>
			<span class="text-sm px-2 py-0.5 rounded font-medium {job.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : job.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}">
				{job.status}
			</span>
			<span class="text-xs text-gray-400">{new Date(job.createdAt).toLocaleString()}</span>
		</div>

		<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
			<h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide px-4 py-3 border-b border-gray-100">Files</h2>
			<ul class="divide-y divide-gray-100">
				{#each job.files as file}
					<li class="flex items-center gap-3 px-4 py-3">
						<span class="{statusClass(file.status)} w-6 text-center">{statusIcon(file.status)}</span>
						<span class="font-medium text-gray-800">{file.filename}</span>
						{#if file.result}
							<span class="text-sm text-gray-500">
								{file.result.inserted} inserted, {file.result.updated} updated, {file.result.skipped} skipped
								{#if file.result.errors > 0}
									<span class="text-red-600">, {file.result.errors} errors</span>
								{/if}
							</span>
							{#if file.result.messages?.length}
								<span class="text-xs text-red-600">{file.result.messages[0]}</span>
							{/if}
						{/if}
					</li>
				{/each}
			</ul>
		</div>

		{#if job.summary}
			<ImportResults results={job.summary} />
		{:else if job.status === 'failed' && job.files.some((f) => f.result?.messages?.length)}
			<div class="bg-red-50 border border-red-200 rounded-xl p-4">
				<h2 class="text-sm font-semibold text-red-800 mb-2">Errors</h2>
				<ul class="text-sm text-red-700 space-y-1">
					{#each job.files.filter((f) => f.result?.messages?.length) as file}
						{#each file.result!.messages as msg}
							<li>{file.filename}: {msg}</li>
						{/each}
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{:else}
	<div class="text-gray-500">Loading…</div>
{/if}
