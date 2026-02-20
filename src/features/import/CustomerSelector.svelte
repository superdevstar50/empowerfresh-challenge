<script lang="ts">
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';
	import type { Customer } from '$lib/types';

	let { selectedCustomerId = $bindable() }: { selectedCustomerId: number | null } = $props();

	let customers = $state<Customer[]>([]);
	let newCustomerName = $state('');

	async function loadCustomers() {
		const res = await fetch('/api/customers');
		if (res.ok) customers = await res.json();
		else toast.error('Failed to load customers.');
	}

	async function createCustomer() {
		if (!newCustomerName.trim()) return;
		const res = await fetch('/api/customers', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: newCustomerName.trim() })
		});
		if (res.ok) {
			const customer: Customer = await res.json();
			await loadCustomers();
			selectedCustomerId = customer.id;
			newCustomerName = '';
			toast.success(`Customer "${customer.name}" created.`);
		} else {
			const data = await res.json().catch(() => ({}));
			toast.error(data.error ?? 'Failed to create customer.');
		}
	}

	onMount(loadCustomers);
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
	<h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Customer</h2>
	<div class="flex flex-wrap gap-3 items-end">
		<div class="flex-1 min-w-[200px]">
			<label for="customer-select" class="block text-sm text-gray-600 mb-1">Select existing</label>
			<select
				id="customer-select"
				class="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
				bind:value={selectedCustomerId}
			>
				<option value={null}>-- Select Customer --</option>
				{#each customers as c}
					<option value={c.id}>{c.name}</option>
				{/each}
			</select>
		</div>
		<div class="text-sm text-gray-400">or</div>
		<div class="flex-1 min-w-[200px]">
			<label for="new-customer" class="block text-sm text-gray-600 mb-1">Create new</label>
			<div class="flex gap-2">
				<input
					id="new-customer"
					type="text"
					placeholder="Customer name"
					class="flex-1 rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
					bind:value={newCustomerName}
					onkeydown={(e) => e.key === 'Enter' && createCustomer()}
				/>
				<button
					class="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
					onclick={createCustomer}
					disabled={!newCustomerName.trim()}
				>
					Create
				</button>
			</div>
		</div>
	</div>
</div>
