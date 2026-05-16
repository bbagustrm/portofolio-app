<script lang="ts">
	import FeedPost from '$lib/components/gallery/FeedPost.svelte';
	import InfiniteScroll from '$lib/components/gallery/InfiniteScroll.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { Post } from '$lib/types';
	import { reveal } from '$lib/actions/reveal';

	let { data } = $props();

	let posts = $state<Post[]>([...data.posts]);
	let nextCursor = $state<string | null>(data.nextCursor);
	let loading = $state(false);

	async function loadMore() {
		if (!nextCursor || loading) return;
		loading = true;
		try {
			const res = await fetch(`/api/gallery?cursor=${nextCursor}&limit=8`);
			const result = await res.json();
			posts = [...posts, ...result.posts];
			nextCursor = result.nextCursor;
		} catch (e) {
			console.error('Failed to load more:', e);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Gallery — Atmojo</title>
	<meta name="description" content="A personal photo and video gallery." />
</svelte:head>

<div class="container mx-auto max-w-2xl px-4 py-16">

	<!-- Header -->
	<div use:reveal={{ y: 20 }} class="mb-10">
		<p class="text-sm text-primary font-medium font-sans mb-2 uppercase tracking-wider">Memories</p>
		<h1 class="text-5xl font-bold mb-4">Gallery</h1>
		<p class="text-muted-foreground text-lg">
			A collection of moments captured in photos and videos.
		</p>
	</div>

	<!-- Feed -->
	{#if posts.length === 0}
		<div class="text-center py-24 text-muted-foreground border rounded-2xl">
			<p class="text-5xl mb-4">📷</p>
			<p class="font-medium">No photos yet.</p>
			<p class="text-sm mt-1">Check back soon!</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each posts as post (post.id)}
				<div use:reveal={{ y: 32, amount: 0.05 }}>
					<FeedPost {post} />
				</div>
			{/each}

			<!-- Loading skeleton saat fetch berikutnya -->
			{#if loading}
				{#each Array(2) as _}
					<div class="border rounded-2xl overflow-hidden bg-card p-4 space-y-3">
						<div class="flex items-center gap-3">
							<Skeleton class="size-9 rounded-full" />
							<div class="space-y-1.5">
								<Skeleton class="h-3 w-24" />
								<Skeleton class="h-3 w-16" />
							</div>
						</div>
						<Skeleton class="h-4 w-3/4" />
						<Skeleton class="h-64 w-full rounded-xl" />
					</div>
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