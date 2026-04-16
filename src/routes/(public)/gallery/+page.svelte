<script lang="ts">
	import FeedPost from '$lib/components/gallery/FeedPost.svelte';
	import InfiniteScroll from '$lib/components/gallery/InfiniteScroll.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';

	let { data } = $props();

	let posts = $derived(data.posts);
	let nextCursor = $derived(data.nextCursor);
	let loading = $state(false);

	async function loadMore() {
		if (!nextCursor || loading) return;

		loading = true;
		try {
			const res = await fetch(`/api/gallery?cursor=${nextCursor}&limit=12`);
			const result = await res.json();

			posts = [...posts, ...result.posts];
			nextCursor = result.nextCursor;
		} catch (e) {
			console.error('Failed to load more posts:', e);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Gallery — Bagus</title>
	<meta name="description" content="A personal photo and video gallery." />
</svelte:head>

<div class="container mx-auto max-w-5xl px-4 py-16">
	<div class="mb-12">
		<p class="text-sm text-primary font-medium mb-2">MEMORIES</p>
		<h1 class="text-4xl font-bold mb-4">Gallery</h1>
		<p class="text-muted-foreground">A collection of moments captured in photos and videos.</p>
	</div>

	{#if posts.length === 0}
		<div class="text-center py-20 text-muted-foreground">
			<p class="text-4xl mb-4">📷</p>
			<p>No photos yet. Check back soon!</p>
		</div>
	{:else}
		<!-- Masonry-like responsive grid -->
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
			{#each posts as post (post.id)}
				<FeedPost {post} />
			{/each}

			<!-- Loading skeleton saat fetch -->
			{#if loading}
				{#each Array(4) as _}
					<Skeleton class="aspect-square rounded-xl" />
				{/each}
			{/if}
		</div>

		<InfiniteScroll
			hasMore={nextCursor !== null}
			{loading}
			onLoadMore={loadMore}
		/>
	{/if}
</div>