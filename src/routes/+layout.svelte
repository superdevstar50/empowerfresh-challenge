<script lang="ts">
	import "../app.css";
	import { Toaster } from 'svelte-french-toast';
	import Navbar from '$components/Navbar.svelte';
	let { children } = $props();
</script>

<Toaster position="top-right" toastOptions={{ duration: 4000 }} />

<div class="min-h-screen bg-gray-50">
	<Navbar />

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{@render children()}
	</main>
</div>
