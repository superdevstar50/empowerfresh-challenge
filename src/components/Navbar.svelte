<script lang="ts">
	import { page } from '$app/stores';

	const links = [
		{ href: '/import', label: 'Import' },
		{ href: '/explore', label: 'Explore' }
	];
</script>

<nav class="bg-white border-b border-gray-200 shadow-sm">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<a href="/" class="text-xl font-bold text-emerald-600">
				Grocery ETL
			</a>
			<div class="flex gap-1">
				{#each links as link}
					<a
						href={link.href}
						class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {
							$page.url.pathname.startsWith(link.href)
								? 'bg-emerald-50 text-emerald-600'
								: 'text-gray-700 hover:bg-gray-100 hover:text-emerald-600'
						}"
					>
						{link.label}
					</a>
				{/each}
			</div>
		</div>
	</div>
</nav>
