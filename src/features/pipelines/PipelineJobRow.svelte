<script lang="ts">
	import type { ETLJob } from '$lib/types';

	let { job }: { job: ETLJob } = $props();

	const statusClass = $derived(
		job.status === 'completed'
			? 'text-emerald-600'
			: job.status === 'failed'
				? 'text-red-600'
				: 'text-amber-600'
	);
</script>

<a
	href="/import/jobs/{job.id}"
	class="block bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 hover:border-emerald-300 transition-colors"
>
	<div class="flex items-center justify-between">
		<span class="font-medium text-gray-800">{job.id.slice(0, 8)}…</span>
		<span class="text-sm {statusClass}">{job.status}</span>
		<span class="text-xs text-gray-400">{new Date(job.createdAt).toLocaleString()}</span>
	</div>
</a>
