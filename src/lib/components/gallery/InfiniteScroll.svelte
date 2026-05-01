<script lang="ts">
	let {
		hasMore = false,
		loading = false,
		onLoadMore
	} = $props<{
		hasMore: boolean;
		loading: boolean;
		onLoadMore: () => void;
	}>();

	let sentinel = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !loading) {
					onLoadMore();
				}
			},
			{ rootMargin: '300px' }
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

<div bind:this={sentinel} class="py-6 flex justify-center">
	{#if loading}
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<span class="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
			Loading more...
		</div>
	{:else if !hasMore && !loading}
		<div class="flex flex-col items-center gap-1">
			<div class="size-8 rounded-full bg-muted flex items-center justify-center">
				<span class="text-sm">✓</span>
			</div>
			<p class="text-xs text-muted-foreground">You've seen everything</p>
		</div>
	{/if}
</div>