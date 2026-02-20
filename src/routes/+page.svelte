<script lang="ts">
	import StatsOverview from '$features/home/StatsOverview.svelte';
	import QuickLinks from '$features/home/QuickLinks.svelte';
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-bold text-gray-900">Grocery Data Processing</h1>
		<p class="mt-2 text-gray-600">
			Upload, process, and explore grocery data from multiple stores.
		</p>
	</div>

	<StatsOverview />

	<QuickLinks />
</div>
