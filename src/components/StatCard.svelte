<script lang="ts">
	let { label, value }: { label: string; value: string | number } = $props();
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
	<p class="text-xs font-medium text-gray-500 uppercase">{label}</p>
	<p class="mt-1 text-xl font-semibold text-gray-900">
		{typeof value === 'number' ? value.toLocaleString() : value}
	</p>
</div>
