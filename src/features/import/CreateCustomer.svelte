<script lang="ts">
	import toast from 'svelte-french-toast';
	import type { Customer } from '$lib/types';

	let { onCreated }: { onCreated: () => void } = $props();

	let newCustomerName = $state('');
	let creating = $state(false);

	async function createCustomer() {
		if (!newCustomerName.trim()) return;
		creating = true;
		try {
			const res = await fetch('/api/customers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newCustomerName.trim() })
			});
			if (res.ok) {
				const customer: Customer = await res.json();
				newCustomerName = '';
				toast.success(`Customer "${customer.name}" created.`);
				onCreated();
			} else {
				const data = await res.json().catch(() => ({}));
				toast.error(data.error ?? 'Failed to create customer.');
			}
		} finally {
			creating = false;
		}
	}
</script>

<div class="border-t border-gray-200 pt-4">
	<p class="text-xs text-gray-500 mb-2">Need a new customer?</p>
	<div class="flex gap-2">
		<input
			type="text"
			placeholder="Customer name"
			class="flex-1 rounded-lg border-gray-300 border px-3 py-2 text-sm"
			bind:value={newCustomerName}
			onkeydown={(e) => e.key === 'Enter' && createCustomer()}
		/>
		<button
			class="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
			onclick={createCustomer}
			disabled={!newCustomerName.trim() || creating}
		>
			Create
		</button>
	</div>
</div>
