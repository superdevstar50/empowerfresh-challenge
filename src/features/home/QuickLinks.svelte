<script lang="ts">
	const links = [
		{
			href: '/import',
			title: 'Import Data',
			description: 'Upload CSV files from grocery stores and run the ETL pipeline to clean and load data.'
		},
		{
			href: '/explore',
			title: 'Explore Data',
			description: 'Browse products, prices, and sales data. Filter by customer, store, and more.'
		}
	];
</script>

<div class="grid md:grid-cols-2 gap-6">
	{#each links as link}
		<a
			href={link.href}
			class="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all"
		>
			<h2 class="text-lg font-semibold text-gray-900">{link.title}</h2>
			<p class="mt-2 text-gray-600 text-sm">{link.description}</p>
		</a>
	{/each}
</div>
