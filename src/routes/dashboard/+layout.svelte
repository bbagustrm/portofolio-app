<script lang="ts">
	import DashboardSidebar from '$lib/components/layout/DashboardSidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';

	let { data, children } = $props();
</script>

<!-- Provider membungkus Sidebar + Inset sekaligus -->
<Sidebar.Provider>
	<DashboardSidebar user={data.user} />

	<Sidebar.Inset>
		<main class="flex-1 overflow-y-auto">
			<div class="container max-w-6xl mx-auto px-6 py-8">
				{@render children()}
			</div>
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>