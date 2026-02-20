<script lang="ts">
	import { onMount } from 'svelte';
	import PipelineJobRow from './PipelineJobRow.svelte';
	import type { ETLJob } from '$lib/types';

	let jobs = $state<ETLJob[]>([]);
	const currentJobs = $derived(jobs.filter((j) => j.status === 'pending' || j.status === 'processing'));
	const historyJobs = $derived(jobs.filter((j) => j.status === 'completed' || j.status === 'failed'));

	async function fetchList() {
		const res = await fetch('/api/jobs?limit=50');
		if (res.ok) {
			const data = await res.json();
			jobs = data.jobs;
		}
	}

	onMount(fetchList);
</script>

{#if currentJobs.length > 0}
	<section>
		<h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Current</h2>
		<div class="space-y-2">
			{#each currentJobs as job}
				<PipelineJobRow {job} />
			{/each}
		</div>
	</section>
{/if}

<section>
	<h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">History</h2>
	<div class="space-y-2">
		{#each historyJobs as job}
			<PipelineJobRow {job} />
		{/each}
	</div>
</section>

{#if jobs.length === 0}
	<p class="text-gray-500">No pipelines yet. Start an import from the <a href="/import" class="text-emerald-600 hover:underline">Import</a> page.</p>
{/if}
