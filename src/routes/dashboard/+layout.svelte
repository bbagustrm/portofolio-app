<script lang="ts">
	import DashboardSidebar from '$lib/components/layout/DashboardSidebar.svelte';

	let { data, children } = $props();
</script>

<div class="flex flex-col md:flex-row min-h-screen bg-background">
	<DashboardSidebar user={data.user} />

	<main class="flex-1 overflow-y-auto">
		<div class="container max-w-6xl mx-auto px-6 py-8">
			{@render children()}
		</div>
	</main>
</div>