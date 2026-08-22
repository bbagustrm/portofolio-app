<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';

	let { data, children } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<Navbar user={data.user} />

	<main class="flex-1">
		{@render children()}
	</main>

	<Footer />
</div>
