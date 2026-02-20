<script lang="ts">
	import { page } from '$app/stores';
	import JobDetail from '$features/pipelines/JobDetail.svelte';

	const id = $derived($page.params.id);
</script>

<svelte:head>
	<title>Pipeline {id?.slice(0, 8)}…</title>
</svelte:head>

{#if id}
	<JobDetail id={id} />
{:else}
	<div class="text-gray-500">Invalid job.</div>
{/if}
