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
				const entry = entries[0];
				if (entry.isIntersecting && hasMore && !loading) {
					onLoadMore();
				}
			},
			{ rootMargin: '200px' } // trigger 200px sebelum batas bawah
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

<div bind:this={sentinel} class="py-8 flex justify-center">
	{#if loading}
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<span class="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
			Loading more...
		</div>
	{:else if !hasMore}
		<p class="text-sm text-muted-foreground">You've seen everything ✨</p>
	{/if}
</div>